const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const GithubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');

// Serialize user for the session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

// Local Strategy (Email & Password)
passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        
        if (!user) {
            return done(null, false, { message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return done(null, false, { message: 'Invalid email or password' });
        }

        if (!user.emailVerified) {
            return done(null, false, { message: 'Please verify your email first' });
        }

        return done(null, user);
    } catch (error) {
        return done(error);
    }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback',
    proxy: true
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ 'google.id': profile.id });

        if (user) {
            return done(null, user);
        }

        // Check if user exists with same email
        user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
            // Link Google account to existing user
            user.google = {
                id: profile.id,
                email: profile.emails[0].value
            };
            await user.save();
            return done(null, user);
        }

        // Create new user
        user = await User.create({
            email: profile.emails[0].value,
            username: profile.displayName,
            google: {
                id: profile.id,
                email: profile.emails[0].value
            },
            emailVerified: true
        });

        done(null, user);
    } catch (error) {
        done(error);
    }
}));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ 'facebook.id': profile.id });

        if (user) {
            return done(null, user);
        }

        // Check if user exists with same email
        if (profile.emails && profile.emails[0]) {
            user = await User.findOne({ email: profile.emails[0].value });
            
            if (user) {
                user.facebook = {
                    id: profile.id,
                    email: profile.emails[0].value
                };
                await user.save();
                return done(null, user);
            }
        }

        // Create new user
        user = await User.create({
            email: profile.emails ? profile.emails[0].value : `${profile.id}@facebook.com`,
            username: `${profile.name.givenName}${profile.name.familyName}`,
            facebook: {
                id: profile.id,
                email: profile.emails ? profile.emails[0].value : null
            },
            emailVerified: true
        });

        done(null, user);
    } catch (error) {
        done(error);
    }
}));

// GitHub OAuth Strategy
passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: '/auth/github/callback'
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ 'github.id': profile.id });

        if (user) {
            return done(null, user);
        }

        // Check if user exists with same email
        if (profile.emails && profile.emails[0]) {
            user = await User.findOne({ email: profile.emails[0].value });
            
            if (user) {
                user.github = {
                    id: profile.id,
                    email: profile.emails[0].value
                };
                await user.save();
                return done(null, user);
            }
        }

        // Create new user
        user = await User.create({
            email: profile.emails ? profile.emails[0].value : `${profile.id}@github.com`,
            username: profile.username,
            github: {
                id: profile.id,
                email: profile.emails ? profile.emails[0].value : null
            },
            emailVerified: true
        });

        done(null, user);
    } catch (error) {
        done(error);
    }
})); 