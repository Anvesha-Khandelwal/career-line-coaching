const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS Configuration - FIXED
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://career-line-coaching-awr3.vercel.app', // REMOVED trailing slash
      'http://localhost:3000',
      'http://localhost:5000',
      'http://localhost:8080',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5000',
      'http://127.0.0.1:8080'
    ];

    // Check if the origin is in the allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('⚠️ Blocked origin:', origin);
      callback(null, true); // Allow anyway for development
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-JSON'],
  maxAge: 86400 // 24 hours
};

// Apply CORS middleware ONCE
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    console.log('Origin:', req.headers.origin);
    next();
});

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/careerline';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log('📊 Database:', mongoose.connection.name);
  })
  .catch(err => {
    console.error('❌ MongoDB Connection Error:', err.message);
    console.log('⚠️ Server will continue without database');
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
            health: 'GET /health'
        }
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date()
    });
});

// API Routes with better error handling
try {
    const authRoutes = require('./routes/auth');
    app.use('/api/auth', authRoutes);
    console.log('✅ Auth routes loaded');
} catch (error) {
    console.error('❌ Error loading auth routes:', error.message);
    // Fallback: create basic auth routes if file doesn't exist
    app.post('/api/auth/register', (req, res) => {
        res.status(503).json({ message: 'Auth routes not configured', error: 'Routes file missing' });
    });
    app.post('/api/auth/login', (req, res) => {
        res.status(503).json({ message: 'Auth routes not configured', error: 'Routes file missing' });
    });
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
    console.log('404 - Not Found:', req.method, req.path);
    res.status(404).json({ 
        message: 'Endpoint not found',
        requestedPath: req.path,
        method: req.method
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err.stack);
    res.status(err.status || 500).json({ 
        message: 'Something went wrong!', 
        error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
    });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('='.repeat(50));
    console.log('🚀 Career Line Backend Server Started');
    console.log('='.repeat(50));
    console.log('📡 Port:', PORT);
    console.log('🌐 Local: http://localhost:' + PORT);
    console.log('🌐 Network: http://0.0.0.0:' + PORT);
    console.log('');
    console.log('📋 CORS enabled for:');
    console.log('   - https://career-line-coaching-awr3.vercel.app');
    console.log('   - localhost:3000, 5000, 8080');
    console.log('');
    console.log('✅ Server ready to accept requests');
    console.log('='.repeat(50));
    console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('💤 Server closed');
        mongoose.connection.close(false, () => {
            console.log('💤 MongoDB connection closed');
            process.exit(0);
        });
    });
});

process.on('SIGINT', () => {
    console.log('\n👋 SIGINT received, shutting down gracefully');
    server.close(() => {
        console.log('💤 Server closed');
        mongoose.connection.close(false, () => {
            console.log('💤 MongoDB connection closed');
            process.exit(0);
        });
    });
});

module.exports = app;