const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employer',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    requirements: {
        type: String,
        required: true
    },
    responsibilities: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobCategory',
        required: true
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
        },
        remote: {
            type: Boolean,
            default: false
        }
    },
    salary: {
        min: Number,
        max: Number,
        currency: {
            type: String,
            default: 'USD'
        },
        isNegotiable: {
            type: Boolean,
            default: false
        }
    },
    status: {
        type: String,
        enum: ['Open', 'Closed'],
        default: 'Open'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', jobSchema); 