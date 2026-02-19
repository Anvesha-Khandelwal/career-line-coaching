const express = require('express');
const router = express.Router();
const Attendance = require('../models/attendance');
const fs = require('fs');
const path = require('path');

// Mark attendance - Save to database
router.post('/mark', async (req, res) => {
  try {
    const { studentEmail, subject, status, markedBy } = req.body;

    if (!studentEmail || !subject || !status || !markedBy) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const attendance = new Attendance({
      studentEmail,
      subject,
      status,
      markedBy,
      date: new Date()
    });

    const savedAttendance = await attendance.save();
    res.status(201).json({
      message: 'Attendance marked successfully',
      data: savedAttendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error marking attendance', error: error.message });
  }
});

// Get all attendance records
router.get('/all', async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find().sort({ date: -1 });
    res.status(200).json({
      message: 'Attendance records retrieved',
      data: attendanceRecords
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving attendance', error: error.message });
  }
});

// Get attendance by student
router.get('/student/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const attendanceRecords = await Attendance.find({ studentEmail: email })
      .sort({ date: -1 });

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: 'No attendance records found for this student' });
    }

    res.status(200).json({
      message: 'Student attendance records retrieved',
      data: attendanceRecords
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving student attendance', error: error.message });
  }
});

// Export attendance to text file
router.get('/export/txt', async (req, res) => {
  try {
    const attendanceRecords = await Attendance.find()
      .sort({ date: -1 });

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: 'No attendance records to export' });
    }

    // Create text content
    let textContent = '====================================\n';
    textContent += '      STUDENT ATTENDANCE REPORT\n';
    textContent += '====================================\n\n';
    textContent += `Generated on: ${new Date().toLocaleString()}\n\n`;

    // Group by student
    const groupedByStudent = {};
    attendanceRecords.forEach(record => {
      if (!groupedByStudent[record.studentEmail]) {
        groupedByStudent[record.studentEmail] = [];
      }
      groupedByStudent[record.studentEmail].push(record);
    });

    // Helper function to pad text
    const padText = (text, width) => String(text).padEnd(width);

    // Format data
    Object.keys(groupedByStudent).forEach(email => {
      textContent += `\nStudent Email: ${email}\n`;
      textContent += '-'.repeat(50) + '\n';
      textContent += padText('Date', 20) + padText('Subject', 15) + padText('Status', 12) + 'Marked By\n';
      textContent += '-'.repeat(50) + '\n';

      groupedByStudent[email].forEach(record => {
        const date = new Date(record.date).toLocaleDateString('en-IN');
        const markedBy = record.markedBy || 'Unknown';
        textContent += padText(date, 20) + padText(record.subject, 15) + padText(record.status, 12) + markedBy + '\n';
      });
    });

    textContent += '\n\n====================================\n';
    textContent += '          END OF REPORT\n';
    textContent += '====================================\n';

    // Create file path
    const fileName = `attendance_report_${Date.now()}.txt`;
    const filePath = path.join(__dirname, '..', 'exports', fileName);
    
    // Create exports folder if it doesn't exist
    const exportsDir = path.dirname(filePath);
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(filePath, textContent);

    // Send file as download
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Remove file after download
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error exporting attendance', error: error.message });
  }
});

// Export attendance for specific date range to text file
router.post('/export/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    const attendanceRecords = await Attendance.find({
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });

    if (!attendanceRecords.length) {
      return res.status(404).json({ message: 'No attendance records found for this date range' });
    }

    // Create text content
    let textContent = '====================================\n';
    textContent += '  STUDENT ATTENDANCE REPORT (DATE RANGE)\n';
    textContent += '====================================\n\n';
    textContent += `Date Range: ${start.toLocaleDateString('en-IN')} to ${end.toLocaleDateString('en-IN')}\n`;
    textContent += `Generated on: ${new Date().toLocaleString()}\n\n`;

    // Group by student
    const groupedByStudent = {};
    attendanceRecords.forEach(record => {
      if (!groupedByStudent[record.studentEmail]) {
        groupedByStudent[record.studentEmail] = [];
      }
      groupedByStudent[record.studentEmail].push(record);
    });

    // Helper function to pad text
    const padText = (text, width) => String(text).padEnd(width);

    // Format data
    Object.keys(groupedByStudent).forEach(email => {
      const records = groupedByStudent[email];
      const presentCount = records.filter(r => r.status === 'present').length;
      const absentCount = records.filter(r => r.status === 'absent').length;

      textContent += `\nStudent Email: ${email}\n`;
      textContent += 'Statistics: Present: ' + presentCount + ', Absent: ' + absentCount + '\n';
      textContent += '-'.repeat(50) + '\n';
      textContent += padText('Date', 20) + padText('Subject', 15) + padText('Status', 12) + 'Marked By\n';
      textContent += '-'.repeat(50) + '\n';

      records.forEach(record => {
        const date = new Date(record.date).toLocaleDateString('en-IN');
        const markedBy = record.markedBy || 'Unknown';
        textContent += padText(date, 20) + padText(record.subject, 15) + padText(record.status, 12) + markedBy + '\n';
      });
    });

    textContent += '\n\n====================================\n';
    textContent += '          END OF REPORT\n';
    textContent += '====================================\n';

    // Create file path
    const fileName = `attendance_report_${Date.now()}.txt`;
    const filePath = path.join(__dirname, '..', 'exports', fileName);
    
    // Create exports folder if it doesn't exist
    const exportsDir = path.dirname(filePath);
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Write to file
    fs.writeFileSync(filePath, textContent);

    // Send file as download
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error('Error downloading file:', err);
      }
      // Remove file after download
      fs.unlink(filePath, (unlinkErr) => {
        if (unlinkErr) console.error('Error deleting file:', unlinkErr);
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error exporting attendance', error: error.message });
  }
});

// Get attendance statistics
router.get('/stats/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const records = await Attendance.find({ studentEmail: email });

    if (!records.length) {
      return res.status(404).json({ message: 'No attendance records found' });
    }

    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const percentage = ((presentCount / records.length) * 100).toFixed(2);

    res.status(200).json({
      message: 'Attendance statistics',
      data: {
        studentEmail: email,
        totalRecords: records.length,
        presentCount,
        absentCount,
        attendancePercentage: percentage + '%'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving statistics', error: error.message });
  }
});

// POST bulk mark attendance
router.post('/bulk', async (req, res) => {
    try {
        const { records, subject, markedBy, sessionDate } = req.body;
        
        if (!records || !Array.isArray(records) || !subject) {
            return res.status(400).json({ 
                success: false, 
                message: 'records array and subject are required' 
            });
        }

        const Student = require('../models/student');
        const date = sessionDate || new Date().toISOString().split('T')[0];
        const results = [];

        for (const r of records) {
            // Look up student name
            const student = await Student.findOne({ 
                email: r.studentEmail.toLowerCase() 
            }).catch(() => null);
            
            const studentName = student ? student.name : r.studentEmail;

            // Upsert attendance (update if exists, create if not)
            const record = await Attendance.findOneAndUpdate(
                { 
                    studentEmail: r.studentEmail.toLowerCase(), 
                    subject, 
                    sessionDate: date 
                },
                {
                    $set: {
                        status: r.status,
                        markedBy: markedBy || 'admin',
                        studentName,
                        date: new Date()
                    }
                },
                { upsert: true, new: true }
            );
            
            results.push(record);
        }

        res.json({ 
            success: true, 
            message: `Saved ${results.length} records`, 
            data: results 
        });
    } catch (err) {
        console.error('Bulk attendance error:', err);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
