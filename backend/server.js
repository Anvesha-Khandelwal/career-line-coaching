const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS Configuration - THIS IS CRITICAL
app.use(cors({
    origin: '*', // Allow all origins in development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// MongoDB Connection - DISABLED FOR TESTING
console.log('⚠️ MongoDB temporarily disabled for testing');
console.log('✅ Server will work without database - DATA WILL NOT BE SAVED');

// Uncomment this when MongoDB is fixed:
// const MONGODB_URI = process.env.MONGODB_URI || 'your_mongodb_atlas_uri_here';
// mongoose.connect(MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
// })
//     .then(() => {
//         console.log('✅ MongoDB Connected Successfully');
//         console.log('📊 Database:', mongoose.connection.name);
//     })
//     .catch(err => {
//         console.log('❌ MongoDB Connection Error:', err.message);
//         console.log('💡 Tip: Check your MongoDB Atlas connection string in .env file');
//     });

// Test Route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Career Line API is running',
        status: 'active',
        timestamp: new Date(),
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
        }
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// API Routes
try {
    app.use('/api/auth', require('./routes/auth'));
    console.log('✅ Auth routes loaded');
} catch (error) {
    console.error('❌ Error loading auth routes:', error.message);
}

try {
    app.use('/api/student', require('./routes/student'));
    console.log('✅ Student routes loaded');
} catch (error) {
    console.log('⚠️ Student routes not found (optional)');
}

try {
    app.use('/api/teacher', require('./routes/teacher'));
    console.log('✅ Teacher routes loaded');
} catch (error) {
    console.log('⚠️ Teacher routes not found (optional)');
}

try {
    app.use('/api/fee', require('./routes/fee'));
    console.log('✅ Fee routes loaded');
} catch (error) {
    console.log('⚠️ Fee routes not found (optional)');
}

// 404 handler
app.use((req, res) => {
    res.status(404).json({ 
        message: 'Endpoint not found',
        requestedPath: req.path
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!', 
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🚀 Server running on port', PORT);
    console.log('📡 API URL: http://localhost:' + PORT);
    console.log('🌐 Frontend can connect from any origin');
    console.log('✅ Server is ready to accept requests');
    console.log('⚠️ WARNING: Database is disabled - data will not be saved!');
    console.log('='.repeat(50));
});