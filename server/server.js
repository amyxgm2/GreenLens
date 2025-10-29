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

// Multer setup for image uploads
const upload = multer({ storage: multer.memoryStorage() });

// ✅ Initialize Gemini (official new SDK)
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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


// Root Route (for testing)

app.get("/", (_req, res) => {
  res.send("🌿 GreenLens Gemini 2.5 API is running successfully!");
});

//  Start Server

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
