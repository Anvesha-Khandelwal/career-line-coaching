// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...defaultOptions,
            ...options,
            headers: {
                ...defaultOptions.headers,
                ...options.headers
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API call failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    } else {
        alert(message);
    }
}

// Show loading state
function showLoading(show = true) {
    const loadingDiv = document.getElementById('loading');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    
    if (loadingDiv) {
        if (show) {
            loadingDiv.classList.add('show');
            if (loginBtn) loginBtn.disabled = true;
            if (registerBtn) registerBtn.disabled = true;
        } else {
            loadingDiv.classList.remove('show');
            if (loginBtn) loginBtn.disabled = false;
            if (registerBtn) registerBtn.disabled = false;
        }
    }
}

// Check if user is authenticated
function checkAuth() {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    
    if (!token || !userRole) {
        return false;
    }
    
    return true;
}

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}