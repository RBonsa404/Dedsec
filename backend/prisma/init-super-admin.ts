import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Vérification du compte SUPER_ADMIN...\n');

  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@dedsec.pro' },
  });

  if (existingAdmin) {
    console.log('✅ Le compte SUPER_ADMIN existe déjà.');
    console.log(`   Email: ${existingAdmin.email}`);
    console.log(`   Rôle: ${existingAdmin.role}`);
    console.log(`   Statut: ${existingAdmin.status}`);
    return;
  }

  console.log('📝 Création du compte SUPER_ADMIN...\n');

  const superAdminPasswordHash = await bcrypt.hash('Dedsec@2024', 12);

  const superAdmin = await prisma.user.create({
    data: {
      email: 'admin@dedsec.pro',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      passwordHash: superAdminPasswordHash,
      status: 'ACTIVE',
      theme: 'dark',
    },
  });

  console.log('🎉 Compte SUPER_ADMIN créé avec succès !');
  console.log(`   Email       : admin@dedsec.pro`);
  console.log(`   Mot de passe: Dedsec@2024`);
  console.log(`   ID          : ${superAdmin.id}`);
  console.log(`   Rôle        : SUPER_ADMIN`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
