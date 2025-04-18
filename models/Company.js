const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        default: 'default-company-logo.png'
    },
    coverImage: {
        type: String,
        default: 'default-company-cover.png'
    },
    industry: {
        type: String,
        required: true
    },
    size: {
        type: String,
        enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
    },
    founded: Number,
    website: String,
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
            coordinates: [Number]
        }
    },
    socialMedia: {
        linkedin: String,
        twitter: String,
        facebook: String
    },
    contact: {
        email: String,
        phone: String
    },
    benefits: [{
        type: String
    }],
    culture: {
        values: [String],
        description: String
    },
    metrics: {
        totalJobs: {
            type: Number,
            default: 0
        },
        activeJobs: {
            type: Number,
            default: 0
        },
        totalApplications: {
            type: Number,
            default: 0
        },
        averageResponseTime: Number
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    }
}, {
    timestamps: true
});

// Indexes
companySchema.index({ name: 'text', description: 'text' });
companySchema.index({ 'location.coordinates': '2dsphere' });

// Pre-save middleware to create slug
companySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    }
    next();
});

module.exports = mongoose.model('Company', companySchema); 