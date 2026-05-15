import express from 'express';
import {
  generateIdeas,
  generateHooks,
  generateScript,
  generateCaptions,
  generateHashtags,
  improveScript,
  generateContent,
  getRecentGenerations,
  generateDigest,
} from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected - require authentication
router.use(protect);

/**
 * @route   POST /api/ai/ideas
 * @desc    Generate content ideas
 * @access  Private
 * @body    { prompt, niche, count }
 */
router.post('/ideas', generateIdeas);

/**
 * @route   POST /api/ai/hooks
 * @desc    Generate attention-grabbing hooks
 * @access  Private
 * @body    { topic, count }
 */
router.post('/hooks', generateHooks);

/**
 * @route   POST /api/ai/scripts
 * @desc    Generate content script
 * @access  Private
 * @body    { topic, length }
 */
router.post('/scripts', generateScript);

/**
 * @route   POST /api/ai/captions
 * @desc    Generate social media captions
 * @access  Private
 * @body    { topic, tone, count }
 */
router.post('/captions', generateCaptions);

/**
 * @route   POST /api/ai/hashtags
 * @desc    Generate hashtags
 * @access  Private
 * @body    { niche, count }
 */
router.post('/hashtags', generateHashtags);

/**
 * @route   POST /api/ai/improve
 * @desc    Improve existing script
 * @access  Private
 * @body    { script }
 */
router.post('/improve', improveScript);

/**
 * @route   POST /api/ai/generate
 * @desc    Generate full content structured JSON
 * @access  Private
 * @body    { topic, niche, platform }
 */
router.post('/generate', generateContent);

/**
 * @route   GET /api/ai/generate
 * @desc    Get last 5 content generations
 * @access  Private
 */
router.get('/generate', getRecentGenerations);

/**
 * @route   GET /api/ai/digest
 * @desc    Generate weekly AI digest
 * @access  Private
 */
router.get('/digest', generateDigest);

export default router;
