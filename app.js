const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const path = require('path');
const flash = require('connect-flash');
const multer = require('multer');
require('dotenv').config();
const staticConfig = require('./config/staticFiles');
const storage = require('./config/storage');

// Load Models
require('./models/User');
require('./models/Profile');
require('./models/Job');
require('./models/Application');

// Passport Config
require('./config/passport');

const app = express();

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/job_portal')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log('MongoDB Connection Error:', err));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create upload directories
storage.createUploadDirs();

// Setup static files
staticConfig.setup(app);

// Serve static files with caching
app.use('/static', express.static(path.join(__dirname, 'public'), {
    maxAge: '1d',
    etag: true
}));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    maxAge: '1d',
    etag: true
}));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Session Configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/job_portal',
        ttl: 24 * 60 * 60, // 1 day
        autoRemove: 'native',
        touchAfter: 24 * 3600 // time period in seconds
    }),
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: true
    }
}));

// Flash messages
app.use(flash());

// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

// Global variables
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.messages = {
        success: req.flash('success'),
        error: req.flash('error')
    };
    next();
});

// Routes
app.use('/', require('./routes/auth'));
app.use('/jobs', require('./routes/jobs'));
app.use('/profile', require('./routes/profile'));
app.use('/settings', require('./routes/settings'));

// Multer Error Handling
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            req.flash('error', 'File is too large. Maximum size is 5MB');
        } else {
            req.flash('error', 'Error uploading file: ' + err.message);
        }
        return res.redirect('back');
    }
    next(err);
});

// General Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { error: err.message });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 