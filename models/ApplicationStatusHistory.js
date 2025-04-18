const mongoose = require('mongoose');

const applicationStatusHistorySchema = new mongoose.Schema({
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobApplication',
        required: true
    },
    previousStatus: {
        type: String,
        enum: [
            'pending',
            'reviewing',
            'shortlisted',
            'interviewing',
            'offered',
            'accepted',
            'rejected',
            'withdrawn'
        ],
        required: true
    },
    newStatus: {
        type: String,
        enum: [
            'pending',
            'reviewing',
            'shortlisted',
            'interviewing',
            'offered',
            'accepted',
            'rejected',
            'withdrawn'
        ],
        required: true
    },
    changedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reason: String,
    notes: String,
    metadata: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Indexes
applicationStatusHistorySchema.index({ application: 1, createdAt: -1 });
applicationStatusHistorySchema.index({ changedBy: 1 });

module.exports = mongoose.model('ApplicationStatusHistory', applicationStatusHistorySchema); 