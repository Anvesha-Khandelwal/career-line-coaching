const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const corsOptions = {
  origin: [
    'https://career-line-coaching-awr3.vercel.app/',          // Your Vercel URL
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// If CORS_ORIGIN is set and contains comma, split it
if (process.env.CORS_ORIGIN && process.env.CORS_ORIGIN.includes(',')) {
    corsOptions.origin = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
}

app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/careerline';

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log('📊 Database:', mongoose.connection.name);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err);
  });

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
    console.log('✅ Database integration enabled');
    console.log('='.repeat(50));
});