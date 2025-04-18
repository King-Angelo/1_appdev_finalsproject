const mongoose = require('mongoose');

const studentProfileSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    studentId: {
        type: String,
        required: true,
        unique: true
    },
    institution: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    yearLevel: {
        type: Number,
        required: true,
        min: 1
    },
    expectedGraduation: {
        type: Date,
        required: true
    },
    skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
    }],
    projects: [{
        title: String,
        description: String,
        url: String,
        startDate: Date,
        endDate: Date
    }],
    academicAchievements: [{
        title: String,
        description: String,
        date: Date
    }],
    isAvailableForInternship: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes
studentProfileSchema.index({ studentId: 1 });
studentProfileSchema.index({ institution: 1 });
studentProfileSchema.index({ course: 1 });

module.exports = mongoose.model('StudentProfile', studentProfileSchema); 