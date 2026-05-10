import { PrismaClient } from './src/generated/prisma/client.js';
import * as bcrypt from 'bcrypt';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL is not set');

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: { passwordHash: hash },
    create: {
      email: 'admin@school.com',
      name: 'Admin User',
      passwordHash: hash,
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Admin user ready!');
  console.log('Email: admin@school.com');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
