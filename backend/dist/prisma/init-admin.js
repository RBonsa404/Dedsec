"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const enums_1 = require("../src/common/enums");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔧 Initializing admin user for production...\n');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@dedsec.io';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Dedsec@2024';
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });
    if (existingAdmin) {
        console.log('✅ Admin user already exists:', adminEmail);
        console.log('   Status:', existingAdmin.status);
        return;
    }
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            firstName: 'System',
            lastName: 'Admin',
            role: enums_1.Role.ADMIN,
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
//# sourceMappingURL=init-admin.js.map