"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_test_1 = require("node:test");
const assert = require("assert");
const bcrypt = require("bcrypt");
(0, node_test_1.describe)('DEDSEC Security & Authentication Protocols', () => {
    (0, node_test_1.test)('Passphrase hashing and verification with bcrypt', async () => {
        const password = 'DedsecSecurePass@2026';
        const hash = await bcrypt.hash(password, 10);
        assert.notStrictEqual(password, hash);
        const isMatch = await bcrypt.compare(password, hash);
        assert.strictEqual(isMatch, true);
        const isWrongMatch = await bcrypt.compare('WrongPassword', hash);
        assert.strictEqual(isWrongMatch, false);
    });
    (0, node_test_1.test)('Storage quota threshold calculation', () => {
        const quotaMb = 500;
        const usedMb = 420;
        const percentage = Math.round((usedMb / quotaMb) * 100);
        assert.strictEqual(percentage, 84);
        assert.strictEqual(percentage >= 80, true);
    });
    (0, node_test_1.test)('Role clearance hierarchy validation', () => {
        const roles = ['ADMIN', 'PROJECT_MANAGER', 'TEAM_MEMBER'];
        assert.strictEqual(roles.includes('ADMIN'), true);
        assert.strictEqual(roles.includes('GUEST'), false);
    });
});
//# sourceMappingURL=auth.test.js.map