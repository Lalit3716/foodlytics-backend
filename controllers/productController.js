const productService = require('../services/productService');

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
    
    res.json(product);
  } catch (error) {
    console.error('Error in getProduct controller:', error);
    res.status(500).json({ message: 'Server error getting product' });
  }
};

/**
 * Handle image upload and analysis
 * @route POST /api/product/analyze-image
 * @access Private
 */
exports.analyzeImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    
    // In a real implementation, this would process the image with computer vision
    // For now, we'll just return a placeholder message
    res.json({ 
      message: 'Image analysis is not implemented in this version',
      imageReceived: true
    });
  } catch (error) {
    console.error('Error in analyzeImage controller:', error);
    res.status(500).json({ message: 'Server error analyzing image' });
  }
};
