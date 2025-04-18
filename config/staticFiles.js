const express = require('express');
const path = require('path');

const staticConfig = {
    // Configure static file serving
    setup: (app) => {
        // Serve static files from public directory
        app.use(express.static(path.join(__dirname, '../public')));

        // Serve uploaded files
        app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
    }
};

module.exports = staticConfig; 