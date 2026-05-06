/**
 * Phase 2 AI Tests — Student login + Analytics with linked data
 * 
 * Uses the DB-seeded student, gives them a real bcrypt password,
 * then tests student + analytics endpoints.
 * 
 * Usage: npx tsx scripts/test-ai-phase2.ts
 */
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';

const BASE = `http://localhost:${process.env.PORT || 4000}`;
let PRINCIPAL_TOKEN = '';
let STUDENT_TOKEN = '';

// Seeded IDs from seed-ai-test-data.ts
let classId = '';
let subjectId = '';
let studentId = '';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */
async function api(method: string, path: string, body?: any, token?: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const t = token ?? STUDENT_TOKEN;
  if (t) headers['Authorization'] = `Bearer ${t}`;

  const res = await fetch(`${BASE}${path}`, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  return { status: res.status, json };
}

function log(label: string, r: { status: number; json: any }) {
  const icon = r.status >= 200 && r.status < 300 ? '✅' : '❌';
  console.log(`\n${icon} [${r.status}] ${label}`);
  if (r.status >= 400) {
    console.log('   Error:', JSON.stringify(r.json).slice(0, 300));
  } else {
    const p = JSON.stringify(r.json).slice(0, 400);
    console.log('   Response:', p + (p.length >= 400 ? '...' : ''));
  }
}

/* ------------------------------------------------------------------ */
/*  Setup                                                              */
/* ------------------------------------------------------------------ */
async function setup() {
  console.log('='.repeat(60));
  console.log('SETUP: Create student with real password + login');
  console.log('='.repeat(60));

  // Login as principal first
  const login = await api('POST', '/auth/login', {
    email: 'principal@myschool.com', password: 'StrongPass123!',
  }, '');
  PRINCIPAL_TOKEN = login.json.access_token;
  console.log('✅ Principal logged in');

  // Connect to DB and set up a student with a real password
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();

  try {
    await client.query('SET search_path TO "tenant", public');

    const email = `ai.phase2.${Date.now()}@school.com`;
    const hash = await bcrypt.hash('Student@123', 10);

    // Get existing class + subject from DB
    const classRes = await client.query('SELECT id, name FROM "tenant"."classes" LIMIT 1');
    classId = classRes.rows[0]?.id;
    console.log(`ℹ️  Class: ${classRes.rows[0]?.name} (${classId})`);

    const subRes = await client.query('SELECT id, name FROM "tenant"."subjects" LIMIT 1');
    subjectId = subRes.rows[0]?.id;
    console.log(`ℹ️  Subject: ${subRes.rows[0]?.name} (${subjectId})`);

    // Create student user with real bcrypt hash
    const userRes = await client.query(`
      INSERT INTO "tenant"."users" (id, name, email, password_hash, role, is_active, created_at)
      VALUES (gen_random_uuid(), 'AI Test Student', $1, $2, 'student', true, NOW())
      RETURNING id, name
    `, [email, hash]);
    studentId = userRes.rows[0].id;
    console.log(`✅ Student user: ${studentId} (${email})`);

    // Create student profile linked to class
    await client.query(`
      INSERT INTO "tenant"."student_profiles" (user_id, class_id)
      VALUES ($1, $2)
    `, [studentId, classId]);
    console.log('✅ Student profile linked to class');

    // Login as student
    const studentLogin = await api('POST', '/auth/login', {
      email, password: 'Student@123',
    }, '');
    if (studentLogin.status === 200 || studentLogin.status === 201) {
      STUDENT_TOKEN = studentLogin.json.access_token;
      console.log('✅ Student logged in');
    } else {
      console.log('❌ Student login failed:', JSON.stringify(studentLogin.json));
    }
  } finally {
    client.release();
    await pool.end();
  }
}

/* ------------------------------------------------------------------ */
/*  Student Endpoint Tests                                             */
/* ------------------------------------------------------------------ */
async function testStudentEndpoints() {
  console.log('\n' + '='.repeat(60));
  console.log('🎓 STUDENT ENDPOINTS (as STUDENT user)');
  console.log('='.repeat(60));

  if (!STUDENT_TOKEN) {
    console.log('⚠ No student token — skipping');
    return;
  }

  // 1. Doubt Solver — valid math question
  log('Doubt: "What is Pythagorean theorem?"', await api('POST', '/ai/student/doubt', {
    question: 'What is the Pythagorean theorem and how do I use it?',
    subjectId,
    chapter: 'Triangles',
  }));

  // 2. Doubt Solver — off-topic safety check
  log('Doubt: off-topic social media question', await api('POST', '/ai/student/doubt', {
    question: 'How do I create a TikTok account?',
  }));

  // 3. Chapter Summary
  log('Chapter Summary (Quadratic Equations)', await api('POST', '/ai/student/chapter-summary', {
    subjectId,
    chapter: 'Quadratic Equations',
    language: 'en',
  }));

  // 4. Flashcards
  log('Flashcards (Polynomials, 5 cards)', await api('POST', '/ai/student/flashcards', {
    subjectId,
    chapter: 'Polynomials',
    count: 5,
  }));

  // 5. Practice Quiz
  log('Practice Quiz (weak topics)', await api('POST', '/ai/student/practice-quiz', {
    subjectId,
    chapter: 'Algebra',
    weakTopics: ['Factoring', 'Linear equations'],
  }));
}

/* ------------------------------------------------------------------ */
/*  Analytics Tests (as PRINCIPAL)                                     */
/* ------------------------------------------------------------------ */
async function testAnalyticsEndpoints() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 ANALYTICS ENDPOINTS (as PRINCIPAL)');
  console.log('='.repeat(60));

  // Progress Summary
  log('Progress Summary (no exam data yet)', await api('POST', '/ai/analytics/progress-summary', {
    studentId,
  }, PRINCIPAL_TOKEN));

  // Attendance Risk — single student
  log('Attendance Risk (student)', await api('POST', '/ai/analytics/attendance-risk', {
    studentId,
  }, PRINCIPAL_TOKEN));

  // Weak Subjects
  log('Weak Subjects (no results — graceful)', await api('POST', '/ai/analytics/weak-subjects', {
    studentId,
  }, PRINCIPAL_TOKEN));

  // Report Card Remarks
  log('Report Card Remarks (no exam data)', await api('POST', '/ai/teacher/report-card-remarks', {
    studentId,
  }, PRINCIPAL_TOKEN));

  // Parent Message with real student
  log('Parent Message (behavior concern)', await api('POST', '/ai/admin/parent-message', {
    studentId,
    issue: 'behavior',
    details: 'Student has been disruptive in class, talking during lessons.',
    language: 'en',
    tone: 'concerned',
  }, PRINCIPAL_TOKEN));
}

/* ------------------------------------------------------------------ */
/*  Cross-role RBAC Tests                                              */
/* ------------------------------------------------------------------ */
async function testCrossRoleRBAC() {
  console.log('\n' + '='.repeat(60));
  console.log('🔒 CROSS-ROLE RBAC');
  console.log('='.repeat(60));

  if (!STUDENT_TOKEN) {
    console.log('⚠ No student token — skipping');
    return;
  }

  // Student should NOT be able to generate notices
  const r1 = await api('POST', '/ai/admin/notice', {
    topic: 'Test', audience: 'all', language: 'en',
  });
  const pass1 = r1.status === 403;
  console.log(`\n${pass1 ? '✅' : '❌'} [${r1.status}] Student → /ai/admin/notice (expect 403)`);

  // Student should NOT be able to generate question papers
  const r2 = await api('POST', '/ai/teacher/question-paper', {
    classId, subjectId, examType: 'final', totalMarks: 100,
    chapters: ['All'], sectionConfig: [{ name: 'A', questionType: 'mcq', count: 5, marksPerQuestion: 2 }],
  });
  const pass2 = r2.status === 403;
  console.log(`${pass2 ? '✅' : '❌'} [${r2.status}] Student → /ai/teacher/question-paper (expect 403)`);

  // Student should NOT access analytics
  const r3 = await api('POST', '/ai/analytics/progress-summary', { studentId });
  const pass3 = r3.status === 403;
  console.log(`${pass3 ? '✅' : '❌'} [${r3.status}] Student → /ai/analytics/progress-summary (expect 403)`);
}

/* ------------------------------------------------------------------ */
async function main() {
  console.log('🧪 AI Module — Phase 2 Tests (Student + Analytics)');
  console.log(`   Server: ${BASE}\n`);

  await setup();
  await testStudentEndpoints();
  await testAnalyticsEndpoints();
  await testCrossRoleRBAC();

  console.log('\n' + '='.repeat(60));
  console.log('🏁 PHASE 2 TESTS COMPLETE');
  console.log('='.repeat(60));
}

main().catch((err) => { console.error('Fatal:', err); process.exit(1); });
