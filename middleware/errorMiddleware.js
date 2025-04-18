const logger = require('../utils/logger');

const errorMiddleware = {
    // Not Found handler
    notFound: (req, res, next) => {
        const error = new Error(`Not Found - ${req.originalUrl}`);
        res.status(404);
        next(error);
    },

    // Async handler wrapper
    asyncHandler: (fn) => (req, res, next) =>
        Promise.resolve(fn(req, res, next)).catch(next),

    // Global error handler
    errorHandler: (err, req, res, next) => {
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

        // Log error
        logger.error({
            message: err.message,
            stack: err.stack,
            url: req.originalUrl,
            method: req.method,
            body: req.body,
            user: req.user ? req.user._id : null
        });

        // Mongoose validation error
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: Object.values(err.errors).map(e => e.message)
            });
        }

        // Mongoose duplicate key error
        if (err.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Duplicate field value entered'
            });
        }

        // JWT errors
        if (err.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        // Production error response
        if (process.env.NODE_ENV === 'production') {
            res.status(statusCode).json({
                success: false,
                message: err.message || 'Internal Server Error'
            });
        } 
        // Development error response
        else {
            res.status(statusCode).json({
                success: false,
                message: err.message,
                stack: err.stack,
                error: err
            });
        }
    }
};

module.exports = errorMiddleware; 