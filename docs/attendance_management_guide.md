# Attendance Management System - Documentation

## Overview

The Attendance Management System is a complete solution for tracking and managing student attendance records in the Career Line Coaching application. It allows teachers to mark attendance, view records, generate statistics, and export data to text files.

## Features

✅ **Mark Attendance** - Teachers can easily mark student attendance (Present/Absent)
✅ **View Records** - Browse all attendance records or filter by student
✅ **Statistics** - Get attendance statistics for individual students (count, percentage)
✅ **Export to TXT** - Export all attendance data to text files
✅ **Date Range Export** - Export attendance records for specific date ranges
✅ **Database Storage** - All data is stored securely in MongoDB
✅ **Responsive Design** - Works on desktop, tablet, and mobile devices

## Database Schema

### Attendance Model

```javascript
{
  studentEmail: String (required),      // Student's email address
  subject: String (required),           // Subject/Class name
  status: String (required),            // 'present' or 'absent'
  markedBy: ObjectId (required),        // Reference to Teacher User ID
  date: Date (default: current date)    // Attendance date
}
```

## API Endpoints

### 1. Mark Attendance
**Endpoint:** `POST /api/attendance/mark`

**Request Body:**
```json
{
  "studentEmail": "student@example.com",
  "subject": "Mathematics",
  "status": "present",
  "markedBy": "teacher@example.com"
}
```

**Response:**
```json
{
  "message": "Attendance marked successfully",
  "data": { ...attendance record }
}
```

---

### 2. Get All Attendance Records
**Endpoint:** `GET /api/attendance/all`

**Response:**
```json
{
  "message": "Attendance records retrieved",
  "data": [
    {
      "_id": "...",
      "studentEmail": "student@example.com",
      "subject": "Mathematics",
      "status": "present",
      "date": "2024-02-16T10:00:00Z",
      "markedBy": { "name": "Teacher Name", "email": "teacher@example.com" }
    }
  ]
}
```

---

### 3. Get Student-Specific Attendance
**Endpoint:** `GET /api/attendance/student/:email`

**Parameters:**
- `email` (path) - Student's email address

**Response:**
```json
{
  "message": "Student attendance records retrieved",
  "data": [ ...attendance records ]
}
```

---

### 4. Get Attendance Statistics
**Endpoint:** `GET /api/attendance/stats/:email`

**Parameters:**
- `email` (path) - Student's email address

**Response:**
```json
{
  "message": "Attendance statistics",
  "data": {
    "studentEmail": "student@example.com",
    "totalRecords": 25,
    "presentCount": 22,
    "absentCount": 3,
    "attendancePercentage": "88.00%"
  }
}
```

---

### 5. Export All Records to TXT
**Endpoint:** `GET /api/attendance/export/txt`

**Response:** 
- Downloads a formatted text file containing all attendance records
- File format: `attendance_report_[timestamp].txt`

**File Sample:**
```
====================================
      STUDENT ATTENDANCE REPORT
====================================

Generated on: 2/16/2024, 3:30:00 PM

Student Email: student1@example.com
--------------------------------------------------
Date                 Subject         Status       Marked By
--------------------------------------------------
2/10/2324           Mathematics     PRESENT      Teacher Name
2/15/2024           Science         ABSENT       Teacher Name
```

---

### 6. Export by Date Range
**Endpoint:** `POST /api/attendance/export/date-range`

**Request Body:**
```json
{
  "startDate": "2024-02-01",
  "endDate": "2024-02-15"
}
```

**Response:** 
- Downloads a formatted text file with attendance records in the specified date range
- Includes statistics (present count, absent count) for each student

---

## Frontend Usage

### Accessing the Attendance Management Page

1. Navigate to: `http://localhost:5000/attendance-management.html`
   (or whichever URL your frontend is hosted on)

### Tab: Mark Attendance

1. Enter **Student Email** (e.g., student@example.com)
2. Enter **Subject** (e.g., Mathematics)
3. Select **Status** (Present or Absent)
4. Enter **Your Email** (Teacher email marking the attendance)
5. Click **Mark Attendance**

**Success Response:** ✅ Attendance marked successfully!

---

### Tab: View Records

**Option 1: View All Records**
- Click the "View All Records" button
- All attendance records in the database will be displayed in a table

**Option 2: Filter by Student**
- Enter a student's email in the filter field
- Click "Filter Student"
- View attendance records specific to that student

---

### Tab: Statistics

1. Enter a **Student Email**
2. Click **Get Statistics**
3. View the attendance summary:
   - Total Classes
   - Present Count
   - Absent Count
   - Attendance Percentage

---

### Tab: Export Data

**Option 1: Export All Records**
- Click **Download All Records (TXT)**
- A text file will be downloaded with all attendance data

**Option 2: Export by Date Range**
- Select **Start Date**
- Select **End Date**
- Click **Download Records (TXT)**
- A filtered text file will be downloaded

---

## Setting Up the System

### Prerequisites

- Node.js installed
- MongoDB running
- Express.js environment configured

### Installation Steps

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Database:**
   - Ensure MongoDB is running
   - Update `MONGO_URI` in environment variables if needed

3. **Start Backend Server:**
   ```bash
   npm start
   # or
   node server.js
   ```

4. **Frontend Setup:**
   - Open `attendance-management.html` in a web browser
   - Or serve it through a web server

### Environment Variables Required

In your `.env` file:
```
MONGO_URI=mongodb://localhost:27017/career-line
PORT=5000
```

---

## Example Code

### Marking Attendance via JavaScript

```javascript
async function markAttendance() {
  const response = await fetch('http://localhost:5000/api/attendance/mark', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      studentEmail: 'student@example.com',
      subject: 'Mathematics',
      status: 'present',
      markedBy: 'teacher@example.com'
    })
  });

  const data = await response.json();
  console.log(data);
}
```

### Fetching Student Statistics

```javascript
async function getStats(email) {
  const response = await fetch(`http://localhost:5000/api/attendance/stats/${email}`);
  const data = await response.json();
  
  console.log(`Total: ${data.data.totalRecords}`);
  console.log(`Present: ${data.data.presentCount}`);
  console.log(`Attendance: ${data.data.attendancePercentage}`);
}
```

---

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution:** 
- Ensure MongoDB is running
- Check MONGO_URI in environment variables
- Verify MongoDB connection string is correct

### Issue: Attendance not saving
**Solution:**
- Check browser console for errors
- Verify backend server is running (`http://localhost:5000/health`)
- Ensure all required fields are filled in the form

### Issue: Export file not downloading
**Solution:**
- Check browser's download settings
- Ensure no adblocker is blocking downloads
- Verify backend has write permissions to create export files

### Issue: Frontend can't reach backend
**Solution:**
- Verify backend is running on port 5000
- Check CORS is enabled in server.js
- Try accessing `http://localhost:5000/` in browser to test

---

## Security Considerations

⚠️ **Important Security Notes:**

1. **Authentication:** The current system marks attendance using teacher email. In production, implement proper authentication/authorization.

2. **Data Verification:** Add validation to ensure only teachers can mark attendance.

3. **Access Control:** Restrict who can view/export attendance data.

4. **Data Privacy:** Ensure student data is protected and access is logged.

---

## Future Enhancements

- 📱 Mobile app integration
- 📊 Advanced analytics and reports
- 🔔 Attendance alerts and notifications
- 📧 Email notifications to parents
- 👥 Bulk attendance operations
- 🔐 Role-based access control
- 📈 Graphical attendance reports
- ⏰ Automatic attendance reminders

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Check backend server logs for API errors
4. Verify all environment variables are correctly set

---

## Version

**Version:** 1.0.0
**Last Updated:** February 16, 2024
**Status:** Production Ready

