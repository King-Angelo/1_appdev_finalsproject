const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');

const jobController = {
    // Get all jobs with filtering and pagination
    getAllJobs: async (req, res) => {
        try {
            const {
                page = 1,
                limit = 10,
                location,
                type,
                category,
                experience,
                salary
            } = req.query;

            const query = { status: 'active' };

            // Apply filters
            if (location) query.location = new RegExp(location, 'i');
            if (type) query.type = type;
            if (category) query.category = category;
            if (experience) query.experienceLevel = experience;
            if (salary) query.salary = { $gte: parseInt(salary) };

            const jobs = await Job.find(query)
                .populate('company', 'name logo location')
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 });

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
            console.error('Get all jobs error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching jobs'
            });
        }
    },

    // Create new job
    createJob: async (req, res) => {
        try {
            const {
                title,
                description,
                requirements,
                type,
                location,
                salary,
                category,
                experienceLevel,
                skills
            } = req.body;

            const company = await Company.findOne({ employer: req.user.userId });
            if (!company) {
                return res.status(400).json({
                    success: false,
                    message: 'Please create a company profile first'
                });
            }

            const job = new Job({
                company: company._id,
                employer: req.user.userId,
                title,
                description,
                requirements,
                type,
                location,
                salary,
                category,
                experienceLevel,
                skills
            });

            await job.save();

            res.status(201).json({
                success: true,
                data: job
            });
        } catch (error) {
            console.error('Create job error:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating job'
            });
        }
    },

    // Get job analytics
    getJobAnalytics: async (req, res) => {
        try {
            const { id } = req.params;
            const job = await Job.findOne({ _id: id, employer: req.user.userId });

            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found'
                });
            }

            // Get application statistics
            const stats = await Application.aggregate([
                { $match: { job: job._id } },
                { $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }}
            ]);

            // Get views and other metrics
            const analytics = {
                views: job.views,
                applications: stats,
                conversionRate: (stats.length / job.views) * 100,
                averageResponse: await Application.aggregate([
                    { $match: { job: job._id } },
                    { $group: {
                        _id: null,
                        avg: { $avg: { $subtract: ['$updatedAt', '$createdAt'] } }
                    }}
                ])
            };

            res.status(200).json({
                success: true,
                data: analytics
            });
        } catch (error) {
            console.error('Job analytics error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching job analytics'
            });
        }
    },

    // Search jobs
    searchJobs: async (req, res) => {
        try {
            const {
                keyword,
                location,
                type,
                category,
                experience,
                salary,
                page = 1,
                limit = 10
            } = req.query;

            const query = { status: 'active' };

            // Build search query
            if (keyword) {
                query.$or = [
                    { title: new RegExp(keyword, 'i') },
                    { description: new RegExp(keyword, 'i') },
                    { 'skills': new RegExp(keyword, 'i') }
                ];
            }
            if (location) query.location = new RegExp(location, 'i');
            if (type) query.type = type;
            if (category) query.category = category;
            if (experience) query.experienceLevel = experience;
            if (salary) query.salary = { $gte: parseInt(salary) };

            // Execute search
            const jobs = await Job.find(query)
                .populate('company', 'name logo location')
                .skip((page - 1) * limit)
                .limit(limit)
                .sort({ createdAt: -1 });

            const total = await Job.countDocuments(query);

            // Check if it's an API request or web request
            if (req.xhr || req.headers.accept.includes('application/json')) {
                // API response
                return res.status(200).json({
                    success: true,
                    data: jobs,
                    pagination: {
                        total,
                        pages: Math.ceil(total / limit),
                        page: parseInt(page),
                        limit: parseInt(limit)
                    }
                });
            }

            // Web response
            res.render('jobs/search', {
                jobs,
                error: null,
                query: req.query,
                pagination: {
                    total,
                    pages: Math.ceil(total / limit),
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Search jobs error:', error);
            
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    message: 'Error searching jobs'
                });
            }

            res.render('jobs/search', {
                jobs: [],
                error: 'Error searching jobs',
                query: req.query,
                pagination: {
                    total: 0,
                    pages: 0,
                    page: 1,
                    limit: 10
                }
            });
        }
    },

    // Get job by ID
    getJobById: async (req, res) => {
        try {
            const { id } = req.params;
            
            const job = await Job.findById(id)
                .populate('company', 'name logo location description')
                .populate('employer', 'firstName lastName email');

            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found'
                });
            }

            // Increment view count
            job.views = (job.views || 0) + 1;
            await job.save();

            // Check if it's an API request or web request
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(200).json({
                    success: true,
                    data: job
                });
            }

            // Web response
            res.render('jobs/details', {
                job,
                error: null,
                success: req.flash('success'),
                isEmployer: req.user?.role === 'employer',
                isOwner: req.user?._id.toString() === job.employer._id.toString()
            });
        } catch (error) {
            console.error('Get job by ID error:', error);
            
            // Check if it's an API request or web request
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    message: 'Error fetching job details'
                });
            }

            res.render('jobs/details', {
                job: null,
                error: 'Error fetching job details',
                success: null,
                isEmployer: false,
                isOwner: false
            });
        }
    },

    // Update job
    updateJob: async (req, res) => {
        try {
            const { id } = req.params;
            const {
                title,
                description,
                requirements,
                type,
                location,
                salary,
                category,
                experienceLevel,
                skills
            } = req.body;

            // Find job and verify ownership
            const job = await Job.findOne({ _id: id, employer: req.user.userId });
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found or unauthorized'
                });
            }

            // Update job fields
            const updates = {
                title,
                description,
                requirements,
                type,
                location,
                salary,
                category,
                experienceLevel,
                skills,
                updatedAt: Date.now()
            };

            // Remove undefined fields
            Object.keys(updates).forEach(key => 
                updates[key] === undefined && delete updates[key]
            );

            const updatedJob = await Job.findByIdAndUpdate(
                id,
                { $set: updates },
                { new: true }
            ).populate('company', 'name logo location');

            // Check if it's an API request or web request
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(200).json({
                    success: true,
                    data: updatedJob
                });
            }

            // Web response
            req.flash('success', 'Job updated successfully');
            res.redirect(`/jobs/${id}`);
        } catch (error) {
            console.error('Update job error:', error);
            
            // Check if it's an API request or web request
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    message: 'Error updating job'
                });
            }

            req.flash('error', 'Error updating job');
            res.redirect(`/jobs/${req.params.id}`);
        }
    },

    // Delete job
    deleteJob: async (req, res) => {
        try {
            const { id } = req.params;

            // Find job and verify ownership
            const job = await Job.findOne({ _id: id, employer: req.user.userId });
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found or unauthorized'
                });
            }

            // Check if there are any active applications
            const activeApplications = await Application.countDocuments({
                job: id,
                status: { $in: ['pending', 'accepted'] }
            });

            if (activeApplications > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot delete job with active applications'
                });
            }

            // Delete the job
            await Job.findByIdAndDelete(id);

            // Check if it's an API request or web request
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(200).json({
                    success: true,
                    message: 'Job deleted successfully'
                });
            }

            // Web response
            req.flash('success', 'Job deleted successfully');
            res.redirect('/jobs/manage');
        } catch (error) {
            console.error('Delete job error:', error);
            
            // Check if it's an API request or web request
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    message: 'Error deleting job'
                });
            }

            req.flash('error', 'Error deleting job');
            res.redirect('/jobs/manage');
        }
    },

    // Publish job
    // ... existing code ...

    // Publish job
    publishJob: async (req, res) => {
        try {
            const { id } = req.params;

            // Find job and verify ownership
            const job = await Job.findOne({ _id: id, employer: req.user.userId });
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found or unauthorized'
                });
            }

            // Update job status
            job.status = 'active';
            job.publishedAt = Date.now();
            await job.save();

            // Check if it's an API request or web request
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(200).json({
                    success: true,
                    message: 'Job published successfully'
                });
            }

            // Web response
            req.flash('success', 'Job published successfully');
            res.redirect('/jobs/manage');
        } catch (error) {
            console.error('Publish job error:', error);
            
            // Check if it's an API request or web request
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    message: 'Error publishing job'
                });
            }

            req.flash('error', 'Error publishing job');
            res.redirect('/jobs/manage');
        }
    },

    // Unpublish job
    unpublishJob: async (req, res) => {
        try {
            const { id } = req.params;

            // Find job and verify ownership
            const job = await Job.findOne({ _id: id, employer: req.user.userId });
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found or unauthorized'
                });
            }

            // Update job status
            job.status = 'draft';
            await job.save();

            // Check if it's an API request or web request
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(200).json({
                    success: true,
                    message: 'Job unpublished successfully'
                });
            }

            // Web response
            req.flash('success', 'Job unpublished successfully');
            res.redirect('/jobs/manage');
        } catch (error) {
            console.error('Unpublish job error:', error);
            
            // Check if it's an API request or web request
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    message: 'Error unpublishing job'
                });
            }

            req.flash('error', 'Error unpublishing job');
            res.redirect('/jobs/manage');
        }
    },


    // Unpublish job
    unpublishJob: async (req, res) => {
        try {
            const { id } = req.params;

            // Find job and verify ownership
            const job = await Job.findOne({ _id: id, employer: req.user.userId });
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found or unauthorized'
                });
            }

            // Update job status
            job.status = 'draft';
            await job.save();

            // Check if it's an API request or web request
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(200).json({
                    success: true,
                    message: 'Job unpublished successfully'
                });
            }

            // Web response
            req.flash('success', 'Job unpublished successfully');
            res.redirect('/jobs/manage');
        } catch (error) {
            console.error('Unpublish job error:', error);
            
            // Check if it's an API request or web request
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    message: 'Error unpublishing job'
                });
            }

            req.flash('error', 'Error unpublishing job');
            res.redirect('/jobs/manage');
        }
    }
};

module.exports = jobController; 