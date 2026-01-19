const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'career_line_secret_key_2024';

// Test route
router.get('/test', (req, res) => {
    res.json({ message: 'Auth routes are working!' });
});

// Register endpoint - WITH DATABASE
router.post('/register', async (req, res) => {
    try {
        console.log('📝 Registration request received');
        console.log('Request body:', req.body);
        
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password || !role) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ 
                message: 'All fields are required',
                received: { name: !!name, email: !!email, password: !!password, role: !!role }
            });
        }

        // Validate role
        if (!['student', 'teacher'].includes(role)) {
            console.log('❌ Invalid role:', role);
            return res.status(400).json({ 
                message: 'Invalid role. Must be student or teacher',
                receivedRole: role
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        // Validate password length
        if (password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check if user already exists in database
        const existingUser = await User.findOne({ email: email.toLowerCase().trim(), role });
        if (existingUser) {
            console.log('❌ User already exists:', email, role);
            return res.status(400).json({ 
                message: `A ${role} account already exists with this email. Please login or use a different email.`
            });
        }

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create user in database
        const newUser = new User({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role
        });

        await newUser.save();
        console.log('✅ User registered successfully:', { 
            id: newUser._id, 
            email: newUser.email, 
            role: newUser.role,
            name: newUser.name
        });

        // Generate token
        const token = jwt.sign(
            { id: newUser._id.toString(), role: newUser.role, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('🎟️ Token generated');

        res.status(201).json({
            message: 'Registration successful',
            token,
            name: newUser.name,
            role: newUser.role,
            email: newUser.email
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        
        // Handle duplicate key error (MongoDB unique index)
        if (error.code === 11000) {
            return res.status(400).json({ 
                message: 'An account with this email and role already exists. Please login or use a different email.'
            });
        }
        
        res.status(500).json({ 
            message: 'Server error during registration',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Login endpoint - WITH DATABASE
router.post('/login', async (req, res) => {
    try {
        console.log('🔐 Login request received');
        console.log('Request body:', { email: req.body.email, role: req.body.role });
        
        const { email, password, role } = req.body;

        // Validation
        if (!email || !password || !role) {
            console.log('❌ Missing required fields');
            return res.status(400).json({ 
                message: 'All fields are required',
                received: { email: !!email, password: !!password, role: !!role }
            });
        }

        // Validate role
        if (!['student', 'teacher'].includes(role)) {
            console.log('❌ Invalid role:', role);
            return res.status(400).json({ 
                message: 'Invalid role. Must be student or teacher'
            });
        }

        // Find user in database
        console.log('🔍 Looking for user in database:', email, role);
        
        const user = await User.findOne({ 
            email: email.toLowerCase().trim(), 
            role 
        });
        
        if (!user) {
            console.log('❌ User not found');
            return res.status(401).json({ 
                message: 'Invalid credentials. Please check your email, password, and role.'
            });
        }

        console.log('👤 User found:', user.email);

        // Check password using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if (!isPasswordValid) {
            console.log('❌ Invalid password');
            return res.status(401).json({ 
                message: 'Invalid credentials. Please check your email and password.'
            });
        }

        console.log('✅ Login successful:', user.email);

        // Generate token
        const token = jwt.sign(
            { id: user._id.toString(), role: user.role, email: user.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('🎟️ Token generated');

        res.json({
            message: 'Login successful',
            token,
            name: user.name,
            role: user.role,
            email: user.email
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// Verify token endpoint (optional but useful)
router.get('/verify', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ 
            valid: true, 
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(401).json({ 
            valid: false, 
            message: 'Invalid token' 
        });
    }
});

module.exports = router;