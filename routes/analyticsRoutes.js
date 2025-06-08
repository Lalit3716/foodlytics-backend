const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getDashboard,
  getDailyStats,
  getNutritionBreakdown,
  resetAnalytics,
} = require("../controllers/analyticsController");

// All routes are protected
router.use(protect);

// Dashboard overview
router.get("/dashboard", getDashboard);

// Daily statistics
router.get("/daily", getDailyStats);

// Nutrition breakdown
router.get("/nutrition", getNutritionBreakdown);

// Reset analytics
router.delete("/reset", resetAnalytics);

module.exports = router; 