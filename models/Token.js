const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['verification', 'reset', 'refresh', 'access'],
        required: true
    },
    expires: {
        type: Date,
        required: true
    },
    isValid: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // Automatically delete after 24 hours
    }
});

// Index for faster queries
tokenSchema.index({ user: 1, type: 1 });
tokenSchema.index({ token: 1 });
tokenSchema.index({ expires: 1 }, { expireAfterSeconds: 0 });

// Methods
tokenSchema.methods.isExpired = function() {
    return Date.now() >= this.expires;
};

tokenSchema.methods.invalidate = async function() {
    this.isValid = false;
    await this.save();
};

// Statics
tokenSchema.statics.generateVerificationToken = async function(userId) {
    const token = new this({
        user: userId,
        token: require('crypto').randomBytes(32).toString('hex'),
        type: 'verification',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });
    await token.save();
    return token;
};

tokenSchema.statics.generatePasswordResetToken = async function(userId) {
    const token = new this({
        user: userId,
        token: require('crypto').randomBytes(32).toString('hex'),
        type: 'reset',
        expires: new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour
    });
    await token.save();
    return token;
};

tokenSchema.statics.generateRefreshToken = async function(userId) {
    const token = new this({
        user: userId,
        token: require('crypto').randomBytes(64).toString('hex'),
        type: 'refresh',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });
    await token.save();
    return token;
};

tokenSchema.statics.generateAccessToken = async function(userId) {
    const token = new this({
        user: userId,
        token: require('crypto').randomBytes(32).toString('hex'),
        type: 'access',
        expires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    });
    await token.save();
    return token;
};

// Pre-save middleware
tokenSchema.pre('save', async function(next) {
    if (this.isNew) {
        // Invalidate all other tokens of the same type for this user
        await this.constructor.updateMany(
            { 
                user: this.user, 
                type: this.type,
                _id: { $ne: this._id }
            },
            { 
                isValid: false 
            }
        );
    }
    next();
});

const Token = mongoose.model('Token', tokenSchema);

module.exports = Token; 