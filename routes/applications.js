const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const auth = require('../middleware/auth');

// JobSeeker Routes
router.post('/jobs/:jobId/apply', 
    auth.verifyToken, 
    auth.checkRole(['jobseeker']), 
    applicationController.submitApplication
);

router.get('/my-applications', 
    auth.verifyToken, 
    auth.checkRole(['jobseeker']), 
    applicationController.getMyApplications
);

// Employer Routes
router.get('/job/:jobId/applications', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    applicationController.getJobApplications
);

router.put('/:id/status', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    applicationController.updateApplicationStatus
);

// Common Routes
router.get('/:id', 
    auth.verifyToken, 
    applicationController.getApplicationById
);

router.delete('/:id', 
    auth.verifyToken, 
    applicationController.withdrawApplication
);

module.exports = router; 