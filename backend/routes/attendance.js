const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Mark attendance
router.post('/mark', async (req, res) => {
    try {
        const { studentEmail, subject, status, markedBy } = req.body;
        
        // Get student ID from email
        const [students] = await db.query('SELECT id FROM students WHERE email = ?', [studentEmail]);
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        
        const studentId = students[0].id;
        const today = new Date().toISOString().split('T')[0];
        
        // Check if attendance already exists
        const [existing] = await db.query(
            'SELECT id FROM attendance WHERE studentId = ? AND date = ? AND subject = ?',
            [studentId, today, subject]
        );
        
        if (existing.length > 0) {
            // Update existing
            await db.query(
                'UPDATE attendance SET status = ?, markedBy = ? WHERE id = ?',
                [status, markedBy, existing[0].id]
            );
        } else {
            // Insert new
            await db.query(
                'INSERT INTO attendance (studentId, date, status, markedBy, subject) VALUES (?, ?, ?, ?, ?)',
                [studentId, today, status, markedBy, subject]
            );
        }
        
        res.json({ success: true, message: 'Attendance marked successfully' });
    } catch (error) {
        console.error('Error marking attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get attendance for a student
router.get('/student/:email', async (req, res) => {
    try {
        const [students] = await db.query('SELECT id FROM students WHERE email = ?', [req.params.email]);
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        
        const [attendance] = await db.query(
            'SELECT * FROM attendance WHERE studentId = ? ORDER BY date DESC',
            [students[0].id]
        );
        
        // Calculate stats
        const total = attendance.length;
        const present = attendance.filter(a => a.status === 'present').length;
        const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : 0;
        
        res.json({
            success: true,
            data: attendance,
            stats: {
                total,
                present,
                absent: total - present,
                percentage
            }
        });
    } catch (error) {
        console.error('Error fetching attendance:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;