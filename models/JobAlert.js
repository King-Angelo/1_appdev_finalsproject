const mongoose = require('mongoose');

const jobAlertSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    criteria: {
        keywords: [String],
        categories: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'JobCategory'
        }],
        locations: [{
            city: String,
            state: String,
            country: String
        }],
        jobTypes: [{
            type: String,
            enum: ['full-time', 'part-time', 'contract', 'internship', 'remote']
        }],
        salaryRange: {
            min: Number,
            max: Number,
            currency: {
                type: String,
                default: 'USD'
            }
        },
        experienceLevel: [{
            type: String,
            enum: ['entry', 'intermediate', 'senior', 'executive']
        }],
        skills: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Skill'
        }]
    },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly'],
        default: 'daily'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastSent: Date,
    matchCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('JobAlert', jobAlertSchema); 