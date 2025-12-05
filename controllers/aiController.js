import { sendPrompt } from '../utils/geminiClient.js';
import History from '../models/History.js';

/**
 * Generate content ideas
 * POST /api/ai/ideas
 * 
 * Sample prompt structure:
 * "Generate {count} creative content ideas for a {niche} niche based on this prompt: {prompt}"
 */
export const generateIdeas = async (req, res) => {
  try {
    const { prompt, niche, count = 5 } = req.body;

    // Validate input
    if (!prompt || !niche) {
      return res.status(400).json({
        success: false,
        message: 'Please provide prompt and niche',
      });
    }

    const ideaCount = Math.min(Math.max(1, parseInt(count) || 5), 20); // Limit between 1-20

    // Construct prompt for Gemini
    const geminiPrompt = `Generate ${ideaCount} creative content ideas for a ${niche} niche.

User's request: ${prompt}

For each idea, provide:
1. A catchy title
2. A brief description (2-3 sentences)
3. Why it would work for this niche

Format the response as a JSON array with objects containing: title, description, and reason.

Example format:
[
  {
    "title": "Idea Title",
    "description": "Brief description of the idea",
    "reason": "Why this works for the niche"
  }
]`;

    const result = await sendPrompt(geminiPrompt, {
      temperature: 0.8,
      maxTokens: 2000,
      responseFormat: 'json',
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate ideas',
        error: result.error,
      });
    }

    // Parse ideas from response
    let ideas = [];
    if (Array.isArray(result.data)) {
      ideas = result.data;
    } else if (result.data.ideas && Array.isArray(result.data.ideas)) {
      ideas = result.data.ideas;
    } else if (result.data.text) {
      // Fallback: try to extract ideas from text
      ideas = [{ title: 'Generated Idea', description: result.data.text }];
    }

    // Save to history
    try {
      await History.create({
        userId: req.user.id,
        type: 'other',
        content: `Generated ${ideas.length} content ideas for ${niche} niche`,
        metadata: {
          prompt,
          niche,
          count: ideas.length,
        },
      });
    } catch (historyError) {
      console.error('Failed to save to history:', historyError);
      // Don't fail the request if history save fails
    }

    res.json({
      success: true,
      data: ideas,
      count: ideas.length,
    });
  } catch (error) {
    console.error('Generate ideas error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating ideas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Generate hooks (attention-grabbing openings)
 * POST /api/ai/hooks
 * 
 * Sample prompt structure:
 * "Generate {count} attention-grabbing hooks for content about {topic}"
 */
export const generateHooks = async (req, res) => {
  try {
    const { topic, count = 5 } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Please provide topic',
      });
    }

    const hookCount = Math.min(Math.max(1, parseInt(count) || 5), 20);

    const geminiPrompt = `Generate ${hookCount} attention-grabbing hooks (opening lines) for content about: ${topic}

Hooks should be:
- Engaging and compelling
- Make viewers want to continue watching/reading
- Varied in style (question, statement, story, etc.)

Format as a JSON array of strings, each string being one hook.

Example format:
[
  "Hook 1 here",
  "Hook 2 here",
  "Hook 3 here"
]`;

    const result = await sendPrompt(geminiPrompt, {
      temperature: 0.9,
      maxTokens: 1500,
      responseFormat: 'json',
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate hooks',
        error: result.error,
      });
    }

    let hooks = [];
    if (Array.isArray(result.data)) {
      hooks = result.data;
    } else if (result.data.hooks && Array.isArray(result.data.hooks)) {
      hooks = result.data.hooks;
    } else if (result.data.text) {
      hooks = [result.data.text];
    }

    // Save to history
    try {
      await History.create({
        userId: req.user.id,
        type: 'project',
        content: `Generated ${hooks.length} hooks for topic: ${topic}`,
        metadata: { topic, count: hooks.length },
      });
    } catch (historyError) {
      console.error('Failed to save to history:', historyError);
    }

    res.json({
      success: true,
      data: hooks,
      count: hooks.length,
    });
  } catch (error) {
    console.error('Generate hooks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating hooks',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Generate script
 * POST /api/ai/scripts
 * 
 * Sample prompt structure:
 * "Generate a {length} script about {topic}"
 */
export const generateScript = async (req, res) => {
  try {
    const { topic, length = 'medium' } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Please provide topic',
      });
    }

    // Map length to approximate word count
    const lengthMap = {
      short: '200-300 words',
      medium: '500-700 words',
      long: '1000-1500 words',
    };

    const wordCount = lengthMap[length] || lengthMap.medium;

    const geminiPrompt = `Generate a video/content script about: ${topic}

Script length: ${wordCount}

The script should:
- Have a clear structure (hook, introduction, main content, conclusion)
- Be engaging and conversational
- Include natural transitions
- Be suitable for video or written content

Format the response as a JSON object with:
{
  "title": "Script title",
  "hook": "Opening hook",
  "introduction": "Introduction paragraph",
  "mainContent": "Main content (can be multiple paragraphs)",
  "conclusion": "Conclusion paragraph",
  "callToAction": "Call to action"
}`;

    const result = await sendPrompt(geminiPrompt, {
      temperature: 0.7,
      maxTokens: 3000,
      responseFormat: 'json',
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate script',
        error: result.error,
      });
    }

    const script = result.data;

    // Save to history
    try {
      await History.create({
        userId: req.user.id,
        type: 'project',
        content: `Generated script for topic: ${topic}`,
        metadata: { topic, length },
      });
    } catch (historyError) {
      console.error('Failed to save to history:', historyError);
    }

    res.json({
      success: true,
      data: script,
    });
  } catch (error) {
    console.error('Generate script error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating script',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Generate captions
 * POST /api/ai/captions
 * 
 * Sample prompt structure:
 * "Generate {count} social media captions about {topic} with {tone} tone"
 */
export const generateCaptions = async (req, res) => {
  try {
    const { topic, tone = 'engaging', count = 5 } = req.body;

    if (!topic) {
      return res.status(400).json({
        success: false,
        message: 'Please provide topic',
      });
    }

    const captionCount = Math.min(Math.max(1, parseInt(count) || 5), 20);

    const geminiPrompt = `Generate ${captionCount} social media captions about: ${topic}

Tone: ${tone}

Each caption should:
- Be engaging and appropriate for social media
- Include emojis where natural
- Be between 100-300 characters
- Match the specified tone

Format as a JSON array of strings.

Example format:
[
  "Caption 1 with emojis 📱✨",
  "Caption 2 with emojis 🎯🔥",
  "Caption 3 with emojis 💡🌟"
]`;

    const result = await sendPrompt(geminiPrompt, {
      temperature: 0.8,
      maxTokens: 2000,
      responseFormat: 'json',
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate captions',
        error: result.error,
      });
    }

    let captions = [];
    if (Array.isArray(result.data)) {
      captions = result.data;
    } else if (result.data.captions && Array.isArray(result.data.captions)) {
      captions = result.data.captions;
    } else if (result.data.text) {
      captions = [result.data.text];
    }

    // Save to history
    try {
      await History.create({
        userId: req.user.id,
        type: 'project',
        content: `Generated ${captions.length} captions for topic: ${topic}`,
        metadata: { topic, tone, count: captions.length },
      });
    } catch (historyError) {
      console.error('Failed to save to history:', historyError);
    }

    res.json({
      success: true,
      data: captions,
      count: captions.length,
    });
  } catch (error) {
    console.error('Generate captions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating captions',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Generate hashtags
 * POST /api/ai/hashtags
 * 
 * Sample prompt structure:
 * "Generate {count} relevant hashtags for {niche} niche"
 */
export const generateHashtags = async (req, res) => {
  try {
    const { niche, count = 10 } = req.body;

    if (!niche) {
      return res.status(400).json({
        success: false,
        message: 'Please provide niche',
      });
    }

    const hashtagCount = Math.min(Math.max(1, parseInt(count) || 10), 50);

    const geminiPrompt = `Generate ${hashtagCount} relevant and trending hashtags for the ${niche} niche.

Hashtags should:
- Be relevant to the niche
- Include a mix of popular and niche-specific tags
- Be suitable for Instagram, TikTok, Twitter, etc.
- Not include the # symbol (just the text)

Format as a JSON array of strings.

Example format:
[
  "hashtag1",
  "hashtag2",
  "hashtag3"
]`;

    const result = await sendPrompt(geminiPrompt, {
      temperature: 0.7,
      maxTokens: 1000,
      responseFormat: 'json',
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to generate hashtags',
        error: result.error,
      });
    }

    let hashtags = [];
    if (Array.isArray(result.data)) {
      hashtags = result.data;
    } else if (result.data.hashtags && Array.isArray(result.data.hashtags)) {
      hashtags = result.data.hashtags;
    } else if (result.data.text) {
      hashtags = result.data.text.split(',').map(tag => tag.trim());
    }

    // Save to history
    try {
      await History.create({
        userId: req.user.id,
        type: 'project',
        content: `Generated ${hashtags.length} hashtags for ${niche} niche`,
        metadata: { niche, count: hashtags.length },
      });
    } catch (historyError) {
      console.error('Failed to save to history:', historyError);
    }

    res.json({
      success: true,
      data: hashtags,
      count: hashtags.length,
    });
  } catch (error) {
    console.error('Generate hashtags error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating hashtags',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

/**
 * Improve existing script
 * POST /api/ai/improve
 * 
 * Sample prompt structure:
 * "Improve this script: {script}"
 */
export const improveScript = async (req, res) => {
  try {
    const { script } = req.body;

    if (!script || typeof script !== 'string' || script.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a script to improve',
      });
    }

    const geminiPrompt = `Improve the following script. Make it more engaging, clear, and effective while maintaining the original message and style.

Original script:
${script}

Provide the improved version with:
1. Enhanced hook (if applicable)
2. Better flow and transitions
3. More engaging language
4. Clearer structure
5. Stronger conclusion/call to action

Format as a JSON object with:
{
  "improvedScript": "The improved script text",
  "changes": ["List of key improvements made"],
  "suggestions": ["Additional suggestions for the script"]
}`;

    const result = await sendPrompt(geminiPrompt, {
      temperature: 0.7,
      maxTokens: 4000,
      responseFormat: 'json',
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to improve script',
        error: result.error,
      });
    }

    const improved = result.data;

    // Save to history
    try {
      await History.create({
        userId: req.user.id,
        type: 'project',
        content: 'Improved script using AI',
        metadata: {
          originalLength: script.length,
          improvedLength: improved.improvedScript?.length || 0,
        },
      });
    } catch (historyError) {
      console.error('Failed to save to history:', historyError);
    }

    res.json({
      success: true,
      data: improved,
    });
  } catch (error) {
    console.error('Improve script error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while improving script',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};


