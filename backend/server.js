const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// CORS Configuration
app.use(cors({
    origin: '*', // Allow all origins for development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============================================
// IN-MEMORY STORAGE
// ============================================

const users = [];

// ============================================
// ROUTES
// ============================================

// Root route - Test server
app.get('/', (req, res) => {
    res.json({ 
        message: 'Career Line API is running',
        status: 'active',
        timestamp: new Date(),
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            users: 'GET /api/auth/users',
            health: 'GET /health'
        }
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        timestamp: new Date(),
        totalUsers: users.length
    });
});

// ============================================
// AUTH ROUTES - REGISTRATION
// ============================================

app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('');
        console.log('📝 ========== REGISTRATION REQUEST ==========');
        console.log('📦 Request Body:', JSON.stringify(req.body, null, 2));
        
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password || !role) {
            console.log('❌ Missing fields');
            return res.status(400).json({ 
                message: 'All fields are required',
                success: false,
                received: { name, email, password: password ? '***' : undefined, role }
            });
        }

        // Validate role
        if (!['student', 'teacher'].includes(role)) {
            console.log('❌ Invalid role:', role);
            return res.status(400).json({ 
                message: 'Invalid role. Must be "student" or "teacher"',
                success: false 
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.log('❌ Invalid email format:', email);
            return res.status(400).json({ 
                message: 'Invalid email format',
                success: false 
            });
        }

        // Password validation
        if (password.length < 6) {
            console.log('❌ Password too short');
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters',
                success: false 
            });
        }

        // Check if user already exists
        const existingUser = users.find(u => u.email === email && u.role === role);
        if (existingUser) {
            console.log('❌ User already exists:', email, role);
            return res.status(400).json({ 
                message: 'User already exists with this email and role',
                success: false 
            });
        }

        // Hash password
        console.log('🔐 Hashing password...');
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashedPassword,
            role,
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        
        console.log('✅ User registered successfully!');
        console.log('👤 User ID:', newUser.id);
        console.log('📧 Email:', newUser.email);
        console.log('👔 Role:', newUser.role);
        console.log('📊 Total users now:', users.length);

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: newUser.id, 
                email: newUser.email, 
                role: newUser.role 
            },
            'career_line_secret_key_2024',
            { expiresIn: '7d' }
        );

        console.log('🎟️ Token generated');
        console.log('========================================');
        console.log('');

        res.status(201).json({
            message: 'Registration successful',
            success: true,
            token,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ 
            message: 'Server error during registration',
            error: error.message,
            success: false 
        });
    }
});

// ============================================
// AUTH ROUTES - LOGIN
// ============================================

app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('');
        console.log('🔐 ========== LOGIN REQUEST ==========');
        console.log('📦 Request Body:', { email: req.body.email, role: req.body.role });
        
        const { email, password, role } = req.body;

        // Validation
        if (!email || !password || !role) {
            console.log('❌ Missing fields');
            return res.status(400).json({ 
                message: 'All fields are required',
                success: false 
            });
        }

        // Find user
        const user = users.find(u => u.email === email && u.role === role);
        if (!user) {
            console.log('❌ User not found');
            console.log('📊 Available users:', users.map(u => ({ email: u.email, role: u.role })));
            return res.status(401).json({ 
                message: 'Invalid email or password',
                success: false 
            });
        }

        // Verify password
        console.log('🔐 Verifying password...');
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return res.status(401).json({ 
                message: 'Invalid email or password',
                success: false 
            });
        }

        console.log('✅ Login successful!');
        console.log('👤 User:', user.email);

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            'career_line_secret_key_2024',
            { expiresIn: '7d' }
        );

        console.log('🎟️ Token generated');
        console.log('====================================');
        console.log('');

        res.status(200).json({
            message: 'Login successful',
            success: true,
            token,
            name: user.name,
            email: user.email,
            role: user.role
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login',
            error: error.message,
            success: false 
        });
    }
});

// ============================================
// DEBUG ROUTES
// ============================================

// Get all users (for debugging)
app.get('/api/auth/users', (req, res) => {
    const safeUsers = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt
    }));
    
    console.log('📋 Users list requested. Total:', users.length);
    
    res.json({ 
        users: safeUsers, 
        count: users.length,
        timestamp: new Date().toISOString()
    });
});

// Test POST endpoint
app.post('/api/test', (req, res) => {
    console.log('🧪 Test endpoint hit');
    console.log('📦 Body:', req.body);
    res.json({ 
        message: 'Test endpoint working',
        receivedData: req.body,
        timestamp: new Date()
    });
});

// ============================================
// ERROR HANDLERS
// ============================================

// 404 handler
app.use((req, res) => {
    console.log('❌ 404 - Not Found:', req.method, req.path);
    res.status(404).json({ 
        message: 'Endpoint not found',
        requestedPath: req.path,
        method: req.method,
        availableEndpoints: [
            'POST /api/auth/register',
            'POST /api/auth/login',
            'GET /api/auth/users',
            'GET /health',
            'GET /'
        ]
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('💥 Unhandled error:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: err.message
    });
});

// ============================================
// START SERVER
// ============================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
    console.log('');
    console.log('='.repeat(60));
    console.log('🚀 CAREER LINE BACKEND SERVER STARTED');
    console.log('='.repeat(60));
    console.log('');
    console.log('📡 Port:', PORT);
    console.log('🌐 Local:', `http://localhost:${PORT}`);
    console.log('🌐 Network:', `http://0.0.0.0:${PORT}`);
    console.log('');
    console.log('📋 Available Endpoints:');
    console.log('   GET  /', '                    - Server status');
    console.log('   GET  /health', '              - Health check');
    console.log('   POST /api/auth/register', '   - User registration');
    console.log('   POST /api/auth/login', '      - User login');
    console.log('   GET  /api/auth/users', '      - List all users');
    console.log('   POST /api/test', '            - Test endpoint');
    console.log('');
    console.log('✅ CORS: Enabled for all origins');
    console.log('✅ Body Parser: JSON & URL-encoded');
    console.log('✅ Request Logging: Enabled');
    console.log('');
    console.log('🎯 Ready to accept requests!');
    console.log('='.repeat(60));
    console.log('');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n👋 Shutting down gracefully...');
    console.log('📊 Total users registered:', users.length);
    process.exit(0);
});