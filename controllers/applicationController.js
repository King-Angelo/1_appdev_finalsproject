const Application = require('../models/Application');
const Job = require('../models/Job');
const Notification = require('../models/Notification');

const applicationController = {
    submitApplication: async (req, res) => {
        try {
            const { jobId } = req.params;
            const { coverLetter, resume } = req.body;

            // Check if job exists and is active
            const job = await Job.findOne({ _id: jobId, status: 'active' });
            if (!job) {
                return res.status(404).json({
                    success: false,
                    message: 'Job not found or inactive'
                });
            }

            // Check if already applied
            const existingApplication = await Application.findOne({
                job: jobId,
                jobseeker: req.user.userId
            });

            if (existingApplication) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already applied for this job'
                });
            }

            const application = new Application({
                job: jobId,
                jobseeker: req.user.userId,
                employer: job.employer,
                coverLetter,
                resume
            });

            await application.save();

            // Notify employer
            await Notification.create({
                user: job.employer,
                type: 'newApplication',
                message: `New application received for ${job.title}`,
                reference: application._id
            });

            res.status(201).json({
                success: true,
                data: application
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error submitting application'
            });
        }
    },

    getMyApplications: async (req, res) => {
        try {
            const applications = await Application.find({
                jobseeker: req.user.userId
            })
            .populate('job', 'title company status')
            .sort('-createdAt');

            res.status(200).json({
                success: true,
                data: applications
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching applications'
            });
        }
    },

    updateApplicationStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status, feedback } = req.body;

            const application = await Application.findOneAndUpdate(
                { _id: id, employer: req.user.userId },
                { 
                    status,
                    feedback,
                    updatedAt: Date.now()
                },
                { new: true }
            );

            if (!application) {
                return res.status(404).json({
                    success: false,
                    message: 'Application not found'
                });
            }

            // Notify jobseeker
            await Notification.create({
                user: application.jobseeker,
                type: 'applicationUpdate',
                message: `Your application status has been updated to ${status}`,
                reference: application._id
            });

            res.status(200).json({
                success: true,
                data: application
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating application'
            });
        }
    }
};

module.exports = applicationController; 