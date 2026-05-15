import { GoogleGenerativeAI } from "@google/generative-ai";
import AIGeneration from "../models/AIGeneration.js";
import TitleTest from "../models/TitleTest.js";
import ContentScore from "../models/ContentScore.js";
import { buildSystemPrompt } from "../services/aiMemoryService.js";

const getModel = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

// ===============================
// 1. END-TO-END GENERATION
// ===============================
export const generateContentV2 = async (req, res) => {
  try {
    const { topic, type, platform } = req.body;
    const systemPrompt = await buildSystemPrompt(req.user.id);
    
    let instructions = "";
    if (type === "script") instructions = "Write a highly engaging short-form video script with a clear hook, value delivery, and CTA.";
    else if (type === "hook") instructions = "Write 5 viral hooks.";
    else if (type === "caption") instructions = "Write a compelling social media caption with emojis and hashtags.";
    else if (type === "ideas") instructions = "Give me 5 unique content ideas.";
    else instructions = "Write high quality content.";

    const prompt = `${systemPrompt}\n\nTask: ${instructions}\nTopic: ${topic}\nPlatform: ${platform}\nReturn ONLY the actual content, no pleasantries or markdown blocks.`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const outputText = result.response?.text()?.trim();

    if (!outputText) throw new Error("Gemini returned empty response");

    const newGen = await AIGeneration.create({
      userId: req.user.id,
      topic,
      type,
      platform,
      output: outputText
    });

    res.json({ success: true, data: newGen });
  } catch (error) {
    console.error("GENERATE CONTENT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecentGenerations = async (req, res) => {
  const history = await AIGeneration.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(5);
  res.json({ success: true, data: history });
};

// ===============================
// 2. A/B TITLES
// ===============================
export const generateABTitles = async (req, res) => {
  try {
    const { topic } = req.body;
    const systemPrompt = await buildSystemPrompt(req.user.id);
    
    // Fetch past winning titles for this user
    const pastWins = await TitleTest.find({ userId: req.user.id, winningTitle: { $ne: null } }).limit(5);
    const winsContext = pastWins.length > 0 
      ? `Past winning titles to mimic:\n${pastWins.map(w => `- ${w.winningTitle}`).join('\n')}\n`
      : "";

    const prompt = `${systemPrompt}\n${winsContext}\nGenerate 5 highly clickable, curiosity-inducing YouTube/TikTok titles about: ${topic}. Return ONLY a JSON array of strings: ["Title 1", "Title 2", ...]`;

    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const titles = JSON.parse(result.response?.text()?.trim());

    const session = await TitleTest.create({
      userId: req.user.id,
      topic,
      generatedTitles: titles
    });

    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const chooseTitle = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "title is required" });

    const session = await TitleTest.findOneAndUpdate(
      { _id: sessionId, userId: req.user.id },
      { winningTitle: title },
      { new: true }
    );
    res.json({ success: true, data: session });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error choosing title" });
  }
};

// ===============================
// 3. CONTENT PIPELINE (Parallel)
// ===============================
export const runContentPipeline = async (req, res) => {
  try {
    const { topic, script } = req.body;
    const systemPrompt = await buildSystemPrompt(req.user.id);
    const model = getModel();

    const createPrompt = (format) => `${systemPrompt}\n\nTransform this script into a ${format}. Focus on native platform mechanics.\nOriginal Script: ${script}\nOutput only the content.`;

    // RUN 4 CALLS IN PARALLEL
    const [reels, linkedin, twitter, email] = await Promise.all([
      model.generateContent(createPrompt("Instagram Reels caption with trending hashtags")),
      model.generateContent(createPrompt("LinkedIn post with a strong hook and line breaks")),
      model.generateContent(createPrompt("Twitter thread (number each tweet)")),
      model.generateContent(createPrompt("Email newsletter (include subject line)"))
    ]);

    res.json({
      success: true,
      data: {
        reels: reels.response?.text(),
        linkedin: linkedin.response?.text(),
        twitter: twitter.response?.text(),
        email: email.response?.text()
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// 4. CONTENT SCORER
// ===============================
export const scoreContent = async (req, res) => {
  try {
    const { content, type, platform } = req.body;
    const prompt = `Act as an elite content strategist. Score this ${type} for ${platform} out of 10.
Content: "${content}"

Return strict JSON:
{
  "hookStrength": 8,
  "clarity": 7,
  "retentionPotential": 6,
  "overallScore": 7,
  "reason": "Why it got this score",
  "fixSuggestion": "How to make it a 10/10"
}`;

    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const scores = JSON.parse(result.response?.text());

    const savedScore = await ContentScore.create({
      userId: req.user.id,
      type,
      platform,
      content,
      scores: {
        hookStrength: scores.hookStrength,
        clarity: scores.clarity,
        retentionPotential: scores.retentionPotential,
        overallScore: scores.overallScore
      },
      reason: scores.reason,
      fixSuggestion: scores.fixSuggestion
    });

    res.json({ success: true, data: savedScore });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// 5. TRENDING HOOKS (Reddit Cache)
// ===============================
let redditCache = { data: null, timestamp: 0 };

export const getTrendingHooks = async (req, res) => {
  try {
    const niche = req.query.niche || "Entrepreneurship";
    
    // 1 Hr In-Memory Cache
    if (!redditCache.data || (Date.now() - redditCache.timestamp > 3600000)) {
      const redditRes = await fetch(`https://www.reddit.com/r/${niche}/top.json?limit=5&t=day`);
      if (!redditRes.ok) throw new Error("Reddit API failed");
      const redditJson = await redditRes.json();
      redditCache.data = redditJson.data.children.map(c => c.data.title).join("\n");
      redditCache.timestamp = Date.now();
    }

    const systemPrompt = await buildSystemPrompt(req.user.id);
    const prompt = `${systemPrompt}\n\nHere are the top trending discussions on Reddit today for ${niche}:\n${redditCache.data}\n\nBased on these trends, generate 5 viral hooks. Return a JSON array of strings: ["Hook 1", "Hook 2"]`;

    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const hooks = JSON.parse(result.response?.text());

    res.json({ success: true, data: hooks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
