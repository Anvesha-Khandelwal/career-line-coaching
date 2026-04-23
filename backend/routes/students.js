const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all students
router.get('/', async (req, res) => {
    try {
        const [students] = await db.query('SELECT * FROM students ORDER BY name');
        res.json({ success: true, data: students });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get student by email
router.get('/email/:email', async (req, res) => {
    try {
        const [students] = await db.query('SELECT * FROM students WHERE email = ?', [req.params.email]);
        if (students.length === 0) {
            return res.status(404).json({ success: false, message: 'Student not found' });
        }
        res.json({ success: true, data: students[0] });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create new student
router.post('/', async (req, res) => {
    try {
        const { name, email, mobile, phone, class: studentClass, board, totalFee, feePaid, fatherName, subject, dob, address } = req.body;
        
        const id = Date.now().toString();
        const actualMobile = mobile || phone || '';
        
        await db.query(
            `INSERT INTO students (id, name, email, mobile, class, board, totalFee, feePaid, fatherName, subject, dob, address) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, name, email, actualMobile, studentClass, board, totalFee || 0, feePaid || 0, fatherName, subject, dob, address]
        );
        
        res.status(201).json({ success: true, message: 'Student created successfully', data: { id, name, email } });
    } catch (error) {
        console.error('Error creating student:', error);
        if (error.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ success: false, message: 'Student with this email already exists' });
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
});

// Update student
router.put('/email/:email', async (req, res) => {
    try {
        const { name, mobile, phone, class: studentClass, board, totalFee, feePaid, fatherName, subject, dob, address } = req.body;
        
        const actualMobile = mobile || phone;
        const updates = [];
        const values = [];
        
        if (name) { updates.push('name = ?'); values.push(name); }
        if (actualMobile) { updates.push('mobile = ?'); values.push(actualMobile); }
        if (studentClass) { updates.push('class = ?'); values.push(studentClass); }
        if (board) { updates.push('board = ?'); values.push(board); }
        if (totalFee !== undefined) { updates.push('totalFee = ?'); values.push(totalFee); }
        if (feePaid !== undefined) { updates.push('feePaid = ?'); values.push(feePaid); }
        if (fatherName) { updates.push('fatherName = ?'); values.push(fatherName); }
        if (subject) { updates.push('subject = ?'); values.push(subject); }
        if (dob) { updates.push('dob = ?'); values.push(dob); }
        if (address !== undefined) { updates.push('address = ?'); values.push(address); }
        
        if (updates.length === 0) {
            return res.status(400).json({ success: false, message: 'No fields to update' });
        }
        
        values.push(req.params.email);
        
        await db.query(
            `UPDATE students SET ${updates.join(', ')} WHERE email = ?`,
            values
        );
        
        res.json({ success: true, message: 'Student updated successfully' });
    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete student
router.delete('/email/:email', async (req, res) => {
    try {
        await db.query('DELETE FROM students WHERE email = ?', [req.params.email]);
        res.json({ success: true, message: 'Student deleted successfully' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;