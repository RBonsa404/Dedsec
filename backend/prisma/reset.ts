import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Nettoyage complet de la base de données...\n');

  // Suppression dans l'ordre pour respecter les contraintes FK
  await prisma.activityLog.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.announcement.deleteMany({});
  await prisma.checklistItem.deleteMany({});
  await prisma.checklist.deleteMany({});
  await prisma.comment.deleteMany({});
  await prisma.attachment.deleteMany({});
  await prisma.taskLabel.deleteMany({});
  await prisma.label.deleteMany({});
  await prisma.taskDependency.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.deliverable.deleteMany({});
  await prisma.absenceRequest.deleteMany({});
  await prisma.column.deleteMany({});
  await prisma.board.deleteMany({});
  await prisma.projectMember.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('✅ Base de données vidée.\n');

  // Création du compte SUPER_ADMIN
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
