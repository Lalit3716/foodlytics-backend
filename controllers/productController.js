const productService = require("../services/productService");
const ScanHistory = require("../models/ScanHistory");
const aiService = require("../services/aiService");
const UserAnalytics = require("../models/UserAnalytics");

/**
 * Get product by barcode
 * @route GET /api/product/:barcode
 * @access Private
 */
exports.getProduct = async (req, res) => {
  try {
    const { barcode } = req.params;

    if (!barcode) {
      return res.status(400).json({ message: "Barcode is required" });
    }

    const product = await productService.getProduct(barcode);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Get healthier recommendations using AI
    let recommendations = null;
    try {
      const prompt = `Based on this product's nutritional profile, suggest 3 healthier alternatives:

Product: ${product.name}
Brand: ${product.brand}
Health Score: ${product.healthScore}/100
Nutrition per 100g:
- Calories: ${product.nutritionInfo.calories} kcal
- Protein: ${product.nutritionInfo.protein}g
- Carbs: ${product.nutritionInfo.carbs}g
- Fat: ${product.nutritionInfo.fat}g
- Fiber: ${product.nutritionInfo.fiber}g
- Sugar: ${product.nutritionInfo.sugar}g
- Sodium: ${product.nutritionInfo.sodium}mg
${
  product.ingredients.length > 0
    ? `Ingredients: ${product.ingredients.slice(0, 5).join(", ")}`
    : ""
}

Please provide recommendations in this exact JSON format:
{
  "recommendations": [
    {
      "name": "Product name",
      "imgUrl": "Leave empty string if no real image available",
      "barcode": "Real barcode/UPC code if known, otherwise null",
      "reason": "Why this is healthier (max 50 words)",
      "nutritionHighlights": ["Key benefit 1", "Key benefit 2"],
      "category": "Same category as original product"
    }
  ],
  "generalAdvice": "Brief advice about this type of product (max 50 words)"
}

IMPORTANT: 
- For imgUrl: Only provide REAL, existing product image URLs from actual sources. If you don't have a real image URL, use an empty string "".
- Do NOT use placeholder URLs like example.com, placeholder.com, or any made-up URLs.
- For barcode: Only provide real, valid barcode/UPC codes if you know them. Otherwise, use null.
- Recommend real, existing products that people can actually find in stores.`;

      const aiResponse = await aiService.getNutritionAdvice(prompt);

      // Parse the AI response to extract JSON
      const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      }
    } catch (aiError) {
      console.error("Error getting AI recommendations:", aiError);
      // Don't fail the request if AI recommendations fail
    }

    // Save to scan history and update analytics
    try {
      // Check if this product was already scanned by this user
      const existingScan = await ScanHistory.findOne({
        userId: req.user.id,
        barcode: barcode,
      });

      let isNewProduct = false;

      if (!existingScan) {
        // Create new scan history entry
        await ScanHistory.create({
          userId: req.user.id,
          barcode: barcode,
          productData: {
            name: product.name,
            brand: product.brand,
            imageUrl: product.imageUrl || "",
            healthScore: product.healthScore,
            nutritionInfo: product.nutritionInfo,
            ingredients: product.ingredients || [],
            allergens: product.allergens || [],
            servingSize: product.servingSize || "100",
            servingUnit: product.servingUnit || "g",
          },
        });
        isNewProduct = true;
      } else {
        // Update the scannedAt timestamp
        existingScan.scannedAt = new Date();
        await existingScan.save();
      }

      // Update user analytics
      try {
        const userAnalytics = await UserAnalytics.getOrCreateForUser(req.user.id);
        await userAnalytics.updateOnProductScan(product, isNewProduct);
      } catch (analyticsError) {
        console.error("Error updating user analytics:", analyticsError);
        // Don't fail the request if analytics update fails
      }
    } catch (historyError) {
      console.error("Error saving scan history:", historyError);
      // Don't fail the request if history save fails
    }

    // Include recommendations in the response
    res.json({
      ...product,
      recommendations: recommendations,
    });
  } catch (error) {
    console.error("Error in getProduct controller:", error);
    res.status(500).json({ message: "Server error getting product" });
  }
};
