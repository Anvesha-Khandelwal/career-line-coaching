# Career Line – Coaching Institute Management System

A full-stack web application designed to manage academic and administrative operations of a coaching institute. The system provides role-based access for teachers and students, enabling efficient handling of student records, fees, attendance, and timetables.

## Overview

Career Line is built to replace manual record-keeping with a centralized digital system. It supports Classes 1–12, multiple boards (CBSE, RBSE, ICSE), and various subjects, offering separate dashboards for teachers and students.

The application focuses on clarity, efficiency, and scalability, making it suitable for small to medium coaching institutes.

## Key Features

### Teacher Portal
- Student record management (add, update, delete, search)
- Fee tracking with paid, pending, and partial status
- Attendance marking with historical records
- Timetable creation and management
- Dashboard analytics (students count, fee summary)

### Student Portal
- Personal profile and academic details
- Fee status and payment history
- Attendance overview and percentage
- Class timetable access

### Authentication & Security
- Role-based authentication (Student / Teacher)
- JWT-based session management
- Password hashing using bcrypt

## Technology Stack

### Frontend
- HTML5
- CSS3 (responsive layout, modern UI)
- JavaScript (ES6+)

### Backend
- Node.js
- Express.js
- JSON Web Tokens (JWT)
- bcrypt

### Data Storage
- LocalStorage (current implementation)
- MongoDB (planned migration)

## Project Structure

```
career-line-coaching/
│
├── frontend/
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── student-dashboard.html
│   ├── teacher-dashboard.html
│   └── assets/
│       ├── css/
│       ├── js/
│       └── images/
│
├── backend/
│   ├── server.js
│   ├── server-working.js
│   ├── routes/
│   ├── models/
│   └── package.json
│
├── README.md
├── .gitignore
└── LICENSE
```

## Installation & Setup

### Prerequisites
- Node.js (v14+)
- npm
- Git

### Backend Setup

```bash
cd backend
npm install
node server-working.js
```

The backend will start on:
```
http://localhost:5000
```

### Frontend Setup

```bash
cd frontend
npx live-server
```

Open the application in your browser via the provided local URL.

## API Overview

### Authentication

```
POST /api/auth/register
POST /api/auth/login
GET  /api/users
```

JWT tokens are used for securing protected routes.

## Data Schema

### Student Record
```javascript
{
  id: String,
  name: String,
  fatherName: String,
  mobile: String,
  email: String,
  class: String,
  board: String,
  subject: String,
  totalFee: Number,
  feePaid: Number,
  address: String
}
```

### Attendance
```javascript
{
  "YYYY-MM-DD_studentId": "present" | "absent"
}
```

### Timetable
```javascript
{
  id: String,
  day: String,
  time: String,
  class: String,
  subject: String,
  teacher: String
}
```

## Current Limitations

- Uses LocalStorage (data clears if browser storage is reset)
- No email verification
- No password recovery flow
- Single-instance usage (not multi-tenant yet)

## Planned Enhancements

### Short-term
- MongoDB integration
- Email notifications
- PDF report generation
- Payment gateway integration

### Long-term
- Parent portal
- Exam and result management
- SMS notifications
- Mobile app support
- Docker & CI/CD pipeline
- Multi-branch support

## Deployment

### Frontend
- Netlify
- Vercel

### Backend
- Railway
- Render
- Heroku

### Environment Variables

```env
PORT=5000
JWT_SECRET=your_secret_key
MONGODB_URI=your_database_url
NODE_ENV=production
```

## Usage

### For Teachers
1. Register/Login with teacher role
2. Add student details via "Add New Student" button
3. Record fee payments using payment modal
4. Mark daily attendance by date
5. Create timetables with time slots and subjects

### For Students
1. Register/Login with student role
2. View personal profile and academic details
3. Check fee status and payment history
4. Monitor attendance records
5. Access class timetable


### Teacher Dashboard
- Real-time analytics (students, fees collected, pending)
- Student management table with actions
- Attendance marking interface
- Timetable grid

### Student Dashboard
- Profile overview
- Fee breakdown
- Attendance percentage
- Weekly schedule

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Anvesha Khandelwal**  
Computer Science Engineering Student  
Full-Stack Web Development

**Contact:**
- Email: anveshak0906@gmail.com
- GitHub: [@Anvesha-Khandelwal](https://github.com/Anvesha-Khandelwal)
- LinkedIn: [Anveshak Khandelwal](https://www.linkedin.com/in/anvesha-khandelwal-115778320/)

**Built for Educational Excellence**

*Version 1.0.0 | January 2026*
