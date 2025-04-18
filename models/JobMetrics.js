const mongoose = require('mongoose');

const jobMetricsSchema = new mongoose.Schema({
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    views: {
        total: {
            type: Number,
            default: 0
        },
        unique: {
            type: Number,
            default: 0
        }
    },
    applications: {
        total: {
            type: Number,
            default: 0
        },
        qualified: {
            type: Number,
            default: 0
        },
        shortlisted: {
            type: Number,
            default: 0
        },
        interviewed: {
            type: Number,
            default: 0
        },
        offered: {
            type: Number,
            default: 0
        },
        accepted: {
            type: Number,
            default: 0
        },
        rejected: {
            type: Number,
            default: 0
        }
    },
    engagement: {
        averageTimeOnPage: Number,
        bounceRate: Number,
        clickThroughRate: Number
    },
    demographics: {
        locations: [{
            city: String,
            count: Number
        }],
        experienceLevels: [{
            level: String,
            count: Number
        }]
    },
    timeToHire: Number, // in days
    costPerHire: Number,
    sourceEffectiveness: [{
        source: String,
        applications: Number,
        hires: Number,
        conversionRate: Number
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('JobMetrics', jobMetricsSchema); 