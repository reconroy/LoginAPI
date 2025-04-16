const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');

const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email
        },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

const googleAuthCallback = async (req, res) => {
    try {
        // Generate JWT token
        const token = generateToken(req.user);

        // Redirect to frontend with token
        res.redirect(`${process.env.FRONTEND_URL}/auth-success?token=${token}`);
    } catch (error) {
        console.error('Error in Google auth callback:', error);
        res.redirect(`${process.env.FRONTEND_URL}/auth-failed`);
    }
};

// Handle the frontend callback with the authorization code
const handleFrontendCallback = async (req, res) => {
    try {
        const { code, redirectUri } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Authorization code is required' });
        }

        // Exchange the code for tokens
        const tokenResponse = await axios.post(
            'https://oauth2.googleapis.com/token',
            {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri || process.env.FRONTEND_URL,
                grant_type: 'authorization_code'
            }
        );

        const { access_token, id_token } = tokenResponse.data;

        // Get user info with the access token
        const userInfoResponse = await axios.get(
            'https://www.googleapis.com/oauth2/v2/userinfo',
            {
                headers: { Authorization: `Bearer ${access_token}` }
            }
        );

        const userInfo = userInfoResponse.data;

        // Check if user exists in our database
        let user = await User.findOne({ googleId: userInfo.id });

        if (!user) {
            // Create a new user if they don't exist
            user = await User.create({
                googleId: userInfo.id,
                fullName: userInfo.name,
                email: userInfo.email,
                picture: userInfo.picture
            });
        }

        // Generate JWT token
        const token = generateToken(user);

        // Return user info and token
        res.status(200).json({
            user: {
                id: user._id,
                name: user.fullName,
                email: user.email,
                picture: user.picture,
                role: user.role || 'user'
            },
            token
        });
    } catch (error) {
        console.error('Error in frontend Google callback:', error);
        res.status(500).json({
            message: 'Authentication failed',
            error: error.message
        });
    }
};

module.exports = {
    googleAuthCallback,
    handleFrontendCallback
};
