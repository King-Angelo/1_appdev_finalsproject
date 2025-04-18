const User = require('../models/User');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');

const adminController = {
    getAllUsers: async (req, res) => {
        try {
            const { page = 1, limit = 10, role, status } = req.query;
            
            const query = {};
            if (role) query.role = role;
            if (status) query.status = status;

            const users = await User.find(query)
                .select('-password')
                .skip((page - 1) * limit)
                .limit(limit);

            const total = await User.countDocuments(query);

            res.status(200).json({
                success: true,
                data: users,
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
                message: 'Error fetching users'
            });
        }
    },

    updateUserStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, reason } = req.body;

            const user = await User.findByIdAndUpdate(
                id,
                { 
                    status,
                    statusReason: reason,
                    updatedAt: Date.now()
                },
                { new: true }
            ).select('-password');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating user status'
            });
        }
    },

    getSystemSettings: async (req, res) => {
        try {
            const settings = await Settings.findOne();
            res.status(200).json({
                success: true,
                data: settings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching settings'
            });
        }
    },

    updateSystemSettings: async (req, res) => {
        try {
            const settings = await Settings.findOneAndUpdate(
                {},
                req.body,
                { new: true, upsert: true }
            );

            res.status(200).json({
                success: true,
                data: settings
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating settings'
            });
        }
    }
};

module.exports = adminController; 