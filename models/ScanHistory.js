const mongoose = require('mongoose');

const ScanHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  barcode: {
    type: String,
    required: true
  },
  productData: {
    name: {
      type: String,
      required: true
    },
    brand: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      default: ''
    },
    healthScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    nutritionInfo: {
      calories: {
        type: Number,
        required: true
      },
      protein: {
        type: Number,
        required: true
      },
      carbs: {
        type: Number,
        required: true
      },
      fat: {
        type: Number,
        required: true
      },
      fiber: {
        type: Number,
        default: 0
      },
      sugar: {
        type: Number,
        default: 0
      },
      sodium: {
        type: Number,
        default: 0
      }
    },
    ingredients: [{
      type: String
    }],
    allergens: [{
      type: String
    }]
  },
  scannedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for efficient queries
ScanHistorySchema.index({ userId: 1, scannedAt: -1 });
ScanHistorySchema.index({ userId: 1, barcode: 1 });

module.exports = mongoose.model('ScanHistory', ScanHistorySchema); 