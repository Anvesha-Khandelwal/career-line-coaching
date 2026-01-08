const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/career-line', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.log('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/student', require('./routes/student'));
app.use('/api/teacher', require('./routes/teacher'));
app.use('/api/fee', require('./routes/fee'));

// Test Route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Career Line API is running',
        status: 'active',
        timestamp: new Date()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!', 
        error: err.message 
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API URL: http://localhost:${PORT}`);
});