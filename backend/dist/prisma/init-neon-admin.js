"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const enums_1 = require("../src/common/enums");
const bcrypt = require("bcrypt");
const neonDbUrl = 'postgresql://neondb_owner:npg_AcnaWUfJ5X3x@ep-sweet-violet-b233stio.c-6.eu-central-1.aws.neon.tech/neondb?sslmode=require';
const prisma = new client_1.PrismaClient({
    datasources: {
        db: {
            url: neonDbUrl,
        },
    },
});
async function main() {
    console.log('🔧 Connecting to Neon database...\n');
    try {
        await prisma.$connect();
        console.log('✅ Connected to Neon database');
        const existingAdmin = await prisma.user.findUnique({
            where: { email: 'rachidbonsa707@gmail.com' },
        });
        if (existingAdmin) {
            console.log('✅ Admin user already exists: rachidbonsa707@gmail.com');
            console.log('   Status:', existingAdmin.status);
            const passwordHash = await bcrypt.hash('Dedsec@2024', 12);
            await prisma.user.update({
                where: { email: 'rachidbonsa707@gmail.com' },
                data: {
                    passwordHash,
                    status: 'ACTIVE',
                },
            });
            console.log('✅ Password reset to: Dedsec@2024');
        }
        else {
            const passwordHash = await bcrypt.hash('Dedsec@2024', 12);
            const admin = await prisma.user.create({
                data: {
                    email: 'rachidbonsa707@gmail.com',
                    firstName: 'Rachid',
                    lastName: 'Bonsa',
                    role: enums_1.Role.ADMIN,
                    passwordHash: passwordHash,
                    status: 'ACTIVE',
                    theme: 'dark',
                },
            });
            console.log('✅ Admin user created successfully!');
            console.log('   Email: rachidbonsa707@gmail.com');
            console.log('   Password: Dedsec@2024');
            console.log('   Status: ACTIVE');
            console.log('   Role: ADMIN');
        }
        const verifyUser = await prisma.user.findUnique({
            where: { email: 'rachidbonsa707@gmail.com' },
        });
        console.log('\n🔍 Verification:');
        console.log('User exists:', !!verifyUser);
        console.log('Status:', verifyUser?.status);
        console.log('Role:', verifyUser?.role);
    }
    catch (error) {
        console.error('❌ Error:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
main()
    .catch((e) => {
    console.error('❌ Failed to initialize admin in Neon:', e);
    process.exit(1);
});
//# sourceMappingURL=init-neon-admin.js.map