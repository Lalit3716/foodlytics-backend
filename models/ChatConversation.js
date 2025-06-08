const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  isUser: {
    type: Boolean,
    required: true,
    default: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const ChatConversationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'New Conversation'
  },
  messages: [MessageSchema],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Middleware to update the updatedAt field on save
ChatConversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Generate a title from the first user message if not set
  if (this.title === 'New Conversation' && 
      this.messages && 
      this.messages.length > 0 && 
      this.messages[0].isUser) {
    const firstMessage = this.messages[0].text;
    this.title = firstMessage.length > 30 
      ? firstMessage.substring(0, 30) + '...' 
      : firstMessage;
  }
  
  next();
});

// Create indexes for efficient querying
ChatConversationSchema.index({ userId: 1, updatedAt: -1 });

module.exports = mongoose.model('ChatConversation', ChatConversationSchema); 