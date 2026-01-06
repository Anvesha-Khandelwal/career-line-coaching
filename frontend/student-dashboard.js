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

// Fetch fee status
function fetchFeeStatus() {
    // Get students from localStorage (same as teacher dashboard)
    const students = JSON.parse(localStorage.getItem('students')) || [];
    
    // Find current student by email or name
    // In a real app, you'd match by user ID
    const currentStudent = students.find(s => 
        s.email === localStorage.getItem('userEmail') || 
        s.name.toLowerCase().includes(userName.toLowerCase())
    );
    
    if (currentStudent) {
        const totalFee = currentStudent.totalFee;
        const feePaid = currentStudent.feePaid;
        const feePending = totalFee - feePaid;
        const percentagePaid = ((feePaid / totalFee) * 100).toFixed(1);
        
        document.getElementById('totalFeeAmount').textContent = '₹' + totalFee.toLocaleString();
        document.getElementById('feePaidAmount').textContent = '₹' + feePaid.toLocaleString();
        document.getElementById('feePendingAmount').textContent = '₹' + feePending.toLocaleString();
        
        let statusMessage = '';
        if (feePending === 0) {
            statusMessage = '✅ All fees paid! Thank you.';
            document.getElementById('feePendingAmount').style.color = '#4CAF50';
        } else if (feePending < totalFee) {
            statusMessage = `⚠️ ${percentagePaid}% paid. Please clear pending amount.`;
            document.getElementById('feePendingAmount').style.color = '#ffd700';
        } else {
            statusMessage = '❌ No payment received yet. Please pay your fees.';
            document.getElementById('feePendingAmount').style.color = '#ff6b6b';
        }
        
        document.getElementById('feeStatusMessage').textContent = statusMessage;
    } else {
        // If student not found, show demo data
        document.getElementById('totalFeeAmount').textContent = '₹50,000';
        document.getElementById('feePaidAmount').textContent = '₹30,000';
        document.getElementById('feePendingAmount').textContent = '₹20,000';
        document.getElementById('feeStatusMessage').textContent = '⚠️ 60% paid. Please clear pending amount of ₹20,000.';
    }
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
fetchFeeStatus();
fetchAttendance();
fetchTimetable();
fetchNotices();