const express = require('express');
const router = express.Router();
const Student = require('../models/student');

// Get all students - UPDATED RESPONSE FORMAT
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching all students');
        const students = await Student.find().sort({ createdAt: -1 });
        console.log(`Total students: ${students.length}`);
        
        // CHANGED: Wrap in { success, data } format
        res.json({ success: true, data: students });
    } catch (error) {
        console.error('❌ Error fetching students:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get single student by ID
router.get('/:id', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, data: student });
    } catch (error) {
        console.error('❌ Error fetching student:', error);
        if (error.name === 'CastError') {
            return res.status(400).json({ success: false, message: 'Invalid student ID' });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

// NEW: Get student by email (for attendance system)
router.get('/email/:email', async (req, res) => {
    try {
        const student = await Student.findOne({ email: req.params.email.toLowerCase() });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, data: student });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Add new student - UPDATED RESPONSE FORMAT
router.post('/', async (req, res) => {
    try {
        console.log('➕ Adding new student');
        console.log('Request body:', req.body);

        const { name, mobile, email, class: studentClass, board, totalFee, feePaid, address, rollNumber, batch, phone } = req.body;

        // Validation
        if (!name || !email) {
            return res.status(400).json({ 
                success: false,
                message: 'Name and email are required' 
            });
        }

        // Check if student with this email already exists
        const existingStudent = await Student.findOne({ email: email.toLowerCase() });
        if (existingStudent) {
            return res.status(409).json({
                success: false,
                message: 'Student with this email already exists'
            });
        }

        // Create new student
        const newStudent = new Student({
            name: name.trim(),
            mobile: mobile || phone || '',
            email: email.trim().toLowerCase(),
            class: studentClass || '10',
            board: board || 'CBSE',
            totalFee: Number(totalFee) || 0,
            feePaid: Number(feePaid) || 0,
            address: address ? address.trim() : '',
            rollNumber: rollNumber || '',
            phone: phone || mobile || ''
        });

        await newStudent.save();
        console.log('✅ Student added:', newStudent.name);
        console.log(`📊 Student ID: ${newStudent._id}`);

        // CHANGED: Wrap in { success, message, data } format
        res.status(201).json({ 
            success: true, 
            message: 'Student added successfully',
            data: newStudent 
        });
    } catch (error) {
        console.error('❌ Error adding student:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false,
                message: 'Validation error', 
                errors: Object.values(error.errors).map(e => e.message) 
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
});

// Update student
router.put('/:id', async (req, res) => {
    try {
        console.log('✏️ Updating student:', req.params.id);
        
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const { name, mobile, email, class: studentClass, board, totalFee, feePaid, address, rollNumber, batch, phone } = req.body;

        // Update student data
        if (name) student.name = name.trim();
        if (mobile) student.mobile = mobile.trim();
        if (email) student.email = email.trim().toLowerCase();
        if (phone) student.phone = phone.trim();
        if (studentClass) student.class = studentClass;
        if (board) student.board = board;
        if (totalFee !== undefined) student.totalFee = Number(totalFee);
        if (feePaid !== undefined) student.feePaid = Number(feePaid);
        if (address !== undefined) student.address = address.trim();
        if (rollNumber !== undefined) student.rollNumber = rollNumber.trim();
        if (batch !== undefined) student.batch = batch.trim();

        await student.save();
        console.log('✅ Student updated:', student.name);
        res.json({ success: true, message: 'Student updated', data: student });
    } catch (error) {
        console.error('❌ Error updating student:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete student by ID
router.delete('/:id', async (req, res) => {
    try {
        console.log('🗑️ Deleting student:', req.params.id);
        
        const student = await Student.findByIdAndDelete(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        console.log('✅ Student deleted:', student.name);
        res.json({ success: true, message: 'Student deleted successfully', student });
    } catch (error) {
        console.error('❌ Error deleting student:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// NEW: Delete student by email (for attendance system)
router.delete('/email/:email', async (req, res) => {
    try {
        console.log('🗑️ Deleting student by email:', req.params.email);
        
        const student = await Student.findOneAndDelete({ 
            email: req.params.email.toLowerCase() 
        });
        
        if (!student) {
            return res.status(404).json({ 
                success: false, 
                message: 'Student not found' 
            });
        }

        console.log('✅ Student deleted:', student.name);
        res.json({ 
            success: true, 
            message: 'Student deleted successfully', 
            student 
        });
    } catch (error) {
        console.error('❌ Error deleting student:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Record payment for a student
router.post('/:id/payment', async (req, res) => {
    try {
        console.log('💰 Recording payment for student:', req.params.id);
        
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        const { amount, date, method, notes } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Valid payment amount is required' });
        }

        const pendingAmount = student.totalFee - student.feePaid;
        if (amount > pendingAmount) {
            return res.status(400).json({ 
                success: false,
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
            success: true,
            message: 'Payment recorded successfully', 
            student,
            payment 
        });
    } catch (error) {
        console.error('❌ Error recording payment:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get payment history for a student
router.get('/:id/payments', async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }

        res.json({
            success: true,
            studentName: student.name,
            payments: student.paymentHistory || []
        });
    } catch (error) {
        console.error('❌ Error fetching payments:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;
