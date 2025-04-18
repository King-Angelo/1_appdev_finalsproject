const Company = require('../models/Company');
const Job = require('../models/Job');

const companyController = {
    createCompany: async (req, res) => {
        try {
            const {
                name,
                industry,
                size,
                location,
                website,
                description,
                logo
            } = req.body;

            const company = new Company({
                name,
                industry,
                size,
                location,
                website,
                description,
                logo,
                employer: req.user.userId
            });

            await company.save();

            res.status(201).json({
                success: true,
                data: company
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error creating company'
            });
        }
    },

    updateCompany: async (req, res) => {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const company = await Company.findOneAndUpdate(
                { _id: id, employer: req.user.userId },
                updateData,
                { new: true }
            );

            if (!company) {
                return res.status(404).json({
                    success: false,
                    message: 'Company not found'
                });
            }

            res.status(200).json({
                success: true,
                data: company
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating company'
            });
        }
    },

    getCompanyJobs: async (req, res) => {
        try {
            const { id } = req.params;
            const { page = 1, limit = 10 } = req.query;

            const jobs = await Job.find({ company: id, status: 'active' })
                .skip((page - 1) * limit)
                .limit(limit)
                .sort('-createdAt');

            const total = await Job.countDocuments({ company: id, status: 'active' });

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
                message: 'Error fetching company jobs'
            });
        }
    }
};

module.exports = companyController; 