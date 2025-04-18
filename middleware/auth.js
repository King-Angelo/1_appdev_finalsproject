const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = {
    // Verify JWT token or session
    verifyToken: async (req, res, next) => {
        try {
            // First check for JWT token in header
            const token = req.header('Authorization')?.replace('Bearer ', '');
            
            if (token) {
                try {
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    const user = await User.findById(decoded.userId);
                    if (user) {
                        req.user = user;
                        return next();
                    }
                } catch (error) {
                    console.error('JWT verification error:', error);
                }
            }

            // If no valid JWT, check for session authentication
            if (req.isAuthenticated()) {
                return next();
            }

            // If neither authentication method is valid, redirect to login
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication required'
                });
            }
            res.redirect('/auth/login');
        } catch (error) {
            console.error('Auth middleware error:', error);
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication error'
                });
            }
            res.redirect('/auth/login');
        }
    },

    // Check user role
    checkRole: (roles) => {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    success: false,
                    message: 'Access denied'
                });
            }
            next();
        };
    },

    // Check if email is verified
    isEmailVerified: (req, res, next) => {
        if (!req.user.emailVerified) {
            return res.status(403).json({ message: 'Please verify your email first' });
        }
        next();
    }
};

module.exports = auth; 