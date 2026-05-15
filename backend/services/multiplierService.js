import { GoogleGenerativeAI } from "@google/generative-ai";
import MultiplierCampaign from "../models/MultiplierCampaign.js";
import { buildSystemPrompt } from "./aiMemoryService.js"; // Assuming we reuse the brain from Feature 1

const getModel = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
};

// --- PLATFORM AGENTS ---

const generateTwitterThread = async (systemPrompt, sourceContent) => {
  const model = getModel();
  const prompt = `${systemPrompt}

You are a viral Twitter ghostwriter. Convert the following source material into a high-engagement Twitter thread.
Rules:
1. First tweet must have a "hook" (an undeniable claim or interesting dichotomy).
2. Limit each tweet to 250 characters.
3. No hashtags. No generic phrasing like "A thread".
4. Output MUST be a strict JSON array of strings, where each string is a tweet.

Source Material:
${sourceContent}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: { responseMimeType: "application/json" }
  });
  
  const text = result.response?.text() || '[]';
  return JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
};

const generateLinkedinPost = async (systemPrompt, sourceContent) => {
  const model = getModel();
  const prompt = `${systemPrompt}

You are a top 1% LinkedIn creator. Convert this material into a story-driven LinkedIn post.
Rules:
1. Start with a contrarian statement or personal failure/learning.
2. Leave a double line break after the first sentence.
3. Use bullet points for the core value.
4. End with a question to drive comments.
5. Do not use hashtags.

Source Material:
${sourceContent}`;

  const result = await model.generateContent(prompt);
  return result.response?.text() || "";
};

const generateNewsletter = async (systemPrompt, sourceContent) => {
  const model = getModel();
  const prompt = `${systemPrompt}

Convert this material into an engaging, high-value newsletter email.
Rules:
1. Include a catchy Subject Line at the top.
2. Tone should be intimate, conversational, and direct to the reader.
3. Break the content into readable, scannable sections with headers.

Source Material:
${sourceContent}`;

  const result = await model.generateContent(prompt);
  return result.response?.text() || "";
};

// --- ORCHESTRATOR ---

export const executeFanOutCampaign = async (campaignId, userId, sourceContent) => {
  try {
    // 1. Fetch Creator Memory
    const systemPrompt = await buildSystemPrompt(userId);

    // 2. Execute platform agents concurrently (Promise.allSettled)
    const [twitterRes, linkedinRes, newsletterRes] = await Promise.allSettled([
      generateTwitterThread(systemPrompt, sourceContent),
      generateLinkedinPost(systemPrompt, sourceContent),
      generateNewsletter(systemPrompt, sourceContent)
    ]);

    // 3. Process Results
    const updates = { status: "completed", outputs: {}, errorLogs: [] };

    if (twitterRes.status === "fulfilled") {
      updates.outputs.twitterThread = twitterRes.value;
    } else {
      updates.errorLogs.push(`Twitter Agent Failed: ${twitterRes.reason.message}`);
    }

    if (linkedinRes.status === "fulfilled") {
      updates.outputs.linkedinPost = linkedinRes.value;
    } else {
      updates.errorLogs.push(`LinkedIn Agent Failed: ${linkedinRes.reason.message}`);
    }

    if (newsletterRes.status === "fulfilled") {
      updates.outputs.newsletter = newsletterRes.value;
    } else {
      updates.errorLogs.push(`Newsletter Agent Failed: ${newsletterRes.reason.message}`);
    }

    // If everything failed, mark as failed
    if (updates.errorLogs.length === 3) {
      updates.status = "failed";
    }

    // 4. Update DB
    await MultiplierCampaign.findByIdAndUpdate(campaignId, { $set: updates });

    // In a real streaming architecture, we would emit WebSockets/SSE events here 
    // as each promise resolves, rather than waiting for all to finish.
    
    return updates;
  } catch (error) {
    console.error("Multiplier Campaign Error:", error);
    await MultiplierCampaign.findByIdAndUpdate(campaignId, { 
      status: "failed", 
      $push: { errorLogs: error.message } 
    });
  }
};
