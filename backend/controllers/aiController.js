import { GoogleGenerativeAI } from "@google/generative-ai";
import AIGeneration from "../models/AIGeneration.js";
import TitleTest from "../models/TitleTest.js";
import ContentScore from "../models/ContentScore.js";
import ContentHistory from "../models/ContentHistory.js";
import PlannerCard from "../models/PlannerCard.js";
import { buildSystemPrompt } from "../services/aiMemoryService.js";
import AppError from "../utils/AppError.js";

const getModel = () => {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY missing");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

// ===============================
// 1. FULL GENERATOR (Generator Tab)
// ===============================
export const generateContentV2 = async (req, res, next) => {
  try {
    const { topic, niche, platform } = req.body;

    if (!topic || !platform) {
      return next(new AppError("Topic and platform are required", 400));
    }

    const systemPrompt = await buildSystemPrompt(req.user.id);
    const prompt = `${systemPrompt}\n\nGenerate a complete content package for topic: "${topic}" in the niche: "${niche || 'General'}" optimized for the platform: "${platform}".
    Return STRICT JSON matching this schema:
    {
      "title": ["5 Clickable Titles"],
      "hook": ["3 Hook Variations"],
      "scriptOutline": [
        { "heading": "Introduction", "description": "Hook visual/audio cues" },
        { "heading": "Body Point", "description": "Delivery visuals/audio" },
        { "heading": "CTA", "description": "Closing visual/audio" }
      ],
      "captions": ["3 Social Media Caption options"],
      "hashtags": ["10 Relevant hashtags"]
    }`;

    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const outputText = result.response?.text()?.trim();
    if (!outputText) throw new Error("Gemini returned empty response");

    const parsedResult = JSON.parse(outputText);

    const newGen = await AIGeneration.create({
      userId: req.user.id,
      topic,
      type: 'other',
      platform,
      prompt,
      result: parsedResult,
      output: parsedResult // Backward compatibility mapping
    });

    // Also add to ContentHistory for dashboard analytics
    await ContentHistory.create({
      userId: req.user.id,
      type: "idea",
      input: { topic, platform, niche },
      output: { text: outputText },
    });

    res.json({ success: true, data: newGen });
  } catch (error) {
    if (error.status || error.message?.includes("API") || error.message?.includes("fetch")) {
      return next(new AppError("AI service temporarily unavailable", 503));
    }
    next(error);
  }
};

export const getRecentGenerations = async (req, res, next) => {
  try {
    const history = await AIGeneration.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Map output to result for frontend compatibility
    const mappedHistory = history.map(item => ({
      _id: item._id,
      topic: item.topic,
      type: item.type,
      platform: item.platform,
      output: item.output || item.result,
      result: item.result || item.output,
      bookmarked: item.bookmarked,
      createdAt: item.createdAt
    }));

    res.json({ success: true, data: mappedHistory });
  } catch (error) {
    next(error);
  }
};

// ===============================
// 2. CONTENT IDEAS (Ideas Tab)
// ===============================
export const generateContentIdeas = async (req, res, next) => {
  try {
    const { prompt: userPrompt, niche, count } = req.body;
    
    if (!niche) {
      return next(new AppError("Niche is required", 400));
    }

    const systemPrompt = await buildSystemPrompt(req.user.id);
    const countVal = count || 5;
    const finalPrompt = `${systemPrompt}\n\nGenerate a list of ${countVal} content ideas for the niche: "${niche}". Context/Prompt details: "${userPrompt || 'No extra context'}"\nReturn STRICT JSON array of strings: ["Idea 1", "Idea 2", ...]`;

    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const outputText = result.response?.text()?.trim();
    const parsedResult = JSON.parse(outputText);

    const newGen = await AIGeneration.create({
      userId: req.user.id,
      topic: userPrompt || niche,
      type: 'content_idea',
      platform: 'Multiple',
      prompt: finalPrompt,
      result: parsedResult,
      output: parsedResult
    });

    // Add to ContentHistory
    await ContentHistory.create({
      userId: req.user.id,
      type: "idea",
      input: { prompt: userPrompt, niche },
      output: { text: outputText },
    });

    res.json({ success: true, data: newGen });
  } catch (error) {
    if (error.status || error.message?.includes("API") || error.message?.includes("fetch")) {
      return next(new AppError("AI service temporarily unavailable", 503));
    }
    next(error);
  }
};

// ===============================
// 3. SOCIAL CAPTIONS (Captions Tab)
// ===============================
export const generateCaptions = async (req, res, next) => {
  try {
    const { topic, tone, count } = req.body;

    if (!topic) {
      return next(new AppError("Topic is required", 400));
    }

    const systemPrompt = await buildSystemPrompt(req.user.id);
    const countVal = count || 3;
    const finalPrompt = `${systemPrompt}\n\nGenerate ${countVal} caption variations in a "${tone || 'engaging'}" tone for topic: "${topic}". Include emojis and hashtags.\nReturn STRICT JSON array of strings: ["Caption 1", "Caption 2", ...]`;

    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const outputText = result.response?.text()?.trim();
    const parsedResult = JSON.parse(outputText);

    const newGen = await AIGeneration.create({
      userId: req.user.id,
      topic,
      type: 'caption',
      platform: 'Multiple',
      prompt: finalPrompt,
      result: parsedResult,
      output: parsedResult
    });

    // Add to ContentHistory
    await ContentHistory.create({
      userId: req.user.id,
      type: "caption",
      input: { topic, tone },
      output: { text: outputText },
    });

    res.json({ success: true, data: newGen });
  } catch (error) {
    if (error.status || error.message?.includes("API") || error.message?.includes("fetch")) {
      return next(new AppError("AI service temporarily unavailable", 503));
    }
    next(error);
  }
};

// ===============================
// 4. PERFORMANCE SCORE / STRATEGY
// ===============================
export const scoreContent = async (req, res, next) => {
  try {
    const { content, type, platform } = req.body;

    if (!content || !platform) {
      return next(new AppError("Content and platform are required", 400));
    }

    const finalPrompt = `Act as an elite content performance strategist. Rate this content type "${type || 'script'}" for the platform "${platform}" out of 10.
    Content: "${content}"
    
    Return strict JSON matching this schema:
    {
      "score": 8,
      "reasoning": "Explain hook strength, clarity, retention potential, and why it got this score.",
      "fixes": "Actionable improvements to make it a 10/10."
    }`;

    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const outputText = result.response?.text()?.trim();
    const scores = JSON.parse(outputText);

    const savedScore = await ContentScore.create({
      userId: req.user.id,
      type: type || 'script',
      platform,
      content,
      scores: {
        hookStrength: scores.score,
        clarity: scores.score,
        retentionPotential: scores.score,
        overallScore: scores.score
      },
      reason: scores.reasoning,
      fixSuggestion: scores.fixes
    });

    const newGen = await AIGeneration.create({
      userId: req.user.id,
      topic: content.slice(0, 100),
      type: 'performance_score',
      platform,
      prompt: finalPrompt,
      result: scores,
      output: scores
    });

    // Add to ContentHistory
    await ContentHistory.create({
      userId: req.user.id,
      type: "score",
      input: { content, type, platform },
      output: { overallScore: scores.score, reason: scores.reasoning, fixSuggestion: scores.fixes },
    });

    res.json({ success: true, data: newGen, scoreId: savedScore._id });
  } catch (error) {
    if (error.status || error.message?.includes("API") || error.message?.includes("fetch")) {
      return next(new AppError("AI service temporarily unavailable", 503));
    }
    next(error);
  }
};

// ===============================
// 5. SCRIPTS WRITER (Scripts Tab)
// ===============================
export const generateScripts = async (req, res, next) => {
  try {
    const { topic, length } = req.body;

    if (!topic) {
      return next(new AppError("Topic is required", 400));
    }

    const systemPrompt = await buildSystemPrompt(req.user.id);
    const finalPrompt = `${systemPrompt}\n\nWrite a highly engaging short-form video script for topic: "${topic}". Length should be: "${length || 'medium'}". Include hooks, visual cues, speaker notes, and CTAs.\nReturn ONLY the script, no markdown blocks.`;

    const model = getModel();
    const result = await model.generateContent(finalPrompt);

    const outputText = result.response?.text()?.trim();
    if (!outputText) throw new Error("Gemini returned empty response");

    const newGen = await AIGeneration.create({
      userId: req.user.id,
      topic,
      type: 'script',
      platform: 'Multiple',
      prompt: finalPrompt,
      result: outputText,
      output: outputText
    });

    res.json({ success: true, data: newGen });
  } catch (error) {
    if (error.status || error.message?.includes("API") || error.message?.includes("fetch")) {
      return next(new AppError("AI service temporarily unavailable", 503));
    }
    next(error);
  }
};

// ===============================
// 6. VIRAL HOOKS (Hooks Tab)
// ===============================
export const generateHooks = async (req, res, next) => {
  try {
    const { topic, count } = req.body;

    if (!topic) {
      return next(new AppError("Topic is required", 400));
    }

    const systemPrompt = await buildSystemPrompt(req.user.id);
    const countVal = count || 5;
    const finalPrompt = `${systemPrompt}\n\nGenerate ${countVal} highly engaging hook variations for topic: "${topic}".\nReturn STRICT JSON array of strings: ["Hook 1", "Hook 2", ...]`;

    const model = getModel();
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });

    const outputText = result.response?.text()?.trim();
    const parsedResult = JSON.parse(outputText);

    const newGen = await AIGeneration.create({
      userId: req.user.id,
      topic,
      type: 'hook',
      platform: 'Multiple',
      prompt: finalPrompt,
      result: parsedResult,
      output: parsedResult
    });

    res.json({ success: true, data: newGen });
  } catch (error) {
    if (error.status || error.message?.includes("API") || error.message?.includes("fetch")) {
      return next(new AppError("AI service temporarily unavailable", 503));
    }
    next(error);
  }
};

// ===============================
// 7. MULTI-TURN AI CHAT
// ===============================
export const handleChat = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message) {
      return next(new AppError("Message is required", 400));
    }

    // 1. Fetch last 10 messages for this user (ascending order)
    const recentChats = await AIGeneration.find({ userId: req.user.id, type: 'chat' })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Reverse to chronological order (ascending)
    recentChats.reverse();

    // 2. Format history for Google Gemini SDK
    const history = [];
    recentChats.forEach(chat => {
      history.push({
        role: 'user',
        parts: [{ text: chat.prompt }]
      });
      history.push({
        role: 'model',
        parts: [{ text: typeof chat.result === 'string' ? chat.result : JSON.stringify(chat.result) }]
      });
    });

    const systemInstruction = "You are a helpful creative writing partner and content mentor for a digital creator. Keep your answers conversational, insightful, and concise.";
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: systemInstruction
    });

    // 3. Start Chat Session
    const chatSession = model.startChat({ history });
    const result = await chatSession.sendMessage(message);
    const responseText = result.response?.text()?.trim();

    if (!responseText) throw new Error("Gemini returned empty response");

    // 4. Save to DB
    const newChat = await AIGeneration.create({
      userId: req.user.id,
      topic: "AI Chat Message",
      type: 'chat',
      platform: 'Chat',
      prompt: message,
      result: responseText,
      output: responseText,
      conversationHistory: [
        ...recentChats.flatMap(c => [
          { role: 'user', content: c.prompt },
          { role: 'model', content: typeof c.result === 'string' ? c.result : JSON.stringify(c.result) }
        ]),
        { role: 'user', content: message },
        { role: 'model', content: responseText }
      ]
    });

    res.json({ success: true, data: newChat });
  } catch (error) {
    if (error.status || error.message?.includes("API") || error.message?.includes("fetch")) {
      return next(new AppError("AI service temporarily unavailable", 503));
    }
    next(error);
  }
};

// ===============================
// 8. UPDATE BOOKMARK STATUS
// ===============================
export const updateBookmark = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { bookmarked } = req.body;
    
    if (bookmarked === undefined) {
      return next(new AppError("bookmarked field is required", 400));
    }

    const generation = await AIGeneration.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { bookmarked },
      { new: true }
    );

    if (!generation) {
      return next(new AppError("Generation not found", 404));
    }

    res.json({ success: true, data: generation });
  } catch (error) {
    next(error);
  }
};

// ===============================
// 9. AI WEEKLY DIGEST (Dashboard Modal)
// ===============================
export const generateDigest = async (req, res, next) => {
  try {
    // 1. Fetch user's content history & planner cards
    const plannerCards = await PlannerCard.find({ userId: req.user.id }).limit(10);
    const history = await AIGeneration.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(5);

    const plannerContext = plannerCards.length > 0
      ? `Planner items:\n${plannerCards.map(c => `- [${c.status}] ${c.title}`).join("\n")}`
      : "No items in content planner yet.";

    const historyContext = history.length > 0
      ? `Recent AI creations:\n${history.map(h => `- [${h.type}] topic: ${h.topic}`).join("\n")}`
      : "No recent AI creations.";

    const finalPrompt = `Analyze this creator's recent planner backlog and history, and generate a brief 3-sentence weekly digest and tactical suggestion.
    Planner backlog:
    ${plannerContext}
    History:
    ${historyContext}
    Return only the clean summary text.`;

    const model = getModel();
    const result = await model.generateContent(finalPrompt);
    const outputText = result.response?.text()?.trim();

    if (!outputText) throw new Error("Gemini returned empty response");

    res.json({ success: true, data: outputText });
  } catch (error) {
    if (error.status || error.message?.includes("API") || error.message?.includes("fetch")) {
      return next(new AppError("AI service temporarily unavailable", 503));
    }
    next(error);
  }
};

// ===============================
// LEGACY BACKWARD COMPATIBLE FLOWS
// ===============================
export const generateABTitles = async (req, res, next) => {
  try {
    const { topic } = req.body;
    const systemPrompt = await buildSystemPrompt(req.user.id);
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
    next(error);
  }
};

export const chooseTitle = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { title } = req.body;
    if (!title) return next(new AppError("title is required", 400));

    const session = await TitleTest.findOneAndUpdate(
      { _id: sessionId, userId: req.user.id },
      { winningTitle: title },
      { new: true }
    );
    res.json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

export const runContentPipeline = async (req, res, next) => {
  try {
    const { topic, script } = req.body;
    const systemPrompt = await buildSystemPrompt(req.user.id);
    const model = getModel();

    const createPrompt = (format) => `${systemPrompt}\n\nTransform this script into a ${format}. Focus on native platform mechanics.\nOriginal Script: ${script}\nOutput only the content.`;

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
    next(error);
  }
};

export const getTrendingHooks = async (req, res, next) => {
  try {
    const niche = req.query.niche || "Entrepreneurship";
    let redditCache = { data: null, timestamp: 0 };
    
    const redditRes = await fetch(`https://www.reddit.com/r/${niche}/top.json?limit=5&t=day`);
    if (!redditRes.ok) throw new Error("Reddit API failed");
    const redditJson = await redditRes.json();
    redditCache.data = redditJson.data.children.map(c => c.data.title).join("\n");
    redditCache.timestamp = Date.now();

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
    next(error);
  }
};
