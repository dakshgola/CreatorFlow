import mongoose from "mongoose";
import ContentHistory from "../models/ContentHistory.js";
import PlannerCard from "../models/PlannerCard.js";
import AIGeneration from "../models/AIGeneration.js";
import Payment from "../models/Payment.js";
import Client from "../models/Client.js";

/**
 * Get analytics summary using real MongoDB aggregation pipelines
 * GET /api/v1/analytics/summary
 */
export const getAnalyticsSummary = async (req, res, next) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Execute aggregation pipelines in parallel to prevent user-data leakage
    const [
      aiStats,
      contentByStatusRaw,
      aiByTypeRaw,
      paymentStatsRaw,
      clientsCount,
      recentActivity
    ] = await Promise.all([
      // 1. ContentHistory aggregation for basic stats, activity, average score
      ContentHistory.aggregate([
        { $match: { userId: userId } },
        {
          $facet: {
            totalGenerations: [{ $count: "count" }],
            thisWeek: [
              { $match: { createdAt: { $gte: sevenDaysAgo } } },
              { $count: "count" }
            ],
            dailyActivity: [
              { $match: { createdAt: { $gte: fourteenDaysAgo } } },
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                  },
                  count: { $sum: 1 }
                }
              },
              { $sort: { _id: 1 } }
            ],
            averageScore: [
              { $match: { type: "score" } },
              {
                $group: {
                  _id: null,
                  avg: { $avg: "$output.overallScore" }
                }
              }
            ]
          }
        }
      ]),

      // 2. Content by status (feeds Kanban summary)
      PlannerCard.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),

      // 3. AI generation history by type (feeds AI usage stats)
      AIGeneration.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: "$type", count: { $sum: 1 } } }
      ]),

      // 4. Client count + payment totals (feeds payment KPIs)
      Payment.aggregate([
        { $match: { userId: userId } },
        {
          $group: {
            _id: "$paid",
            totalAmount: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        }
      ]),

      // 5. Client count
      Client.countDocuments({ userId }),

      // 6. Activity timeline (feeds recent activity)
      PlannerCard.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(10)
    ]);

    const rawAI = aiStats[0];

    // Format contentByStatus
    const contentByStatus = { Idea: 0, Script: 0, Shoot: 0, Edit: 0, Posted: 0 };
    contentByStatusRaw.forEach(item => {
      if (item._id) contentByStatus[item._id] = item.count;
    });

    // Format aiByType
    const aiByType = {};
    aiByTypeRaw.forEach(item => {
      if (item._id) aiByType[item._id] = item.count;
    });

    // Format paymentStats
    const paymentStats = { paid: { amount: 0, count: 0 }, unpaid: { amount: 0, count: 0 } };
    paymentStatsRaw.forEach(item => {
      const key = item._id ? "paid" : "unpaid";
      paymentStats[key] = {
        amount: item.totalAmount || 0,
        count: item.count || 0
      };
    });

    // Get real saved items count from AIGeneration where bookmarked is true
    const savedItemsCount = await AIGeneration.countDocuments({ userId, bookmarked: true });

    // Format daily activity for the chart
    const formattedDailyActivity = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      
      const found = rawAI.dailyActivity.find(day => day._id === dateStr);
      formattedDailyActivity.push({
        date: dateStr,
        count: found ? found.count : 0
      });
    }

    const finalData = {
      // Dashboard backward compatibility
      totalGenerations: rawAI.totalGenerations[0]?.count || 0,
      thisWeek: rawAI.thisWeek[0]?.count || 0,
      savedItems: savedItemsCount,
      byType: {
        idea: aiByType.content_idea || 0,
        caption: aiByType.caption || 0,
        score: aiByType.performance_score || 0
      },
      dailyActivity: formattedDailyActivity,
      averageScore: rawAI.averageScore[0]?.avg ? Number(rawAI.averageScore[0].avg.toFixed(1)) : 0,

      // New pipelines
      contentByStatus,
      aiByType,
      paymentStats,
      clientsCount,
      recentActivity: recentActivity.map(c => ({
        _id: c._id,
        title: c.title,
        status: c.status,
        platform: c.platform,
        updatedAt: c.updatedAt
      }))
    };

    res.json(finalData);
  } catch (error) {
    next(error);
  }
};
