import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();

try {
  await client.query('SET search_path TO "tenant", public');

  // Check columns of the classes table
  const cols = await client.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_schema='tenant' AND table_name='classes' 
    ORDER BY ordinal_position
  `);
  console.log('Classes columns:', cols.rows.map((r: any) => r.column_name).join(', '));

  // Add academic_year_id column if missing
  const hasAcYearCol = cols.rows.some((r: any) => r.column_name === 'academic_year_id');
  if (!hasAcYearCol) {
    console.log('Adding missing academic_year_id column...');
    await client.query('ALTER TABLE "tenant"."classes" ADD COLUMN IF NOT EXISTS "academic_year_id" UUID');
    console.log('✓ Column added');
  }

  // Insert a test class
  const classRes = await client.query(`
    INSERT INTO "tenant"."classes" (id, name, academic_year, created_at) 
    VALUES (gen_random_uuid(), 'Grade 10', '2025-2026', NOW()) 
    RETURNING id, name
  `);
  const classId = classRes.rows[0].id;
  console.log(`✓ Created class: ${classId} (${classRes.rows[0].name})`);

  // Insert a test subject
  // Check subjects columns first
  const subCols = await client.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_schema='tenant' AND table_name='subjects' ORDER BY ordinal_position
  `);
  console.log('Subjects columns:', subCols.rows.map((r: any) => r.column_name).join(', '));

  const subRes = await client.query(`
    INSERT INTO "tenant"."subjects" (id, name, code, class_id) 
    VALUES (gen_random_uuid(), 'Mathematics', 'MATH10', $1) 
    RETURNING id, name
  `, [classId]);
  const subjectId = subRes.rows[0].id;
  console.log(`✓ Created subject: ${subjectId} (${subRes.rows[0].name})`);

  // Get principal user ID
  const principalRes = await client.query(`
    SELECT id, name, role FROM "tenant"."users" WHERE role='principal' LIMIT 1
  `);
  const principalId = principalRes.rows[0]?.id;
  console.log(`✓ Principal: ${principalId} (${principalRes.rows[0]?.name})`);

  // Insert a test student user + profile
  const studentEmail = `ai.test.student.${Date.now()}@school.com`;
  // Check users columns
  const userCols = await client.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_schema='tenant' AND table_name='users' ORDER BY ordinal_position
  `);
  console.log('Users columns:', userCols.rows.map((r: any) => r.column_name).join(', '));

  // Build INSERT based on discovered columns
  const userColList = userCols.rows.map((r: any) => r.column_name);
  const hasUpdatedAt = userColList.includes('updated_at');
  const studentRes = await client.query(`
    INSERT INTO "tenant"."users" (id, name, email, password_hash, role, is_active, created_at) 
    VALUES (gen_random_uuid(), 'Test Student AI', $1, '$2b$10$dummyhashedpasswordhere000000000000000000000000000', 'student', true, NOW()) 
    RETURNING id, name
  `, [studentEmail]);
  const studentId = studentRes.rows[0].id;
  console.log(`✓ Created student user: ${studentId}`);

  // Insert student profile
  // Check student_profiles columns
  const spCols = await client.query(`
    SELECT column_name FROM information_schema.columns 
    WHERE table_schema='tenant' AND table_name='student_profiles' ORDER BY ordinal_position
  `);
  console.log('Student profiles columns:', spCols.rows.map((r: any) => r.column_name).join(', '));

  const spColList = spCols.rows.map((r: any) => r.column_name);
  // student_profiles has no 'id' — user_id is the primary key
  await client.query(`
    INSERT INTO "tenant"."student_profiles" (user_id, class_id) 
    VALUES ($1, $2)
  `, [studentId, classId]);
  console.log(`✓ Created student profile`);

  console.log('\n📋 Test Data IDs (copy into test script):');
  console.log(`   classId    = "${classId}"`);
  console.log(`   subjectId  = "${subjectId}"`);
  console.log(`   studentId  = "${studentId}"`);

} catch (err: any) {
  // If duplicate key, that's OK
  if (err.code === '23505') {
    console.log('⚠ Some data already exists, fetching...');
    const classes = await client.query('SELECT id, name FROM "tenant"."classes" LIMIT 1');
    const subjects = await client.query('SELECT id, name FROM "tenant"."subjects" LIMIT 1');
    const students = await client.query(`SELECT id, name FROM "tenant"."users" WHERE role='STUDENT' LIMIT 1`);
    console.log('classId:', classes.rows[0]?.id);
    console.log('subjectId:', subjects.rows[0]?.id);
    console.log('studentId:', students.rows[0]?.id);
  } else {
    throw err;
  }
} finally {
  client.release();
  await pool.end();
}
