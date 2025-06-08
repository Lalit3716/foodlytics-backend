const express = require('express');
const { 
  sendMessage, 
  getConversations, 
  getConversation, 
  deleteConversation 
} = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

// POST /api/chatbot/message - Send a message to the AI
router.post('/message', sendMessage);

// GET /api/chatbot/conversations - Get user's conversations
router.get('/conversations', getConversations);

// GET /api/chatbot/conversations/:id - Get a specific conversation
router.get('/conversations/:id', getConversation);

// DELETE /api/chatbot/conversations/:id - Delete a conversation
router.delete('/conversations/:id', deleteConversation);

module.exports = router; 