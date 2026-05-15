import express from 'express';
import rateLimit from "express-rate-limit";
import {
  generateContentV2,
  getRecentGenerations,
  generateABTitles,
  chooseTitle,
  runContentPipeline,
  scoreContent,
  getTrendingHooks
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { generateSchema, abTitlesSchema, pipelineSchema, scoreSchema } from '../validators/aiValidator.js';

const router = express.Router();

// Strict AI Rate Limiter (20 req / hour per userId)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  keyGenerator: (req) => req.user?.id || req.ip,
  message: { success: false, message: "AI rate limit exceeded (20 requests per hour). Please upgrade or try again later." }
});

router.use(protect);
router.use(aiLimiter);

/**
 * @route   POST /api/v1/ai/generate
 * @desc    Generate script/hook/caption/ideas end-to-end
 */
router.post('/generate', validate(generateSchema), generateContentV2);

/**
 * @route   GET /api/v1/ai/generate
 * @desc    Get last 5 content generations
 */
router.get('/generate', getRecentGenerations);

/**
 * @route   POST /api/v1/ai/ab-titles
 * @desc    Generate 5 A/B titles
 */
router.post('/ab-titles', validate(abTitlesSchema), generateABTitles);

/**
 * @route   POST /api/v1/ai/ab-titles/:sessionId/choose
 * @desc    Choose a winning title
 */
router.post('/ab-titles/:sessionId/choose', chooseTitle);

/**
 * @route   POST /api/v1/ai/pipeline
 * @desc    Parallel generate reels/linkedin/twitter/email
 */
router.post('/pipeline', validate(pipelineSchema), runContentPipeline);

/**
 * @route   POST /api/v1/ai/score
 * @desc    Score content and get fixes
 */
router.post('/score', validate(scoreSchema), scoreContent);

/**
 * @route   GET /api/v1/ai/trending-hooks
 * @desc    Fetch Reddit trends & generate hooks
 */
router.get('/trending-hooks', getTrendingHooks);

export default router;
