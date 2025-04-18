const WebSocket = require('ws');
const Notification = require('../models/Notification');
const User = require('../models/User');

class NotificationService {
    constructor(server) {
        this.wss = new WebSocket.Server({ server });
        this.clients = new Map(); // userId -> WebSocket

        this.wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });
    }

    handleConnection(ws, req) {
        const userId = req.user.id; // Assuming user is authenticated
        this.clients.set(userId, ws);

        ws.on('close', () => {
            this.clients.delete(userId);
        });
    }

    async createNotification(userId, type, message, data = {}) {
        try {
            const notification = new Notification({
                user: userId,
                type,
                message,
                data
            });

            await notification.save();

            // Send real-time notification if user is connected
            this.sendToUser(userId, {
                type: 'notification',
                data: notification
            });

            return notification;
        } catch (error) {
            console.error('Notification creation failed:', error);
            throw error;
        }
    }

    async getUserNotifications(userId) {
        try {
            return await Notification.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(20);
        } catch (error) {
            console.error('Get notifications failed:', error);
            throw error;
        }
    }

    sendToUser(userId, data) {
        const ws = this.clients.get(userId);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(data));
        }
    }

    async markAsRead(notificationId, userId) {
        try {
            await Notification.findOneAndUpdate(
                { _id: notificationId, user: userId },
                { isRead: true }
            );
        } catch (error) {
            console.error('Mark notification as read failed:', error);
            throw error;
        }
    }

    async markAllAsRead(userId) {
        try {
            await Notification.updateMany(
                { user: userId },
                { isRead: true }
            );
        } catch (error) {
            console.error('Mark all notifications as read failed:', error);
            throw error;
        }
    }
}

module.exports = NotificationService; 