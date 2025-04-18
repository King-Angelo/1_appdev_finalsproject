const User = require('../models/User');
const JobSeeker = require('../models/JobSeeker');
const Employer = require('../models/Employer');
const Token = require('../models/Token');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const passport = require('passport');

const authController = {
    // Register new user
    register: async (req, res) => {
        try {
            const { email, password, role, firstName, lastName } = req.body;

            // Check if user exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'Email is already registered'
                });
            }

            // Create verification token
            const verificationToken = crypto.randomBytes(32).toString('hex');

            // Create user
            const user = new User({
                email,
                password,
                role,
                firstName,
                lastName,
                verificationToken,
                isEmailVerified: false
            });

            // Hash password before saving
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);

            await user.save();

            // Create profile based on role
            if (role === 'jobseeker') {
                await JobSeeker.create({
                    user: user._id,
                    firstName,
                    lastName
                });
            } else if (role === 'employer') {
                await Employer.create({
                    user: user._id,
                    firstName,
                    lastName
                });
            }

            // Send verification email
            await sendVerificationEmail(user.email, verificationToken);

            res.status(201).json({
                success: true,
                message: 'Registration successful. Please verify your email.'
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Error during registration'
            });
        }
    },

    // Login user
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid credentials'
                });
            }
                req.flash('error', 'Invalid credentials');
                return res.redirect('/auth/login');
            }

            // Check if email is verified
            if (!user.isEmailVerified) {
                if (req.xhr || req.headers.accept.includes('application/json')) {
                    return res.status(401).json({
                        success: false,
                        message: 'Please verify your email before logging in'
                    });
                }
                req.flash('error', 'Please verify your email before logging in');
                return res.redirect('/auth/login');
            }

            // Validate password
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                if (req.xhr || req.headers.accept.includes('application/json')) {
                    return res.status(401).json({
                        success: false,
                        message: 'Invalid credentials'
                    });
                }
                req.flash('error', 'Invalid credentials');
                return res.redirect('/auth/login');
            }

            // Generate JWT token
            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Handle API requests
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(200).json({
                    success: true,
                    token,
                    user: {
                        id: user._id,
                        email: user.email,
                        role: user.role,
                        firstName: user.firstName,
                        lastName: user.lastName
                    }
                });
            }

            // Handle web requests
            req.login(user, (err) => {
                if (err) {
                    console.error('Login error:', err);
                    req.flash('error', 'Error during login');
                    return res.redirect('/auth/login');
                }
                res.redirect('/dashboard');
            });
        } catch (error) {
            console.error('Login error:', error);
            if (req.xhr || req.headers.accept.includes('application/json')) {
                return res.status(500).json({
                    success: false,
                    message: 'Error during login'
                });
            }
            req.flash('error', 'An error occurred during login');
            res.redirect('/auth/login');
        }
    },

    // Verify email
    verifyEmail: async (req, res) => {
        try {
            const { token } = req.params;

            const user = await User.findOne({ verificationToken: token });
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid verification token'
                });
            }

            user.isEmailVerified = true;
            user.verificationToken = undefined;
            await user.save();

            res.status(200).json({
                success: true,
                message: 'Email verified successfully'
            });
        } catch (error) {
            console.error('Email verification error:', error);
            res.status(500).json({
                success: false,
                message: 'Error during email verification'
            });
        }
    },

    // Forgot password
    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;

            const user = await User.findOne({ email });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString('hex');
            const resetTokenExpiry = Date.now() + 3600000; // 1 hour

            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = resetTokenExpiry;
            await user.save();

            // Send password reset email
            await sendPasswordResetEmail(email, resetToken);

            res.status(200).json({
                success: true,
                message: 'Password reset email sent'
            });
        } catch (error) {
            console.error('Forgot password error:', error);
            res.status(500).json({
                success: false,
                message: 'Error processing password reset request'
            });
        }
    },

    // Reset password
    resetPassword: async (req, res) => {
        try {
            const { token } = req.params;
            const { password } = req.body;

            const user = await User.findOne({
                resetPasswordToken: token,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid or expired reset token'
                });
            }

            // Hash new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            res.status(200).json({
                success: true,
                message: 'Password reset successful'
            });
        } catch (error) {
            console.error('Reset password error:', error);
            res.status(500).json({
                success: false,
                message: 'Error resetting password'
            });
        }
    },

    // Social auth callback
    socialAuthCallback: async (req, res) => {
        try {
            const user = req.user;
            const token = jwt.sign(
                { userId: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Redirect to frontend with token
            res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
        } catch (error) {
            console.error('Social auth callback error:', error);
            res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }
    },

    // Get current user
    getCurrentUser: async (req, res) => {
        try {
            const user = await User.findById(req.user.userId)
                .select('-password -resetPasswordToken -resetPasswordExpires');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                user
            });
        } catch (error) {
            console.error('Get current user error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching user data'
            });
        }
    },

    // Logout
    logout: async (req, res) => {
        try {
            // Clear session token from database if using session tokens
            const token = req.headers.authorization?.split(' ')[1];
            if (token) {
                await Token.deleteOne({ token });
            }

            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Error during logout'
            });
        }
    },

    // Logout from all devices
    logoutAllDevices: async (req, res) => {
        try {
            // Delete all tokens for the user
            await Token.deleteMany({ userId: req.user.userId });

            res.status(200).json({
                success: true,
                message: 'Logged out from all devices'
            });
        } catch (error) {
            console.error('Logout all devices error:', error);
            res.status(500).json({
                success: false,
                message: 'Error during logout from all devices'
            });
        }
    },

    // Google Authentication
    googleAuth: passport.authenticate('google', {
        scope: ['profile', 'email']
    }),

    googleCallback: passport.authenticate('google', {
        failureRedirect: '/login',
        session: false
    }),

    // Facebook Authentication
    facebookAuth: passport.authenticate('facebook', {
        scope: ['email']
    }),

    facebookCallback: passport.authenticate('facebook', {
        failureRedirect: '/login',
        session: false
    }),

    // LinkedIn Authentication
    linkedinAuth: passport.authenticate('linkedin', {
        scope: ['r_emailaddress', 'r_liteprofile']
    }),

    linkedinCallback: passport.authenticate('linkedin', {
        failureRedirect: '/login',
        session: false
    }),

    // Update profile
    updateProfile: async (req, res) => {
        try {
            const { firstName, lastName, email } = req.body;
            
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Check if email is being changed and if it's already in use
            if (email !== user.email) {
                const emailExists = await User.findOne({ email });
                if (emailExists) {
                    return res.status(400).json({
                        success: false,
                        message: 'Email is already in use'
                    });
                }
            }

            // Update user
            user.firstName = firstName;
            user.lastName = lastName;
            user.email = email;
            user.updatedAt = Date.now();

            await user.save();

            res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                user: {
                    id: user._id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Error updating profile'
            });
        }
    },

    // Change password
    changePassword: async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;
            
            const user = await User.findById(req.user.userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Verify current password
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Validate new password
            if (newPassword.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be at least 6 characters long'
                });
            }

            // Hash and update password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
            user.updatedAt = Date.now();

            await user.save();

            res.status(200).json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Error changing password'
            });
        }
    },

    // Get active sessions
    getActiveSessions: async (req, res) => {
        try {
            const user = await User.findById(req.user.userId)
                .select('sessions');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Filter out expired sessions (older than 24 hours)
            const activeSessions = user.sessions.filter(session => {
                const sessionAge = Date.now() - session.lastActive;
                return sessionAge < 24 * 60 * 60 * 1000; // 24 hours
            });

            res.status(200).json({
                success: true,
                sessions: activeSessions.map(session => ({
                    device: session.device,
                    lastActive: session.lastActive,
                    token: session.token.slice(-8) // Only send last 8 chars for security
                }))
            });
        } catch (error) {
            console.error('Get active sessions error:', error);
            res.status(500).json({
                success: false,
                message: 'Error fetching active sessions'
            });
        }
    },
};

module.exports = authController; 