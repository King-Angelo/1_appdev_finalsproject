const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const fileUploadMiddleware = {
    // Storage configuration
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            const type = file.fieldname;
            let uploadPath = 'uploads/';
            
            switch (type) {
                case 'resume':
                    uploadPath += 'resumes/';
                    break;
                case 'avatar':
                    uploadPath += 'avatars/';
                    break;
                case 'companyLogo':
                    uploadPath += 'companies/';
                    break;
                default:
                    uploadPath += 'others/';
            }
            
            cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
            const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
            cb(null, uniqueName);
        }
    }),

    // File filter
    fileFilter: (req, file, cb) => {
        const allowedTypes = {
            'resume': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
            'avatar': ['image/jpeg', 'image/png'],
            'companyLogo': ['image/jpeg', 'image/png']
        };

        const allowed = allowedTypes[file.fieldname] || [];
        
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    },

    // Upload middleware configurations
    upload: {
        resume: multer({
            storage: this.storage,
            fileFilter: this.fileFilter,
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB
            }
        }).single('resume'),

        avatar: multer({
            storage: this.storage,
            fileFilter: this.fileFilter,
            limits: {
                fileSize: 2 * 1024 * 1024 // 2MB
            }
        }).single('avatar'),

        companyLogo: multer({
            storage: this.storage,
            fileFilter: this.fileFilter,
            limits: {
                fileSize: 2 * 1024 * 1024 // 2MB
            }
        }).single('companyLogo')
    },

    // Error handler
    handleUploadError: (err, req, res, next) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: 'File upload error',
                error: err.message
            });
        }
        next(err);
    }
};

module.exports = fileUploadMiddleware; 