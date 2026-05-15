import { GoogleGenerativeAI } from "@google/generative-ai";
import CompetitorAnalysis from "../models/CompetitorAnalysis.js";
import CreatorProfile from "../models/CreatorProfile.js";

// Simulated ingestion and analysis (To be replaced with Apify webhook callback in prod)
export const processCompetitorIntelligence = async (analysisId, userId, targetUrl) => {
  try {
    // 1. Simulate Scraper Delay & Data fetch
    await new Promise(resolve => setTimeout(resolve, 2000));
    const simulatedScrapedData = "This is a placeholder for 50 scraped tweets/transcripts about growing SaaS revenue and building AI wrappers quickly.";

    // 2. Fetch User's Creator Profile for context
    const userProfile = await CreatorProfile.findOne({ userId });
    const userNiche = userProfile?.niche || "General Content";

    // 3. Update status to Analyzing
    await CompetitorAnalysis.findByIdAndUpdate(analysisId, { status: "analyzing" });

    // 4. Run AI Synthesis
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an elite Business Strategist. 
We have scraped a competitor's content.
Competitor URL: ${targetUrl}
User's Niche: ${userNiche}

Analyze the competitor's raw data and find Blue Ocean differentiation strategies for the User. Do not compete where the competitor is strong.

Raw Competitor Data:
"${simulatedScrapedData}"

Output strict JSON only:
{
  "competitorName": "Estimated Name",
  "contentPillars": [
    { "topic": "Name of pillar", "frequencyPercent": 60 }
  ],
  "viralHookPatterns": ["Structural pattern 1", "Structural pattern 2"],
  "audienceOverlap": ["Pain point 1 they target"],
  "ignoredTopics": ["Sub-niche A", "Sub-niche B that they ignore"],
  "differentiationAngle": "While they focus on X, you should pivot to Y because..."
}`;

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

    // 5. Save Results
    await CompetitorAnalysis.findByIdAndUpdate(analysisId, {
      status: "completed",
      competitorName: parsedResult.competitorName || "Unknown",
      contentPillars: parsedResult.contentPillars || [],
      viralHookPatterns: parsedResult.viralHookPatterns || [],
      audienceOverlap: parsedResult.audienceOverlap || [],
      ignoredTopics: parsedResult.ignoredTopics || [],
      differentiationAngle: parsedResult.differentiationAngle || "Focus on your unique strengths."
    });

  } catch (error) {
    console.error("COMPETITOR ANALYSIS ERROR:", error);
    await CompetitorAnalysis.findByIdAndUpdate(analysisId, { 
      status: "failed", 
      $push: { errorLogs: error.message } 
    });
  }
};
