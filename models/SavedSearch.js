const mongoose = require('mongoose');

const savedSearchSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    query: {
        type: String,
        required: true
    },
    filters: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    notificationFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'biweekly', 'monthly'],
        default: 'weekly'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastNotificationSent: Date
}, {
    timestamps: true
});

// Indexes
savedSearchSchema.index({ user: 1, createdAt: -1 });
savedSearchSchema.index({ user: 1, isActive: 1 });

module.exports = mongoose.model('SavedSearch', savedSearchSchema); 