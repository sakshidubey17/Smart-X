import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

// Check if API key exists
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing in .env file");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function suggestPosts(req, res) {
  try {
    const { draft } = req.body || {};

    // Input validation
    if (!draft || draft.trim() === "") {
      return res.status(400).json({ error: "Draft is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash"
    });

    const prompt = `Based on this topic: "${draft}", generate exactly 3 short, catchy tweet suggestions (max 280 chars each).
    Return ONLY a valid JSON array of strings.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean response
    const clean = text.replace(/```(?:json)?\s*/g, "").trim();

    let suggestions;

    // Safe JSON parse
    try {
      suggestions = JSON.parse(clean);
    } catch (parseError) {
      console.error("⚠️ JSON Parse Error:", parseError.message);
      suggestions = [clean]; // fallback
    }

    // Ensure array
    if (!Array.isArray(suggestions)) {
      suggestions = [suggestions];
    }

    return res.json({ suggestions });

  } catch (error) {
    console.error("❌ Gemini Error:", error.message);

    return res.status(500).json({
      error: "Failed to generate suggestions. Please try again."
    });
  }
};