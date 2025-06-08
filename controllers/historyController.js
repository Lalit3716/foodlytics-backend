const ScanHistory = require("../models/ScanHistory");

/**
 * Get user's scan history
 * @route GET /api/history
 * @access Private
 */
exports.getHistory = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const history = await ScanHistory.find({ userId: req.user.id })
      .sort({ scannedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .lean();

    // Transform the data to match the client's expected format
    const formattedHistory = history.map((item) => ({
      barcode: item.barcode,
      name: item.productData.name,
      brand: item.productData.brand,
      imageUrl: item.productData.imageUrl,
      healthScore: item.productData.healthScore,
      nutritionInfo: item.productData.nutritionInfo,
      ingredients: item.productData.ingredients,
      allergens: item.productData.allergens,
      scannedAt: item.scannedAt,
      servingSize: item.productData.servingSize,
      servingUnit: item.productData.servingUnit,
    }));

    res.json({
      history: formattedHistory,
      total: await ScanHistory.countDocuments({ userId: req.user.id }),
    });
  } catch (error) {
    console.error("Error in getHistory controller:", error);
    res.status(500).json({ message: "Server error getting history" });
  }
};

/**
 * Clear user's scan history
 * @route DELETE /api/history
 * @access Private
 */
exports.clearHistory = async (req, res) => {
  try {
    await ScanHistory.deleteMany({ userId: req.user.id });
    res.json({ message: "History cleared successfully" });
  } catch (error) {
    console.error("Error in clearHistory controller:", error);
    res.status(500).json({ message: "Server error clearing history" });
  }
};

/**
 * Delete a specific item from history
 * @route DELETE /api/history/:barcode
 * @access Private
 */
exports.deleteHistoryItem = async (req, res) => {
  try {
    const { barcode } = req.params;

    const result = await ScanHistory.deleteOne({
      userId: req.user.id,
      barcode: barcode,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "History item not found" });
    }

    res.json({ message: "History item deleted successfully" });
  } catch (error) {
    console.error("Error in deleteHistoryItem controller:", error);
    res.status(500).json({ message: "Server error deleting history item" });
  }
};
