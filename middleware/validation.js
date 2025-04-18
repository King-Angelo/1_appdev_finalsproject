const { body, validationResult } = require('express-validator');

const validation = {
    validateRegistration: [
        body('email').isEmail().normalizeEmail(),
        body('password')
            .isLength({ min: 8 })
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
            .withMessage('Password must be at least 8 characters long and contain uppercase, lowercase, number and special character'),
        body('firstName').trim().notEmpty(),
        body('lastName').trim().notEmpty(),
        body('role').isIn(['employer', 'jobseeker']),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
            next();
        }
    ],

    validateLogin: [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty(),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
            next();
        }
    ]
};

module.exports = validation; 