const express = require('express');
const passport = require('passport');
const { googleAuthCallback, handleFrontendCallback } = require('../controllers/authController');

const router = express.Router();

// Initial Google auth route
router.get('/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
        accessType: 'offline',
        prompt: 'consent'
    })
);

// Google callback route
router.get('/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
        session: false
    }),
    googleAuthCallback
);

// Handle frontend callback with code
router.post('/google/callback', handleFrontendCallback);

module.exports = router;
