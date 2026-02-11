// API Configuration
// Change this based on your environment

// For LOCAL development (backend running on your computer)
const API_BASE_URL = 'http://localhost:5000/api';

// For PRODUCTION (after deploying backend)
// const API_BASE_URL = 'https://career-line-coaching-1.onrender.com/api';

// Auto-detect environment (uncomment to use)
/*
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://career-line-coaching-1.onrender.com/api';
*/

console.log('🔗 API URL:', API_BASE_URL);