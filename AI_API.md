# AI API Documentation

This document describes the AI-powered content generation endpoints using Google Gemini.

## Base URL
```
http://localhost:5000/api/ai
```

**All endpoints require authentication.** Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-token>
```

## Environment Variables Required

Add to your `.env` file:
```env
GEMINI_API_KEY=your-gemini-api-key-here
```

Get your API key from: https://makersuite.google.com/app/apikey

---

## Endpoints

### 1. Generate Content Ideas
**POST** `/api/ai/ideas`

Generate creative content ideas based on a prompt and niche.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "prompt": "Content about productivity tips",
  "niche": "Productivity",
  "count": 5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "title": "5 Morning Routines That Boost Productivity",
      "description": "A comprehensive guide to morning routines that help professionals start their day right.",
      "reason": "Productivity niche audiences love actionable morning routine content"
    },
    {
      "title": "Time-Blocking Mastery",
      "description": "Learn how to use time-blocking to maximize your daily output.",
      "reason": "Time management is core to productivity content"
    }
  ],
  "count": 5
}
```

**Parameters:**
- `prompt` (required): Description of what kind of ideas you want
- `niche` (required): The niche/topic area
- `count` (optional): Number of ideas to generate (1-20, default: 5)

---

### 2. Generate Hooks
**POST** `/api/ai/hooks`

Generate attention-grabbing opening hooks for content.

**Request Body:**
```json
{
  "topic": "Starting a YouTube channel",
  "count": 5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    "What if I told you that you could start a YouTube channel in just 30 days?",
    "I made $10,000 in my first month on YouTube. Here's how...",
    "Stop making these 5 mistakes that are killing your channel growth",
    "The secret strategy that got me 100K subscribers in 6 months",
    "You're doing YouTube wrong. Here's the right way."
  ],
  "count": 5
}
```

**Parameters:**
- `topic` (required): The topic for the hooks
- `count` (optional): Number of hooks to generate (1-20, default: 5)

---

### 3. Generate Script
**POST** `/api/ai/scripts`

Generate a complete content script.

**Request Body:**
```json
{
  "topic": "How to build a personal brand",
  "length": "medium"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "title": "How to Build a Personal Brand That Stands Out",
    "hook": "In today's digital age, your personal brand is your most valuable asset...",
    "introduction": "Welcome! Today we're diving into the world of personal branding...",
    "mainContent": "Building a personal brand starts with understanding your unique value proposition...",
    "conclusion": "Remember, building a personal brand is a journey, not a destination...",
    "callToAction": "If you found this helpful, subscribe for more branding tips!"
  }
}
```

**Parameters:**
- `topic` (required): The topic for the script
- `length` (optional): Script length - "short" (200-300 words), "medium" (500-700 words), "long" (1000-1500 words). Default: "medium"

---

### 4. Generate Captions
**POST** `/api/ai/captions`

Generate social media captions.

**Request Body:**
```json
{
  "topic": "New product launch",
  "tone": "excited",
  "count": 5
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    "🚀 It's finally here! Our new product is launching today! Get ready to transform your workflow! 💼✨",
    "✨ The moment you've been waiting for is here! Introducing our latest innovation that's going to change everything! 🎉",
    "🔥 Big news! We're launching something amazing today. Stay tuned for the reveal! 👀",
    "💡 Innovation meets excellence! Our new product is designed to help you achieve more. Check it out! 🚀",
    "🎊 Launch day! We're so excited to share what we've been working on. This is going to be game-changing! 💪"
  ],
  "count": 5
}
```

**Parameters:**
- `topic` (required): The topic for the captions
- `tone` (optional): Caption tone (e.g., "engaging", "excited", "professional", "casual"). Default: "engaging"
- `count` (optional): Number of captions to generate (1-20, default: 5)

---

### 5. Generate Hashtags
**POST** `/api/ai/hashtags`

Generate relevant hashtags for a niche.

**Request Body:**
```json
{
  "niche": "Fitness",
  "count": 10
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    "fitness",
    "workout",
    "health",
    "gym",
    "fitnessmotivation",
    "fitlife",
    "training",
    "exercise",
    "healthylifestyle",
    "fitnessjourney"
  ],
  "count": 10
}
```

**Parameters:**
- `niche` (required): The niche/topic area
- `count` (optional): Number of hashtags to generate (1-50, default: 10)

---

### 6. Improve Script
**POST** `/api/ai/improve`

Improve an existing script with AI suggestions.

**Request Body:**
```json
{
  "script": "This is my current script. It needs improvement..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "improvedScript": "This is your improved script with better flow and engagement...",
    "changes": [
      "Enhanced the hook to be more attention-grabbing",
      "Improved transitions between sections",
      "Added more engaging language",
      "Strengthened the call to action"
    ],
    "suggestions": [
      "Consider adding a personal story in the introduction",
      "Include more specific examples in the main content",
      "Add a question to engage the audience"
    ]
  }
}
```

**Parameters:**
- `script` (required): The script text to improve

---

## Usage Examples

### JavaScript/Fetch Examples

#### Generate Ideas
```javascript
const generateIdeas = async () => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/ai/ideas', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: 'Content about productivity tips',
      niche: 'Productivity',
      count: 5,
    }),
  });

  const data = await response.json();
  return data;
};
```

#### Generate Hooks
```javascript
const generateHooks = async (topic) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/ai/hooks', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: topic,
      count: 5,
    }),
  });

  const data = await response.json();
  return data;
};
```

#### Generate Script
```javascript
const generateScript = async (topic, length = 'medium') => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/ai/scripts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: topic,
      length: length,
    }),
  });

  const data = await response.json();
  return data;
};
```

#### Generate Captions
```javascript
const generateCaptions = async (topic, tone = 'engaging') => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/ai/captions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: topic,
      tone: tone,
      count: 5,
    }),
  });

  const data = await response.json();
  return data;
};
```

#### Generate Hashtags
```javascript
const generateHashtags = async (niche) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/ai/hashtags', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      niche: niche,
      count: 10,
    }),
  });

  const data = await response.json();
  return data;
};
```

#### Improve Script
```javascript
const improveScript = async (script) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/ai/improve', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      script: script,
    }),
  });

  const data = await response.json();
  return data;
};
```

### React Hook Example
```jsx
import { useState } from 'react';

const useAIGeneration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async (endpoint, body) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/ai/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Generation failed');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error };
};

// Usage
const MyComponent = () => {
  const { generate, loading, error } = useAIGeneration();

  const handleGenerateIdeas = async () => {
    try {
      const result = await generate('ideas', {
        prompt: 'Productivity tips',
        niche: 'Productivity',
        count: 5,
      });
      console.log('Ideas:', result.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <button onClick={handleGenerateIdeas} disabled={loading}>
      {loading ? 'Generating...' : 'Generate Ideas'}
    </button>
  );
};
```

## Features

1. **History Tracking**: All AI generations are automatically saved to the History model
2. **Structured Responses**: Responses are formatted as JSON for easy consumption
3. **Error Handling**: Comprehensive error handling with helpful messages
4. **Rate Limiting**: Consider implementing rate limiting for production use
5. **User Isolation**: All generations are tied to the authenticated user

## Status Codes

- `200` - Success
- `400` - Bad Request (missing or invalid parameters)
- `401` - Unauthorized (missing or invalid token)
- `500` - Server Error (Gemini API error or server issue)

## Notes

- All responses are saved to the History model automatically
- Gemini API has rate limits - consider implementing caching for production
- Responses may vary slightly between calls due to AI generation
- For production, consider adding request rate limiting
- Make sure GEMINI_API_KEY is set in your `.env` file

## Installing Dependencies

Make sure to install the Google Generative AI package:
```bash
npm install @google/generative-ai
```


