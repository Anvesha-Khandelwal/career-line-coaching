/*************************
 AUTH CHECK
**************************/
const token = localStorage.getItem("token");
const userName = localStorage.getItem("userName");
const userRole = localStorage.getItem("userRole");

if (!token || userRole !== "teacher") {
  alert("Please login as a teacher first!");
  window.location.href = "login.html";
}

document.getElementById("teacherName").textContent = `Welcome, ${userName}`;

/*************************
 CONFIG
**************************/
const API_BASE = "http://localhost:5000/api";
let students = [];

/*************************
 LOGOUT
**************************/
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.clear();
    window.location.href = "login.html";
  }
}

/*************************
 TAB SWITCHING
**************************/
function showTab(tabName) {
  // Hide all tabs
  document.querySelectorAll(".tab-content").forEach(tab =>
    tab.classList.remove("active")
  );
  // Remove active from all buttons
  document.querySelectorAll(".tab-btn").forEach(btn =>
    btn.classList.remove("active")
  );

  // Show selected tab
  document.getElementById(tabName).classList.add("active");
  
  // Add active to clicked button
  event.target.classList.add("active");
}

/*************************
 LOAD STUDENTS
**************************/
async function loadStudents() {
  try {
    console.log('📋 Loading students...');
    const res = await fetch(`${API_BASE}/student`);
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    students = await res.json();
    console.log(`✅ Loaded ${students.length} students`);

    displayStudents();
    updateStatistics();
  } catch (err) {
    console.error('❌ Failed to load students:', err);
    alert("Failed to load students. Make sure the backend is running!");
  }
}

/*************************
 DISPLAY STUDENTS
**************************/
function displayStudents() {
  const tbody = document.getElementById("studentTableBody");
  tbody.innerHTML = "";

  if (students.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align: center; padding: 40px; color: #999;">
          No students added yet. Click "Add New Student" to get started!
        </td>
      </tr>
    `;
    return;
  }

  students.forEach(student => {
    const pending = student.totalFee - student.feePaid;
    const status =
      pending === 0 ? "Paid" : pending < student.totalFee ? "Partial" : "Pending";
    const statusClass =
      pending === 0
        ? "status-paid"
        : pending < student.totalFee
        ? "status-partial"
        : "status-pending";

    tbody.innerHTML += `
      <tr>
        <td>${student.name}</td>
        <td>${student.mobile}</td>
        <td>Class ${student.class} (${student.board})</td>
        <td>₹${student.totalFee.toLocaleString()}</td>
        <td>₹${student.feePaid.toLocaleString()}</td>
        <td class="${statusClass}">₹${pending.toLocaleString()}</td>
        <td><span class="${statusClass}">${status}</span></td>
        <td>
          ${
            pending > 0
              ? `<button class="action-btn btn-payment" onclick="openPaymentModal('${student._id}')">💰 Pay</button>`
              : ""
          }
          <button class="action-btn btn-edit" onclick="editStudent('${student._id}')">✏️ Edit</button>
          <button class="action-btn btn-delete" onclick="deleteStudent('${student._id}')">🗑️ Delete</button>
        </td>
      </tr>
    `;
  });
}

/*************************
 STATISTICS
**************************/
function updateStatistics() {
  document.getElementById("totalStudents").textContent = students.length;
  
  const totalCollected = students.reduce((sum, st) => sum + st.feePaid, 0);
  document.getElementById("totalFeeCollected").textContent = "₹" + totalCollected.toLocaleString();
  
  const totalPending = students.reduce((sum, st) => sum + (st.totalFee - st.feePaid), 0);
  document.getElementById("totalFeePending").textContent = "₹" + totalPending.toLocaleString();
  
  const pendingStudentsCount = students.filter(s => s.feePaid < s.totalFee).length;
  document.getElementById("pendingStudents").textContent = pendingStudentsCount;
}

/*************************
 SEARCH
**************************/
function searchStudents() {
  const term = document.getElementById("searchStudent").value.toLowerCase();
  document.querySelectorAll("#studentTableBody tr").forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
  });
}

/*************************
 MODALS
**************************/
function openAddStudentModal() {
  document.getElementById("studentForm").reset();
  document.getElementById("studentId").value = "";
  document.getElementById("modalTitle").textContent = "Add New Student";
  document.getElementById("studentModal").classList.add("active");
}

function closeModal() {
  document.getElementById("studentModal").classList.remove("active");
}

/*************************
 EDIT STUDENT
**************************/
function editStudent(id) {
  const s = students.find(st => st._id === id);
  if (!s) {
    alert("Student not found!");
    return;
  }

  document.getElementById("studentId").value = s._id;
  document.getElementById("studentName").value = s.name;
  document.getElementById("mobile").value = s.mobile;
  document.getElementById("class").value = s.class;
  document.getElementById("board").value = s.board;
  document.getElementById("totalFee").value = s.totalFee;
  document.getElementById("feePaid").value = s.feePaid;
  document.getElementById("studentEmailField").value = s.email || "";
  document.getElementById("address").value = s.address || "";

  document.getElementById("modalTitle").textContent = "Edit Student";
  document.getElementById("studentModal").classList.add("active");
}

/*************************
 DELETE STUDENT
**************************/
async function deleteStudent(id) {
  const student = students.find(s => s._id === id);
  if (!confirm(`Are you sure you want to delete ${student.name}?`)) {
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/student/${id}`, { 
      method: "DELETE" 
    });

    if (!res.ok) {
      throw new Error('Delete failed');
    }

    alert("Student deleted successfully!");
    loadStudents();
  } catch (err) {
    console.error('❌ Delete error:', err);
    alert("Failed to delete student!");
  }
}

/*************************
 ADD / UPDATE STUDENT
**************************/
document.getElementById("studentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const studentId = document.getElementById("studentId").value;
  const data = {
    name: document.getElementById("studentName").value,
    mobile: document.getElementById("mobile").value,
    class: document.getElementById("class").value,
    board: document.getElementById("board").value,
    totalFee: Number(document.getElementById("totalFee").value),
    feePaid: Number(document.getElementById("feePaid").value),
    email: document.getElementById("studentEmailField").value,
    address: document.getElementById("address").value
  };

  try {
    const method = studentId ? "PUT" : "POST";
    const url = studentId
      ? `${API_BASE}/student/${studentId}`
      : `${API_BASE}/student`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      throw new Error('Save failed');
    }

    alert(studentId ? "Student updated successfully!" : "Student added successfully!");
    closeModal();
    loadStudents();
  } catch (err) {
    console.error('❌ Save error:', err);
    alert("Failed to save student!");
  }
});

/*************************
 PAYMENT MODAL
**************************/
function openPaymentModal(id) {
  const s = students.find(st => st._id === id);
  if (!s) {
    alert("Student not found!");
    return;
  }

  const pending = s.totalFee - s.feePaid;

  document.getElementById("paymentStudentId").value = id;
  document.getElementById("paymentStudentName").value = s.name;
  document.getElementById("pendingAmount").value = "₹" + pending.toLocaleString();
  document.getElementById("paymentAmount").value = pending;
  document.getElementById("paymentDate").value = new Date().toISOString().split("T")[0];

  document.getElementById("paymentModal").classList.add("active");
}

function closePaymentModal() {
  document.getElementById("paymentModal").classList.remove("active");
}

/*************************
 RECORD PAYMENT
**************************/
document.getElementById("paymentForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const studentId = document.getElementById("paymentStudentId").value;
  const amount = Number(document.getElementById("paymentAmount").value);
  const date = document.getElementById("paymentDate").value;
  const method = document.getElementById("paymentMethod").value;
  const notes = document.getElementById("paymentNotes").value;

  if (amount <= 0) {
    alert("Please enter a valid amount!");
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/student/${studentId}/payment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, date, method, notes })
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.message || 'Payment failed');
    }

    alert("Payment recorded successfully!");
    closePaymentModal();
    loadStudents();
  } catch (err) {
    console.error('❌ Payment error:', err);
    alert(err.message || "Failed to record payment!");
  }
});

/*************************
 ATTENDANCE FORM
**************************/
document.getElementById("attendanceForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  alert("Attendance feature coming soon! (Database not implemented yet)");
});

/*************************
 TIMETABLE FORM
**************************/
document.getElementById("timetableForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  alert("Timetable feature coming soon! (Database not implemented yet)");
});

/*************************
 NOTICE FORM
**************************/
document.getElementById("noticeForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  alert("Notice feature coming soon! (Database not implemented yet)");
});

/*************************
 INITIAL LOAD
**************************/
console.log('🚀 Teacher Dashboard Loaded');
console.log('👤 User:', userName);
console.log('🔑 Role:', userRole);
loadStudents();