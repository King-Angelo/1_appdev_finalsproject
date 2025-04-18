const mongoose = require('mongoose');

const applicationHistorySchema = new mongoose.Schema({
    application: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JobApplication',
        required: true
    },
    status: {
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
    notes: String,
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Indexes
applicationHistorySchema.index({ application: 1, createdAt: -1 });

module.exports = mongoose.model('ApplicationHistory', applicationHistorySchema); 