const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); // Changed from 'bcrypt'
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
const users = [];

// Test route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Backend is working!',
        status: 'OK',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login'
        }
    });
});

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        console.log('📝 Registration request received:', req.body);
        
        const { name, email, password, role } = req.body;

        // Validation
        if (!name || !email || !password || !role) {
            console.log('❌ Missing fields');
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if exists
        const exists = users.find(u => u.email === email && u.role === role);
        if (exists) {
            console.log('❌ User already exists');
            return res.status(400).json({ message: 'User already exists with this email and role' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = {
            id: users.length + 1,
            name,
            email,
            password: hashedPassword,
            role,
            createdAt: new Date()
        };

        users.push(user);
        console.log('✅ User registered:', { id: user.id, email: user.email, role: user.role });

        // Generate token
        const token = jwt.sign(
            { id: user.id, role: user.role },
            'secret_key_12345',
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
        res.status(500).json({ message: 'Server error: ' + error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('🔐 Login request received:', { email: req.body.email, role: req.body.role });
        
        const { email, password, role } = req.body;

        // Validation
        if (!email || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Find user
        const user = users.find(u => u.email === email && u.role === role);
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
            { id: user.id, role: user.role },
            'secret_key_12345',
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

// Show all users (for debugging)
app.get('/api/users', (req, res) => {
    const safeUsers = users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role
    }));
    res.json({ users: safeUsers, count: users.length });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 ================================');
    console.log('✅ Server running on port', PORT);
    console.log('📡 Test: http://localhost:5000');
    console.log('📝 Register: POST http://localhost:5000/api/auth/register');
    console.log('🔐 Login: POST http://localhost:5000/api/auth/login');
    console.log('👥 Users: http://localhost:5000/api/users');
    console.log('🚀 ================================');
    console.log('');
});