const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const Notice = require('../models/Notice');

// Mark Attendance
router.post('/attendance', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { studentEmail, subject, status } = req.body;

        const attendance = new Attendance({
            studentEmail,
            subject,
            status,
            markedBy: req.user._id
        });

        await attendance.save();

        res.status(201).json({ 
            message: 'Attendance marked successfully',
            attendance 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add Timetable Entry
router.post('/timetable', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { day, time, subject } = req.body;

        const timetable = new Timetable({
            day,
            time,
            subject,
            teacher: req.user.name,
            createdBy: req.user._id
        });

        await timetable.save();

        res.status(201).json({ 
            message: 'Timetable entry added successfully',
            timetable 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Post Notice
router.post('/notice', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { title, content } = req.body;

        const notice = new Notice({
            title,
            content,
            postedBy: req.user._id
        });

        await notice.save();

        res.status(201).json({ 
            message: 'Notice posted successfully',
            notice 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;