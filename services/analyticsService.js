const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');
const Company = require('../models/Company');

class AnalyticsService {
    async getJobAnalytics(jobId) {
        try {
            const applications = await Application.aggregate([
                {
                    $match: { job: jobId }
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const views = await Job.findById(jobId).select('views');
            const conversionRate = (applications.length / views.views) * 100;

            return {
                applications,
                views: views.views,
                conversionRate
            };
        } catch (error) {
            console.error('Job analytics failed:', error);
            throw error;
        }
    }

    async getCompanyAnalytics(companyId) {
        try {
            const jobStats = await Job.aggregate([
                {
                    $match: { company: companyId }
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalViews: { $sum: '$views' }
                    }
                }
            ]);

            const applicationStats = await Application.aggregate([
                {
                    $lookup: {
                        from: 'jobs',
                        localField: 'job',
                        foreignField: '_id',
                        as: 'job'
                    }
                },
                {
                    $match: {
                        'job.company': companyId
                    }
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            return {
                jobStats,
                applicationStats
            };
        } catch (error) {
            console.error('Company analytics failed:', error);
            throw error;
        }
    }

    async getUserAnalytics(userId) {
        try {
            const applicationStats = await Application.aggregate([
                {
                    $match: { user: userId }
                },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            return {
                applicationStats
            };
        } catch (error) {
            console.error('User analytics failed:', error);
            throw error;
        }
    }

    async getSystemAnalytics() {
        try {
            const userStats = await User.aggregate([
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const jobStats = await Job.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            const applicationStats = await Application.aggregate([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            return {
                userStats,
                jobStats,
                applicationStats
            };
        } catch (error) {
            console.error('System analytics failed:', error);
            throw error;
        }
    }
}

module.exports = new AnalyticsService(); 