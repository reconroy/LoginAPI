const express = require('express');
const router = express.Router();
const { registerUser, getCurrentUser } = require('../controllers/userController');

// Register a new user
router.post('/register', registerUser);

// Get current user info
router.get('/me', getCurrentUser);

module.exports = router;
