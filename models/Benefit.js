const mongoose = require('mongoose');

const benefitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: [
            'health',
            'financial',
            'professional_development',
            'lifestyle',
            'other'
        ]
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Benefit', benefitSchema); 