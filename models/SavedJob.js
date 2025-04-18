const mongoose = require('mongoose');

const savedJobSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    notes: String,
    reminderDate: Date,
    status: {
        type: String,
        enum: ['saved', 'applied', 'archived'],
        default: 'saved'
    }
}, {
    timestamps: true
});

// Compound index to ensure a user can't save the same job twice
savedJobSchema.index({ user: 1, job: 1 }, { unique: true });

module.exports = mongoose.model('SavedJob', savedJobSchema); 