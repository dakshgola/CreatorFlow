import { GoogleGenerativeAI } from "@google/generative-ai";
import History from "../models/History.js";
import AIGeneration from "../models/AIGeneration.js";
import Task from "../models/Task.js";
import Payment from "../models/Payment.js";
import Project from "../models/Project.js";
import { buildSystemPrompt } from "../services/aiMemoryService.js";

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
    const systemPrompt = await buildSystemPrompt(req.user.id);
    const result = await model.generateContent(`
${systemPrompt}

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
    const systemPrompt = await buildSystemPrompt(req.user.id);
    const result = await model.generateContent(`
${systemPrompt}

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

// ===============================
// 7️⃣ FULL GENERATOR
// ===============================
export const generateContent = async (req, res) => {
  try {
    const { topic, niche, platform } = req.body;
    if (!topic || !niche || !platform) {
      return res.status(400).json({ success: false, message: "Topic, niche, and platform are required" });
    }

    const model = getModel();
    const systemPrompt = await buildSystemPrompt(req.user.id);
    const prompt = `${systemPrompt}

Topic: ${topic}
Niche: ${niche}
Platform: ${platform}

Return a JSON object with these exact keys:
- "title": array of 5 title variations (strings)
- "hook": array of 3 opening line variations (strings)
- "scriptOutline": array of 5 sections, where each section is an object with "heading" (string) and "description" (2-line string)
- "captions": array of 3 caption variations with emojis (strings)
- "hashtags": array of 15 hashtags (strings)

Respond ONLY with valid JSON. Do not include markdown formatting like \`\`\`json.`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });

    const responseText = result.response?.text() || '';
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch (e) {
      // fallback if model includes markdown
      const cleaned = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    // Save to DB
    const newGen = await AIGeneration.create({
      userId: req.user.id,
      topic,
      niche,
      platform,
      result: parsedResult
    });

    // Keep only last 5 per user
    const userGens = await AIGeneration.find({ userId: req.user.id }).sort({ createdAt: -1 });
    if (userGens.length > 5) {
      const idsToDelete = userGens.slice(5).map(g => g._id);
      await AIGeneration.deleteMany({ _id: { $in: idsToDelete } });
    }

    res.json({ success: true, data: newGen });
  } catch (err) {
    console.error("AI GENERATOR ERROR:", err.message);
    res.status(500).json({ success: false, message: err.message || "Failed to generate content" });
  }
};

export const getRecentGenerations = async (req, res) => {
  try {
    const history = await AIGeneration.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ success: true, data: history });
  } catch (err) {
    console.error("AI FETCH GENERATIONS ERROR:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch generations" });
  }
};

// ===============================
// 8️⃣ WEEKLY DIGEST
// ===============================
export const generateDigest = async (req, res) => {
  try {
    const userId = req.user.id;
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Fetch Tasks
    const allTasks = await Task.find({ userId });
    const completedTasks7d = allTasks.filter(t => t.completed && t.updatedAt >= sevenDaysAgo).length;
    const overdueTasks = allTasks.filter(t => !t.completed && new Date(t.dueDate) < new Date());
    
    // 2. Payments
    const allPayments = await Payment.find({ userId }).populate('clientId', 'name');
    const paidPayments7d = allPayments.filter(p => p.paid && p.updatedAt >= sevenDaysAgo).reduce((acc, p) => acc + p.amount, 0);
    const duePayments = allPayments.filter(p => !p.paid).reduce((acc, p) => acc + p.amount, 0);
    const overduePayments = allPayments.filter(p => !p.paid && new Date(p.dueDate) < new Date());
    const overdueClientNames = [...new Set(overduePayments.map(p => p.clientId?.name || 'Unknown'))];

    // 3. Planner (Projects)
    const allProjects = await Project.find({ userId });
    const stages = { Idea: 0, Scripted: 0, Shot: 0, Edited: 0, Posted: 0 };
    allProjects.forEach(p => {
      if (stages[p.status] !== undefined) {
        stages[p.status]++;
      }
    });
    const mostStuckStage = Object.keys(stages).reduce((a, b) => stages[a] > stages[b] ? a : b);

    // Assemble Data
    const dataContext = `
    Tasks:
    - Completed in last 7 days: ${completedTasks7d}
    - Currently Overdue: ${overdueTasks.length}
    - Overdue Task Names: ${overdueTasks.map(t => t.title).join(', ') || 'None'}

    Payments:
    - Paid in last 7 days: ₹${paidPayments7d}
    - Total Due: ₹${duePayments}
    - Overdue Clients: ${overdueClientNames.join(', ') || 'None'}

    Planner:
    - Items per stage: Idea(${stages.Idea}), Scripted(${stages.Scripted}), Shot(${stages.Shot}), Edited(${stages.Edited}), Posted(${stages.Posted})
    - Most stuck items are in stage: ${mostStuckStage}
    `;

    const model = getModel();
    const result = await model.generateContent(`You are a business assistant. Based on this creator's last 7 days of data, write a concise 4-sentence weekly digest. Be specific with numbers. End with one clear priority action for this week. Tone: direct, professional, no fluff.
    
    Data:
    ${dataContext}`);

    const digestText = result.response?.text() || '';

    res.json({ success: true, data: digestText });
  } catch (err) {
    console.error("AI DIGEST ERROR:", err.message);
    res.status(500).json({ success: false, message: "Failed to generate digest" });
  }
};
