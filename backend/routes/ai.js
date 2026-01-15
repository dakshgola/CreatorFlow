import express from 'express';
import {
  generateIdeas,
  generateHooks,
  generateScript,
  generateCaptions,
  generateHashtags,
  improveScript,
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

export default router;
