// Check authentication
const token = localStorage.getItem('token');
const userName = localStorage.getItem('userName');
const userRole = localStorage.getItem('userRole');

if (!token || userRole !== 'student') {
    window.location.href = 'login.html';
}

// Display user name
document.getElementById('studentName').textContent = `Welcome, ${userName}`;

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

// Fetch attendance data
async function fetchAttendance() {
    try {
        const response = await fetch('http://localhost:5000/api/student/attendance', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('totalClasses').textContent = data.totalClasses;
            document.getElementById('attendedClasses').textContent = data.attendedClasses;
            document.getElementById('attendancePercentage').textContent = data.percentage + '%';
            
            // Color code the percentage
            const percentageElement = document.getElementById('attendancePercentage');
            if (data.percentage >= 75) {
                percentageElement.style.color = '#27ae60';
            } else if (data.percentage >= 50) {
                percentageElement.style.color = '#f39c12';
            } else {
                percentageElement.style.color = '#e74c3c';
            }
        }
    } catch (error) {
        console.error('Error fetching attendance:', error);
    }
}

// Fetch timetable data
async function fetchTimetable() {
    try {
        const response = await fetch('http://localhost:5000/api/student/timetable', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            const tbody = document.getElementById('timetableBody');
            tbody.innerHTML = '';

            data.timetable.forEach(item => {
                const row = `
                    <tr>
                        <td>${item.day}</td>
                        <td>${item.time}</td>
                        <td>${item.subject}</td>
                        <td>${item.teacher}</td>
                    </tr>
                `;
                tbody.innerHTML += row;
            });
        }
    } catch (error) {
        console.error('Error fetching timetable:', error);
    }
}

// Fetch notices
async function fetchNotices() {
    try {
        const response = await fetch('http://localhost:5000/api/student/notices', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (response.ok) {
            const container = document.getElementById('noticesContainer');
            container.innerHTML = '';

            data.notices.forEach(notice => {
                const noticeElement = `
                    <div class="notice-item">
                        <p><strong>${notice.title}</strong></p>
                        <p>${notice.content}</p>
                        <p class="notice-date">${new Date(notice.date).toLocaleDateString()}</p>
                    </div>
                `;
                container.innerHTML += noticeElement;
            });
        }
    } catch (error) {
        console.error('Error fetching notices:', error);
    }
}

// Load all data on page load
fetchAttendance();
fetchTimetable();
fetchNotices();