import { GoogleGenerativeAI } from "@google/generative-ai";

export const evaluateContent = async (contentType, content) => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `You are an elite YouTube and TikTok retention strategist. Evaluate the following ${contentType}.
Analyze it against a strict rubric. Be extremely critical. Most content is a 40/100. A 90/100 means top 1% perfection.

Rubric:
1. Hook Strength (0-100): Is there a massive curiosity gap? Does it break a pattern?
2. Retention Potential (0-100): Is there fluff? Are there clear stakes?
3. Clarity (0-100): Is it confusing to a 5th grader?
4. Emotional Resonance (0-100): Will this make someone angry, inspired, or laugh?

Content to evaluate:
"""
${content}
"""

Output strict JSON only:
{
  "metrics": {
    "hookStrength": { "score": 0, "explanation": "Why?" },
    "retentionPotential": { "score": 0, "explanation": "Why?" },
    "clarity": { "score": 0, "explanation": "Why?" },
    "emotionalResonance": { "score": 0, "explanation": "Why?" }
  },
  "weakestSentence": "Exact sentence quote here that drops retention",
  "suggestedFixes": ["Actionable rewrite 1", "Actionable rewrite 2"],
  "ctrEstimate": "High" // or "Average" or "Low"
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

  // Calculate algorithmic weighted average on the backend
  // Weights: Hook (40%), Retention (30%), Clarity (15%), Emotion (15%)
  const hook = parsedResult.metrics?.hookStrength?.score || 0;
  const retention = parsedResult.metrics?.retentionPotential?.score || 0;
  const clarity = parsedResult.metrics?.clarity?.score || 0;
  const emotion = parsedResult.metrics?.emotionalResonance?.score || 0;

  const overallScore = Math.round(
    (hook * 0.40) +
    (retention * 0.30) +
    (clarity * 0.15) +
    (emotion * 0.15)
  );

  return {
    ...parsedResult,
    overallScore
  };
};
