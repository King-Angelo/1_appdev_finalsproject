const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Job = require('../models/Job');
const Application = require('../models/Application');
const multer = require('multer');
const path = require('path');
const jobController = require('../controllers/jobController');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/resumes')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        const allowedTypes = ['.pdf', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF, DOC, and DOCX files are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Public Routes - Specific routes first
router.get('/search', jobController.searchJobs);
router.get('/post', auth.isAuthenticated, (req, res) => {
    if (req.user.role !== 'employer') {
        return res.redirect('/dashboard');
    }
    res.render('jobs/post', { error: null });
});
router.get('/manage', auth.isAuthenticated, async (req, res) => {
    if (req.user.role !== 'employer') {
        return res.redirect('/dashboard');
    }
    try {
        const jobs = await Job.find({ employer: req.user._id }).sort({ createdAt: -1 });
        res.render('jobs/manage', { 
            jobs,
            error: null,
            success: req.flash('success')
        });
    } catch (err) {
        res.render('jobs/manage', { 
            jobs: [],
            error: 'Error fetching your job listings',
            success: null
        });
    }
});
router.get('/applications/overview', auth.isAuthenticated, async (req, res) => {
    if (req.user.role !== 'employer') {
        return res.redirect('/dashboard');
    }
    try {
        const jobs = await Job.find({ employer: req.user._id });
        const jobIds = jobs.map(job => job._id);
        
        const applications = await Application.find({ job: { $in: jobIds } })
            .populate('job')
            .populate('applicant', 'firstName lastName email')
            .sort({ createdAt: -1 });

        res.render('jobs/applications-overview', {
            applications,
            messages: {
                success: req.flash('success'),
                error: req.flash('error')
            }
        });
    } catch (err) {
        console.error('Error in applications overview:', err);
        res.render('jobs/applications-overview', {
            applications: [],
            messages: {
                error: 'Error fetching applications',
                success: null
            }
        });
    }
});
router.get('/applications', auth.isAuthenticated, async (req, res) => {
    if (req.user.role !== 'jobseeker') {
        return res.redirect('/jobs/applications/overview');
    }
    try {
        const applications = await Application.find({ applicant: req.user._id })
            .populate('job')
            .sort({ createdAt: -1 });
        res.render('jobs/applications', { 
            applications,
            error: null
        });
    } catch (err) {
        res.render('jobs/applications', { 
            applications: [], 
            error: 'Error fetching applications'
        });
    }
});

// Generic routes
router.get('/', jobController.getAllJobs);
router.get('/:id', jobController.getJobById);

// Employer Routes
router.post('/', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    jobController.createJob
);

router.put('/:id', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    jobController.updateJob
);

router.delete('/:id', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    jobController.deleteJob
);

// Job Management
router.post('/:id/publish', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    jobController.publishJob
);

router.post('/:id/unpublish', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    jobController.unpublishJob
);

// Job Analytics
router.get('/:id/analytics', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    jobController.getJobAnalytics
);

// Get job edit page (for employers)
router.get('/:id/edit', auth.isAuthenticated, async (req, res) => {
    if (req.user.role !== 'employer') {
        return res.redirect('/dashboard');
    }
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            req.flash('error', 'Job not found');
            return res.redirect('/jobs/manage');
        }
        
        if (job.employer.toString() !== req.user._id.toString()) {
            req.flash('error', 'Not authorized to edit this job');
            return res.redirect('/jobs/manage');
        }
        
        res.render('jobs/edit', { job, error: req.flash('error') });
    } catch (err) {
        console.error('Error fetching job for edit:', err);
        req.flash('error', 'Error fetching job details');
        res.redirect('/jobs/manage');
    }
});

// Apply for a job
router.post('/:id/apply', auth.isAuthenticated, upload.single('resume'), async (req, res) => {
    try {
        if (req.user.role !== 'jobseeker') {
            req.flash('error', 'Only job seekers can apply for jobs');
            return res.redirect('/jobs/' + req.params.id);
        }

        const job = await Job.findById(req.params.id);
        if (!job) {
            req.flash('error', 'Job not found');
            return res.redirect('/jobs');
        }

        // Check if user has already applied
        const existingApplication = await Application.findOne({
            job: job._id,
            applicant: req.user._id
        });

        if (existingApplication) {
            req.flash('error', 'You have already applied for this job');
            return res.redirect('/jobs/' + req.params.id);
        }

        if (!req.file) {
            req.flash('error', 'Please upload your resume');
            return res.redirect('/jobs/' + req.params.id);
        }

        const application = new Application({
            job: job._id,
            applicant: req.user._id,
            coverLetter: req.body.coverLetter,
            resume: '/uploads/resumes/' + req.file.filename
        });

        await application.save();
        req.flash('success', 'Application submitted successfully');
        res.redirect('/jobs/applications');
    } catch (err) {
        console.error('Error submitting application:', err);
        req.flash('error', 'Error submitting application');
        res.redirect('/jobs/' + req.params.id);
    }
});

module.exports = router; 