// API Configuration for Career Line

// Auto-detect environment
const isLocalhost = window.location.hostname === 'localhost' || 
                    window.location.hostname === '127.0.0.1' ||
                    window.location.hostname === '';

// Set API URL based on environment
const API_BASE_URL = isLocalhost 
    ? 'http://localhost:5000/api'
    : 'https://career-line-coaching-1.onrender.com/api';

console.log('🌍 Environment:', isLocalhost ? 'Local Development' : 'Production');
console.log('🔗 API URL:', API_BASE_URL);

// Export for use in other scripts
window.API_BASE_URL = API_BASE_URL;