// Import modules
import { setupForms } from './components/forms.js';
import { setupNotifications } from './components/notifications.js';
import { setupFileUpload } from './components/fileUpload.js';
import { initializeAPI } from './utils/api.js';

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
    // Setup forms
    setupForms();

    // Initialize notifications
    setupNotifications();

    // Setup file upload
    setupFileUpload();

    // Initialize API
    initializeAPI();

    // Global event listeners
    setupEventListeners();
});

// Global event listeners
function setupEventListeners() {
    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Mobile menu
    const mobileMenuButton = document.getElementById('mobile-menu');
    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', toggleMobileMenu);
    }
}

// Theme toggle function
function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    localStorage.setItem('theme', 
        document.body.classList.contains('dark-theme') ? 'dark' : 'light'
    );
}

// Mobile menu toggle
function toggleMobileMenu() {
    document.querySelector('.navigation').classList.toggle('active');
}

// Load latest jobs
async function loadLatestJobs() {
    try {
        const response = await fetch('/api/jobs?limit=5');
        const data = await response.json();
        
        const jobsContainer = document.getElementById('latestJobs');
        if (data.jobs && data.jobs.length > 0) {
            jobsContainer.innerHTML = data.jobs.map(job => `
                <div class="job-item">
                    <h3>${job.title}</h3>
                    <div class="company">${job.company.name}</div>
                    <div class="location">${job.location}</div>
                    <div class="type">${job.type}</div>
                    <a href="/jobs/${job._id}" class="btn btn-primary mt-2">View Details</a>
                </div>
            `).join('');
        } else {
            jobsContainer.innerHTML = '<p>No jobs available at the moment.</p>';
        }
    } catch (error) {
        console.error('Error loading jobs:', error);
        document.getElementById('latestJobs').innerHTML = 
            '<p class="text-danger">Error loading jobs. Please try again later.</p>';
    }
}

// Form validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    if (!form) return true;

    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('is-invalid');
        } else {
            input.classList.remove('is-invalid');
        }
    });

    return isValid;
}

// Add event listeners for form validation
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', (e) => {
        if (!validateForm(form.id)) {
            e.preventDefault();
        }
    });
});

// Handle job search
const searchForm = document.querySelector('form[action="/jobs"]');
if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const search = searchForm.querySelector('[name="search"]').value;
        const location = searchForm.querySelector('[name="location"]').value;
        window.location.href = `/jobs?search=${encodeURIComponent(search)}&location=${encodeURIComponent(location)}`;
    });
}

// Handle login form submission
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Store the token in localStorage
            localStorage.setItem('token', data.token);
            // Redirect to dashboard
            window.location.href = '/dashboard';
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login');
    }
});

// Handle registration form submission
document.getElementById('registerForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        role: document.getElementById('role').value
    };

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! Please login.');
            window.location.href = '/login';
        } else {
            alert(data.message || 'Registration failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during registration');
    }
});

// Handle social login buttons
document.querySelectorAll('.social-login').forEach(button => {
    button.addEventListener('click', (e) => {
        const provider = e.target.dataset.provider;
        window.location.href = `/api/auth/${provider}`;
    });
}); 