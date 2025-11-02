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

      CRITICAL INSTRUCTIONS:
      1. Carefully examine the ENTIRE image, including the physical object itself, not just what's printed on it
      2. Focus on analyzing the PHYSICAL PRODUCT (the material, packaging, container, or item), NOT the content, text, or graphics on it
      3. Examples:
        - A thank you card → Analyze the CARD STOCK/PAPER MATERIAL, not the message
        - A water bottle with a label → Analyze the BOTTLE MATERIAL, not the brand logo
        - A cereal box → Analyze the CARDBOARD PACKAGING, not the cereal inside

      WHEN TO REJECT AN IMAGE:
      If the image shows ONLY digital content, scenery, animals, people, screenshots, or abstract art with NO physical product visible, return:
      {
        "productName": "No physical product detected",
        "summary": "I can only analyze physical products and their materials. This image appears to show [describe what you see]. Please upload a clear photo of the actual physical item (the material, packaging, or container) for sustainability analysis."
      }

      FOR VALID PRODUCT IMAGES, analyze the PHYSICAL MATERIAL and return ONLY pure JSON:
      {
        "productName": "Specific material description (e.g., 'Greeting Card - Printed Cardstock', 'Single-Use Plastic Water Bottle', 'Glossy Paper Magazine')",
        "greenScore": number (0-100, evaluating the PHYSICAL MATERIAL's sustainability),
        "energyUse": "1-3 sentences about the MATERIAL's manufacturing energy, production process, and carbon footprint",
        "recyclability": "High|Medium|Low (based on the MATERIAL composition) and provide 1-2 percise summary on why.",
        "communityImpact": "1-3 sentences on donation potential for this TYPE of item, community reuse programs, or local recycling options",
        "dropOffInfo": "Specific disposal guidance for this MATERIAL: paper recycling, e-waste, donation centers, or proper waste stream",
        "summary": "1-3 sentences covering the MATERIAL's overall environmental impact, best disposal method, and sustainability rating",
        "reuseIdeas": [
          "Specific, actionable reuse idea 1 for this physical item",
          "Specific, actionable reuse idea 2",
          "Specific, actionable reuse idea 3",
          "Specific, actionable reuse idea 4",
          "Specific, actionable reuse idea 5"
        ]
      }

      SCORING GUIDELINES for greenScore (evaluate the PHYSICAL MATERIAL):
      - 80-100: Highly sustainable (recyclable paper, reusable materials, minimal processing, biodegradable)
      - 60-79: Moderately sustainable (recyclable with some processing, FSC-certified paper, moderate energy use)
      - 40-59: Below average (mixed materials, coated paper, difficult to recycle, high energy production)
      - 20-39: Poor sustainability (non-recyclable, single-use plastic, high environmental cost)
      - 0-19: Very poor (toxic materials, extremely wasteful, significant pollution)

      CRITICAL CONSISTENCY RULES:
      - For greeting cards/postcards: Always identify as "Greeting Card" or "Postcard" with paper type (e.g., "Glossy Cardstock", "Matte Recycled Paper")
      - Score paper products consistently: Plain paper (75-85), Glossy/coated paper (50-65), Recycled paper (80-90)
      - Ignore decorative elements - focus ONLY on the base material
      - Be consistent: The same type of material should always receive similar scores

      PRODUCT NAME MUST specify:
      - The item type (card, bottle, box, container)
      - The material (cardstock, plastic, glass, metal, paper)
      - Paper quality if relevant (glossy, matte, recycled, virgin)
      - Examples: "Greeting Card - Glossy Cardstock", "Paperback Book - Recycled Paper", "Plastic Gift Card - PVC"

      Return ONLY valid JSON with no markdown, no explanations, no extra text. Be consistent in your scoring.
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
      // imageNumber: idx + 1,
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

Respond in a conversational, empathetic tone (max 5 sentences). If they ask about a specific product, reference it by filename. Keep it helpful, realistic, and positive.
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