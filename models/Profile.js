const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    personalInfo: {
        firstName: {
            type: String,
            required: true,
            trim: true
        },
        lastName: {
            type: String,
            required: true,
            trim: true
        },
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer_not_to_say']
        },
        nationality: String
    },
    contact: {
        email: {
            type: String,
            required: true,
            lowercase: true
        },
        phone: {
            type: String,
            trim: true
        },
        alternatePhone: String,
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            postalCode: String
        }
    },
    social: {
        linkedin: String,
        twitter: String,
        github: String,
        portfolio: String
    },
    preferences: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        smsNotifications: {
            type: Boolean,
            default: false
        },
        newsletter: {
            type: Boolean,
            default: true
        },
        language: {
            type: String,
            default: 'en'
        },
        timezone: String
    },
    security: {
        twoFactorEnabled: {
            type: Boolean,
            default: false
        },
        lastPasswordChange: Date,
        loginAttempts: {
            type: Number,
            default: 0
        },
        lastFailedLogin: Date
    },
    settings: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        visibility: {
            type: String,
            enum: ['public', 'private', 'connections'],
            default: 'public'
        }
    }
}, {
    timestamps: true
});

// Indexes
profileSchema.index({ 'personalInfo.firstName': 1, 'personalInfo.lastName': 1 });
profileSchema.index({ 'contact.email': 1 });

// Virtual for full name
profileSchema.virtual('fullName').get(function() {
    return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

module.exports = mongoose.model('Profile', profileSchema); 