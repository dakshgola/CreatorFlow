import { GoogleGenerativeAI } from '@google/generative-ai';

// ❗ Do NOT re-import dotenv here (already loaded in server.js)

// Initialize Gemini client
let genAI;
let model;

try {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.warn('Warning: GEMINI_API_KEY not found in environment variables');
  } else {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    console.log('Gemini client initialized successfully');
  }
} catch (error) {
  console.error('Error initializing Gemini client:', error);
}

/**
 * Send a prompt to Gemini and get a response
 * @param {string} prompt - The prompt to send to Gemini
 * @param {Object} options - Additional options
 * @param {number} options.temperature - Temperature for generation (0-1, default: 0.7)
 * @param {number} options.maxTokens - Maximum tokens to generate (default: 1000)
 * @param {string} options.responseFormat - Expected response format ('json' or 'text', default: 'text')
 * @returns {Promise<Object>} Response object with success, data, and error fields
 */
export const sendPrompt = async (prompt, options = {}) => {
  try {
    if (!genAI || !model) {
      throw new Error('Gemini client not initialized. Please check GEMINI_API_KEY in .env');
    }

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      throw new Error('Prompt is required and must be a non-empty string');
    }

    const {
      temperature = 0.7,
      maxTokens = 1000,
      responseFormat = 'text',
    } = options;

    // Configure generation config
    const generationConfig = {
      temperature: Math.max(0, Math.min(1, temperature)), // Clamp between 0 and 1
      maxOutputTokens: maxTokens,
    };

    // If JSON format is requested, add instruction to return JSON
    let finalPrompt = prompt;
    if (responseFormat === 'json') {
      finalPrompt = `${prompt}\n\nPlease respond with valid JSON only, no additional text.`;
    }

    // Generate content
    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    let text = response.text();

    // Try to parse as JSON if JSON format was requested
    if (responseFormat === 'json') {
      try {
        // Remove markdown code blocks if present
        text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const jsonData = JSON.parse(text);
        return {
          success: true,
          data: jsonData,
          error: null,
        };
      } catch (parseError) {
        // If JSON parsing fails, return the text anyway
        console.warn('Failed to parse JSON response:', parseError);
        return {
          success: true,
          data: { text },
          error: null,
        };
      }
    }

    return {
      success: true,
      data: { text },
      error: null,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      success: false,
      data: null,
      error: error.message || 'Failed to generate response from Gemini',
    };
  }
};

/**
 * Send multiple prompts in batch (for future use)
 * @param {Array<string>} prompts - Array of prompts
 * @param {Object} options - Options for all prompts
 * @returns {Promise<Array>} Array of responses
 */
export const sendBatchPrompts = async (prompts, options = {}) => {
  try {
    const promises = prompts.map(prompt => sendPrompt(prompt, options));
    const results = await Promise.all(promises);
    return results;
  } catch (error) {
    console.error('Batch prompt error:', error);
    return prompts.map(() => ({
      success: false,
      data: null,
      error: error.message,
    }));
  }
};

export default {
  sendPrompt,
  sendBatchPrompts,
};
