const express = require('express');
const router = express.Router();
const Student = require('../models/student');

// Get all students
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching all students');
        const students = await Student.find().sort({ createdAt: -1 });
        console.log(`Total students: ${students.length}`);
        res.json({ success: true, data: students });
    } catch (error) {
        console.error('❌ Error fetching students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});
// Add after the GET /:id route
router.get('/email/:email', async (req, res) => {
    try {
        const student = await Student.findOne({ 
            email: req.params.email.toLowerCase() 
        });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single student by ID
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error('❌ Error fetching student:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid student ID' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add new student
router.post('/', async (req, res) => {
    try {
        console.log('➕ Adding new student');
        console.log('Request body:', req.body);

        const { name, mobile, class: studentClass, board, totalFee, feePaid, email, address } = req.body;

        // Validation
        if (!name || !mobile || !studentClass || !board || totalFee === undefined) {
            return res.status(400).json({ 
                message: 'Required fields: name, mobile, class, board, totalFee' 
            });
        }

        // Create new student
        const newStudent = new Student({
            name: name.trim(),
            mobile: mobile.trim(),
            class: studentClass,
            board: board,
            totalFee: Number(totalFee),
            feePaid: Number(feePaid) || 0,
            email: email ? email.trim() : '',
            address: address ? address.trim() : ''
        });

        await newStudent.save();
        console.log('✅ Student added:', newStudent.name);
        console.log(`📊 Student ID: ${newStudent._id}`);

        res.status(201).json({ success: true, message: 'Student added', data: newStudent });
    } catch (error) {
        console.error('❌ Error adding student:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: Object.values(error.errors).map(e => e.message) 
            });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update student
router.put('/:id', async (req, res) => {
    try {
        console.log('✏️ Updating student:', req.params.id);
        
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const { name, mobile, class: studentClass, board, totalFee, feePaid, email, address } = req.body;

        // Update student data
        if (name) student.name = name.trim();
        if (mobile) student.mobile = mobile.trim();
        if (studentClass) student.class = studentClass;
        if (board) student.board = board;
        if (totalFee !== undefined) student.totalFee = Number(totalFee);
        if (feePaid !== undefined) student.feePaid = Number(feePaid);
        if (email !== undefined) student.email = email.trim();
        if (address !== undefined) student.address = address.trim();

        await student.save();
        console.log('✅ Student updated:', student.name);
        res.json(student);
    } catch (error) {
        console.error('❌ Error updating student:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid student ID' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: Object.values(error.errors).map(e => e.message) 
            });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete student
router.delete('/:id', async (req, res) => {
    try {
        console.log('🗑️ Deleting student:', req.params.id);
        
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        console.log('✅ Student deleted:', student.name);
        res.json({ message: 'Student deleted successfully', student });
    } catch (error) {
        console.error('❌ Error deleting student:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid student ID' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Record payment for a student
router.post('/:id/payment', async (req, res) => {
    try {
        console.log('💰 Recording payment for student:', req.params.id);
        
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const { amount, date, method, notes } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'Valid payment amount is required' });
        }

        const pendingAmount = student.totalFee - student.feePaid;
        if (amount > pendingAmount) {
            return res.status(400).json({ 
                message: `Payment amount (₹${amount}) exceeds pending amount (₹${pendingAmount})` 
            });
        }

        // Create payment record
        const payment = {
            amount: Number(amount),
            paymentDate: date ? new Date(date) : new Date(),
            paymentMethod: method || 'Cash',
            notes: notes || ''
        };

        // Use the model method to add payment
        await student.addPayment(payment);

        console.log(`✅ Payment recorded: ₹${amount} for ${student.name}`);
        console.log(`   New feePaid: ₹${student.feePaid} / ₹${student.totalFee}`);

        res.json({ 
            message: 'Payment recorded successfully', 
            student,
            payment 
        });
    } catch (error) {
        console.error('❌ Error recording payment:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid student ID' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get payment history for a student
router.get('/:id/payments', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({
            studentName: student.name,
            payments: student.paymentHistory || []
        });
    } catch (error) {
        console.error('❌ Error fetching payments:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ message: 'Invalid student ID' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;