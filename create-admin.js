const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('123456', 10);

    try {
        const user = await prisma.user.upsert({
            where: { username: 'admin' },
            update: {
                hashedPassword: hashedPassword,
                role: 'ADMIN',
                permissions: '["ALL"]',
            },
            create: {
                id: 'admin_user_id',
                username: 'admin',
                name: 'Administrator',
                email: 'admin@example.com',
                hashedPassword: hashedPassword,
                role: 'ADMIN',
                permissions: '["ALL"]',
            },
        });
        console.log('User created/updated:', user);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
