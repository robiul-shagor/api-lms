const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
require('dotenv').config();
const cron = require('node-cron');
const passport = require('passport');
const cors = require('cors');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const passportConfig = require('./config/passport');
const { syncData } = require('./services/syncService');

// MongoDB connection
// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    maxPoolSize: 10,          // Adjust the connection pool size as needed
    serverSelectionTimeoutMS: 5000, // Timeout for connecting to the server
    socketTimeoutMS: 45000,        // Timeout for socket inactivity
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('MongoDB connection error:', error);
        process.exit(1); // Exit process if the database fails to connect
    });


// Express setup
const app = express();
app.use(express.json());
app.use(cors());
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Define rate limiter - Limit requests to 100 per 15 minutes
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
});

// Apply rate limiting middleware to all routes
app.use(limiter);

// Schedule data sync every hour
cron.schedule('0 */12 * * *', syncData);

// Define routes
const propertyController = require('./controllers/propertyController');
app.use('/api/properties', limiter, propertyController);
app.use('/auth', limiter, authRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});