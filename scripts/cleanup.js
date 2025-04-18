const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Directories to remove
const directoriesToRemove = [
    '__pycache__',
    'venv',
    'templates',
    'staticfiles',
    'static',
    'social_login_project',
    'myproject',
    'myapp',
    'jobportal',
    'django_social_login_allauth',
    'users',
    'src',
    'protected_media'
];

// Files to remove
const filesToRemove = [
    'db.sqlite3',
    'django-debug.log',
    'requirements.txt',
    'manage.py',
    'run_tests.py',
    'test_runner.py',
    'test_api.py',
    'test_server.py',
    'create_categories.py',
    'create_jobseeker.py',
    'create_profiles.py',
    'create_skills_benefits.py'
];

// Create Express directory structure
const expressDirectories = [
    'config',
    'controllers',
    'middleware',
    'models',
    'public',
    'public/css',
    'public/js',
    'public/images',
    'routes',
    'services',
    'views',
    'views/layouts',
    'views/partials',
    'views/pages'
];

console.log('Starting cleanup process...');

// Remove Django directories
directoriesToRemove.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true, force: true });
        console.log(`Removed directory: ${dir}`);
    }
});

// Remove Django files
filesToRemove.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`Removed file: ${file}`);
    }
});

// Create Express directory structure
expressDirectories.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

console.log('Cleanup completed! Express directory structure created.'); 