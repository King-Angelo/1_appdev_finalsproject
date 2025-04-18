const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const Employer = require('../models/Employer');

const profileController = {
    getMyProfile: async (req, res) => {
        try {
            const user = await User.findById(req.user.userId)
                .select('-password -resetPasswordToken')
                .populate('profile');

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching profile'
            });
        }
    },

    updateProfile: async (req, res) => {
        try {
            const { firstName, lastName, phone, location, bio } = req.body;
            
            const user = await User.findByIdAndUpdate(
                req.user.userId,
                {
                    firstName,
                    lastName,
                    phone,
                    location,
                    bio,
                    updatedAt: Date.now()
                },
                { new: true }
            ).select('-password');

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating profile'
            });
        }
    },

    updateResume: async (req, res) => {
        try {
            const { resume, education, experience, skills } = req.body;
            
            const jobSeeker = await JobSeeker.findOneAndUpdate(
                { user: req.user.userId },
                {
                    resume,
                    education,
                    experience,
                    skills,
                    updatedAt: Date.now()
                },
                { new: true }
            );

            res.status(200).json({
                success: true,
                data: jobSeeker
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating resume'
            });
        }
    },

    updateCompanyProfile: async (req, res) => {
        try {
            const { 
                companyName, 
                industry, 
                companySize, 
                website, 
                description 
            } = req.body;
            
            const employer = await Employer.findOneAndUpdate(
                { user: req.user.userId },
                {
                    companyName,
                    industry,
                    companySize,
                    website,
                    description,
                    updatedAt: Date.now()
                },
                { new: true }
            );

            res.status(200).json({
                success: true,
                data: employer
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating company profile'
            });
        }
    },

    updateSkills: async (req, res) => {
        try {
            const { skills } = req.body;
            
            const jobSeeker = await JobSeeker.findOneAndUpdate(
                { user: req.user.userId },
                {
                    skills,
                    updatedAt: Date.now()
                },
                { new: true }
            );

            res.status(200).json({
                success: true,
                data: jobSeeker
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating skills'
            });
        }
    },

    updateExperience: async (req, res) => {
        try {
            const { experience } = req.body;
            
            const jobSeeker = await JobSeeker.findOneAndUpdate(
                { user: req.user.userId },
                {
                    experience,
                    updatedAt: Date.now()
                },
                { new: true }
            );

            res.status(200).json({
                success: true,
                data: jobSeeker
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating experience'
            });
        }
    },

    updatePrivacySettings: async (req, res) => {
        try {
            const { privacySettings } = req.body;
            
            const user = await User.findByIdAndUpdate(
                req.user.userId,
                {
                    privacySettings,
                    updatedAt: Date.now()
                },
                { new: true }
            ).select('-password');

            res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error updating privacy settings'
            });
        }
    }
};

module.exports = profileController; 