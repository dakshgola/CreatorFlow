import CreatorProfile from "../models/CreatorProfile.js";
import AIGeneration from "../models/AIGeneration.js";

/**
 * AI Memory Service (Creator Brain)
 * 
 * Top AI startups (like Jasper, Copy.ai) separate Prompt Engineering 
 * from Business Logic. This service acts as the "Memory Retrieval" layer.
 * It compiles a "System Prompt" from the user's Creator Profile.
 */
export const buildSystemPrompt = async (userId) => {
  try {
    const profile = await CreatorProfile.findOne({ userId });
    
    // Fetch last 5 generations to maintain consistency
    const recentGens = await AIGeneration.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5);

    let pastWorkBlock = "";
    if (recentGens.length > 0) {
      pastWorkBlock = "\n[PAST SUCCESSFUL CONTENT (Match this style)]\n";
      recentGens.forEach((gen, index) => {
        const textPreview = typeof gen.output === "string" ? gen.output.substring(0, 150) : JSON.stringify(gen.output).substring(0, 150);
        pastWorkBlock += `${index + 1}. Topic: ${gen.topic} | Excerpt: ${textPreview}...\n`;
      });
    }

    // If no profile exists, return a generic but solid baseline
    if (!profile) {
      return `You are an expert AI content creator. Deliver concise, high-quality content.${pastWorkBlock}`;
    }

    // Deconstruct for cleaner templating
    const {
      niche,
      targetAudience,
      tone,
      preferredHooks,
      writingStyle,
      contentPillars,
      contentGoals,
      rejectedOutputs,
    } = profile;

    // Build the dynamic memory blocks
    const identityBlock = niche ? `You are a top-tier creator in the ${niche} space.` : "You are an expert content creator.";
    const audienceBlock = targetAudience ? `Your target audience is: ${targetAudience}. Speak directly to their pain points and desires.` : "";
    const toneBlock = tone?.length > 0 ? `Tone of voice: ${tone.join(", ")}.` : "";
    const styleBlock = writingStyle ? `Writing Rules: ${writingStyle}` : "";
    const goalsBlock = contentGoals ? `Primary Goal: ${contentGoals}` : "";
    
    // Anti-patterns (Crucial for "Resume-Worthy" systems)
    const negativePromptBlock = rejectedOutputs?.length > 0 
      ? `\nCRITICAL - DO NOT USE THESE PATTERNS:\n- ${rejectedOutputs.join("\n- ")}`
      : `\nCRITICAL: Avoid generic AI phrasing like "In today's digital age," "Unleash your potential," or excessive emojis unless requested.`;

    // Assembly of the "Creator Brain" context
    const systemPrompt = `
[SYSTEM CONTEXT - CREATOR BRAIN]
${identityBlock}
${audienceBlock}
${toneBlock}
${goalsBlock}

${styleBlock}
${negativePromptBlock}
${pastWorkBlock}

[INSTRUCTIONS]
Internalize the context above. All outputs must feel handwritten by this specific creator. 
Match the tone and rules exactly.
    `.trim();

    return systemPrompt;
  } catch (error) {
    console.error("Error building system prompt:", error);
    return "You are an expert AI content creator.";
  }
};
