const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function resetAdminPassword() {
    try {
        const hashedPassword = await bcrypt.hash('admin', 10);

        const admin = await prisma.user.update({
            where: { email: 'admin@trieuloi.com' },
            data: { hashedPassword }
        });

        console.log('✓ Password reset successfully!');
        console.log('  Email: admin@trieuloi.com');
        console.log('  Password: admin');
        console.log('  Role:', admin.role);

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdminPassword();
