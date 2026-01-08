const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Student = require('../models/student');

// Get all students with fee details (Teacher only)
router.get('/students', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { search, class: classFilter, board, status } = req.query;
        
        let query = {};
        
        // Search filter
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { mobile: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Class filter
        if (classFilter) {
            query.class = classFilter;
        }
        
        // Board filter
        if (board) {
            query.board = board;
        }
        
        // Status filter (default to Active)
        query.status = status || 'Active';
        
        const students = await Student.find(query)
            .select('name mobile email class board stream totalFee feePaid feeDiscount status')
            .sort({ class: 1, name: 1 });
        
        res.json({ students });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get fee statistics (Teacher only)
router.get('/statistics', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const students = await Student.find({ status: 'Active' });
        
        const totalStudents = students.length;
        const totalFeeCollected = students.reduce((sum, s) => sum + s.feePaid, 0);
        const totalFeePending = students.reduce((sum, s) => sum + (s.totalFee - s.feePaid - s.feeDiscount), 0);
        const totalFeeExpected = students.reduce((sum, s) => sum + s.totalFee, 0);
        const studentsWithPending = students.filter(s => (s.totalFee - s.feePaid - s.feeDiscount) > 0).length;
        const fullyPaidStudents = students.filter(s => (s.totalFee - s.feePaid - s.feeDiscount) <= 0).length;
        
        res.json({
            totalStudents,
            totalFeeCollected,
            totalFeePending,
            totalFeeExpected,
            studentsWithPending,
            fullyPaidStudents
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add new student (Teacher only)
router.post('/student', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const studentData = {
            ...req.body,
            createdBy: req.user._id,
            lastModifiedBy: req.user._id
        };
        
        const student = new Student(studentData);
        await student.save();
        
        res.status(201).json({ 
            message: 'Student added successfully',
            student 
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Mobile number already exists' });
        }
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update student (Teacher only)
router.put('/student/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const student = await Student.findByIdAndUpdate(
            req.params.id,
            { 
                ...req.body, 
                lastModifiedBy: req.user._id 
            },
            { new: true, runValidators: true }
        );
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json({ 
            message: 'Student updated successfully',
            student 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete student (Teacher only)
router.delete('/student/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const student = await Student.findByIdAndDelete(req.params.id);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Record payment (Teacher only)
router.post('/payment/:studentId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const student = await Student.findById(req.params.studentId);
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        const { amount, paymentDate, paymentMethod, notes } = req.body;
        
        // Validate payment amount
        const pending = student.totalFee - student.feePaid - student.feeDiscount;
        if (amount > pending) {
            return res.status(400).json({ 
                message: 'Payment amount exceeds pending amount',
                pending 
            });
        }
        
        // Generate receipt number
        const receiptNumber = `RCP${Date.now()}`;
        
        // Add payment
        await student.addPayment({
            amount,
            paymentDate: paymentDate || new Date(),
            paymentMethod: paymentMethod || 'Cash',
            receiptNumber,
            notes,
            recordedBy: req.user._id
        });
        
        res.json({ 
            message: 'Payment recorded successfully',
            receiptNumber,
            student 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get payment history for a student (Teacher only)
router.get('/payment-history/:studentId', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const student = await Student.findById(req.params.studentId)
            .populate('paymentHistory.recordedBy', 'name')
            .select('name mobile paymentHistory totalFee feePaid');
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        res.json({ 
            student: {
                name: student.name,
                mobile: student.mobile,
                totalFee: student.totalFee,
                feePaid: student.feePaid
            },
            paymentHistory: student.paymentHistory 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get student's own fee details (Student only)
router.get('/my-fees', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Find student by user ID or email
        const student = await Student.findOne({ 
            $or: [
                { userId: req.user._id },
                { email: req.user.email }
            ]
        }).select('name class board totalFee feePaid feeDiscount paymentHistory');
        
        if (!student) {
            return res.status(404).json({ message: 'Student record not found' });
        }
        
        const feePending = student.totalFee - student.feePaid - student.feeDiscount;
        const percentagePaid = ((student.feePaid / student.totalFee) * 100).toFixed(1);
        
        res.json({ 
            name: student.name,
            class: student.class,
            board: student.board,
            totalFee: student.totalFee,
            feePaid: student.feePaid,
            feeDiscount: student.feeDiscount,
            feePending,
            percentagePaid,
            status: student.feeStatus,
            lastPayment: student.paymentHistory.length > 0 
                ? student.paymentHistory[student.paymentHistory.length - 1] 
                : null
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get fee defaulters (Teacher only)
router.get('/defaulters', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const students = await Student.find({ status: 'Active' })
            .select('name mobile class board totalFee feePaid feeDiscount');
        
        const defaulters = students
            .filter(s => (s.totalFee - s.feePaid - s.feeDiscount) > 0)
            .map(s => ({
                id: s._id,
                name: s.name,
                mobile: s.mobile,
                class: s.class,
                board: s.board,
                totalFee: s.totalFee,
                feePaid: s.feePaid,
                feePending: s.totalFee - s.feePaid - s.feeDiscount
            }))
            .sort((a, b) => b.feePending - a.feePending);
        
        res.json({ 
            count: defaulters.length,
            defaulters 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;