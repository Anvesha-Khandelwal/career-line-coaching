const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all timetable entries
router.get('/', async (req, res) => {
    try {
        const [timetable] = await db.query('SELECT * FROM timetable ORDER BY day, time');
        res.json({ success: true, data: timetable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Get timetable for specific class
router.get('/class/:classNum', async (req, res) => {
    try {
        const [timetable] = await db.query('SELECT * FROM timetable WHERE class = ? ORDER BY day, time', [req.params.classNum]);
        res.json({ success: true, data: timetable });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Create timetable entry
router.post('/', async (req, res) => {
    try {
        const { day, time, class: classNum, subject, teacher } = req.body;
        const id = Date.now().toString();
        
        await db.query(
            'INSERT INTO timetable (id, day, time, class, subject, teacher) VALUES (?, ?, ?, ?, ?, ?)',
            [id, day, time, classNum, subject, teacher]
        );
        
        res.status(201).json({ success: true, message: 'Timetable entry created' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Delete timetable entry
router.delete('/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM timetable WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Timetable entry deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;