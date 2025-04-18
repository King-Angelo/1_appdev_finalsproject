const User = require('../models/User');
const Job = require('../models/Job');
const Application = require('../models/Application');

const dashboardController = {
    // Employer Dashboard
    getEmployerDashboard: async (req, res) => {
        try {
            const userId = req.user.userId;
            
            // Get posted jobs
            const postedJobs = await Job.find({ employer: userId })
                .sort({ createdAt: -1 })
                .limit(10);
            
            // Get recent applications
            const recentApplications = await Application.find({
                job: { $in: postedJobs.map(job => job._id) }
            })
            .populate('jobseeker', 'firstName lastName email')
            .populate('job', 'title')
            .sort({ createdAt: -1 })
            .limit(5);

            // Get dashboard stats
            const stats = {
                totalJobs: await Job.countDocuments({ employer: userId }),
                activeJobs: await Job.countDocuments({ 
                    employer: userId,
                    status: 'active'
                }),
                totalApplications: await Application.countDocuments({
                    job: { $in: postedJobs.map(job => job._id) }
                })
            };

            res.render('dashboard/employer', {
                postedJobs,
                recentApplications,
                stats
            });
        } catch (error) {
            console.error('Employer dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Error loading dashboard'
            });
        }
    },

    // JobSeeker Dashboard
    getJobSeekerDashboard: async (req, res) => {
        try {
            const userId = req.user.userId;
            
            // Get applied jobs
            const applications = await Application.find({ jobseeker: userId })
                .populate('job')
                .sort({ createdAt: -1 })
                .limit(10);

            // Get recommended jobs based on skills
            const userProfile = await User.findById(userId).select('skills');
            const recommendedJobs = await Job.find({
                skills: { $in: userProfile.skills },
                status: 'active'
            })
            .limit(5);

            // Get dashboard stats
            const stats = {
                totalApplications: await Application.countDocuments({ 
                    jobseeker: userId 
                }),
                pendingApplications: await Application.countDocuments({ 
                    jobseeker: userId,
                    status: 'pending'
                }),
                shortlisted: await Application.countDocuments({ 
                    jobseeker: userId,
                    status: 'shortlisted'
                })
            };

            res.render('dashboard/jobseeker', {
                applications,
                recommendedJobs,
                stats
            });
        } catch (error) {
            console.error('JobSeeker dashboard error:', error);
            res.status(500).json({
                success: false,
                message: 'Error loading dashboard'
            });
        }
    }
};

module.exports = dashboardController; 