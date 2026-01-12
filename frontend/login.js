const API_BASE_URL = 'http://localhost:5000/api';
let selectedRole = 'student';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Role selection buttons
    const studentBtn = document.getElementById('studentBtn');
    const teacherBtn = document.getElementById('teacherBtn');

    if (studentBtn && teacherBtn) {
        studentBtn.addEventListener('click', () => {
            selectedRole = 'student';
            studentBtn.classList.add('active');
            teacherBtn.classList.remove('active');
        });

        teacherBtn.addEventListener('click', () => {
            selectedRole = 'teacher';
            teacherBtn.classList.add('active');
            studentBtn.classList.remove('active');
        });
    }

    // Check if already logged in
    const existingToken = localStorage.getItem('token');
    const existingRole = localStorage.getItem('userRole');
    if (existingToken && existingRole) {
        if (existingRole === 'student') {
            window.location.href = 'student-dashboard.html';
        } else if (existingRole === 'teacher') {
            window.location.href = 'teacher-dashboard.html';
        }
    }

    // Login form submission
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Validation
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return;
        }

        showLoading(true);

        try {
            let response;
            try {
                response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, role: selectedRole })
                });
            } catch (fetchError) {
                throw new Error('NETWORK_ERROR');
            }

            // Parse JSON response
            let data;
            try {
                data = await response.json();
            } catch (jsonError) {
                if (!response.ok) {
                    throw new Error(`Server error: ${response.status} ${response.statusText}`);
                }
                throw new Error('Invalid response from server');
            }

            if (!response.ok) {
                throw new Error(data.message || `Login failed: ${response.status}`);
            }

            // Validate response data
            if (!data.token || !data.role || !data.name) {
                throw new Error('Invalid response from server');
            }

            // Store user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userName', data.name);
            localStorage.setItem('userEmail', email);

            showLoading(false);
            showSuccess(`Welcome back, ${data.name}! Redirecting...`);

            // Redirect based on role
            setTimeout(() => {
                if (data.role === 'student') {
                    window.location.href = 'student-dashboard.html';
                } else if (data.role === 'teacher') {
                    window.location.href = 'teacher-dashboard.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);

        } catch (error) {
            showLoading(false);
            
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.message === 'NETWORK_ERROR' || 
                error.message.includes('fetch') || 
                error.message.includes('Failed to fetch') || 
                error.message.includes('NetworkError') || 
                error.name === 'TypeError' ||
                error.message.includes('Network request failed')) {
                errorMessage = 'Cannot connect to server. Please make sure the backend is running at http://localhost:5000';
            } 
            else if (error.message.includes('credentials') || error.message.includes('Invalid') || error.message.includes('401')) {
                errorMessage = 'Invalid email or password. Please check and try again.';
            } 
            else if (error.message.includes('required') || error.message.includes('fields')) {
                errorMessage = error.message;
            }
            else if (error.message.includes('Server error') || error.message.includes('500')) {
                errorMessage = 'Server error occurred. Please try again later.';
            }
            else {
                errorMessage = error.message || 'Login failed. Please try again.';
            }
            
            showError(errorMessage);
            console.error('Login error:', error);
        }
    });
});

// Helper functions
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    const successDiv = document.getElementById('successMessage');
    
    if (successDiv) {
        successDiv.classList.remove('show');
    }
    
    if (errorDiv) {
        errorDiv.textContent = '⚠️ ' + message;
        errorDiv.classList.add('show');
        setTimeout(() => errorDiv.classList.remove('show'), 5000);
    } else {
        alert('Error: ' + message);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    const errorDiv = document.getElementById('errorMessage');
    
    if (errorDiv) {
        errorDiv.classList.remove('show');
    }
    
    if (successDiv) {
        successDiv.textContent = '✅ ' + message;
        successDiv.classList.add('show');
    }
}

function showLoading(show) {
    const loadingDiv = document.getElementById('loading');
    const loginForm = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    
    if (loadingDiv) {
        loadingDiv.classList.toggle('show', show);
    }
    if (loginForm) {
        loginForm.style.display = show ? 'none' : 'block';
    }
    if (submitBtn) {
        submitBtn.disabled = show;
    }
}