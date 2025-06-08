const productService = require('../services/productService');
const ScanHistory = require('../models/ScanHistory');

/**
 * Get product by barcode
 * @route GET /api/product/:barcode
 * @access Private
 */
exports.getProduct = async (req, res) => {
  try {
    const { barcode } = req.params;
    
    if (!barcode) {
      return res.status(400).json({ message: 'Barcode is required' });
    }
    
    const product = await productService.getProduct(barcode);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Save to scan history
    try {
      // Check if this product was already scanned by this user
      const existingScan = await ScanHistory.findOne({
        userId: req.user._id,
        barcode: barcode
      });
      
      if (!existingScan) {
        // Create new scan history entry
        await ScanHistory.create({
          userId: req.user._id,
          barcode: barcode,
          productData: {
            name: product.name,
            brand: product.brand,
            imageUrl: product.imageUrl || '',
            healthScore: product.healthScore,
            nutritionInfo: product.nutritionInfo,
            ingredients: product.ingredients || [],
            allergens: product.allergens || []
          }
        });
      } else {
        // Update the scannedAt timestamp
        existingScan.scannedAt = new Date();
        await existingScan.save();
      }
    } catch (historyError) {
      console.error('Error saving scan history:', historyError);
      // Don't fail the request if history save fails
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error in getProduct controller:', error);
    res.status(500).json({ message: 'Server error getting product' });
  }
}; 