const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register endpoint
router.post('/register', async (req, res) => {
    try {
        console.log('📝 Registration request received:', req.body);
        
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password || !role) {
            console.log('❌ Missing fields');
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate role
        if (!['student', 'teacher'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be student or teacher' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email, role });
        if (existingUser) {
            console.log('❌ User already exists');
            return res.status(400).json({ message: 'User already exists with this email and role' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await user.save();
        console.log('✅ User registered:', { id: user._id, email: user.email, role: user.role });

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret_key_12345',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Registration successful',
            token,
            name: user.name,
            role: user.role
        });

    } catch (error) {
        console.error('❌ Registration error:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(400).json({ message: 'User already exists with this email and role' });
        }
        
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        console.log('🔐 Login request received:', { email: req.body.email, role: req.body.role });
        
        const { email, password, role } = req.body;

        // Validation
        if (!email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Validate role
        if (!['student', 'teacher'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role. Must be student or teacher' });
        }

        // Find user
        const user = await User.findOne({ email, role });
        if (!user) {
            console.log('❌ User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('❌ Invalid password');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        console.log('✅ Login successful:', user.email);

        // Generate token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || 'secret_key_12345',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            name: user.name,
            role: user.role
        });

    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

module.exports = router;
