import express from 'express';
import Client from '../models/Client.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Payment from '../models/Payment.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/analytics
 * @desc    Get analytics stats (clients count, tasks due this month, payments pending)
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [clientsCount, projectsCount, tasksDueThisMonth, paymentsPending] = await Promise.all([
      Client.countDocuments({ userId }),
      Project.countDocuments({ userId }),
      Task.countDocuments({
        userId,
        dueDate: { $gte: startOfMonth, $lte: endOfMonth },
        completed: false
      }),
      Payment.countDocuments({ userId, paid: false })
    ]);

    res.json({
      success: true,
      clientsCount,
      projectsCount,
      tasksDueThisMonth,
      paymentsPending
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

export default router;
