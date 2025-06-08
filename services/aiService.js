const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");

dotenv.config();

// Check if API key is available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is not set in environment variables");
}

// Initialize the Google Generative AI with the API key
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

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
      const formattedHistory = chatHistory.map((msg) => ({
        role: msg.isUser ? "user" : "model",
        parts: [{ text: msg.text }],
      }));

      // Create a chat session
      const chat = genAI.chats.create({
        model: "gemini-2.0-flash",
        history: formattedHistory,
        config: {
          temperature: 0.4,
          maxOutputTokens: 800,
          systemInstruction: [systemPrompt],
        },
      });

      // Generate response
      const result = await chat.sendMessage(userMessage);
      const response = result.text;

      return {
        text: response,
      };
    } catch (error) {
      console.error("Error getting AI response:", error);
      throw new Error("Failed to generate AI response");
    }
  }
}

module.exports = new AiService();
