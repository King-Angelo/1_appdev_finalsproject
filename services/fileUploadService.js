const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

class FileUploadService {
    constructor() {
        this.storage = new CloudinaryStorage({
            cloudinary: cloudinary,
            params: {
                folder: 'job-portal',
                allowed_formats: ['jpg', 'png', 'pdf', 'doc', 'docx']
            }
        });

        this.upload = multer({
            storage: this.storage,
            limits: {
                fileSize: 5 * 1024 * 1024 // 5MB limit
            },
            fileFilter: this._fileFilter
        });
    }

    _fileFilter(req, file, cb) {
        const allowedMimeTypes = {
            'image/jpeg': true,
            'image/png': true,
            'application/pdf': true,
            'application/msword': true,
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true
        };

        if (allowedMimeTypes[file.mimetype]) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type'), false);
        }
    }

    async uploadResume(file) {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'resumes',
                resource_type: 'raw'
            });
            return result.secure_url;
        } catch (error) {
            console.error('Resume upload failed:', error);
            throw error;
        }
    }

    async uploadProfileImage(file) {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'profiles',
                width: 200,
                height: 200,
                crop: 'fill'
            });
            return result.secure_url;
        } catch (error) {
            console.error('Profile image upload failed:', error);
            throw error;
        }
    }

    async uploadCompanyLogo(file) {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'companies',
                width: 300,
                height: 300,
                crop: 'fill'
            });
            return result.secure_url;
        } catch (error) {
            console.error('Company logo upload failed:', error);
            throw error;
        }
    }

    async deleteFile(publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error('File deletion failed:', error);
            throw error;
        }
    }
}

module.exports = new FileUploadService(); 