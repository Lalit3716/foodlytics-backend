const express = require('express');
const { getHistory, clearHistory, deleteHistoryItem } = require('../controllers/historyController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Get user's scan history
router.get('/', protect, getHistory);

// Clear all history
router.delete('/', protect, clearHistory);

// Delete specific history item
router.delete('/:barcode', protect, deleteHistoryItem);

module.exports = router; 