const UserAnalytics = require("../models/UserAnalytics");

/**
 * Get user analytics dashboard data
 * @route GET /api/analytics/dashboard
 * @access Private
 */
exports.getDashboard = async (req, res) => {
  try {
    const analytics = await UserAnalytics.getOrCreateForUser(req.user.id);

    // Calculate today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayStats = analytics.dailyStats.find(stat => 
      stat.date.getTime() === today.getTime()
    ) || { scans: 0, calories: 0, products: [] };

    // Calculate weekly stats
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const weeklyStats = analytics.dailyStats
      .filter(stat => stat.date >= weekAgo)
      .reduce((acc, stat) => ({
        scans: acc.scans + stat.scans,
        calories: acc.calories + stat.calories,
      }), { scans: 0, calories: 0 });

    // Format response
    const dashboardData = {
      overview: {
        totalScans: analytics.totalScans,
        uniqueProducts: analytics.uniqueProductsScanned,
        totalCalories: Math.round(analytics.totalCaloriesTracked),
        averageHealthScore: Math.round(analytics.averageHealthScore),
      },
      today: {
        scans: todayStats.scans,
        calories: Math.round(todayStats.calories),
        products: todayStats.products,
      },
      weekly: {
        scans: weeklyStats.scans,
        calories: Math.round(weeklyStats.calories),
        averageScansPerDay: Math.round(analytics.scanningPatterns.averageScansPerDay * 10) / 10,
      },
      nutritionTotals: {
        protein: Math.round(analytics.nutritionTotals.protein),
        carbs: Math.round(analytics.nutritionTotals.carbs),
        fat: Math.round(analytics.nutritionTotals.fat),
        fiber: Math.round(analytics.nutritionTotals.fiber),
        sugar: Math.round(analytics.nutritionTotals.sugar),
        sodium: Math.round(analytics.nutritionTotals.sodium),
      },
      healthScoreDistribution: analytics.healthScoreDistribution,
      scanningPatterns: analytics.scanningPatterns,
      topAllergens: Array.from(analytics.allergenExposure.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([allergen, count]) => ({ allergen, count })),
    };

    res.json(dashboardData);
  } catch (error) {
    console.error("Error getting dashboard data:", error);
    res.status(500).json({ message: "Server error getting analytics" });
  }
};

/**
 * Get detailed daily statistics
 * @route GET /api/analytics/daily
 * @query days - Number of days to retrieve (default: 30)
 * @access Private
 */
exports.getDailyStats = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const analytics = await UserAnalytics.getOrCreateForUser(req.user.id);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const dailyStats = analytics.dailyStats
      .filter(stat => stat.date >= startDate)
      .map(stat => ({
        date: stat.date,
        scans: stat.scans,
        calories: Math.round(stat.calories),
        productCount: stat.products.length,
      }))
      .sort((a, b) => a.date - b.date);

    res.json({ dailyStats });
  } catch (error) {
    console.error("Error getting daily stats:", error);
    res.status(500).json({ message: "Server error getting daily statistics" });
  }
};

/**
 * Get nutrition breakdown
 * @route GET /api/analytics/nutrition
 * @access Private
 */
exports.getNutritionBreakdown = async (req, res) => {
  try {
    const analytics = await UserAnalytics.getOrCreateForUser(req.user.id);

    const nutritionData = {
      totals: {
        protein: Math.round(analytics.nutritionTotals.protein),
        carbs: Math.round(analytics.nutritionTotals.carbs),
        fat: Math.round(analytics.nutritionTotals.fat),
        fiber: Math.round(analytics.nutritionTotals.fiber),
        sugar: Math.round(analytics.nutritionTotals.sugar),
        sodium: Math.round(analytics.nutritionTotals.sodium),
      },
      averagePerScan: {
        protein: Math.round((analytics.nutritionTotals.protein / analytics.totalScans) * 10) / 10,
        carbs: Math.round((analytics.nutritionTotals.carbs / analytics.totalScans) * 10) / 10,
        fat: Math.round((analytics.nutritionTotals.fat / analytics.totalScans) * 10) / 10,
        fiber: Math.round((analytics.nutritionTotals.fiber / analytics.totalScans) * 10) / 10,
        sugar: Math.round((analytics.nutritionTotals.sugar / analytics.totalScans) * 10) / 10,
        sodium: Math.round((analytics.nutritionTotals.sodium / analytics.totalScans) * 10) / 10,
      },
      macroDistribution: {
        protein: Math.round((analytics.nutritionTotals.protein * 4 / 
          (analytics.nutritionTotals.protein * 4 + analytics.nutritionTotals.carbs * 4 + analytics.nutritionTotals.fat * 9)) * 100),
        carbs: Math.round((analytics.nutritionTotals.carbs * 4 / 
          (analytics.nutritionTotals.protein * 4 + analytics.nutritionTotals.carbs * 4 + analytics.nutritionTotals.fat * 9)) * 100),
        fat: Math.round((analytics.nutritionTotals.fat * 9 / 
          (analytics.nutritionTotals.protein * 4 + analytics.nutritionTotals.carbs * 4 + analytics.nutritionTotals.fat * 9)) * 100),
      },
    };

    res.json(nutritionData);
  } catch (error) {
    console.error("Error getting nutrition breakdown:", error);
    res.status(500).json({ message: "Server error getting nutrition data" });
  }
};

/**
 * Reset user analytics (for testing or user request)
 * @route DELETE /api/analytics/reset
 * @access Private
 */
exports.resetAnalytics = async (req, res) => {
  try {
    await UserAnalytics.findOneAndDelete({ userId: req.user.id });
    res.json({ message: "Analytics reset successfully" });
  } catch (error) {
    console.error("Error resetting analytics:", error);
    res.status(500).json({ message: "Server error resetting analytics" });
  }
};