const mongoose = require('mongoose');

const searchLogSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    query: String,
    filters: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    resultsCount: Number,
    searchedAt: {
        type: Date,
        default: Date.now
    }
});

const pageViewSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserSession',
        required: true
    },
    pageUrl: {
        type: String,
        required: true
    },
    viewTime: {
        type: Date,
        default: Date.now
    },
    timeSpent: Number,
    referrer: String
});

const userActionSchema = new mongoose.Schema({
    session: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserSession',
        required: true
    },
    actionType: {
        type: String,
        enum: ['search', 'apply', 'save', 'view', 'download', 'share'],
        required: true
    },
    actionTime: {
        type: Date,
        default: Date.now
    },
    actionData: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    }
});

const userSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    sessionKey: {
        type: String,
        required: true
    },
    ipAddress: String,
    userAgent: String,
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date,
    pagesViewed: {
        type: Number,
        default: 0
    },
    actionsPerformed: {
        type: Number,
        default: 0
    }
});

const analyticsReportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: String,
    reportType: {
        type: String,
        enum: [
            'user_engagement',
            'job_performance',
            'application_funnel',
            'platform_metrics',
            'custom'
        ],
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scheduleFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly']
    },
    recipients: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    parameters: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: {}
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastGenerated: Date
}, {
    timestamps: true
});

// Create models
const SearchLog = mongoose.model('SearchLog', searchLogSchema);
const PageView = mongoose.model('PageView', pageViewSchema);
const UserAction = mongoose.model('UserAction', userActionSchema);
const UserSession = mongoose.model('UserSession', userSessionSchema);
const AnalyticsReport = mongoose.model('AnalyticsReport', analyticsReportSchema);

module.exports = {
    SearchLog,
    PageView,
    UserAction,
    UserSession,
    AnalyticsReport
}; 