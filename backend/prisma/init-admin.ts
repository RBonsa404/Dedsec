import { PrismaClient } from '@prisma/client';
import { Role } from '../src/common/enums';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Initializing admin user for production...\n');

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@dedsec.io' },
  });

  if (existingAdmin) {
    console.log('✅ Admin user already exists: admin@dedsec.io');
    console.log('   Status:', existingAdmin.status);
    return;
  }

  // Create admin user
  const adminPassword = await bcrypt.hash('Dedsec@2024', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dedsec.io',
      firstName: 'System',
      lastName: 'Admin',
      role: Role.ADMIN,
      passwordHash: adminPassword,
      status: 'ACTIVE',
      theme: 'dark',
    },
  });

  console.log('✅ Admin user created successfully!');
  console.log('   Email: admin@dedsec.io');
  console.log('   Password: Dedsec@2024');
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