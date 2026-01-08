const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Attendance = require('../models/Attendance');
const Timetable = require('../models/Timetable');
const Notice = require('../models/Notice');

// Get all attendance records
router.get('/attendance/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { date, subject, status } = req.query;
        let query = {};

        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            query.date = { $gte: startDate, $lte: endDate };
        }

        if (subject) {
            query.subject = subject;
        }

        if (status) {
            query.status = status;
        }

        const attendance = await Attendance.find(query)
            .populate('markedBy', 'name')
            .sort({ date: -1 })
            .limit(100);

        res.json({ attendance });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Mark Attendance
router.post('/attendance', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { studentEmail, subject, status, date } = req.body;

        const attendance = new Attendance({
            studentEmail,
            subject,
            status,
            date: date || new Date(),
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

// Bulk attendance marking
router.post('/attendance/bulk', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { students, subject, date } = req.body;
        
        const attendanceRecords = students.map(student => ({
            studentEmail: student.email,
            subject,
            status: student.status,
            date: date || new Date(),
            markedBy: req.user._id
        }));

        await Attendance.insertMany(attendanceRecords);

        res.status(201).json({ 
            message: `Attendance marked for ${students.length} students`,
            count: students.length
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all timetable entries
router.get('/timetable/all', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const timetable = await Timetable.find()
            .populate('createdBy', 'name')
            .sort({ day: 1, time: 1 });

        res.json({ timetable });
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

        const { day, time, subject, class: className, section } = req.body;

        const timetable = new Timetable({
            day,
            time,
            subject,
            class: className,
            section,
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

// Update timetable entry
router.put('/timetable/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const timetable = await Timetable.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!timetable) {
            return res.status(404).json({ message: 'Timetable entry not found' });
        }

        res.json({ 
            message: 'Timetable updated successfully',
            timetable 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete timetable entry
router.delete('/timetable/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const timetable = await Timetable.findByIdAndDelete(req.params.id);

        if (!timetable) {
            return res.status(404).json({ message: 'Timetable entry not found' });
        }

        res.json({ message: 'Timetable entry deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all notices
router.get('/notices', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const notices = await Notice.find()
            .populate('postedBy', 'name')
            .sort({ date: -1 });

        res.json({ notices });
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

        const { title, content, targetClass, targetBoard, priority } = req.body;

        const notice = new Notice({
            title,
            content,
            targetClass,
            targetBoard,
            priority: priority || 'Normal',
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

// Update notice
router.put('/notice/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const notice = await Notice.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        res.json({ 
            message: 'Notice updated successfully',
            notice 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete notice
router.delete('/notice/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'teacher') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const notice = await Notice.findByIdAndDelete(req.params.id);

        if (!notice) {
            return res.status(404).json({ message: 'Notice not found' });
        }

        res.json({ message: 'Notice deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;