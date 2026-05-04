import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL required');

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();

  try {
    const sqlPath = path.join(
      __dirname,
      '..',
      'prisma',
      'migrations',
      '20260505120000_add_academic_year',
      'migration.sql',
    );
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // This codebase currently uses a fixed Prisma schema: `tenant`.
    // So the proper fix is to create the table in the literal `tenant` schema.
    await client.query('BEGIN');
    try {
      await client.query('SET LOCAL search_path = "tenant", public');
      await client.query(sql);
      await client.query('COMMIT');
      console.log('Applied academic_years migration to schema: tenant');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
