const express = require('express');
const router = express.Router();
const apiController = require('../controllers/apiController');
const auth = require('../middleware/auth');

// API Authentication
router.post('/token', apiController.generateApiToken);
router.post('/token/refresh', apiController.refreshApiToken);

// Protected API Routes
router.use(auth.verifyApiToken);

// Jobs API
router.get('/jobs', apiController.getJobs);
router.get('/jobs/:id', apiController.getJobById);
router.post('/jobs/search', apiController.searchJobs);

// Companies API
router.get('/companies', apiController.getCompanies);
router.get('/companies/:id', apiController.getCompanyById);
router.get('/companies/:id/jobs', apiController.getCompanyJobs);

// Statistics API
router.get('/stats/jobs', apiController.getJobStats);
router.get('/stats/companies', apiController.getCompanyStats);
router.get('/stats/industries', apiController.getIndustryStats);

module.exports = router; 