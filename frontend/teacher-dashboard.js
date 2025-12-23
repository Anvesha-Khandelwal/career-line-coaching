// Check authentication
const token = localStorage.getItem('token');
const userName = localStorage.getItem('userName');
const userRole = localStorage.getItem('userRole');

if (!token || userRole !== 'teacher') {
    window.location.href = 'login.html';
}

// Display user name
document.getElementById('teacherName').textContent = `Welcome, ${userName}`;

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Mark Attendance
document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentEmail = document.getElementById('studentEmail').value;
    const subject = document.getElementById('subject').value;
    const status = document.getElementById('status').value;

    try {
        const response = await fetch('http://localhost:5000/api/teacher/attendance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ studentEmail, subject, status })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Attendance marked successfully!');
            document.getElementById('attendanceForm').reset();
        } else {
            alert(data.message || 'Failed to mark attendance');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Unable to connect to server');
    }
});

// Add Timetable Entry
document.getElementById('timetableForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const day = document.getElementById('day').value;
    const time = document.getElementById('time').value;
    const subject = document.getElementById('ttSubject').value;

    try {
        const response = await fetch('http://localhost:5000/api/teacher/timetable', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ day, time, subject })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Timetable entry added successfully!');
            document.getElementById('timetableForm').reset();
        } else {
            alert(data.message || 'Failed to add timetable entry');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Unable to connect to server');
    }
});

// Post Notice
document.getElementById('noticeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('noticeTitle').value;
    const content = document.getElementById('noticeContent').value;

    try {
        const response = await fetch('http://localhost:5000/api/teacher/notice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ title, content })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Notice posted successfully!');
            document.getElementById('noticeForm').reset();
        } else {
            alert(data.message || 'Failed to post notice');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Unable to connect to server');
    }
});