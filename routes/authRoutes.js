const express = require('express');
const { register, login, getCurrentUser } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/token', login);

// Get current user route
router.get('/users/me', protect, getCurrentUser);

module.exports = router;
