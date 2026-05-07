import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Pool } from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Apply a tenant-schema migration by name.
 *
 * Usage:
 *   npm run apply:tenant:migrations                         # applies all pending
 *   npm run apply:tenant:migrations -- --name add_ai_tables # applies a specific one
 */
async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL required');

  // Support both --name=value and --name value
  let specificName: string | null = null;
  const nameIdx = process.argv.findIndex((a) => a === '--name' || a.startsWith('--name='));
  if (nameIdx !== -1) {
    const arg = process.argv[nameIdx];
    if (arg.includes('=')) {
      specificName = arg.split('=')[1];
    } else if (process.argv[nameIdx + 1]) {
      specificName = process.argv[nameIdx + 1];
    }
  }
  console.log(specificName ? `Filtering for migrations matching: ${specificName}` : 'Applying all migrations...');

  const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
  const entries = fs.readdirSync(migrationsDir, { withFileTypes: true });

  // Collect migration dirs that have a migration.sql
  const migrations = entries
    .filter((e) => e.isDirectory() && e.name !== '_lock')
    .filter((e) => {
      if (specificName) return e.name.includes(specificName);
      return true;
    })
    .map((e) => ({
      name: e.name,
      sqlPath: path.join(migrationsDir, e.name, 'migration.sql'),
    }))
    .filter((m) => fs.existsSync(m.sqlPath))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (migrations.length === 0) {
    console.log('No migrations to apply.');
    return;
  }

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();

  try {
    for (const migration of migrations) {
      const sql = fs.readFileSync(migration.sqlPath, 'utf8');

      console.log(`Applying migration: ${migration.name} ...`);
      await client.query('BEGIN');
      try {
        await client.query('SET LOCAL search_path = "tenant", public');
        await client.query(sql);
        await client.query('COMMIT');
        console.log(`  ✓ ${migration.name} applied successfully`);
      } catch (err: any) {
        await client.query('ROLLBACK');
        // Skip "already exists" errors gracefully
        if (err.code === '42P07' || err.code === '42710') {
          console.log(`  ⚠ ${migration.name} — already applied, skipping`);
        } else {
          throw err;
        }
      }
    }
    console.log('\nAll migrations applied.');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
