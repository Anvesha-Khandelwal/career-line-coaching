const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// In-memory user storage (temporary - will use MongoDB later)
const users = [];

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        console.log('📝 Registration request received');
        console.log('📦 Body:', req.body);
        
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password || !role) {
            console.log('❌ Missing fields');
            return res.status(400).json({ 
                message: 'All fields are required (name, email, password, role)',
                success: false 
            });
        }

        // Validate role
        if (!['student', 'teacher'].includes(role)) {
            return res.status(400).json({ 
                message: 'Invalid role. Must be "student" or "teacher"',
                success: false 
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                message: 'Invalid email format',
                success: false 
            });
        }

        // Password validation
        if (password.length < 6) {
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
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

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
        
        console.log('✅ User registered successfully');
        console.log('📊 Total users:', users.length);
        console.log('👤 New user:', { id: newUser.id, email: newUser.email, role: newUser.role });

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: newUser.id, 
                email: newUser.email, 
                role: newUser.role 
            },
            process.env.JWT_SECRET || 'career_line_secret_key_2024',
            { expiresIn: '7d' }
        );

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

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        console.log('🔐 Login request received');
        console.log('📦 Email:', req.body.email, 'Role:', req.body.role);
        
        const { email, password, role } = req.body;

        // Validation
        if (!email || !password || !role) {
            return res.status(400).json({ 
                message: 'All fields are required (email, password, role)',
                success: false 
            });
        }

        // Find user
        const user = users.find(u => u.email === email && u.role === role);
        if (!user) {
            console.log('❌ User not found');
            return res.status(401).json({ 
                message: 'Invalid email or password',
                success: false 
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return res.status(401).json({ 
                message: 'Invalid email or password',
                success: false 
            });
        }

        console.log('✅ Login successful');

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user.id, 
                email: user.email, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'career_line_secret_key_2024',
            { expiresIn: '7d' }
        );

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

// @route   GET /api/auth/users
// @desc    Get all users (for debugging)
// @access  Public (should be protected in production)
router.get('/users', (req, res) => {
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

// @route   POST /api/auth/verify
// @desc    Verify JWT token
// @access  Private
router.post('/verify', (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ 
                message: 'No token provided',
                success: false 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'career_line_secret_key_2024');
        
        res.json({
            message: 'Token is valid',
            success: true,
            user: decoded
        });

    } catch (error) {
        res.status(401).json({ 
            message: 'Invalid or expired token',
            success: false 
        });
    }
});

module.exports = router;