# Foodlytics Chatbot API

This document describes how to set up and use the Foodlytics Chatbot API, which uses Google's Gemini AI to provide nutrition-related advice.

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```
GEMINI_API_KEY=your_gemini_api_key
```

### 2. How to Get a Gemini API Key

1. Go to [Google AI Studio](https://ai.google.dev/)
2. Sign in with your Google account
3. Go to the API section
4. Create a new API key
5. Copy the key and add it to your `.env` file

## API Endpoints

All endpoints require authentication using JWT token in the Authorization header.

### Send a Message to the Chatbot

```
POST /api/chatbot/message
```

**Request Body:**
```json
{
  "message": "What are the health benefits of avocados?",
  "conversationId": "64a5e2b7e3f1b2c3d4e5f6a7" // Optional, for continuing an existing conversation
}
```

**Response:**
```json
{
  "message": "Avocados are nutrient-dense fruits that offer several health benefits...",
  "conversationId": "64a5e2b7e3f1b2c3d4e5f6a7",
  "usage": {
    "promptTokenCount": 123,
    "candidatesTokenCount": 456,
    "totalTokenCount": 579
  }
}
```

### Get User's Conversations

```
GET /api/chatbot/conversations
```

**Response:**
```json
[
  {
    "_id": "64a5e2b7e3f1b2c3d4e5f6a7",
    "title": "What are the health benefits of...",
    "createdAt": "2023-07-06T12:34:56.789Z",
    "updatedAt": "2023-07-06T12:40:23.456Z"
  },
  {
    "_id": "64a5e2b7e3f1b2c3d4e5f6a8",
    "title": "How much protein should I eat...",
    "createdAt": "2023-07-05T10:20:30.789Z",
    "updatedAt": "2023-07-05T10:25:45.123Z"
  }
]
```

### Get a Specific Conversation

```
GET /api/chatbot/conversations/:id
```

**Response:**
```json
{
  "_id": "64a5e2b7e3f1b2c3d4e5f6a7",
  "userId": "507f1f77bcf86cd799439011",
  "title": "What are the health benefits of avocados?",
  "messages": [
    {
      "text": "What are the health benefits of avocados?",
      "isUser": true,
      "timestamp": "2023-07-06T12:34:56.789Z"
    },
    {
      "text": "Avocados are nutrient-dense fruits that offer several health benefits...",
      "isUser": false,
      "timestamp": "2023-07-06T12:35:01.123Z"
    }
  ],
  "createdAt": "2023-07-06T12:34:56.789Z",
  "updatedAt": "2023-07-06T12:35:01.123Z"
}
```

### Delete a Conversation

```
DELETE /api/chatbot/conversations/:id
```

**Response:**
```json
{
  "message": "Conversation deleted successfully"
}
```

## Usage Guidelines

1. The chatbot is specifically designed to answer nutrition-related questions
2. It will not provide medical diagnoses or treatment recommendations
3. For best results, ask clear and specific questions
4. The chatbot will maintain conversation context when using the same conversationId

## Error Handling

The API returns appropriate HTTP status codes:
- 400: Bad request (e.g., empty message)
- 401: Unauthorized (invalid or missing token)
- 404: Not found (e.g., conversation not found)
- 500: Server error (e.g., AI service error)

## Rate Limiting

Be aware that the Gemini API has rate limits. Check the [Google AI documentation](https://ai.google.dev/docs) for the latest information on rate limits. 