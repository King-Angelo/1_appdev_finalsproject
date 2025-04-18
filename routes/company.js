const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const auth = require('../middleware/auth');

// Public Company Routes
router.get('/', companyController.getAllCompanies);
router.get('/:id', companyController.getCompanyById);
router.get('/:id/jobs', companyController.getCompanyJobs);

// Employer Company Management
router.post('/', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    companyController.createCompany
);

router.put('/:id', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    companyController.updateCompany
);

router.delete('/:id', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    companyController.deleteCompany
);

// Company Profile Management
router.put('/:id/logo', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    companyController.updateCompanyLogo
);

router.put('/:id/profile', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    companyController.updateCompanyProfile
);

module.exports = router; 