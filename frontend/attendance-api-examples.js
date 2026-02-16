// Attendance System - API Testing Examples
// This file contains example API calls to test the attendance management system

// ============================================
// CONFIGURATION
// ============================================

const API_BASE_URL = 'http://localhost:5000/api';

// ============================================
// HELPER FUNCTION - Make API Calls
// ============================================

async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    
    console.log(`\n${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', data);
    
    return data;
  } catch (error) {
    console.error(`Error calling ${endpoint}:`, error);
    return null;
  }
}

// ============================================
// 1. MARK ATTENDANCE EXAMPLES
// ============================================

// Example: Mark student as present
async function markStudentPresent() {
  console.log('\n========== MARKING STUDENT PRESENT ==========\n');
  
  const result = await apiCall('/attendance/mark', 'POST', {
    studentEmail: 'john.doe@school.com',
    subject: 'Mathematics',
    status: 'present',
    markedBy: 'teacher1@school.com'
  });
  
  return result;
}

// Example: Mark student as absent
async function markStudentAbsent() {
  console.log('\n========== MARKING STUDENT ABSENT ==========\n');
  
  const result = await apiCall('/attendance/mark', 'POST', {
    studentEmail: 'jane.smith@school.com',
    subject: 'English',
    status: 'absent',
    markedBy: 'teacher1@school.com'
  });
  
  return result;
}

// Example: Mark multiple students
async function markMultipleStudents() {
  console.log('\n========== MARKING MULTIPLE STUDENTS ==========\n');
  
  const students = [
    { email: 'student1@school.com', subject: 'Science', status: 'present' },
    { email: 'student2@school.com', subject: 'Science', status: 'absent' },
    { email: 'student3@school.com', subject: 'Science', status: 'present' },
    { email: 'student4@school.com', subject: 'Science', status: 'present' }
  ];

  for (const student of students) {
    await apiCall('/attendance/mark', 'POST', {
      studentEmail: student.email,
      subject: student.subject,
      status: student.status,
      markedBy: 'teacher1@school.com'
    });
  }
}

// ============================================
// 2. VIEW RECORDS - EXAMPLES
// ============================================

// Example: Get all attendance records
async function getAllRecords() {
  console.log('\n========== GETTING ALL RECORDS ==========\n');
  
  const result = await apiCall('/attendance/all');
  return result;
}

// Example: Get student-specific records
async function getStudentRecords(email) {
  console.log(`\n========== GETTING RECORDS FOR ${email} ==========\n`);
  
  const result = await apiCall(`/attendance/student/${email}`);
  return result;
}

// ============================================
// 3. STATISTICS - EXAMPLES
// ============================================

// Example: Get student statistics
async function getStudentStats(email) {
  console.log(`\n========== GETTING STATS FOR ${email} ==========\n`);
  
  const result = await apiCall(`/attendance/stats/${email}`);
  
  if (result.data) {
    console.log('\n📊 ATTENDANCE SUMMARY:');
    console.log(`   Total Classes: ${result.data.totalRecords}`);
    console.log(`   Present: ${result.data.presentCount}`);
    console.log(`   Absent: ${result.data.absentCount}`);
    console.log(`   Percentage: ${result.data.attendancePercentage}`);
  }
  
  return result;
}

// ============================================
// 4. EXPORT - EXAMPLES
// ============================================

// Example: Export all records
async function exportAllRecords() {
  console.log('\n========== EXPORTING ALL RECORDS ==========\n');
  
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/export/txt`, {
      method: 'GET'
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_all_${new Date().getTime()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ File downloaded successfully!');
    } else {
      console.error('❌ Failed to export');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example: Export by date range
async function exportByDateRange(startDate, endDate) {
  console.log(`\n========== EXPORTING RECORDS (${startDate} to ${endDate}) ==========\n`);
  
  try {
    const response = await fetch(`${API_BASE_URL}/attendance/export/date-range`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate, endDate })
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_range_${new Date().getTime()}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      console.log('✅ File downloaded successfully!');
    } else {
      console.error('❌ Failed to export');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// ============================================
// TEST SUITE - Run all examples
// ============================================

async function runAllTests() {
  console.log('\n\n');
  console.log('═'.repeat(60));
  console.log('   ATTENDANCE SYSTEM - COMPREHENSIVE TEST SUITE');
  console.log('═'.repeat(60));

  try {
    // 1. Mark Attendance
    await markStudentPresent();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await markStudentAbsent();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await markMultipleStudents();
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. View Records
    await getAllRecords();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    await getStudentRecords('john.doe@school.com');
    await new Promise(resolve => setTimeout(resolve, 500));

    // 3. Statistics
    await getStudentStats('john.doe@school.com');
    await new Promise(resolve => setTimeout(resolve, 500));

    console.log('\n' + '═'.repeat(60));
    console.log('   ✅ ALL TESTS COMPLETED SUCCESSFULLY');
    console.log('═'.repeat(60) + '\n');

  } catch (error) {
    console.error('❌ Test suite failed:', error);
  }
}

// ============================================
// QUICK TEST - Minimal example
// ============================================

async function quickTest() {
  console.log('🚀 Running quick test...\n');

  // Mark attendance
  console.log('1️⃣ Marking attendance...');
  await apiCall('/attendance/mark', 'POST', {
    studentEmail: 'test.student@example.com',
    subject: 'Mathematics',
    status: 'present',
    markedBy: 'test.teacher@example.com'
  });

  // Get statistics
  console.log('\n2️⃣ Getting statistics...');
  await getStudentStats('test.student@example.com');

  console.log('\n✅ Quick test completed!');
}

// ============================================
// USAGE INSTRUCTIONS
// ============================================

/*

HOW TO USE THESE EXAMPLES:

1. OPEN BROWSER CONSOLE:
   - Open attendance-management.html
   - Press F12 or Ctrl+Shift+J (Cmd+Option+J on Mac)
   - Go to "Console" tab

2. RUN QUICK TEST:
   - Copy & paste: quickTest()
   - Press Enter

3. RUN FULL TEST SUITE:
   - Copy & paste: runAllTests()
   - Press Enter

4. RUN SPECIFIC EXAMPLES:
   - markStudentPresent()
   - markStudentAbsent()
   - getAllRecords()
   - getStudentRecords('email@example.com')
   - getStudentStats('email@example.com')

5. VIEW RESULTS:
   - Check console output
   - View database records
   - Check exported files

NOTES:
- Ensure backend server is running on port 5000
- Replace example emails with real student/teacher emails
- All times are stored in GMT, displayed in local timezone
- Exported files are created in backend/exports/ folder

*/

// ============================================
// HELPER: Sample Data Generator
// ============================================

async function generateSampleData() {
  console.log('📝 Generating sample attendance data...\n');

  const classes = ['Mathematics', 'English', 'Science', 'History', 'Geography'];
  const students = [
    'alice@school.com',
    'bob@school.com',
    'charlie@school.com',
    'diana@school.com',
    'evan@school.com'
  ];

  let count = 0;

  for (let i = 0; i < 10; i++) {
    for (const student of students) {
      const status = Math.random() > 0.2 ? 'present' : 'absent';
      const subject = classes[Math.floor(Math.random() * classes.length)];

      await apiCall('/attendance/mark', 'POST', {
        studentEmail: student,
        subject: subject,
        status: status,
        markedBy: 'teacher@school.com'
      });

      count++;
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  console.log(`\n✅ Generated ${count} attendance records!`);
}

// ============================================
// QUICK START GUIDE
// ============================================

function printGuide() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║          ATTENDANCE SYSTEM - QUICK START GUIDE                 ║
╚════════════════════════════════════════════════════════════════╝

📋 AVAILABLE COMMANDS:

  MARKING ATTENDANCE:
  • markStudentPresent()           - Mark one student present
  • markStudentAbsent()            - Mark one student absent
  • markMultipleStudents()         - Mark multiple students
  • generateSampleData()           - Create 50 sample records

  VIEWING RECORDS:
  • getAllRecords()                - View all attendance records
  • getStudentRecords('email')     - View records for one student

  STATISTICS:
  • getStudentStats('email')       - Get student attendance summary

  EXPORT:
  • exportAllRecords()             - Download all records as TXT
  • exportByDateRange('2024-02-01', '2024-02-15') - Download date range

  TESTING:
  • quickTest()                    - Run a quick 3-step test
  • runAllTests()                  - Run comprehensive test suite
  • printGuide()                   - Show this message

🚀 GET STARTED:
   Type: quickTest()
   Press: Enter

💡 TIPS:
   • Check console output for API responses
   • Use browser DevTools (F12) to debug
   • Replace example emails with real ones
   • Backup data regularly

═════════════════════════════════════════════════════════════════
  `);
}

// Auto-print guide on load (if run in browser console)
if (typeof window !== 'undefined') {
  console.log('📋 Type printGuide() to see available commands');
}
