const { validationResult, body, param, query } = require('express-validator');

const validationMiddleware = {
    // Validation result checker
    validate: (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    },

    // User validation rules
    userValidation: {
        register: [
            body('email').isEmail().normalizeEmail(),
            body('password')
                .isLength({ min: 8 })
                .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/),
            body('firstName').trim().notEmpty(),
            body('lastName').trim().notEmpty(),
            body('role').isIn(['jobseeker', 'employer'])
        ],

        login: [
            body('email').isEmail().normalizeEmail(),
            body('password').notEmpty()
        ]
    },

    // Job validation rules
    jobValidation: {
        create: [
            body('title').trim().notEmpty(),
            body('description').trim().notEmpty(),
            body('type').isIn(['full-time', 'part-time', 'contract', 'internship']),
            body('location').trim().notEmpty(),
            body('salary').isNumeric(),
            body('skills').isArray(),
            body('requirements').isArray()
        ],

        update: [
            param('id').isMongoId(),
            body('title').optional().trim().notEmpty(),
            body('description').optional().trim().notEmpty(),
            body('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship']),
            body('location').optional().trim().notEmpty(),
            body('salary').optional().isNumeric(),
            body('skills').optional().isArray(),
            body('requirements').optional().isArray()
        ]
    },

    // Application validation rules
    applicationValidation: {
        create: [
            body('coverLetter').trim().notEmpty(),
            body('resume').custom((value, { req }) => {
                if (!req.file) {
                    throw new Error('Resume is required');
                }
                return true;
            })
        ]
    },

    // Company validation rules
    companyValidation: {
        create: [
            body('name').trim().notEmpty(),
            body('industry').trim().notEmpty(),
            body('size').isIn(['1-10', '11-50', '51-200', '201-500', '501+']),
            body('location').trim().notEmpty(),
            body('website').isURL(),
            body('description').trim().notEmpty()
        ]
    },

    // Search validation rules
    searchValidation: {
        jobs: [
            query('keyword').optional().trim(),
            query('location').optional().trim(),
            query('type').optional().isIn(['full-time', 'part-time', 'contract', 'internship']),
            query('salary').optional().isNumeric(),
            query('page').optional().isInt({ min: 1 }),
            query('limit').optional().isInt({ min: 1, max: 50 })
        ]
    }
};

module.exports = validationMiddleware; 