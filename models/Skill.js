const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['technical', 'soft', 'language', 'certification', 'other'],
        required: true
    },
    description: String,
    aliases: [String],
    popularity: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Index for text search
skillSchema.index({ name: 'text', aliases: 'text' });

module.exports = mongoose.model('Skill', skillSchema); 