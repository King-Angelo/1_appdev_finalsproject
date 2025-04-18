const Job = require('../models/Job');
const Application = require('../models/Application');
const User = require('../models/User');

const analyticsController = {
    getEmployerAnalytics: async (req, res) => {
        try {
            const userId = req.user.userId;
            const timeframe = req.query.timeframe || '30'; // days

            // Job posting analytics
            const jobStats = await Job.aggregate([
                { $match: { employer: userId } },
                { $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }}
            ]);

            // Application analytics
            const applicationStats = await Application.aggregate([
                { 
                    $match: { 
                        employer: userId,
                        createdAt: { 
                            $gte: new Date(Date.now() - timeframe * 24 * 60 * 60 * 1000) 
                        }
                    }
                },
                { 
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // Response time analytics
            const responseTimeStats = await Application.aggregate([
                { $match: { employer: userId } },
                { $project: {
                    responseTime: { 
                        $divide: [
                            { $subtract: ['$updatedAt', '$createdAt'] },
                            1000 * 60 * 60 // Convert to hours
                        ]
                    }
                }},
                { $group: {
                    _id: null,
                    avgResponseTime: { $avg: '$responseTime' }
                }}
            ]);

            res.render('analytics/employer', {
                jobStats,
                applicationStats,
                responseTimeStats: responseTimeStats[0]?.avgResponseTime || 0
            });
        } catch (error) {
            console.error('Employer analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Error generating analytics'
            });
        }
    },

    getJobSeekerAnalytics: async (req, res) => {
        try {
            const userId = req.user.userId;
            
            // Application success rate
            const applicationStats = await Application.aggregate([
                { $match: { jobseeker: userId } },
                { $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }}
            ]);

            // Skills match analytics
            const user = await User.findById(userId).select('skills');
            const skillMatchJobs = await Job.find({
                skills: { $in: user.skills }
            }).countDocuments();

            // Application timeline
            const applicationTimeline = await Application.aggregate([
                { $match: { jobseeker: userId } },
                { $group: {
                    _id: { 
                        $dateToString: { 
                            format: "%Y-%m", 
                            date: "$createdAt" 
                        }
                    },
                    count: { $sum: 1 }
                }},
                { $sort: { _id: 1 } }
            ]);

            res.render('analytics/jobseeker', {
                applicationStats,
                skillMatchJobs,
                applicationTimeline
            });
        } catch (error) {
            console.error('JobSeeker analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Error generating analytics'
            });
        }
    }
};

module.exports = analyticsController; 