/*************************
 AUTH CHECK
**************************/
const token = localStorage.getItem("token");
const userName = localStorage.getItem("userName");
const userRole = localStorage.getItem("userRole");

if (!token || userRole !== "teacher") {
  window.location.href = "login.html";
}

document.getElementById("teacherName").textContent = `Welcome, ${userName}`;

/*************************
 CONFIG
**************************/
const API_BASE = "http://localhost:5000/api";
let students = [];

/*************************
 DOM ELEMENTS
**************************/
const studentId = document.getElementById("studentId");
const studentName = document.getElementById("studentName");
const mobile = document.getElementById("mobile");
const studentClass = document.getElementById("studentClass");
const board = document.getElementById("board");
const totalFee = document.getElementById("totalFee");
const feePaid = document.getElementById("feePaid");
const studentEmailField = document.getElementById("studentEmailField");
const address = document.getElementById("address");

const paymentStudentId = document.getElementById("paymentStudentId");
const paymentStudentName = document.getElementById("paymentStudentName");
const pendingAmount = document.getElementById("pendingAmount");
const paymentAmount = document.getElementById("paymentAmount");
const paymentDate = document.getElementById("paymentDate");
const paymentMethod = document.getElementById("paymentMethod");
const paymentNotes = document.getElementById("paymentNotes");

/*************************
 LOGOUT
**************************/
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

/*************************
 TAB SWITCHING
**************************/
function showTab(event, tabName) {
  document.querySelectorAll(".tab-content").forEach(tab =>
    tab.classList.remove("active")
  );
  document.querySelectorAll(".tab-btn").forEach(btn =>
    btn.classList.remove("active")
  );

  document.getElementById(tabName).classList.add("active");
  event.target.classList.add("active");
}

/*************************
 LOAD STUDENTS
**************************/
async function loadStudents() {
  try {
    const res = await fetch(`${API_BASE}/students`);
    students = await res.json();

    const tbody = document.getElementById("studentTableBody");
    tbody.innerHTML = "";

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

    updateStatistics();
  } catch (err) {
    console.error(err);
    alert("Failed to load students");
  }
}

/*************************
 STATISTICS
**************************/
function updateStatistics() {
  document.getElementById("totalStudents").textContent = students.length;
  document.getElementById("totalFeeCollected").textContent =
    "₹" + students.reduce((s, st) => s + st.feePaid, 0).toLocaleString();
  document.getElementById("totalFeePending").textContent =
    "₹" +
    students
      .reduce((s, st) => s + (st.totalFee - st.feePaid), 0)
      .toLocaleString();
  document.getElementById("pendingStudents").textContent =
    students.filter(s => s.feePaid < s.totalFee).length;
}

/*************************
 SEARCH
**************************/
function searchStudents() {
  const term = document.getElementById("searchStudent").value.toLowerCase();
  document.querySelectorAll("#studentTableBody tr").forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(term)
      ? ""
      : "none";
  });
}

/*************************
 MODALS
**************************/
function openAddStudentModal() {
  document.getElementById("studentForm").reset();
  studentId.value = "";
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
  if (!s) return;

  studentId.value = s._id;
  studentName.value = s.name;
  mobile.value = s.mobile;
  studentClass.value = s.class;
  board.value = s.board;
  totalFee.value = s.totalFee;
  feePaid.value = s.feePaid;
  studentEmailField.value = s.email || "";
  address.value = s.address || "";

  document.getElementById("modalTitle").textContent = "Edit Student";
  document.getElementById("studentModal").classList.add("active");
}

/*************************
 DELETE STUDENT
**************************/
async function deleteStudent(id) {
  if (!confirm("Are you sure?")) return;
  await fetch(`${API_BASE}/students/${id}`, { method: "DELETE" });
  loadStudents();
}

/*************************
 ADD / UPDATE STUDENT
**************************/
document.getElementById("studentForm").addEventListener("submit", async e => {
  e.preventDefault();

  const data = {
    name: studentName.value,
    mobile: mobile.value,
    class: studentClass.value,
    board: board.value,
    totalFee: Number(totalFee.value),
    feePaid: Number(feePaid.value),
    email: studentEmailField.value,
    address: address.value
  };

  const method = studentId.value ? "PUT" : "POST";
  const url = studentId.value
    ? `${API_BASE}/students/${studentId.value}`
    : `${API_BASE}/students`;

  await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });

  closeModal();
  loadStudents();
});

/*************************
 PAYMENT
**************************/
function openPaymentModal(id) {
  const s = students.find(st => st._id === id);
  if (!s) return;

  paymentStudentId.value = id;
  paymentStudentName.value = s.name;
  pendingAmount.value = "₹" + (s.totalFee - s.feePaid).toLocaleString();
  paymentAmount.value = s.totalFee - s.feePaid;
  paymentDate.value = new Date().toISOString().split("T")[0];

  document.getElementById("paymentModal").classList.add("active");
}

function closePaymentModal() {
  document.getElementById("paymentModal").classList.remove("active");
}

document.getElementById("paymentForm").addEventListener("submit", async e => {
  e.preventDefault();

  await fetch(`${API_BASE}/students/${paymentStudentId.value}/payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      amount: Number(paymentAmount.value),
      date: paymentDate.value,
      method: paymentMethod.value,
      notes: paymentNotes.value
    })
  });

  closePaymentModal();
  loadStudents();
});

/*************************
 INITIAL LOAD
**************************/
loadStudents();
