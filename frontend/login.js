// Role selection
let selectedRole = 'student';

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
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
    if (typeof checkAuth === 'function' && checkAuth()) {
        const userRole = localStorage.getItem('userRole');
        if (userRole === 'student') {
            window.location.href = 'student-dashboard.html';
        } else if (userRole === 'teacher') {
            window.location.href = 'teacher-dashboard.html';
        }
    }
});

// Login form submission
document.addEventListener('DOMContentLoaded', () => {
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
            if (typeof showError === 'function') {
                showError('Please fill in all fields');
            } else {
                alert('Please fill in all fields');
            }
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if (typeof showError === 'function') {
                showError('Please enter a valid email address');
            } else {
                alert('Please enter a valid email address');
            }
            return;
        }

        // Show loading
        if (typeof showLoading === 'function') {
            showLoading(true);
        }

        try {
            // Check if apiCall function exists
            if (typeof apiCall !== 'function') {
                throw new Error('API configuration not loaded. Please refresh the page.');
            }

            // Call login API
            const data = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ 
                    email, 
                    password, 
                    role: selectedRole 
                })
            });

            // Store user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userName', data.name);
            localStorage.setItem('userEmail', email);

            // Show success message
            if (typeof showLoading === 'function') {
                showLoading(false);
            }
            
            // Create success message
            const successDiv = document.createElement('div');
            successDiv.style.cssText = 'background: #10b981; color: white; padding: 14px 16px; border-radius: 10px; margin-bottom: 20px; text-align: center; font-weight: 500; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);';
            successDiv.textContent = `✅ Login successful! Welcome ${data.name || 'User'}`;
            
            const loginBox = document.querySelector('.login-box');
            const errorMsg = document.getElementById('errorMessage');
            if (errorMsg) {
                errorMsg.classList.remove('show');
            }
            loginBox.insertBefore(successDiv, loginBox.firstChild);

            // Redirect based on role
            setTimeout(() => {
                if (data.role === 'student') {
                    window.location.href = 'student-dashboard.html';
                } else if (data.role === 'teacher') {
                    window.location.href = 'teacher-dashboard.html';
                } else {
                    window.location.href = 'index.html';
                }
            }, 1500);

        } catch (error) {
            if (typeof showLoading === 'function') {
                showLoading(false);
            }
            console.error('Login Error:', error);
            
            // Show user-friendly error message
            let errorMessage = 'Login failed. Please try again.';
            
            if (error.message.includes('Invalid credentials') || error.message.includes('401')) {
                errorMessage = 'Invalid email or password. Please check and try again.';
            } else if (error.message.includes('network') || error.message.includes('fetch') || error.message.includes('Failed to fetch')) {
                errorMessage = 'Cannot connect to server. Please make sure the backend is running on http://localhost:5000';
            } else if (error.message.includes('API configuration')) {
                errorMessage = error.message;
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            if (typeof showError === 'function') {
                showError(errorMessage);
            } else {
                alert(errorMessage);
            }
        }
    });
});