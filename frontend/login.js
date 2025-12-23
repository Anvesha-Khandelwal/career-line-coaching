// Role selection
let selectedRole = 'student';

const studentBtn = document.getElementById('studentBtn');
const teacherBtn = document.getElementById('teacherBtn');

studentBtn.addEventListener('click', () => {
    selectedRole = 'student';
    studentBtn.classList.add('active');
    teacherBtn.classList.remove('active');
});

teacherBtn.addEventListener('click', () => {
    selectedRole = 'teacher';
    teacherBtn.classList.add('active');
    studentBtn.classList.remove('active');
});

// Login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, role: selectedRole })
        });

        const data = await response.json();

        if (response.ok) {
            // Store token and user info
            localStorage.setItem('token', data.token);
            localStorage.setItem('userRole', data.role);
            localStorage.setItem('userName', data.name);

            // Redirect based on role
            if (data.role === 'student') {
                window.location.href = 'student-dashboard.html';
            } else {
                window.location.href = 'teacher-dashboard.html';
            }
        } else {
            alert(data.message || 'Login failed');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Unable to connect to server. Please try again.');
    }
});