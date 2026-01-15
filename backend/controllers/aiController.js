import { GoogleGenerativeAI } from "@google/generative-ai";
import History from "../models/History.js";

// ❗ Do NOT re-import dotenv here (already loaded in server.js)

if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY missing in .env");
}

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// ✅ WORKING MODEL - gemini-1.5-flash was shut down, using stable replacement
const MODEL_NAME = "gemini-2.5-flash";

const getModel = () => {
  if (!genAI) {
    throw new Error("Gemini API not configured. Please set GEMINI_API_KEY in .env");
  }
  return genAI.getGenerativeModel({ model: MODEL_NAME });
};

// ---------- helper ----------
const saveToHistory = async (userId, content) => {
  try {
    await History.create({ 
      userId, 
      type: 'other', // Valid enum value
      content: content.substring(0, 2000) // Ensure within maxlength
    });
  } catch (err) {
    // Silently fail - don't break API if history save fails
    console.error('History save failed:', err.message);
  }
};

// ===============================
// 1️⃣ IDEAS
// ===============================
export const generateIdeas = async (req, res) => {
  try {
    const { prompt, niche, count = 5 } = req.body;
    if (!prompt || !niche) {
      return res.status(400).json({ success: false, message: "Prompt & niche required" });
    }

    const model = getModel();
    const result = await model.generateContent(`
Generate ${count} viral short-form content ideas.
Niche: ${niche}
Context: ${prompt}
Return ONLY numbered list.
`);

    const responseText = result.response?.text() || '';
    const ideas = responseText
      .split("\n")
      .filter(line => line.trim() && line.length > 0)
      .slice(0, count);

    if (ideas.length === 0) {
      throw new Error("No ideas generated. Please try again.");
    }

    await saveToHistory(req.user.id, `Generated ${ideas.length} ideas for ${niche}: ${prompt}`);

    res.json({ success: true, data: ideas });
  } catch (err) {
    console.error("AI IDEAS ERROR:", err.message);
    res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to generate ideas" 
    });
  }
};

// ===============================
// 2️⃣ HOOKS
// ===============================
export const generateHooks = async (req, res) => {
  try {
    const { topic, count = 5 } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: "Topic is required" });
    }
    
    const model = getModel();
    const result = await model.generateContent(`
Create ${count} viral hooks for: ${topic}
Return numbered list only.
`);

    const responseText = result.response?.text() || '';
    const hooks = responseText
      .split("\n")
      .filter(line => line.trim() && line.length > 0)
      .slice(0, count);

    if (hooks.length === 0) {
      throw new Error("No hooks generated. Please try again.");
    }

    await saveToHistory(req.user.id, `Generated ${hooks.length} hooks for: ${topic}`);

    res.json({
      success: true,
      data: hooks,
    });
  } catch (err) {
    console.error("AI HOOKS ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message || "Failed to generate hooks" });
  }
};

// ===============================
// 3️⃣ SCRIPT
// ===============================
export const generateScript = async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: "Topic is required" });
    }
    
    const model = getModel();
    const result = await model.generateContent(`
Write a short viral video script on:
${topic}
Include hook, value, CTA.
`);

    const script = result.response?.text() || '';
    
    if (!script || script.trim().length === 0) {
      throw new Error("No script generated. Please try again.");
    }

    await saveToHistory(req.user.id, `Generated script for: ${topic}`);

    res.json({ success: true, data: script });
  } catch (err) {
    console.error("AI SCRIPT ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message || "Failed to generate script" });
  }
};

// ===============================
// 4️⃣ CAPTIONS
// ===============================
export const generateCaptions = async (req, res) => {
  try {
    const { topic, count = 3 } = req.body;
    if (!topic) {
      return res.status(400).json({ success: false, message: "Topic is required" });
    }
    
    const model = getModel();
    const result = await model.generateContent(`
Write ${count} engaging Instagram captions for:
${topic}
Add emojis.
Return list only.
`);

    const responseText = result.response?.text() || '';
    const captions = responseText
      .split("\n")
      .filter(line => line.trim() && line.length > 0)
      .slice(0, count);

    if (captions.length === 0) {
      throw new Error("No captions generated. Please try again.");
    }

    await saveToHistory(req.user.id, `Generated ${captions.length} captions for: ${topic}`);

    res.json({
      success: true,
      data: captions,
    });
  } catch (err) {
    console.error("AI CAPTIONS ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message || "Failed to generate captions" });
  }
};

// ===============================
// 5️⃣ HASHTAGS
// ===============================
export const generateHashtags = async (req, res) => {
  try {
    const { niche, count = 10 } = req.body;

    if (!niche) {
      return res.status(400).json({ success: false, message: "Niche is required" });
    }

    const model = getModel();

    const result = await model.generateContent(`
Generate ${count} trending Instagram hashtags for niche: ${niche}
Rules:
- Return ONLY hashtags
- Space separated OR newline separated
- Include "#" symbol
`);

    const responseText = result.response?.text() || "";

    // ✅ FIXED PARSER (works for: "#a #b" OR "a b" OR lines)
    const hashtags = responseText
      .replace(/,/g, " ")
      .split(/\s+/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => tag.replace(/^#/, "")) // remove starting #
      .filter((tag) => tag.length > 0)
      .slice(0, Number(count) || 10);

    if (hashtags.length === 0) {
      return res.status(200).json({
        success: false,
        message: "No hashtags generated. Please try again.",
      });
    }

    await saveToHistory(req.user.id, `Generated ${hashtags.length} hashtags for: ${niche}`);

    return res.json({
      success: true,
      data: hashtags,
    });
  } catch (err) {
    console.error("AI HASHTAGS ERROR:", err.message);
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to generate hashtags",
    });
  }
};


// ===============================
// 6️⃣ IMPROVE SCRIPT
// ===============================
export const improveScript = async (req, res) => {
  try {
    const { script } = req.body;
    if (!script || typeof script !== 'string' || script.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Script is required" });
    }
    
    const model = getModel();
    const result = await model.generateContent(`
Improve this script to be more viral:
${script}
`);

    const improved = result.response?.text() || '';
    
    if (!improved || improved.trim().length === 0) {
      throw new Error("No improved script generated. Please try again.");
    }

    await saveToHistory(req.user.id, "Improved script using AI");

    res.json({ success: true, data: improved });
  } catch (err) {
    console.error("AI IMPROVE ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message || "Failed to improve script" });
  }
};
