const aiService = require("../services/aiService");
const ChatConversation = require("../models/ChatConversation");

/**
 * Get a response from the AI
 * @route POST /api/chatbot/message
 * @access Private
 */
exports.sendMessage = async (req, res) => {
  try {
    const { message, conversationId } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ message: "Message is required" });
    }

    let conversation;
    let chatHistory = [];

    // If conversationId is provided, fetch existing conversation
    if (conversationId) {
      conversation = await ChatConversation.findOne({
        _id: conversationId,
        userId: req.user._id,
      });

      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Extract chat history
      chatHistory = conversation.messages;
    } else {
      // Create a new conversation
      conversation = new ChatConversation({
        userId: req.user._id,
        messages: [],
      });
    }

    // Add user message to conversation
    const userMessage = {
      text: message,
      isUser: true,
      timestamp: new Date(),
    };
    conversation.messages.push(userMessage);

    // Get AI response
    const aiResponse = await aiService.getNutritionAdvice(message, chatHistory);

    // Add AI response to conversation
    const botMessage = {
      text: aiResponse.text,
      isUser: false,
      timestamp: new Date(),
    };
    conversation.messages.push(botMessage);

    // Save conversation
    await conversation.save();

    // Return response
    res.json({
      message: aiResponse.text,
      conversationId: conversation._id,
    });
  } catch (error) {
    console.error("Error in sendMessage controller:", error);
    res.status(500).json({ message: "Error generating response" });
  }
};

/**
 * Get user's conversations
 * @route GET /api/chatbot/conversations
 * @access Private
 */
exports.getConversations = async (req, res) => {
  try {
    const conversations = await ChatConversation.find({ userId: req.user._id })
      .select("_id title createdAt updatedAt")
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (error) {
    console.error("Error in getConversations controller:", error);
    res.status(500).json({ message: "Error fetching conversations" });
  }
};

/**
 * Get a specific conversation
 * @route GET /api/chatbot/conversations/:id
 * @access Private
 */
exports.getConversation = async (req, res) => {
  try {
    const conversation = await ChatConversation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.json(conversation);
  } catch (error) {
    console.error("Error in getConversation controller:", error);
    res.status(500).json({ message: "Error fetching conversation" });
  }
};

/**
 * Delete a conversation
 * @route DELETE /api/chatbot/conversations/:id
 * @access Private
 */
exports.deleteConversation = async (req, res) => {
  try {
    const result = await ChatConversation.deleteOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    res.json({ message: "Conversation deleted successfully" });
  } catch (error) {
    console.error("Error in deleteConversation controller:", error);
    res.status(500).json({ message: "Error deleting conversation" });
  }
};
