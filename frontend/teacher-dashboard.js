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

// Sample students data (In real app, this would come from database)
let students = JSON.parse(localStorage.getItem('students')) || [
    {
        id: 1,
        name: 'Rahul Sharma',
        mobile: '9876543210',
        class: '10',
        board: 'CBSE',
        email: 'rahul@example.com',
        totalFee: 50000,
        feePaid: 30000,
        address: 'Kota, Rajasthan'
    },
    {
        id: 2,
        name: 'Priya Verma',
        mobile: '9876543211',
        class: '12',
        board: 'RBSE',
        email: 'priya@example.com',
        totalFee: 65000,
        feePaid: 65000,
        address: 'Kota, Rajasthan'
    },
    {
        id: 3,
        name: 'Amit Kumar',
        mobile: '9876543212',
        class: '9',
        board: 'CBSE',
        email: 'amit@example.com',
        totalFee: 45000,
        feePaid: 20000,
        address: 'Kota, Rajasthan'
    }
];

// Save students to localStorage
function saveStudents() {
    localStorage.setItem('students', JSON.stringify(students));
}

// Tab switching
function showTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // Remove active from all buttons
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Show selected tab
    document.getElementById(tabName).classList.add('active');
    event.target.classList.add('active');
}

// Load and display students
function loadStudents() {
    const tbody = document.getElementById('studentTableBody');
    tbody.innerHTML = '';
    
    students.forEach(student => {
        const pending = student.totalFee - student.feePaid;
        const status = pending === 0 ? 'Paid' : pending < student.totalFee ? 'Partial' : 'Pending';
        const statusClass = pending === 0 ? 'status-paid' : pending < student.totalFee ? 'status-partial' : 'status-pending';
        
        const row = `
            <tr>
                <td>${student.name}</td>
                <td>${student.mobile}</td>
                <td>Class ${student.class} (${student.board})</td>
                <td>₹${student.totalFee.toLocaleString()}</td>
                <td>₹${student.feePaid.toLocaleString()}</td>
                <td class="${statusClass}">₹${pending.toLocaleString()}</td>
                <td><span class="${statusClass}">${status}</span></td>
                <td>
                    ${pending > 0 ? `<button class="action-btn btn-payment" onclick="openPaymentModal(${student.id})">💰 Pay</button>` : ''}
                    <button class="action-btn btn-edit" onclick="editStudent(${student.id})">✏️ Edit</button>
                    <button class="action-btn btn-delete" onclick="deleteStudent(${student.id})">🗑️ Delete</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
    
    updateStatistics();
}

// Update statistics
function updateStatistics() {
    const totalStudents = students.length;
    const totalCollected = students.reduce((sum, s) => sum + s.feePaid, 0);
    const totalPending = students.reduce((sum, s) => sum + (s.totalFee - s.feePaid), 0);
    const studentsWithPending = students.filter(s => s.feePaid < s.totalFee).length;
    
    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('totalFeeCollected').textContent = '₹' + totalCollected.toLocaleString();
    document.getElementById('totalFeePending').textContent = '₹' + totalPending.toLocaleString();
    document.getElementById('pendingStudents').textContent = studentsWithPending;
}

// Search students
function searchStudents() {
    const searchTerm = document.getElementById('searchStudent').value.toLowerCase();
    const tbody = document.getElementById('studentTableBody');
    const rows = tbody.getElementsByTagName('tr');
    
    Array.from(rows).forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
}

// Open add student modal
function openAddStudentModal() {
    document.getElementById('modalTitle').textContent = 'Add New Student';
    document.getElementById('studentForm').reset();
    document.getElementById('studentId').value = '';
    document.getElementById('studentModal').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('studentModal').classList.remove('active');
}

// Edit student
function editStudent(id) {
    const student = students.find(s => s.id === id);
    if (!student) return;
    
    document.getElementById('modalTitle').textContent = 'Edit Student';
    document.getElementById('studentId').value = student.id;
    document.getElementById('studentName').value = student.name;
    document.getElementById('mobile').value = student.mobile;
    document.getElementById('class').value = student.class;
    document.getElementById('board').value = student.board;
    document.getElementById('totalFee').value = student.totalFee;
    document.getElementById('feePaid').value = student.feePaid;
    document.getElementById('studentEmailField').value = student.email || '';
    document.getElementById('address').value = student.address || '';
    
    document.getElementById('studentModal').classList.add('active');
}

// Delete student
function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        students = students.filter(s => s.id !== id);
        saveStudents();
        loadStudents();
        alert('Student deleted successfully!');
    }
}

// Save student (Add or Edit)
document.getElementById('studentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const id = document.getElementById('studentId').value;
    const studentData = {
        name: document.getElementById('studentName').value,
        mobile: document.getElementById('mobile').value,
        class: document.getElementById('class').value,
        board: document.getElementById('board').value,
        totalFee: parseInt(document.getElementById('totalFee').value),
        feePaid: parseInt(document.getElementById('feePaid').value),
        email: document.getElementById('studentEmailField').value,
        address: document.getElementById('address').value
    };
    
    if (id) {
        // Edit existing student
        const index = students.findIndex(s => s.id === parseInt(id));
        students[index] = { ...students[index], ...studentData };
        alert('Student updated successfully!');
    } else {
        // Add new student
        const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
        students.push({ id: newId, ...studentData });
        alert('Student added successfully!');
    }
    
    saveStudents();
    loadStudents();
    closeModal();
});

// Open payment modal
function openPaymentModal(studentId) {
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const pending = student.totalFee - student.feePaid;
    
    document.getElementById('paymentStudentId').value = studentId;
    document.getElementById('paymentStudentName').value = student.name;
    document.getElementById('pendingAmount').value = '₹' + pending.toLocaleString();
    document.getElementById('paymentAmount').value = pending;
    document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
    
    document.getElementById('paymentModal').classList.add('active');
}

// Close payment modal
function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('active');
}

// Record payment
document.getElementById('paymentForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const studentId = parseInt(document.getElementById('paymentStudentId').value);
    const paymentAmount = parseInt(document.getElementById('paymentAmount').value);
    
    const student = students.find(s => s.id === studentId);
    if (!student) return;
    
    const pending = student.totalFee - student.feePaid;
    
    if (paymentAmount > pending) {
        alert('Payment amount cannot be greater than pending amount!');
        return;
    }
    
    student.feePaid += paymentAmount;
    
    saveStudents();
    loadStudents();
    closePaymentModal();
    
    alert(`Payment of ₹${paymentAmount.toLocaleString()} recorded successfully!`);
});

// Attendance Form
document.getElementById('attendanceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const studentEmail = document.getElementById('studentEmail').value;
    const subject = document.getElementById('subject').value;
    const status = document.getElementById('status').value;

    alert('Attendance marked successfully!');
    document.getElementById('attendanceForm').reset();
});

// Timetable Form
document.getElementById('timetableForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const day = document.getElementById('day').value;
    const time = document.getElementById('time').value;
    const subject = document.getElementById('ttSubject').value;

    alert('Timetable entry added successfully!');
    document.getElementById('timetableForm').reset();
});

// Notice Form
document.getElementById('noticeForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('noticeTitle').value;
    const content = document.getElementById('noticeContent').value;

    alert('Notice posted successfully!');
    document.getElementById('noticeForm').reset();
});

// Load students on page load
loadStudents();