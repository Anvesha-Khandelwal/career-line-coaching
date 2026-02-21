# Career Line – Coaching Institute Management System

<div align="center">

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4+-green.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

**A modern, full-stack web application for managing coaching institute operations.**

[Features](#features) • [Installation](#installation) • [API](#api-reference) • [Contributing](#contributing)

</div>

---

## Overview

Career Line is a comprehensive coaching institute management system that streamlines academic and administrative operations. Built with Node.js, Express, and MongoDB, it provides separate dashboards for teachers and students with real-time data synchronization.

**Supported:** Classes 1–12 | Multiple boards (CBSE, RBSE, ICSE)

---

## Features

### Teacher Portal
- **Student Management** – Complete CRUD operations with search and filters
- **Smart Attendance System** – Name-based marking with real-time dashboard and bulk actions
- **Attendance Analytics** – Statistics, subject-wise breakdowns, and threshold alerts
- **Fee Management** – Track payments, status, and history
- **Reports & Export** – Download attendance records as formatted text files
- **Timetable Management** – Create and manage class schedules

### Student Portal
- View personal dashboard with academic status
- Check fee status and payment history
- Monitor attendance records and percentages
- Access class timetable

### Security
- JWT-based authentication with role-based access control
- bcrypt password encryption
- Protected API routes

---

## Tech Stack

**Frontend:** HTML5, CSS3, JavaScript (ES6+)  
**Backend:** Node.js, Express.js, Mongoose  
**Database:** MongoDB  
**Authentication:** JWT, bcrypt  

---

## Installation

### Prerequisites
- Node.js (v14+)
- MongoDB (v4.4+)
- npm

### Quick Start

```bash
# Clone repository
git clone https://github.com/Anvesha-Khandelwal/career-line-coaching.git
cd career-line-coaching

# Backend setup
cd backend
npm install
node server.js

# Frontend setup
cd ../frontend
# Open index.html in browser or use Live Server
```

### Environment Variables

Create `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017/career_line
PORT=5000
JWT_SECRET=your_secure_secret_key_here
```

---

## Usage

### Teachers
1. Register/Login with teacher role
2. Add students via "Add Student" form (name, email, roll number, etc.)
3. Mark attendance:
   - Enter subject → Click "Load Students"
   - Toggle Present/Absent for each student
   - Use bulk actions or click "Save Attendance"
4. View records, statistics, and export reports

### Students
1. Register/Login with student role
2. View dashboard for personal info, fees, and attendance
3. Access class timetable

---

## API Reference

### Base URL: `http://localhost:5000/api`

#### Authentication
```http
POST /auth/register    # Register new user
POST /auth/login       # Login user
```

#### Students
```http
GET    /students              # Get all students
POST   /students              # Add new student
GET    /students/email/:email # Get student by email
DELETE /students/email/:email # Delete student
```

#### Attendance
```http
POST /attendance/mark              # Mark single attendance
POST /attendance/bulk              # Mark entire class (recommended)
GET  /attendance/all               # Get all records
GET  /attendance/student/:email    # Get student records
GET  /attendance/stats/:email      # Get statistics
GET  /attendance/export/txt        # Export all as TXT
POST /attendance/export/date-range # Export filtered records
```

**Example Request:**
```javascript
// Mark bulk attendance
POST /api/attendance/bulk
{
  "records": [
    { "studentEmail": "alice@example.com", "status": "present" },
    { "studentEmail": "bob@example.com", "status": "absent" }
  ],
  "subject": "Mathematics",
  "markedBy": "teacher@example.com"
}
```

---

## Project Structure

```
career-line-coaching/
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── teacher-dashboard.html
│   ├── student-dashboard.html
│   ├── attendance.html          # New attendance system
│   └── css/style.css
├── backend/
│   ├── server.js
│   ├── config/db.js
│   ├── models/
│   │   ├── student.js
│   │   └── attendance.js
│   └── routes/
│       ├── students.js
│       └── attendance.js
└── README.md
```

---

## Deployment

### Backend (Render)
```bash
# Set environment variables
MONGO_URI=<mongodb-atlas-uri>
PORT=5000
JWT_SECRET=<secret>
NODE_ENV=production
```

### Frontend (Vercel)
- Connect repository
- Deploy `frontend` directory
- Update API URLs to production backend

---

## Roadmap

**v2.1** – Email notifications, PDF reports, bulk import  
**v2.5** – Mobile app, parent portal, payment gateway  
**v3.0** – Multi-branch support, video conferencing, Docker  

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Author

**Anvesha Khandelwal**  
Computer Science Engineering Student | Full-Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-Anvesha--Khandelwal-181717?logo=github)](https://github.com/Anvesha-Khandelwal)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Anvesha_Khandelwal-0077B5?logo=linkedin)](https://www.linkedin.com/in/anvesha-khandelwal-115778320/)
[![Email](https://img.shields.io/badge/Email-anveshak0906@gmail.com-D14836?logo=gmail)](mailto:anveshak0906@gmail.com)

---

<div align="center">

**Built with ❤️ for Educational Excellence**

*Version 2.0.0 | February 2026*

</div>
