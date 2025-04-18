const mongoose = require('mongoose');

const employerProfileSchema = new mongoose.Schema({
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
    department: {
        type: String,
        required: true
    },
    employeeId: {
        type: String,
        unique: true,
        sparse: true
    },
    hiringRole: {
        type: String,
        enum: ['recruiter', 'hiring_manager', 'hr_manager', 'department_head'],
        required: true
    },
    permissions: {
        canPostJobs: {
            type: Boolean,
            default: true
        },
        canReviewApplications: {
            type: Boolean,
            default: true
        },
        canManageTeam: {
            type: Boolean,
            default: false
        },
        canAccessAnalytics: {
            type: Boolean,
            default: false
        }
    },
    hiring: {
        totalPositionsManaged: {
            type: Number,
            default: 0
        },
        activeJobPostings: {
            type: Number,
            default: 0
        },
        totalHires: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Indexes
employerProfileSchema.index({ company: 1 });
employerProfileSchema.index({ employeeId: 1 });
employerProfileSchema.index({ hiringRole: 1 });

module.exports = mongoose.model('EmployerProfile', employerProfileSchema); 