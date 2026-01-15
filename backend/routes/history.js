import express from 'express';
import History from '../models/History.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/history
 * @desc    Get user history (AI outputs, etc.)
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const history = await History.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(history);
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

export default router;
