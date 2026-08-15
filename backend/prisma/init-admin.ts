import { PrismaClient } from '@prisma/client';
import { Role } from '../src/common/enums';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Initializing admin user for production...\n');

  // Get credentials from environment variables
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@dedsec.io';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Dedsec@2024';

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists:', adminEmail);
    console.log('   Status:', existingAdmin.status);
    return;
  }

  // Create admin user
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      firstName: 'System',
      lastName: 'Admin',
      role: Role.ADMIN,
      passwordHash: passwordHash,
      status: 'ACTIVE',
      theme: 'dark',
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log('   Email:', adminEmail);
  console.log('   Status: ACTIVE');
  console.log('   Role: ADMIN');
}

main()
  .catch((e) => {
    console.error('❌ Failed to initialize admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });