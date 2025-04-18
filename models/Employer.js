const mongoose = require('mongoose');

const employerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    position: {
        type: String,
        required: true
    },
    department: String,
    phone: {
        type: String,
        required: true
    },
    isCompanyAdmin: {
        type: Boolean,
        default: false
    },
    permissions: {
        canPostJobs: {
            type: Boolean,
            default: true
        },
        canManageApplications: {
            type: Boolean,
            default: true
        },
        canManageTeam: {
            type: Boolean,
            default: false
        }
    },
    notificationPreferences: {
        newApplications: {
            type: Boolean,
            default: true
        },
        applicationUpdates: {
            type: Boolean,
            default: true
        },
        teamUpdates: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Employer', employerSchema); 