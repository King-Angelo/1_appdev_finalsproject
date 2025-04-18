const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Create upload directories if they don't exist
const createUploadDirs = () => {
    const dirs = [
        'uploads',
        'uploads/profiles',
        'uploads/resumes',
        'uploads/companies'
    ];

    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
};

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/';
        
        switch (file.fieldname) {
            case 'profile':
                uploadPath += 'profiles/';
                break;
            case 'resume':
                uploadPath += 'resumes/';
                break;
            case 'company':
                uploadPath += 'companies/';
                break;
            default:
                uploadPath += 'misc/';
        }
        
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = uuidv4();
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
    const allowedTypes = {
        'profile': ['image/jpeg', 'image/png'],
        'resume': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        'company': ['image/jpeg', 'image/png']
    };

    const allowed = allowedTypes[file.fieldname] || [];
    
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'), false);
    }
};

// Configure upload limits
const limits = {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1
};

// Export configuration
module.exports = {
    createUploadDirs,
    upload: multer({
        storage,
        fileFilter,
        limits
    })
}; 