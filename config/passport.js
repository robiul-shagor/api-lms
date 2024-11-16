const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User');

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3939/user-token/completeGoogleLogin"
}, async (token, tokenSecret, profile, done) => {
    const user = await User.findOne({ googleId: profile.id });
    if (user) {
        return done(null, user);
    }

    const newUser = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        googleId: profile.id
    });
    await newUser.save();
    done(null, newUser);
}));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:5000/auth/facebook/callback"
}, async (accessToken, refreshToken, profile, done) => {
    const user = await User.findOne({ facebookId: profile.id });
    if (user) {
        return done(null, user);
    }

    const newUser = new User({
        name: profile.displayName,
        email: profile.emails[0].value,
        facebookId: profile.id
    });
    await newUser.save();
    done(null, newUser);
}));

// Serialize and deserialize user
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id, (err, user) => done(err, user)));