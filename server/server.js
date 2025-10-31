import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import bcrypt from "bcrypt";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "20mb" }));

// Multer setup for image uploads
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Initialize Gemini (official new SDK)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {auth: {persistSession: false}}
);

const USERS = "user_info";
const PUBLIC_USER = "id, username, first_name, last_name, email, status, created_at, login_active, logout_active"
const PRIVATE_USER = "id, username, password, first_name, last_name, email, status, created_at, login_active, logout_active"

// POST /api/analyze

app.post("/api/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // Convert uploaded file to Base64
    const base64 = req.file.buffer.toString("base64");

    //  Prompt for Gemini
    const contents = [
      {
        inlineData: {
          mimeType: req.file.mimetype || "image/jpeg",
          data: base64,
        },
      },
      {
        text: `You are an environmental AI that analyzes product images for sustainability.
Return ONLY pure JSON in this format:
{
  "greenScore": number (0-100),
  "energyUse": string,
  "recyclability": "High|Medium|Low",
  "ethics": "Good|Moderate|Poor",
  "ecosystemImpact": "Minimal|Moderate|Severe",
  "reuseIdeas": [string],
  "summary": string
}
Evaluate the product's sustainability, materials, and impact.`
      }
    ];

    // Generate content with Gemini 2.5 Flash
    const resp = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents
    });

    let responseText = resp.text?.trim() || "";

    // Clean possible markdown wrappers (```json ... ```)
    if (responseText.startsWith("```")) {
      responseText = responseText
        .replace(/^```json\s*/i, "")
        .replace(/```$/, "")
        .trim();
    }

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
    } catch (err) {
      console.error(" Could not parse JSON:", err);
      jsonResponse = { raw: responseText };
    }

    console.log("✅ AI Response:", jsonResponse);
    res.json(jsonResponse);
  } catch (err) {
    console.error("Error analyzing image:", err);
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/register", async(req,res) =>{
    try{
        const{ username, email, password, first_name, last_name}= req.body;
        if(!username || !email || !password){
            return res.status(400).json({error: "username, email, & password is required."});
        }

        //hash password
        const hash = await bcrypt.hash(String(password), 12);

        const { data, error } = await supabase
        .from(USERS)
        .insert({
            username, 
            email,
            password: hash, 
            first_name: first_name || null, 
            last_name: last_name || null, 
            status: "active",
            created_at: new Date().toISOString()
        })
        .select(PUBLIC_USER)
        .single();

        if(error) return res.status(400).json({ error: error.message});
        res.status(201).json({ user: data});
    } catch (e){
        console.error("REGISTER_ERR:", e);
        res.status(500).json({error: "Registration failed"});
    }
});

app.post("/api/login", async (req,res) => {
    try{
        const { identifier, password } = req.body;
        if(!identifier || !password){
            return res.status(400).json({error: "username and password are required"});
        }

        const {data: user,error } = await supabase
         .from(USERS)
         .select(PRIVATE_USER) //copy public user, make it a private user and include the password there
         .or(`email.eq.${identifier}, username.eq.${identifier}`)
         .limit(1)
         .single();

        if (error || !user) return res.status(401).json({ error: "Invalid credentials"});

        //compare hash
        const ok = await bcrypt.compare(String(password), user.password || "");
        if (!ok) return res.status(401).json({ error: "Invalid credentials"});

        //update login timestamp
        await supabase.from(USERS).update({ login_active: new Date().toISOString()}).eq("id", user.id);

        //return public fields only 

        const { password: _omit, ...publicUser } = user;
        res.json({ user: publicUser });
            } catch (e) {
                console.error("LOGIN_ERR:", e);
                res.status(500).json({ error: "Login failed" });
            }
});

//logout
app.post("/api/logout", async (req, res) => {
  try {
    const { id } = req.body; // in real apps, derive from session/JWT
    if (!id) return res.status(400).json({ error: "id is required" });

    await supabase.from(USERS).update({ logout_active: new Date().toISOString() }).eq("id", id);
    res.json({ ok: true });
  } catch (e) {
    console.error("LOGOUT_ERR:", e);
    res.status(500).json({ error: "Logout failed" });
  }
});

app.get("/api/users/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from(USERS)
      .select(PUBLIC_USER)
      .eq("id", req.params.id)
      .single();

    if (error) return res.status(404).json({ error: "Not found" });
    res.json({ user: data });
  } catch (e) {
    console.error("GET_USER_ERR:", e);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Root Route (for testing)

app.get("/", (_req, res) => {
  res.send("🌿 GreenLens Gemini 2.5 API is running successfully!");
});

//  Start Server

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
