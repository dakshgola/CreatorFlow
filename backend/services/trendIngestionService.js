import Trend from "../models/Trend.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Simulated ingestion pipeline logic (To be connected to BullMQ in prod)
// In a real app, you would use Reddit/Twitter/YouTube APIs
export const ingestAndAnalyzeTrend = async (topic, niche, source, rawData) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert Content Strategist for Creators. Analyze the following trending discussion data.
Topic: ${topic}
Niche: ${niche}
Raw Data: ${rawData}

Do not summarize. Extract the deep insights for a creator. Provide a JSON object with:
- "audiencePainPoints": Array of 3 frustrations or problems people have expressed.
- "repeatedAngles": Array of 2 angles that everyone is already talking about (angles to avoid).
- "contentGaps": Array of 3 unique, contrarian, or hyper-specific angles no one is covering.
- "actionableHooks": Array of 3 viral opening hooks exploiting the content gaps.

Respond ONLY with valid JSON.`;

    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
    });

    const responseText = result.response?.text() || '';
    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch (e) {
      const cleaned = responseText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
      parsedResult = JSON.parse(cleaned);
    }

    // Calculate simulated momentum (In real life, this compares to past db entries)
    const baseScore = Math.floor(Math.random() * 40) + 60; // 60-100
    const momentum = +(Math.random() * 50 + 10).toFixed(2); // 10-60%

    // Upsert into DB
    const newTrend = await Trend.findOneAndUpdate(
      { topic, niche },
      {
        source,
        score: baseScore,
        momentum,
        engagementVolume: Math.floor(Math.random() * 50000) + 1000,
        audiencePainPoints: parsedResult.audiencePainPoints || [],
        repeatedAngles: parsedResult.repeatedAngles || [],
        contentGaps: parsedResult.contentGaps || [],
        actionableHooks: parsedResult.actionableHooks || [],
      },
      { new: true, upsert: true }
    );

    return newTrend;
  } catch (error) {
    console.error("Trend Ingestion Error:", error.message);
    throw error;
  }
};
