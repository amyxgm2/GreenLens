import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

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

let lastScan = null;

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

    const prompt = `
You are an environmental AI that analyzes product images for sustainability.
Return ONLY pure JSON in this format:
{
  "greenScore": number (0-100),
  "energyUse": "One concise sentence describing energy or production impact.",
  "recyclability": "High|Medium|Low",
  "communityImpact": "One short sentence on how reusing or donating this item helps the local community.",
  "dropOffInfo": "Where to properly dispose or donate this product.",
  "reuseIdeas": [
    {
      "idea": "Short reuse idea (e.g., turn into a planter)",
      "imageLink": "Direct link to a working image on Unsplash or Pexels"
    }
  ],
  "summary": "One short sentence summarizing overall sustainability."
}
Keep it concise, realistic, and JSON-only (no extra text).
    `;

    const contents = [
      {
        inlineData: {
          mimeType,
          data: base64,
        },
      },
      { text: prompt },
    ];

    const response = await safeGenerateContent("gemini-2.0-flash", contents);

    let responseText = response.text?.trim() || "";
    if (responseText.startsWith("```")) {
      responseText = responseText
        .replace(/^```json\s*/i, "")
        .replace(/```$/, "")
        .trim();
    }

    let jsonResponse;
    try {
      jsonResponse = JSON.parse(responseText);
    } catch {
      console.error("❌ Failed to parse JSON, returning raw text");
      jsonResponse = { raw: responseText };
    }

    // Replace invalid or missing image links
    if (jsonResponse.reuseIdeas) {
      const validImages = [
        "https://images.unsplash.com/photo-1602526432604-b0e6b31e38f5?auto=format&fit=crop&w=800&q=80", // recycle station
        "https://images.unsplash.com/photo-1556761175-129418cb2dfe?auto=format&fit=crop&w=800&q=80", // DIY crafts
        "https://images.unsplash.com/photo-1524593163327-3ceee6d8e6b2?auto=format&fit=crop&w=800&q=80", // upcycled home decor
        "https://images.unsplash.com/photo-1616627971660-78b9d8d173cd?auto=format&fit=crop&w=800&q=80", // planters
      ];
      jsonResponse.reuseIdeas = jsonResponse.reuseIdeas.map((idea) => ({
        ...idea,
        imageLink:
          idea.imageLink && idea.imageLink.startsWith("http")
            ? idea.imageLink
            : validImages[Math.floor(Math.random() * validImages.length)],
      }));
    }

    lastScan = jsonResponse;

    console.log("✅ AI Response:", jsonResponse);
    res.json(jsonResponse);
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
    if (!lastScan) {
      return res
        .status(400)
        .json({ error: "Please analyze an image first before chatting." });
    }

    const prompt = `
You are GreenLens AI, a friendly sustainability coach 🌿.
Based on this analysis:
${JSON.stringify(lastScan, null, 2)}

User asked: "${userMessage}"

Respond in a conversational, empathetic tone (max 5 sentences). Keep it helpful, realistic, and positive.
`;

    const chatResponse = await safeGenerateContent("gemini-2.0-flash", [
      { text: prompt },
    ]);

    const reply = chatResponse.text?.trim() || "Sorry, I couldn’t get that.";
    res.json({ reply });
  } catch (err) {
    console.error("💬 Chat error:", err);
    res.status(500).json({ error: "Chat service temporarily unavailable." });
  }
});

// ============ ROOT ============
app.get("/", (_req, res) => {
  res.send("🌎 GreenLens AI API is online and running!");
});

app.listen(PORT, () =>
  console.log(`✅ Server running efficiently on http://localhost:${PORT}`)
);