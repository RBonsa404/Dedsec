"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new client_1.PrismaClient();
async function testAuth() {
    console.log('🔍 Testing authentication...\n');
    const email = 'rachidbonsa707@gmail.com';
    const password = 'Dedsec@2024';
    console.log('Testing with credentials:');
    console.log('Email:', email);
    console.log('Password:', password);
    const user = await prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        console.log('❌ User not found in database');
        return;
    }
    console.log('\n✅ User found:');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Status:', user.status);
    console.log('Has password hash:', !!user.passwordHash);
    console.log('\n🔐 Testing password verification...');
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    console.log('Password valid:', isPasswordValid);
    if (!isPasswordValid) {
        console.log('❌ Password does not match!');
        console.log('This explains the "Invalid credentials" error');
    }
    else {
        console.log('✅ Password matches! Authentication should work');
    }
}
testAuth()
    .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=test-auth.js.map