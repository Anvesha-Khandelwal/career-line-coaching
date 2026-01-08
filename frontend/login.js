// Role selection
let selectedRole = 'student';

const studentBtn = document.getElementById('studentBtn');
const teacherBtn = document.getElementById('teacherBtn');

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

// Check if already logged in
if (checkAuth()) {
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'student') {
        window.location.href = 'student-dashboard.html';
    } else if (userRole === 'teacher') {
        window.location.href = 'teacher-dashboard.html';
    }
}

// Login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
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

    // Show loading
    showLoading(true);

    try {
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
        showLoading(false);
        
        // Create success message
        const successDiv = document.createElement('div');
        successDiv.style.cssText = 'background: #4CAF50; color: white; padding: 12px; border-radius: 8px; margin-bottom: 15px; text-align: center;';
        successDiv.textContent = `✅ Login successful! Welcome ${data.name}`;
        
        const loginBox = document.querySelector('.login-box');
        loginBox.insertBefore(successDiv, loginBox.firstChild);

        // Redirect based on role
        setTimeout(() => {
            if (data.role === 'student') {
                window.location.href = 'student-dashboard.html';
            } else if (data.role === 'teacher') {
                window.location.href = 'teacher-dashboard.html';
            }
        }, 1000);

    } catch (error) {
        showLoading(false);
        console.error('Login Error:', error);
        
        // Show user-friendly error message
        let errorMessage = 'Login failed. Please try again.';
        
        if (error.message.includes('Invalid credentials')) {
            errorMessage = 'Invalid email or password. Please check and try again.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Cannot connect to server. Please make sure the backend is running.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showError(errorMessage);
    }
});