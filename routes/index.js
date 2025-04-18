const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');
const notificationController = require('../controllers/notificationController');
const analyticsController = require('../controllers/analyticsController');

// Dashboard routes
router.get('/dashboard/employer', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    dashboardController.getEmployerDashboard
);

router.get('/dashboard/jobseeker', 
    auth.verifyToken, 
    auth.checkRole(['jobseeker']), 
    dashboardController.getJobSeekerDashboard
);

// Notification routes
router.get('/notifications', 
    auth.verifyToken, 
    notificationController.getNotifications
);

router.put('/notifications/:notificationId/read', 
    auth.verifyToken, 
    notificationController.markAsRead
);

router.put('/notifications/read-all', 
    auth.verifyToken, 
    notificationController.markAllAsRead
);

// Analytics routes
router.get('/analytics/employer', 
    auth.verifyToken, 
    auth.checkRole(['employer']), 
    analyticsController.getEmployerAnalytics
);

router.get('/analytics/jobseeker', 
    auth.verifyToken, 
    auth.checkRole(['jobseeker']), 
    analyticsController.getJobSeekerAnalytics
);

module.exports = router; 