const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const auth = require('../middleware/auth');

// General Profile Routes
router.get('/me', 
    auth.verifyToken, 
    profileController.getMyProfile
);

router.put('/me', 
    auth.verifyToken, 
    profileController.updateProfile
);

// JobSeeker Specific Routes
router.put('/resume', 
    auth.verifyToken, 
    auth.checkRole(['jobseeker']), 
    profileController.updateResume
);

router.put('/skills', 
    auth.verifyToken, 
    auth.checkRole(['jobseeker']), 
    profileController.updateSkills
);

router.put('/experience', 
    auth.verifyToken, 
    auth.checkRole(['jobseeker']), 
    profileController.updateExperience
);

// Employer Specific Routes
router.put('/company', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    profileController.updateCompanyProfile
);

// Profile Privacy Settings
router.put('/privacy', 
    auth.verifyToken, 
    profileController.updatePrivacySettings
);

module.exports = router; 