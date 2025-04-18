const jwt = require('jsonwebtoken');
const ApiKey = require('../models/ApiKey');
const Job = require('../models/Job');
const Company = require('../models/Company');

const apiController = {
    generateApiToken: async (req, res) => {
        try {
            const { clientId, clientSecret } = req.body;

            const apiKey = await ApiKey.findOne({ 
                clientId,
                clientSecret,
                status: 'active'
            });

            if (!apiKey) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }

            const token = jwt.sign(
                { clientId: apiKey.clientId },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            res.status(200).json({
                success: true,
                token
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error generating token'
            });
        }
    },

    getJobs: async (req, res) => {
        try {
            const { 
                page = 1,
                limit = 10,
                location,
                type,
                category
            } = req.query;

            const query = { status: 'active' };
            if (location) query.location = new RegExp(location, 'i');
            if (type) query.type = type;
            if (category) query.category = category;

            const jobs = await Job.find(query)
                .select('title company location type salary createdAt')
                .populate('company', 'name logo')
                .skip((page - 1) * limit)
                .limit(limit)
                .sort('-createdAt');

            const total = await Job.countDocuments(query);

            res.status(200).json({
                success: true,
                data: jobs,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching jobs'
            });
        }
    },

    getJobStats: async (req, res) => {
        try {
            const stats = await Job.aggregate([
                { $match: { status: 'active' } },
                { $group: {
                    _id: '$category',
                    count: { $sum: 1 },
                    avgSalary: { $avg: '$salary' }
                }},
                { $sort: { count: -1 } }
            ]);

            res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching job statistics'
            });
        }
    }
};

module.exports = apiController; 