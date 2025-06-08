const { GoogleGenerativeAI } = require('@google/genai');
const dotenv = require('dotenv');

dotenv.config();

// Check if API key is available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is not set in environment variables');
}

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * Service for interacting with Google's Gemini AI
 */
class AiService {
  /**
   * Get a response from the AI for nutrition-related questions
   * @param {string} userMessage - The user's message
   * @param {Array} chatHistory - Previous chat history (optional)
   * @returns {Promise<Object>} - The AI response
   */
  async getNutritionAdvice(userMessage, chatHistory = []) {
    try {
      // Access the generative model (Gemini)
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      // System prompt to set context and constraints
      const systemPrompt = `You are a nutritional assistant for Foodlytics, a food analytics app. 
      Your role is to provide accurate, helpful, and science-based nutrition advice.
      
      Guidelines:
      - Focus solely on nutrition, food, diet, and health-related questions
      - Avoid giving medical diagnoses or treatment recommendations
      - Use scientific evidence when available
      - Keep responses concise and practical
      - If a question is outside your area of expertise, politely explain that you can only help with nutrition-related topics
      - For questions about specific products, focus on nutritional value, ingredients, and health impacts
      - Always encourage users to consult healthcare professionals for medical advice
      
      Use a friendly, conversational tone but stay professional.`;
      
      // Format conversation history for the model
      const formattedHistory = chatHistory.map(msg => ({
        role: msg.isUser ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
      
      // Create a chat session
      const chat = model.startChat({
        history: formattedHistory,
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.4,  // Lower temperature for more focused, factual responses
          maxOutputTokens: 800, // Limit response length
        },
      });
      
      // Generate response
      const result = await chat.sendMessage(userMessage);
      const response = result.response;
      
      return {
        text: response.text(),
        tokens: response.candidates[0]?.usageMetadata || null
      };
    } catch (error) {
      console.error('Error getting AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }
}

module.exports = new AiService(); 