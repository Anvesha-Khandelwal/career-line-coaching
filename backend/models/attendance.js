const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    studentEmail: {
        type: String,
        required: true,
        lowercase: true
    },
    studentName: {
        type: String
    },
    subject: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['present', 'absent'],
        required: true
    },
    markedBy: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    sessionDate: {
        type: String
    }
}, { timestamps: true });

// Add index for faster queries
attendanceSchema.index({ studentEmail: 1, sessionDate: 1, subject: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);