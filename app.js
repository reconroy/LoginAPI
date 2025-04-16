const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config();
const PORT = process.env.PORT;

// Passport config
require('./config/passport');

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

// Import routes
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'API is running' });
});

// Use routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
