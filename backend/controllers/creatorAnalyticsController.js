import DailyCreatorAnalytics from "../models/DailyCreatorAnalytics.js";
import { generateDailyAnalytics } from "../services/analyticsInsightsService.js";

// @desc    Get dashboard analytics (charts + insights)
// @route   GET /api/creator-analytics
// @access  Private
export const getDashboardData = async (req, res) => {
  try {
    // 1. Fetch the last 7 days of data for charts
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const chartData = await DailyCreatorAnalytics.find({
      userId: req.user.id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 }); // Ascending for charts

    // 2. If no data exists for today, trigger the pipeline manually (Fallback)
    // In production, this is done by a Cron Job, not the HTTP request.
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let todayData = chartData.find(d => d.date.getTime() === today.getTime());
    
    if (!todayData) {
      todayData = await generateDailyAnalytics(req.user.id);
      chartData.push(todayData);
    }

    res.status(200).json({ 
      success: true, 
      data: {
        current: todayData,
        chartData: chartData.map(d => ({
          date: d.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          views: d.totalViews,
          subscribers: d.totalSubscribers
        }))
      } 
    });
  } catch (error) {
    console.error("GET CREATOR ANALYTICS ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// @desc    Manually sync YouTube Data (OAuth flow trigger)
// @route   POST /api/creator-analytics/sync
// @access  Private
export const syncYouTubeData = async (req, res) => {
  try {
    // Triggers the background fetch
    const newRecord = await generateDailyAnalytics(req.user.id);
    res.status(200).json({ success: true, data: newRecord });
  } catch (error) {
    console.error("SYNC YOUTUBE ERROR:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
