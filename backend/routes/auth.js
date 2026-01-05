const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const Notice = require('../models/Notice');

// Get Attendance
router.get('/attendance', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const attendance = await Attendance.find({ studentEmail: req.user.email });
        
        const totalClasses = attendance.length;
        const attendedClasses = attendance.filter(a => a.status === 'present').length;
        const percentage = totalClasses > 0 ? Math.round((attendedClasses / totalClasses) * 100) : 0;

        res.json({
            totalClasses,
            attendedClasses,
            percentage,
            records: attendance
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get Timetable
router.get('/timetable', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const timetable = await Timetable.find().sort({ day: 1, time: 1 });
        
        res.json({ timetable });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get Notices
router.get('/notices', auth, async (req, res) => {
    try {
        if (req.user.role !== 'student') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const notices = await Notice.find().sort({ date: -1 }).limit(10);
        
        res.json({ notices });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;