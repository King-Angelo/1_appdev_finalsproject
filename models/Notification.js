const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    notificationType: {
        type: String,
        enum: [
            'application_received',
            'application_status_changed',
            'job_alert',
            'saved_search',
            'message',
            'system'
        ],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: Date,
    data: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    }
}, {
    timestamps: true
});

// Index for faster queries
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isRead: 1 });

// Method to mark notification as read
notificationSchema.methods.markAsRead = async function() {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
};

module.exports = mongoose.model('Notification', notificationSchema); 