const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

const authMiddleware = {
    // Verify JWT token
    verifyToken: async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1] || 
                         req.cookies.token;

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: 'No token provided'
                });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.userId)
                .select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found'
                });
            }

            if (!user.isActive) {
                return res.status(403).json({
                    success: false,
                    message: 'Account is deactivated'
                });
            }

            req.user = user;
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({
                    success: false,
                    message: 'Token expired'
                });
            }

            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
    },

    // Optional authentication (doesn't require token)
    optionalAuth: async (req, res, next) => {
        try {
            const token = req.headers.authorization?.split(' ')[1] || 
                         req.cookies.token;

            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.userId)
                    .select('-password');
                req.user = user;
            }
            next();
        } catch (error) {
            next();
        }
    },

    // Ensure user is authenticated
    isAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/auth/login');
    },

    // Rate limiting
    rateLimiter: rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    })
};

module.exports = authMiddleware; 