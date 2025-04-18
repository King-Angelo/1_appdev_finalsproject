const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');

// Admin Authentication
router.use(auth.verifyToken, auth.checkRole(['admin']));

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserById);
router.put('/users/:id/status', adminController.updateUserStatus);
router.delete('/users/:id', adminController.deleteUser);

// Job Management
router.get('/jobs', adminController.getAllJobs);
router.put('/jobs/:id/status', adminController.updateJobStatus);
router.delete('/jobs/:id', adminController.deleteJob);

// Company Management
router.get('/companies', adminController.getAllCompanies);
router.put('/companies/:id/verify', adminController.verifyCompany);
router.delete('/companies/:id', adminController.deleteCompany);

// Reports & Analytics
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/jobs', adminController.getJobAnalytics);
router.get('/analytics/applications', adminController.getApplicationAnalytics);

// System Settings
router.get('/settings', adminController.getSystemSettings);
router.put('/settings', adminController.updateSystemSettings);

module.exports = router; 