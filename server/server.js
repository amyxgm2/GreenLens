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

const upload = multer({ storage: multer.memoryStorage() });

// Gemini setup
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Store multiple scans instead of just one
let analyzedScans = [];
const MAX_SCANS = 10; // Keep last 10 images

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const USERS = "user_info";
const PUBLIC_USER = "id, username, first_name, last_name, email, status, created_at, login_active, logout_active"
const PRIVATE_USER = "id, username, password, first_name, last_name, email, status, created_at, login_active, logout_active"

// 🧠 Helper: Safe Gemini call with retry + timeout
async function safeGenerateContent(model, contents, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000); // 25s timeout
      const response = await ai.models.generateContent(
        { model, contents },
        { signal: controller.signal }
      );
      clearTimeout(timeout);
      return response;
    } catch (error) {
      const code = error?.error?.code || error?.status || "unknown";
      console.warn(`⚠️ Gemini call failed (attempt ${i + 1}):`, code);
      if (i < retries - 1 && (code === 503 || code === "UNAVAILABLE")) {
        console.log("Retrying in 2s...");
        await new Promise((r) => setTimeout(r, 2000));
        continue;
      }
      throw error;
    }
  }
}

// ============ IMAGE ANALYSIS ROUTE ============
app.post("/api/analyze", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const base64 = req.file.buffer.toString("base64");
    const mimeType = req.file.mimetype || "image/jpeg";
    const userQuestion = req.body.userQuestion || ""; // Get user's question

    // First: Always generate the JSON analysis for the display card
    const analysisPrompt = `
      You are an environmental AI that analyzes product images for sustainability.
      Return ONLY pure JSON in this format:
      {
        "greenScore": number (0-100),
        "energyUse": "One concise sentence describing energy or production impact.",
        "recyclability": "High|Medium|Low",
        "communityImpact": "One short sentence on how reusing or donating this item helps the local community.",
        "dropOffInfo": "Where to properly dispose or donate this product.",
        "summary": "One short sentence summarizing overall sustainability.",
        "reuseIdeas": [
          "Creative reuse idea 1",
          "Creative reuse idea 2",
          "Creative reuse idea 3",
          "Creative reuse idea 4",
          "Creative reuse idea 5"
        ]
      }
      
      For reuseIdeas, provide 5 creative, practical, and specific ways to reuse or repurpose this product. 
      Make them actionable and realistic for everyday people. Think DIY projects, alternative uses, 
      donation options, or creative transformations.
      
      Keep it concise, realistic, and JSON-only (no extra text).
          `;

    const analysisContents = [
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      { text: analysisPrompt },
    ];

    const analysisResponse = await safeGenerateContent("gemini-2.0-flash", analysisContents);

    let responseText = analysisResponse.text?.trim() || "";
    if (responseText.startsWith("```")) {
      responseText = responseText
        .replace(/^```json\s*/i, "")
        .replace(/```$/, "")
        .trim();
    }

    let jsonAnalysis;
    try {
      jsonAnalysis = JSON.parse(responseText);
    } catch {
      console.error("❌ Failed to parse JSON, returning raw text");
      jsonAnalysis = { raw: responseText };
    }

    // Store scan with timestamp and filename
    const scanData = {
      ...jsonAnalysis,
      timestamp: new Date().toISOString(),
      filename: req.file.originalname || "unknown",
    };

    analyzedScans.push(scanData);

    // Keep only last MAX_SCANS images
    if (analyzedScans.length > MAX_SCANS) {
      analyzedScans.shift();
    }

    // Second: Generate conversational answer based on user's question
    let conversationalAnswer;

    if (userQuestion.trim()) {
      // User asked a specific question
      const questionPrompt = `
You are GreenLens AI, a friendly sustainability coach 🌿.

Based on this product analysis:
${JSON.stringify(jsonAnalysis, null, 2)}

The user asked: "${userQuestion}"

Respond in a conversational, empathetic tone (max 5 sentences). Answer their specific question directly. Keep it helpful, realistic, and positive.
`;

      const questionResponse = await safeGenerateContent("gemini-2.0-flash", [
        { text: questionPrompt },
      ]);

      conversationalAnswer = questionResponse.text?.trim() || "I've analyzed your product!";
    } else {
      // No question asked, give default summary
      conversationalAnswer = `I've analyzed your product! Here's what I found:\n\nSustainability Score: ${jsonAnalysis.greenScore}/100\n\n${jsonAnalysis.summary}\n\nFeel free to ask me any questions about this product's environmental impact!`;
    }

    console.log(`✅ Analysis complete (Total scans: ${analyzedScans.length})`);

    res.json({
      analysis: jsonAnalysis,  // JSON data for the display card (includes reuseIdeas)
      answer: conversationalAnswer  // Conversational answer for chat
    });
  } catch (err) {
    console.error("❌ Error analyzing image:", err);
    if (err.message?.includes("overloaded") || err.status === 503) {
      return res.status(503).json({
        error:
          "AI model is currently busy or overloaded. Please try again in a few seconds.",
      });
    }
    res.status(500).json({ error: "Unexpected server error." });
  }
});

// ============ CHAT ROUTE ============
app.post("/api/chat", async (req, res) => {
  try {
    const { userMessage } = req.body;

    // Check if any scans exist
    if (analyzedScans.length === 0) {
      return res
        .status(400)
        .json({ error: "Please analyze an image first before chatting." });
    }

    // Include ALL analyzed scans in the context
    const scansContext = analyzedScans.map((scan, idx) => ({
      imageNumber: idx + 1,
      filename: scan.filename,
      greenScore: scan.greenScore,
      energyUse: scan.energyUse,
      recyclability: scan.recyclability,
      summary: scan.summary,
      communityImpact: scan.communityImpact,
      dropOffInfo: scan.dropOffInfo,
      reuseIdeas: scan.reuseIdeas,
    }));

    const prompt = `
You are GreenLens AI, a friendly sustainability coach 🌿.

The user has analyzed ${analyzedScans.length} product(s). Here's the data for all of them:

${scansContext.map((scan, idx) => `
Product ${idx + 1} (${scan.filename}):
- Sustainability Score: ${scan.greenScore}/100
- Summary: ${scan.summary}
- Energy Use: ${scan.energyUse}
- Recyclability: ${scan.recyclability}
- Community Impact: ${scan.communityImpact}
- Drop-off Info: ${scan.dropOffInfo}
- Reuse Ideas: ${scan.reuseIdeas ? scan.reuseIdeas.join(', ') : 'N/A'}
`).join('\n')}

User asked: "${userMessage}"

Respond in a conversational, empathetic tone (max 5 sentences). If they ask about a specific product, reference it by number or filename. Keep it helpful, realistic, and positive.
`;

    const chatResponse = await safeGenerateContent("gemini-2.0-flash", [
      { text: prompt },
    ]);

    const reply = chatResponse.text?.trim() || "Sorry, I couldn't get that.";
    console.log(`💬 Chat response (Context: ${analyzedScans.length} products)`);
    res.json({ reply });
  } catch (err) {
    console.error("💬 Chat error:", err);
    res.status(500).json({ error: "Chat service temporarily unavailable." });
  }
});

// ============ AUTH ROUTES ============
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password, first_name, last_name } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "username, email, & password is required." });
    }

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

    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ user: data });
  } catch (e) {
    console.error("REGISTER_ERR:", e);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: "username and password are required" });
    }

    const { data: user, error } = await supabase
      .from(USERS)
      .select(PRIVATE_USER)
      .or(`email.eq.${identifier}, username.eq.${identifier}`)
      .limit(1)
      .single();

    if (error || !user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(String(password), user.password || "");
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    await supabase.from(USERS).update({ login_active: new Date().toISOString() }).eq("id", user.id);

    const { password: _omit, ...publicUser } = user;
    res.json({ user: publicUser });
  } catch (e) {
    console.error("LOGIN_ERR:", e);
    res.status(500).json({ error: "Login failed" });
  }
});

app.post("/api/logout", async (req, res) => {
  try {
    const { id } = req.body;
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

// ============ ROOT ============
app.get("/", (_req, res) => {
  res.send("🌎 GreenLens AI API is online and running!");
});

app.listen(PORT, () =>
  console.log(`✅ Server running efficiently on http://localhost:${PORT}`)
);