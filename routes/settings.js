const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../middleware/auth');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// GET /settings - Show settings page
router.get('/', isAuthenticated, (req, res) => {
    res.render('settings/index', { user: req.user });
});

// POST /settings/update - Update user settings
router.post('/update', isAuthenticated, async (req, res) => {
    try {
        const { firstName, lastName, email, currentPassword, newPassword, confirmPassword } = req.body;
        
        // Find user with current data
        const user = await User.findById(req.user._id);
        if (!user) {
            req.flash('error', 'User not found');
            return res.redirect('/settings');
        }

        // Handle password change if any password field is filled
        if (currentPassword || newPassword || confirmPassword) {
            // Validate all password fields are provided
            if (!currentPassword || !newPassword || !confirmPassword) {
                req.flash('error', 'All password fields are required when changing password');
                return res.redirect('/settings');
            }

            // Verify current password using the model's method
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                req.flash('error', 'Current password is incorrect');
                return res.redirect('/settings');
            }

            // Validate new password length
            if (newPassword.length < 6) {
                req.flash('error', 'New password must be at least 6 characters long');
                return res.redirect('/settings');
            }

            // Verify new password confirmation
            if (newPassword !== confirmPassword) {
                req.flash('error', 'New passwords do not match');
                return res.redirect('/settings');
            }

            // Update password - it will be hashed by the pre-save middleware
            user.password = newPassword;
        }

        // Update basic info
        user.firstName = firstName;
        user.lastName = lastName;
        user.email = email;

        // Save all changes
        await user.save();

        if (currentPassword || newPassword || confirmPassword) {
            // If password was changed, log out
            req.flash('success', 'Settings updated successfully. Please log in with your new password.');
            req.logout((err) => {
                if (err) {
                    console.error('Logout error:', err);
                }
                return res.redirect('/login');
            });
        } else {
            // Just basic info update
            req.flash('success', 'Settings updated successfully');
            res.redirect('/settings');
        }
    } catch (error) {
        console.error('Error updating settings:', error);
        req.flash('error', 'Error updating settings: ' + error.message);
        res.redirect('/settings');
    }
});

module.exports = router; 