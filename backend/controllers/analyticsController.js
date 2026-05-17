import mongoose from "mongoose";
import ContentHistory from "../models/ContentHistory.js";

export const getAnalyticsSummary = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const result = await ContentHistory.aggregate([
      { $match: { userId: userId } },
      {
        $facet: {
          // 1. Total count
          totalGenerations: [{ $count: "count" }],

          // 2. This week count
          thisWeek: [
            { $match: { createdAt: { $gte: sevenDaysAgo } } },
            { $count: "count" }
          ],

          // 3. Saved items count
          savedItems: [
            { $match: { isSaved: true } },
            { $count: "count" }
          ],

          // 4. Group by type
          byType: [
            { $group: { _id: "$type", count: { $sum: 1 } } }
          ],

          // 5. Daily activity for last 14 days
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
            { $sort: { _id: 1 } } // Sort chronologically
          ],

          // 6. Average score
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
    ]);

    const raw = result[0];
    
    // Format byType nicely
    const formattedByType = { idea: 0, caption: 0, score: 0 };
    raw.byType.forEach(item => {
      if (item._id) {
        formattedByType[item._id] = item.count;
      }
    });

    // Fill in missing dates for the 14-day chart
    const formattedDailyActivity = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      
      const found = raw.dailyActivity.find(day => day._id === dateStr);
      formattedDailyActivity.push({
        date: dateStr,
        count: found ? found.count : 0
      });
    }

    const finalData = {
      totalGenerations: raw.totalGenerations[0]?.count || 0,
      thisWeek: raw.thisWeek[0]?.count || 0,
      savedItems: raw.savedItems[0]?.count || 0,
      byType: formattedByType,
      dailyActivity: formattedDailyActivity,
      averageScore: raw.averageScore[0]?.avg ? Number(raw.averageScore[0].avg.toFixed(1)) : 0
    };

    res.json(finalData);
  } catch (error) {
    console.error("Analytics Summary Error:", error);
    res.status(500).json({ success: false, message: "Server error computing analytics" });
  }
};
