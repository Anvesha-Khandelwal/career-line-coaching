const express = require('express');
const router = express.Router();

// Temporary in-memory storage for students (replaces database for testing)
let students = [];
let nextId = 1;

// Get all students
router.get('/', async (req, res) => {
    try {
        console.log('📋 Fetching all students');
        console.log(`Total students: ${students.length}`);
        res.json(students);
    } catch (error) {
        console.error('❌ Error fetching students:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single student by ID
router.get('/:id', async (req, res) => {
    try {
        const student = students.find(s => s._id === req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error('❌ Error fetching student:', error);
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
        const newStudent = {
            _id: String(nextId++),
            name: name.trim(),
            mobile: mobile.trim(),
            class: studentClass,
            board: board,
            totalFee: Number(totalFee),
            feePaid: Number(feePaid) || 0,
            email: email ? email.trim() : '',
            address: address ? address.trim() : '',
            createdAt: new Date(),
            payments: []
        };

        students.push(newStudent);
        console.log('✅ Student added:', newStudent.name);
        console.log(`📊 Total students: ${students.length}`);

        res.status(201).json(newStudent);
    } catch (error) {
        console.error('❌ Error adding student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update student
router.put('/:id', async (req, res) => {
    try {
        console.log('✏️ Updating student:', req.params.id);
        
        const studentIndex = students.findIndex(s => s._id === req.params.id);
        if (studentIndex === -1) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const { name, mobile, class: studentClass, board, totalFee, feePaid, email, address } = req.body;

        // Update student data
        students[studentIndex] = {
            ...students[studentIndex],
            name: name || students[studentIndex].name,
            mobile: mobile || students[studentIndex].mobile,
            class: studentClass || students[studentIndex].class,
            board: board || students[studentIndex].board,
            totalFee: totalFee !== undefined ? Number(totalFee) : students[studentIndex].totalFee,
            feePaid: feePaid !== undefined ? Number(feePaid) : students[studentIndex].feePaid,
            email: email !== undefined ? email : students[studentIndex].email,
            address: address !== undefined ? address : students[studentIndex].address,
            updatedAt: new Date()
        };

        console.log('✅ Student updated:', students[studentIndex].name);
        res.json(students[studentIndex]);
    } catch (error) {
        console.error('❌ Error updating student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete student
router.delete('/:id', async (req, res) => {
    try {
        console.log('🗑️ Deleting student:', req.params.id);
        
        const studentIndex = students.findIndex(s => s._id === req.params.id);
        if (studentIndex === -1) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const deletedStudent = students.splice(studentIndex, 1)[0];
        console.log('✅ Student deleted:', deletedStudent.name);
        console.log(`📊 Remaining students: ${students.length}`);

        res.json({ message: 'Student deleted successfully', student: deletedStudent });
    } catch (error) {
        console.error('❌ Error deleting student:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Record payment for a student
router.post('/:id/payment', async (req, res) => {
    try {
        console.log('💰 Recording payment for student:', req.params.id);
        
        const student = students.find(s => s._id === req.params.id);
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
            id: String(Date.now()),
            amount: Number(amount),
            date: date || new Date().toISOString(),
            method: method || 'Cash',
            notes: notes || '',
            recordedAt: new Date()
        };

        // Update student
        student.feePaid += Number(amount);
        student.payments = student.payments || [];
        student.payments.push(payment);

        console.log(`✅ Payment recorded: ₹${amount} for ${student.name}`);
        console.log(`   New feePaid: ₹${student.feePaid} / ₹${student.totalFee}`);

        res.json({ 
            message: 'Payment recorded successfully', 
            student,
            payment 
        });
    } catch (error) {
        console.error('❌ Error recording payment:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get payment history for a student
router.get('/:id/payments', async (req, res) => {
    try {
        const student = students.find(s => s._id === req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.json({
            studentName: student.name,
            payments: student.payments || []
        });
    } catch (error) {
        console.error('❌ Error fetching payments:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;