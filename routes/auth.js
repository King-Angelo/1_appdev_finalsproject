const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authController = require('../controllers/authController');
const { validateRegistration, validateLogin } = require('../middleware/validation');
const auth = require('../middleware/auth');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

// Root Route
router.get('/', auth.verifyToken, (req, res) => {
    return res.redirect('/dashboard');
});

// Dashboard Route
router.get('/dashboard', auth.verifyToken, (req, res) => {
    res.render('dashboard', { user: req.user });
});

// Login Route
router.get('/login', (req, res) => {
    res.render('login', { error: req.flash('error') });
});

router.post('/login', validateLogin, authController.login);

// Register Route
router.get('/register', (req, res) => {
    res.render('register', { error: req.flash('error') });
});

// Authentication Routes
router.post('/register', validateRegistration, authController.register);
router.post('/logout', auth.verifyToken, authController.logout);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Social Auth Routes
router.get('/google', authController.googleAuth);
router.get('/google/callback', authController.googleCallback);
router.get('/facebook', authController.facebookAuth);
router.get('/facebook/callback', authController.facebookCallback);
router.get('/linkedin', authController.linkedinAuth);
router.get('/linkedin/callback', authController.linkedinCallback);

// Profile Routes
router.get('/me', auth.verifyToken, authController.getCurrentUser);
router.put('/me', auth.verifyToken, authController.updateProfile);
router.put('/me/password', auth.verifyToken, authController.changePassword);

// Session Management
router.post('/logout-all', auth.verifyToken, authController.logoutAllDevices);
router.get('/sessions', auth.verifyToken, authController.getActiveSessions);

module.exports = router; 