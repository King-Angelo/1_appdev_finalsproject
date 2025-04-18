const Notification = require('../models/Notification');
const notificationService = require('../services/notificationService');

const notificationController = {
    getNotifications: async (req, res) => {
        try {
            const notifications = await Notification.find({ 
                user: req.user.userId 
            })
            .sort({ createdAt: -1 })
            .limit(20);

            res.status(200).json({
                success: true,
                notifications
            });
        } catch (error) {
            console.error('Get notifications error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching notifications'
            });
        }
    },

    markAsRead: async (req, res) => {
        try {
            const { notificationId } = req.params;
            
            await Notification.findByIdAndUpdate(notificationId, {
                isRead: true
            });

            res.status(200).json({
                success: true,
                message: 'Notification marked as read'
            });
        } catch (error) {
            console.error('Mark notification error:', error);
            res.status(500).json({
                success: false,
                message: 'Error marking notification as read'
            });
        }
    },

    markAllAsRead: async (req, res) => {
        try {
            await Notification.updateMany(
                { user: req.user.userId },
                { isRead: true }
            );

            res.status(200).json({
                success: true,
                message: 'All notifications marked as read'
            });
        } catch (error) {
            console.error('Mark all notifications error:', error);
            res.status(500).json({
                success: false,
                message: 'Error marking notifications as read'
            });
        }
    }
};

module.exports = notificationController; 