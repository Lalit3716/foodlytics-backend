const mongoose = require("mongoose");

const userAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  totalScans: {
    type: Number,
    default: 0,
  },
  uniqueProductsScanned: {
    type: Number,
    default: 0,
  },
  totalCaloriesTracked: {
    type: Number,
    default: 0,
  },
  averageHealthScore: {
    type: Number,
    default: 0,
  },
  // Daily statistics
  dailyStats: [{
    date: {
      type: Date,
      required: true,
    },
    scans: {
      type: Number,
      default: 0,
    },
    calories: {
      type: Number,
      default: 0,
    },
    products: [{
      barcode: String,
      name: String,
      calories: Number,
      healthScore: Number,
      scannedAt: {
        type: Date,
        default: Date.now,
      },
    }],
  }],
  // Category breakdown
  categoryBreakdown: {
    type: Map,
    of: {
      count: { type: Number, default: 0 },
      totalCalories: { type: Number, default: 0 },
      averageHealthScore: { type: Number, default: 0 },
    },
    default: new Map(),
  },
  // Nutrition totals
  nutritionTotals: {
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
  },
  // Health score distribution
  healthScoreDistribution: {
    excellent: { type: Number, default: 0 }, // 80-100
    good: { type: Number, default: 0 },      // 60-79
    fair: { type: Number, default: 0 },      // 40-59
    poor: { type: Number, default: 0 },      // 0-39
  },
  // Scanning patterns
  scanningPatterns: {
    mostActiveHour: { type: Number, min: 0, max: 23 },
    mostActiveDay: { type: String },
    averageScansPerDay: { type: Number, default: 0 },
  },
  // Allergen exposure count
  allergenExposure: {
    type: Map,
    of: Number,
    default: new Map(),
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient queries
userAnalyticsSchema.index({ userId: 1 });
userAnalyticsSchema.index({ "dailyStats.date": 1 });

// Method to update analytics when a product is scanned
userAnalyticsSchema.methods.updateOnProductScan = async function(product, isNewProduct = false) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Update total scans
  this.totalScans += 1;
  
  // Update unique products if new
  if (isNewProduct) {
    this.uniqueProductsScanned += 1;
  }

  // Update total calories (per 100g serving)
  const calories = product.nutritionInfo.calories || 0;
  this.totalCaloriesTracked += calories;

  // Update average health score
  const currentTotal = this.averageHealthScore * (this.totalScans - 1);
  this.averageHealthScore = (currentTotal + product.healthScore) / this.totalScans;

  // Update daily stats
  let todayStats = this.dailyStats.find(stat => 
    stat.date.getTime() === today.getTime()
  );

  if (!todayStats) {
    todayStats = {
      date: today,
      scans: 0,
      calories: 0,
      products: [],
    };
    this.dailyStats.push(todayStats);
  }

  todayStats.scans += 1;
  todayStats.calories += calories;
  todayStats.products.push({
    barcode: product.barcode,
    name: product.name,
    calories: calories,
    healthScore: product.healthScore,
    scannedAt: new Date(),
  });

  // Keep only last 30 days of daily stats
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  this.dailyStats = this.dailyStats.filter(stat => stat.date >= thirtyDaysAgo);

  // Update nutrition totals
  const nutrition = product.nutritionInfo;
  this.nutritionTotals.protein += nutrition.protein || 0;
  this.nutritionTotals.carbs += nutrition.carbs || 0;
  this.nutritionTotals.fat += nutrition.fat || 0;
  this.nutritionTotals.fiber += nutrition.fiber || 0;
  this.nutritionTotals.sugar += nutrition.sugar || 0;
  this.nutritionTotals.sodium += nutrition.sodium || 0;

  // Update health score distribution
  if (product.healthScore >= 80) {
    this.healthScoreDistribution.excellent += 1;
  } else if (product.healthScore >= 60) {
    this.healthScoreDistribution.good += 1;
  } else if (product.healthScore >= 40) {
    this.healthScoreDistribution.fair += 1;
  } else {
    this.healthScoreDistribution.poor += 1;
  }

  // Update allergen exposure
  if (product.allergens && product.allergens.length > 0) {
    product.allergens.forEach(allergen => {
      const currentCount = this.allergenExposure.get(allergen) || 0;
      this.allergenExposure.set(allergen, currentCount + 1);
    });
  }

  // Update scanning patterns
  const scanHour = new Date().getHours();
  const scanDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  // Simple tracking for most active hour (would need more sophisticated logic in production)
  this.scanningPatterns.mostActiveHour = scanHour;
  this.scanningPatterns.mostActiveDay = scanDay;
  
  // Calculate average scans per day
  const daysSinceFirstScan = Math.max(1, Math.ceil((new Date() - this.createdAt) / (1000 * 60 * 60 * 24)));
  this.scanningPatterns.averageScansPerDay = this.totalScans / daysSinceFirstScan;

  this.lastUpdated = new Date();
  
  return this.save();
};

// Static method to get or create analytics for a user
userAnalyticsSchema.statics.getOrCreateForUser = async function(userId) {
  let analytics = await this.findOne({ userId });
  
  if (!analytics) {
    analytics = await this.create({ userId });
  }
  
  return analytics;
};

module.exports = mongoose.model("UserAnalytics", userAnalyticsSchema); 