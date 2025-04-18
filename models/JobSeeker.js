const mongoose = require('mongoose');

const educationSchema = new mongoose.Schema({
    institution: {
        type: String,
        required: true
    },
    degree: {
        type: String,
        required: true
    },
    field: String,
    startDate: Date,
    endDate: Date,
    current: {
        type: Boolean,
        default: false
    },
    description: String
});

const experienceSchema = new mongoose.Schema({
    company: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    location: String,
    startDate: Date,
    endDate: Date,
    current: {
        type: Boolean,
        default: false
    },
    description: String
});

const jobSeekerSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
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
    profilePicture: {
        type: String,
        default: 'default-profile.jpg'
    },
    phone: {
        type: String,
        trim: true
    },
    bio: {
        type: String,
        maxlength: 500
    },
    skills: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill'
    }],
    education: [educationSchema],
    experience: [experienceSchema],
    resume: {
        url: String,
        filename: String,
        uploadDate: Date
    },
    location: {
        address: String,
        city: String,
        state: String,
        country: String,
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                default: 'Point'
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        }
    },
    preferredJobTypes: [{
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship', 'remote']
    }],
    preferredLocations: [{
        type: String
    }],
    expectedSalary: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'USD'
        }
    },
    availability: {
        type: String,
        enum: ['immediate', '2weeks', '1month', 'more'],
        default: '2weeks'
    },
    profileVisibility: {
        type: String,
        enum: ['public', 'private', 'recruiters-only'],
        default: 'public'
    },
    jobPreferences: {
        industries: [String],
        companySizes: [String],
        workEnvironments: [String]
    },
    socialLinks: {
        linkedin: String,
        github: String,
        portfolio: String
    },
    notifications: {
        jobAlerts: {
            type: Boolean,
            default: true
        },
        applicationUpdates: {
            type: Boolean,
            default: true
        },
        messages: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

// Indexes
jobSeekerSchema.index({ 'location.coordinates': '2dsphere' });
jobSeekerSchema.index({ skills: 1 });

// Virtual for full name
jobSeekerSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Method to check if profile is complete
jobSeekerSchema.methods.isProfileComplete = function() {
    return !!(
        this.firstName &&
        this.lastName &&
        this.phone &&
        this.bio &&
        this.skills.length > 0 &&
        this.education.length > 0 &&
        this.resume.url
    );
};

// Method to get matching jobs
jobSeekerSchema.methods.getMatchingJobs = async function() {
    return await mongoose.model('Job').find({
        skills: { $in: this.skills },
        jobType: { $in: this.preferredJobTypes },
        'location.city': { $in: this.preferredLocations }
    }).sort('-createdAt');
};

const JobSeeker = mongoose.model('JobSeeker', jobSeekerSchema);

module.exports = JobSeeker; 