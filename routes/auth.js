const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Register User
// Data need to pass as a josn all data need to pass as a json
// {
//     "name": "John Doe",
//     "email": "john.doe@example.com",
//     "password": "secretpassword"
// }

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }


        user = new User({ name, email, password });

        await user.save();

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        console.error('Error during registration:', err); // Log the full error details
        res.status(500).json({ msg: 'Server error' });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const loginTime = new Date().toISOString();
        const expiresIn = 60 * 60; // 1 hour in seconds
        const expirationTime = new Date(Date.now() + expiresIn * 1000).toISOString(); 

        const profile = {
            name: user.name,
            email: user.email,
            // Add any other profile fields you want to return
            // For example: 
            // address: user.address,
            // phone: user.phone
        };

        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn });
        res.json({ token, profile, loginTime, expirationTime });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Google Auth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Facebook Auth Routes
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/' }), (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

// Twitter Auth Routes
router.get('/twitter', passport.authenticate('twitter'));
router.get('/twitter/callback', passport.authenticate('twitter', { failureRedirect: '/' }), (req, res) => {
    const token = jwt.sign({ userId: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
});

module.exports = router;
