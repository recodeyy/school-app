/**
 * AI Module — End-to-End Test Script
 *
 * Tests all 14 AI endpoints + edge cases with real JWT token and DB data.
 * Usage: npx tsx scripts/test-ai-endpoints.ts
 */
import 'dotenv/config';

const BASE = `http://localhost:${process.env.PORT || 4000}`;
let TOKEN = '';
let USER_ID = '';

// Test data IDs
let classId = '';
let subjectId = '';
let studentId = '';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
async function api(
  method: string,
  path: string,
  body?: any,
) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text };
  }

  return { status: res.status, json };
}

function log(label: string, result: { status: number; json: any }) {
  const icon = result.status >= 200 && result.status < 300 ? '✅' : '❌';
  console.log(`\n${icon} [${result.status}] ${label}`);
  if (result.status >= 400) {
    console.log('   Error:', JSON.stringify(result.json).slice(0, 300));
  } else {
    const preview = JSON.stringify(result.json).slice(0, 400);
    console.log('   Response:', preview + (preview.length >= 400 ? '...' : ''));
  }
}

function logExpect(label: string, result: { status: number; json: any }, expectedStatus: number) {
  const pass = result.status === expectedStatus;
  const icon = pass ? '✅' : '❌';
  console.log(`\n${icon} [${result.status}${pass ? '' : ` expected ${expectedStatus}`}] ${label}`);
  const preview = JSON.stringify(result.json).slice(0, 300);
  console.log('   Response:', preview);
}

/* ------------------------------------------------------------------ */
/*  Setup: Login as SUPER_ADMIN + Seed test data                       */
/* ------------------------------------------------------------------ */
async function setup() {
  console.log('='.repeat(60));
  console.log('SETUP: Login + Seed Data');
  console.log('='.repeat(60));

  // Try login as principal (highest existing role)
  const login = await api('POST', '/auth/login', {
    email: 'principal@myschool.com',
    password: 'StrongPass123!',
  });
  if (login.status !== 201 && login.status !== 200) {
    console.error('❌ Login failed:', login.json);
    process.exit(1);
  }
  TOKEN = login.json.access_token;
  const payload = JSON.parse(
    Buffer.from(TOKEN.split('.')[1], 'base64').toString(),
  );
  USER_ID = payload.sub;
  console.log(`✅ Logged in as ${payload.role} (${USER_ID})`);

  // --- Create class ---
  let classRes = await api('POST', '/setup/classes', { name: 'Grade 10' });
  if (classRes.status === 201) {
    classId = classRes.json.id;
    console.log(`✅ Created class: ${classId}`);
  } else {
    // Fetch existing classes
    const list = await api('GET', '/setup/classes');
    if (Array.isArray(list.json) && list.json.length > 0) {
      classId = list.json[0].id;
      console.log(`ℹ️  Using existing class: ${list.json[0].name} (${classId})`);
    } else {
      console.log('⚠ No classes available. Some tests will be skipped.');
    }
  }

  // --- Create subject ---
  if (classId) {
    let subRes = await api('POST', '/setup/subjects', {
      name: 'Mathematics',
      code: 'MATH10',
      classId,
    });
    if (subRes.status === 201) {
      subjectId = subRes.json.id;
      console.log(`✅ Created subject: ${subjectId}`);
    } else {
      const subList = await api('GET', '/setup/subjects');
      if (Array.isArray(subList.json) && subList.json.length > 0) {
        const match = subList.json.find((s: any) => s.classId === classId) || subList.json[0];
        subjectId = match.id;
        console.log(`ℹ️  Using existing subject: ${match.name} (${subjectId})`);
      }
    }
  }

  // --- Create student ---
  if (classId) {
    const ts = Date.now();
    const studentRes = await api('POST', '/users/students', {
      name: 'Test Student AI',
      email: `ai.test.student.${ts}@school.com`,
      password: 'TestPass123!',
      classId,
      rollNumber: `T${ts % 10000}`,
    });
    if (studentRes.status === 201) {
      studentId = studentRes.json.id;
      console.log(`✅ Created student: ${studentId}`);
    } else {
      console.log('⚠ Student creation:', studentRes.status, JSON.stringify(studentRes.json).slice(0, 200));
      // Try to fetch any existing student
      const userList = await api('GET', `/users/class/${classId}/students`);
      if (Array.isArray(userList.json) && userList.json.length > 0) {
        studentId = userList.json[0].id;
        console.log(`ℹ️  Using existing student: ${studentId}`);
      }
    }
  }

  console.log(`\n📋 Test Data: class=${classId}, subject=${subjectId}, student=${studentId}`);
}

/* ------------------------------------------------------------------ */
/*  TEST 1: Teacher Endpoints                                          */
/* ------------------------------------------------------------------ */
async function testTeacherEndpoints() {
  console.log('\n' + '='.repeat(60));
  console.log('🧑‍🏫 TEACHER ENDPOINTS');
  console.log('='.repeat(60));

  if (!classId || !subjectId) {
    console.log('⚠ Skipping — no class/subject data');
    return;
  }

  // 1) Homework Generator
  console.log('\n--- Homework Generator ---');
  log('Homework (easy, English, 3 questions)', await api('POST', '/ai/teacher/homework', {
    classId, subjectId,
    chapter: 'Quadratic Equations',
    difficulty: 'easy',
    language: 'en',
    questionCount: 3,
  }));

  // 2) Quiz Generator
  console.log('\n--- Quiz Generator ---');
  log('Quiz (MCQ + short, 5 questions)', await api('POST', '/ai/teacher/quiz', {
    subjectId,
    chapter: 'Polynomials',
    difficulty: 'medium',
    questionCount: 5,
    types: ['mcq', 'short'],
    includeAnswerKey: true,
  }));

  // 3) Lesson Plan
  console.log('\n--- Lesson Plan Generator ---');
  log('Lesson Plan (Hindi, 40 min)', await api('POST', '/ai/teacher/lesson-plan', {
    classId, subjectId,
    chapter: 'Linear Equations',
    duration: 40,
    language: 'hi',
  }));

  // 4) Question Paper
  console.log('\n--- Question Paper Generator ---');
  log('Question Paper (midterm, 50 marks)', await api('POST', '/ai/teacher/question-paper', {
    classId, subjectId,
    examType: 'midterm',
    totalMarks: 50,
    chapters: ['Quadratic Equations', 'Polynomials'],
    sectionConfig: [
      { name: 'Section A', questionType: 'mcq', count: 5, marksPerQuestion: 1 },
      { name: 'Section B', questionType: 'short', count: 5, marksPerQuestion: 3 },
      { name: 'Section C', questionType: 'long', count: 4, marksPerQuestion: 5 },
    ],
    includeAnswerKey: true,
  }));

  // 5) Report Card Remarks
  if (studentId) {
    console.log('\n--- Report Card Remarks ---');
    log('Report Card Remarks (no exam data)', await api('POST', '/ai/teacher/report-card-remarks', {
      studentId,
    }));
  }
}

/* ------------------------------------------------------------------ */
/*  TEST 2: Admin Endpoints                                            */
/* ------------------------------------------------------------------ */
async function testAdminEndpoints() {
  console.log('\n' + '='.repeat(60));
  console.log('🏫 ADMIN ENDPOINTS');
  console.log('='.repeat(60));

  // 6) Notice — English formal
  log('Notice (English, formal)', await api('POST', '/ai/admin/notice', {
    topic: 'Annual Sports Day',
    audience: 'parents',
    language: 'en',
    tone: 'formal',
    keyPoints: ['Date: 15th November', 'Venue: School Ground', 'Reporting: 8 AM'],
  }));

  // 7) Notice — Marathi
  log('Notice (Marathi)', await api('POST', '/ai/admin/notice', {
    topic: 'दिवाळी सुट्टी',
    audience: 'all',
    language: 'mr',
    tone: 'friendly',
  }));

  // 8) Parent Message
  if (studentId) {
    log('Parent Message (attendance concern)', await api('POST', '/ai/admin/parent-message', {
      studentId,
      issue: 'attendance',
      details: 'Student absent for 5 consecutive days without leave application.',
      language: 'en',
      tone: 'concerned',
    }));
  }
}

/* ------------------------------------------------------------------ */
/*  TEST 3: Student Endpoints (PRINCIPAL can't access — test RBAC)     */
/* ------------------------------------------------------------------ */
async function testStudentRBAC() {
  console.log('\n' + '='.repeat(60));
  console.log('🎓 STUDENT ENDPOINTS — RBAC TEST (PRINCIPAL should get 403)');
  console.log('='.repeat(60));

  logExpect('Doubt (PRINCIPAL → 403)', await api('POST', '/ai/student/doubt', {
    question: 'What is Pythagorean theorem?',
  }), 403);

  logExpect('Practice Quiz (PRINCIPAL → 403)', await api('POST', '/ai/student/practice-quiz', {
    subjectId: subjectId || '00000000-0000-0000-0000-000000000000',
  }), 403);
}

/* ------------------------------------------------------------------ */
/*  TEST 4: Analytics Endpoints                                        */
/* ------------------------------------------------------------------ */
async function testAnalyticsEndpoints() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 ANALYTICS ENDPOINTS');
  console.log('='.repeat(60));

  if (studentId) {
    log('Progress Summary', await api('POST', '/ai/analytics/progress-summary', { studentId }));
    log('Attendance Risk (student)', await api('POST', '/ai/analytics/attendance-risk', { studentId }));
    log('Weak Subjects', await api('POST', '/ai/analytics/weak-subjects', { studentId }));
  }

  if (classId) {
    log('Attendance Risk (class)', await api('POST', '/ai/analytics/attendance-risk', { classId }));
  }
}

/* ------------------------------------------------------------------ */
/*  TEST 5: Edge Cases & Validation                                    */
/* ------------------------------------------------------------------ */
async function testEdgeCases() {
  console.log('\n' + '='.repeat(60));
  console.log('🛡️  EDGE CASES & VALIDATION');
  console.log('='.repeat(60));

  // No auth
  const saved = TOKEN;
  TOKEN = '';
  logExpect('No token → 401', await api('POST', '/ai/teacher/homework', {
    classId: '00000000-0000-0000-0000-000000000000',
    subjectId: '00000000-0000-0000-0000-000000000000',
    chapter: 'Test', difficulty: 'easy', language: 'en',
  }), 401);
  TOKEN = saved;

  // Bad UUID
  logExpect('Invalid UUID → 400', await api('POST', '/ai/teacher/homework', {
    classId: 'not-a-uuid', subjectId: 'also-bad',
    chapter: 'Test', difficulty: 'easy', language: 'en',
  }), 400);

  // Missing required field
  logExpect('Missing classId → 400', await api('POST', '/ai/teacher/homework', {
    subjectId: subjectId || '00000000-0000-0000-0000-000000000000',
    chapter: 'Test', difficulty: 'easy', language: 'en',
  }), 400);

  // Invalid enum
  logExpect('Bad difficulty enum → 400', await api('POST', '/ai/teacher/homework', {
    classId: classId || '00000000-0000-0000-0000-000000000000',
    subjectId: subjectId || '00000000-0000-0000-0000-000000000000',
    chapter: 'Test', difficulty: 'nightmare', language: 'en',
  }), 400);

  // Extra unknown fields
  logExpect('Extra field → 400 (whitelist)', await api('POST', '/ai/admin/notice', {
    topic: 'Test', audience: 'all', language: 'en', hackerField: 'inject',
  }), 400);

  // Non-existent student
  logExpect('Fake studentId → 404', await api('POST', '/ai/teacher/report-card-remarks', {
    studentId: '00000000-0000-0000-0000-000000000000',
  }), 404);

  // Attendance risk with neither studentId nor classId
  logExpect('No IDs in attendance-risk → 400', await api('POST', '/ai/analytics/attendance-risk', {}), 400);

  // Empty body
  logExpect('Empty body → 400', await api('POST', '/ai/teacher/homework', {}), 400);
}

/* ------------------------------------------------------------------ */
/*  Main                                                               */
/* ------------------------------------------------------------------ */
async function main() {
  console.log('🧪 AI Module — End-to-End Test Suite');
  console.log(`   Server: ${BASE}`);
  console.log(`   Time: ${new Date().toLocaleString()}\n`);

  await setup();
  await testTeacherEndpoints();
  await testAdminEndpoints();
  await testStudentRBAC();
  await testAnalyticsEndpoints();
  await testEdgeCases();

  console.log('\n' + '='.repeat(60));
  console.log('🏁 ALL TESTS COMPLETE');
  console.log('='.repeat(60));
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
