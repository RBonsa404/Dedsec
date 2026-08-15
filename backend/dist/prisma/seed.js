"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const enums_1 = require("../src/common/enums");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding DEDSEC database...\n');
    const adminPassword = await bcrypt.hash('Dedsec@2024', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@dedsec.io' },
        update: {},
        create: {
            email: 'admin@dedsec.io',
            firstName: 'System',
            lastName: 'Admin',
            role: enums_1.Role.ADMIN,
            passwordHash: adminPassword,
            status: 'PENDING_PASSWORD_CHANGE',
            theme: 'dark',
        },
    });
    console.log(`✅ Admin: admin@dedsec.io / Dedsec@2024`);
    const pmPassword = await bcrypt.hash('Manager@2024', 12);
    const pm = await prisma.user.upsert({
        where: { email: 'sophie.martin@dedsec.io' },
        update: {},
        create: {
            email: 'sophie.martin@dedsec.io',
            firstName: 'Sophie',
            lastName: 'Martin',
            role: enums_1.Role.PROJECT_MANAGER,
            passwordHash: pmPassword,
            status: 'ACTIVE',
            theme: 'dark',
            bio: 'Chef de projet senior, spécialisée en gestion agile.',
            createdById: admin.id,
        },
    });
    console.log(`✅ PM: sophie.martin@dedsec.io / Manager@2024`);
    const memberPassword = await bcrypt.hash('Member@2024', 12);
    const member1 = await prisma.user.upsert({
        where: { email: 'alex.dupont@dedsec.io' },
        update: {},
        create: {
            email: 'alex.dupont@dedsec.io',
            firstName: 'Alex',
            lastName: 'Dupont',
            role: enums_1.Role.TEAM_MEMBER,
            passwordHash: memberPassword,
            status: 'ACTIVE',
            theme: 'dark',
            bio: 'Développeur full-stack, expert React & Node.js.',
            createdById: pm.id,
        },
    });
    const member2 = await prisma.user.upsert({
        where: { email: 'lina.chen@dedsec.io' },
        update: {},
        create: {
            email: 'lina.chen@dedsec.io',
            firstName: 'Lina',
            lastName: 'Chen',
            role: enums_1.Role.TEAM_MEMBER,
            passwordHash: memberPassword,
            status: 'ACTIVE',
            theme: 'dark',
            bio: 'Designer UX/UI, passionnée par les interfaces intuitives.',
            createdById: pm.id,
        },
    });
    const member3 = await prisma.user.upsert({
        where: { email: 'omar.benali@dedsec.io' },
        update: {},
        create: {
            email: 'omar.benali@dedsec.io',
            firstName: 'Omar',
            lastName: 'Benali',
            role: enums_1.Role.TEAM_MEMBER,
            passwordHash: memberPassword,
            status: 'ACTIVE',
            theme: 'dark',
            bio: 'DevOps engineer, automatisation et CI/CD.',
            createdById: pm.id,
        },
    });
    console.log(`✅ Members: alex.dupont / lina.chen / omar.benali @dedsec.io / Member@2024`);
    const project = await prisma.project.create({
        data: {
            name: 'Projet Phoenix',
            description: 'Refonte complète de la plateforme client avec nouveau design system et migration API.',
            members: {
                create: [
                    { userId: pm.id, isManager: true },
                    { userId: member1.id },
                    { userId: member2.id },
                    { userId: member3.id },
                ],
            },
            labels: {
                create: [
                    { name: 'Bug', color: '#ff3366' },
                    { name: 'Feature', color: '#00d4ff' },
                    { name: 'Urgent', color: '#ff6600' },
                    { name: 'Documentation', color: '#aa66ff' },
                    { name: 'Design', color: '#ff66aa' },
                    { name: 'Backend', color: '#00ff88' },
                    { name: 'Frontend', color: '#ffaa00' },
                ],
            },
        },
    });
    console.log(`✅ Project: ${project.name}`);
    const board = await prisma.board.create({
        data: {
            name: 'Main Board',
            projectId: project.id,
            columns: {
                create: [
                    { name: 'Backlog', position: 0, color: '#555566' },
                    { name: 'À faire', position: 1, color: '#8888a0' },
                    { name: 'En cours', position: 2, color: '#00d4ff' },
                    { name: 'En révision', position: 3, color: '#ffaa00' },
                    { name: 'Terminé', position: 4, color: '#00ff88' },
                ],
            },
        },
        include: { columns: { orderBy: { position: 'asc' } } },
    });
    const [backlog, todo, inProgress, review, done] = board.columns;
    const labels = await prisma.label.findMany({ where: { projectId: project.id } });
    const labelMap = Object.fromEntries(labels.map(l => [l.name, l.id]));
    const task1 = await prisma.task.create({
        data: {
            title: 'Audit de performance de l\'API existante',
            description: 'Analyser les endpoints les plus lents et identifier les bottlenecks. Utiliser les métriques APM actuelles.',
            columnId: backlog.id,
            position: 0,
            priority: 'MEDIUM',
            creatorId: pm.id,
            estimatedHours: 8,
        },
    });
    const task2 = await prisma.task.create({
        data: {
            title: 'Migration base de données vers PostgreSQL 16',
            description: 'Planifier et exécuter la migration. Tester la compatibilité avec toutes les requêtes existantes.',
            columnId: backlog.id,
            position: 1,
            priority: 'HIGH',
            creatorId: pm.id,
            assigneeId: member3.id,
            estimatedHours: 16,
            dueDate: new Date('2026-09-01'),
        },
    });
    const task3 = await prisma.task.create({
        data: {
            title: 'Maquettes du nouveau dashboard',
            description: 'Créer les maquettes Figma pour le dashboard principal avec les widgets de statistiques.',
            columnId: todo.id,
            position: 0,
            priority: 'HIGH',
            creatorId: pm.id,
            assigneeId: member2.id,
            estimatedHours: 12,
            dueDate: new Date('2026-08-25'),
        },
    });
    const task4 = await prisma.task.create({
        data: {
            title: 'Système d\'authentification JWT',
            description: 'Implémenter le flow complet : login, refresh token, mot de passe oublié, changement obligatoire.',
            columnId: todo.id,
            position: 1,
            priority: 'URGENT',
            creatorId: pm.id,
            assigneeId: member1.id,
            estimatedHours: 20,
            dueDate: new Date('2026-08-20'),
        },
    });
    const task5 = await prisma.task.create({
        data: {
            title: 'Configuration CI/CD pipeline',
            description: 'Mettre en place GitHub Actions avec build, test, lint, et déploiement automatique sur staging.',
            columnId: inProgress.id,
            position: 0,
            priority: 'HIGH',
            creatorId: pm.id,
            assigneeId: member3.id,
            startDate: new Date('2026-08-10'),
            estimatedHours: 10,
            dueDate: new Date('2026-08-18'),
        },
    });
    const task6 = await prisma.task.create({
        data: {
            title: 'Design system — composants de base',
            description: 'Créer les composants Button, Input, Card, Modal, Badge avec les variantes dark/light.',
            columnId: inProgress.id,
            position: 1,
            priority: 'HIGH',
            creatorId: pm.id,
            assigneeId: member2.id,
            startDate: new Date('2026-08-12'),
            estimatedHours: 16,
            dueDate: new Date('2026-08-22'),
        },
    });
    const task7 = await prisma.task.create({
        data: {
            title: 'API CRUD Utilisateurs',
            description: 'Endpoints REST pour la gestion des utilisateurs avec filtres, pagination, et rôles.',
            columnId: review.id,
            position: 0,
            priority: 'MEDIUM',
            creatorId: pm.id,
            assigneeId: member1.id,
            estimatedHours: 8,
        },
    });
    const task8 = await prisma.task.create({
        data: {
            title: 'Setup initial du monorepo',
            description: 'Initialiser NestJS backend + Next.js frontend avec TypeScript strict.',
            columnId: done.id,
            position: 0,
            priority: 'HIGH',
            creatorId: pm.id,
            assigneeId: member1.id,
            completedAt: new Date('2026-08-05'),
            estimatedHours: 4,
        },
    });
    const task9 = await prisma.task.create({
        data: {
            title: 'Schéma Prisma complet',
            description: 'Définir le modèle de données couvrant users, projects, tasks, checklists, comments, etc.',
            columnId: done.id,
            position: 1,
            priority: 'HIGH',
            creatorId: pm.id,
            assigneeId: member1.id,
            completedAt: new Date('2026-08-08'),
            estimatedHours: 6,
        },
    });
    console.log(`✅ Created 9 tasks across all columns`);
    await prisma.taskLabel.createMany({
        data: [
            { taskId: task1.id, labelId: labelMap['Backend'] },
            { taskId: task2.id, labelId: labelMap['Backend'] },
            { taskId: task2.id, labelId: labelMap['Urgent'] },
            { taskId: task3.id, labelId: labelMap['Design'] },
            { taskId: task4.id, labelId: labelMap['Backend'] },
            { taskId: task4.id, labelId: labelMap['Feature'] },
            { taskId: task5.id, labelId: labelMap['Backend'] },
            { taskId: task6.id, labelId: labelMap['Design'] },
            { taskId: task6.id, labelId: labelMap['Frontend'] },
            { taskId: task7.id, labelId: labelMap['Backend'] },
            { taskId: task7.id, labelId: labelMap['Feature'] },
            { taskId: task8.id, labelId: labelMap['Backend'] },
            { taskId: task9.id, labelId: labelMap['Documentation'] },
        ],
    });
    console.log(`✅ Labels assigned to tasks`);
    const checklist1 = await prisma.checklist.create({
        data: {
            title: 'Steps',
            taskId: task4.id,
            items: {
                create: [
                    { text: 'Implement JWT token generation', position: 0, isCompleted: true },
                    { text: 'Add refresh token rotation', position: 1, isCompleted: true },
                    { text: 'Create forgot password flow', position: 2, isCompleted: false },
                    { text: 'Add forced password change on first login', position: 3, isCompleted: false },
                    { text: 'Write unit tests', position: 4, isCompleted: false },
                ],
            },
        },
    });
    const checklist2 = await prisma.checklist.create({
        data: {
            title: 'CI/CD Steps',
            taskId: task5.id,
            items: {
                create: [
                    { text: 'Create GitHub Actions workflow file', position: 0, isCompleted: true },
                    { text: 'Add build step', position: 1, isCompleted: true },
                    { text: 'Add lint step', position: 2, isCompleted: true },
                    { text: 'Add test step', position: 3, isCompleted: false },
                    { text: 'Configure staging deployment', position: 4, isCompleted: false },
                ],
            },
        },
    });
    console.log(`✅ Checklists created`);
    await prisma.comment.createMany({
        data: [
            {
                content: 'J\'ai commencé l\'analyse des endpoints. Les requêtes de listing sont les plus lentes, surtout avec les joins N+1.',
                taskId: task1.id,
                authorId: member1.id,
            },
            {
                content: 'Bonne observation. On devrait utiliser le DataLoader pattern pour les requêtes imbriquées.',
                taskId: task1.id,
                authorId: pm.id,
            },
            {
                content: 'Les maquettes du header et de la sidebar sont prêtes. Je continue avec les widgets de stats.',
                taskId: task3.id,
                authorId: member2.id,
            },
            {
                content: 'Le refresh token rotation fonctionne. Il me reste le flow forgot password.',
                taskId: task4.id,
                authorId: member1.id,
            },
            {
                content: 'Pipeline build+lint OK. Je travaille sur l\'étape de tests maintenant.',
                taskId: task5.id,
                authorId: member3.id,
            },
        ],
    });
    console.log(`✅ Comments added`);
    await prisma.milestone.create({
        data: {
            name: 'MVP v1.0',
            description: 'Première version fonctionnelle avec auth, kanban, et gestion de projets.',
            dueDate: new Date('2026-09-15'),
            projectId: project.id,
        },
    });
    console.log(`✅ Milestone created`);
    await prisma.announcement.create({
        data: {
            title: '🚀 Bienvenue sur DEDSEC',
            content: 'La plateforme de gestion de projet est maintenant en ligne. N\'hésitez pas à explorer les fonctionnalités et à remonter vos retours.',
        },
    });
    console.log(`✅ Announcement created`);
    await prisma.notification.createMany({
        data: [
            {
                type: 'TASK_ASSIGNED',
                title: 'Nouvelle tâche assignée',
                message: 'Sophie vous a assigné la tâche "Système d\'authentification JWT"',
                userId: member1.id,
                link: `/projects/${project.id}/board`,
            },
            {
                type: 'TASK_DUE_SOON',
                title: 'Échéance proche',
                message: 'La tâche "Configuration CI/CD pipeline" est due dans 4 jours',
                userId: member3.id,
                link: `/projects/${project.id}/board`,
            },
            {
                type: 'COMMENT_ADDED',
                title: 'Nouveau commentaire',
                message: 'Sophie a commenté sur "Audit de performance de l\'API"',
                userId: member1.id,
                link: `/projects/${project.id}/board`,
            },
        ],
    });
    console.log(`✅ Notifications created`);
    console.log('\n══════════════════════════════════════');
    console.log('  🔒 DEDSEC — Seed completed!');
    console.log('══════════════════════════════════════');
    console.log('\n  Accounts:');
    console.log('  ├── Admin:   admin@dedsec.io / Dedsec@2024');
    console.log('  ├── PM:      sophie.martin@dedsec.io / Manager@2024');
    console.log('  ├── Member:  alex.dupont@dedsec.io / Member@2024');
    console.log('  ├── Member:  lina.chen@dedsec.io / Member@2024');
    console.log('  └── Member:  omar.benali@dedsec.io / Member@2024\n');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map