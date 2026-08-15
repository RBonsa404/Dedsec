"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🔧 Resetting password for user...\n');
    const email = process.argv[2];
    const newPassword = process.argv[3];
    if (!email || !newPassword) {
        console.log('Usage: npx ts-node prisma/reset-password.ts <email> <new-password>');
        process.exit(1);
    }
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        console.log('❌ User not found:', email);
        return;
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
        where: { email },
        data: {
            passwordHash,
            status: 'ACTIVE',
        },
    });
    console.log('✅ Password reset successfully!');
    console.log('   Email:', email);
    console.log('   Status: ACTIVE');
    console.log('   Please log in with your new password.');
}
main()
    .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=reset-password.js.map