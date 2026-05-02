import 'dotenv/config';

import { randomBytes, randomUUID } from 'node:crypto';
import { stdin as input, stdout as output } from 'node:process';
import { createInterface } from 'node:readline/promises';

import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

type PlanValue = 'STARTER' | 'PRO' | 'ENTERPRISE';
type UserRoles =
  | 'ADMIN'
  | 'TEACHER'
  | 'STUDENT'
  | 'PARENT'
  | 'PRINCIPAL'
  | 'ADMISSION_COUNSELOR'
  | 'SUPER_ADMIN';
type DbPlanValue = 'starter' | 'pro' | 'enterprise';
type DbRoleValue =
  | 'admin'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'principal'
  | 'admission_counselor'
  | 'super_admin';

type BootstrapInput = {
  tenantName: string;
  tenantSlug: string;
  schemaName: string;
  plan: PlanValue;
  billingEmail?: string;
  principalName: string;
  principalEmail: string;
  principalPassword: string;
};

const USAGE = `
Organization Creation Script (OCS)

Creates a new Tenant organization and its first Principal account.

Usage:
  npm run ocs -- --name "My School" --slug "my-school" --plan STARTER --principal-name "Admin" --principal-email "admin@myschool.com" --principal-password "StrongPass123!"

Flags:
  --name               Organization name
  --slug               Organization slug (used for tenant slug)
  --schema-name        Optional schema name (defaults to tenant_<slug>)
  --plan               STARTER | PRO | ENTERPRISE (default: STARTER)
  --billing-email      Optional billing email
  --principal-name     Principal display name
  --principal-email    Principal login email
  --principal-password Principal login password (generated if omitted)
`;

function parseArgs(argv: string[]) {
  const parsed: Record<string, string | boolean> = {};

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;

    const key = arg.slice(2);
    const next = argv[i + 1];

    if (!next || next.startsWith('--')) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    i += 1;
  }

  return parsed;
}

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeSchemaName(value: string) {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!normalized) return 'tenant_default';
  if (/^[0-9]/.test(normalized)) return `tenant_${normalized}`;
  return normalized;
}

function generatePassword(length = 18) {
  return randomBytes(length).toString('base64url').slice(0, length);
}

function toDbPlan(plan: PlanValue): DbPlanValue {
  return plan.toLowerCase() as DbPlanValue;
}

function toDbRole(role: UserRoles): DbRoleValue {
  const mapping: Record<UserRoles, DbRoleValue> = {
    ADMIN: 'admin',
    TEACHER: 'teacher',
    STUDENT: 'student',
    PARENT: 'parent',
    PRINCIPAL: 'principal',
    ADMISSION_COUNSELOR: 'admission_counselor',
    SUPER_ADMIN: 'super_admin',
  };

  return mapping[role];
}

function quoteIdent(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

async function ask(
  rl: ReturnType<typeof createInterface>,
  question: string,
  defaultValue?: string,
) {
  const suffix = defaultValue ? ` (${defaultValue})` : '';
  const answer = await rl.question(`${question}${suffix}: `);
  return answer.trim() || (defaultValue ?? '');
}

async function collectInput(): Promise<BootstrapInput> {
  const args = parseArgs(process.argv.slice(2));

  if (args.help || args.h) {
    console.log(USAGE.trim());
    process.exit(0);
  }

  const canPrompt = Boolean(process.stdin.isTTY && process.stdout.isTTY);
  const rl = canPrompt ? createInterface({ input, output }) : null;

  try {
    const tenantName = String(args.name ?? '');
    const tenantSlug = String(args.slug ?? '');
    const planRaw = String(args.plan ?? 'STARTER').toUpperCase();
    const principalName = String(
      args['principal-name'] ?? args.principalName ?? '',
    );
    const principalEmail = String(
      args['principal-email'] ?? args.principalEmail ?? '',
    );
    const principalPassword = String(
      args['principal-password'] ?? args.principalPassword ?? '',
    );
    const billingEmail = String(
      args['billing-email'] ?? args.billingEmail ?? '',
    );
    const schemaNameArg = String(args['schema-name'] ?? args.schemaName ?? '');

    const finalTenantName =
      tenantName ||
      (rl ? await ask(rl, 'Organization name', 'My Organization') : '');

    const finalTenantSlug = normalizeSlug(
      tenantSlug ||
        (rl ? await ask(rl, 'Organization slug', finalTenantName) : ''),
    );

    const finalSchemaName = normalizeSchemaName(
      schemaNameArg || `tenant_${finalTenantSlug}`,
    );

    const finalPlan = planRaw as PlanValue;
    if (!['STARTER', 'PRO', 'ENTERPRISE'].includes(finalPlan)) {
      throw new Error('Invalid plan. Use STARTER, PRO, or ENTERPRISE.');
    }

    const finalPrincipalName =
      principalName || (rl ? await ask(rl, 'Principal name', 'Principal') : '');

    const finalPrincipalEmail =
      principalEmail || (rl ? await ask(rl, 'Principal email', '') : '');

    const finalBillingEmail = billingEmail || '';

    const finalPrincipalPassword =
      principalPassword ||
      (rl
        ? await ask(rl, 'Principal password', generatePassword())
        : generatePassword());

    if (!finalTenantName) throw new Error('Organization name is required.');
    if (!finalTenantSlug) throw new Error('Organization slug is required.');
    if (!finalPrincipalName) throw new Error('Principal name is required.');
    if (!finalPrincipalEmail) throw new Error('Principal email is required.');

    return {
      tenantName: finalTenantName,
      tenantSlug: finalTenantSlug,
      schemaName: finalSchemaName,
      plan: finalPlan,
      billingEmail: finalBillingEmail || undefined,
      principalName: finalPrincipalName,
      principalEmail: finalPrincipalEmail,
      principalPassword: finalPrincipalPassword,
    };
  } finally {
    if (rl) rl.close();
  }
}

async function ensureEnumValues(client: any) {
  const valuesToAdd = ['principal', 'admission_counselor', 'super_admin'];

  for (const value of valuesToAdd) {
    await client.query(
      `ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS '${value}'`,
    );
  }
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  const input = await collectInput();
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    const client = await pool.connect();

    try {
      await ensureEnumValues(client);
      await client.query('BEGIN');

      const existingTenant = await client.query(
        'SELECT id FROM public.tenants WHERE slug = $1 LIMIT 1',
        [input.tenantSlug],
      );

      if (existingTenant.rowCount && existingTenant.rowCount > 0) {
        throw new Error(
          `Tenant slug "${input.tenantSlug}" already exists. Choose a different slug.`,
        );
      }

      const existingPrincipal = await client.query(
        'SELECT id FROM tenant.users WHERE email = $1 LIMIT 1',
        [input.principalEmail],
      );

      if (existingPrincipal.rowCount && existingPrincipal.rowCount > 0) {
        throw new Error(
          `Principal email "${input.principalEmail}" already exists. Choose a different email.`,
        );
      }

      await client.query(
        `CREATE SCHEMA IF NOT EXISTS ${quoteIdent(input.schemaName)}`,
      );

      const tenantId = randomUUID();
      const tenantResult = await client.query(
        `INSERT INTO public.tenants
          (id, name, slug, plan, schema_name, billing_email)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, slug, schema_name, plan`,
        [
          tenantId,
          input.tenantName,
          input.tenantSlug,
          toDbPlan(input.plan),
          input.schemaName,
          input.billingEmail || null,
        ],
      );

      const passwordHash = await bcrypt.hash(input.principalPassword, 10);
      const principalRole = toDbRole('PRINCIPAL');

      const principalId = randomUUID();
      const principalResult = await client.query(
        `INSERT INTO tenant.users
          (id, name, email, password_hash, role, is_active)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, name, email, role, is_active, created_at`,
        [
          principalId,
          input.principalName,
          input.principalEmail,
          passwordHash,
          principalRole,
          true,
        ],
      );

      await client.query('COMMIT');

      const tenant = tenantResult.rows[0];
      const principal = principalResult.rows[0];

      console.log('\nOrganization created successfully.');
      console.log(`Tenant ID: ${tenant.id}`);
      console.log(`Tenant Name: ${tenant.name}`);
      console.log(`Tenant Slug: ${tenant.slug}`);
      console.log(`Schema Name: ${tenant.schema_name}`);
      console.log(`Plan: ${input.plan}`);
      console.log(`Principal ID: ${principal.id}`);
      console.log(`Principal Email: ${principal.email}`);
      console.log(`Principal Role: ${principal.role.toUpperCase()}`);
      console.log(`Principal Password: ${input.principalPassword}`);
      console.log('\nLogin endpoint: POST /auth/login');
      console.log(
        `Login payload: { "email": "${input.principalEmail}", "password": "${input.principalPassword}" }`,
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } finally {
    await pool.end();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\nOCS failed: ${message}`);
  process.exit(1);
});
