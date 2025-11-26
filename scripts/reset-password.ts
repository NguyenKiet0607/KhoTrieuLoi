
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Checking users...');
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users.`);

    for (const user of users) {
        console.log(`- User: ${user.username} (${user.email})`);
    }

    const targetUsername = 'admin';
    const newPassword = 'password123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`\nResetting password for user "${targetUsername}" to "${newPassword}"...`);

    try {
        const updatedUser = await prisma.user.update({
            where: { username: targetUsername },
            data: { hashedPassword },
        });
        console.log('Password reset successful for:', updatedUser.email);
    } catch (error) {
        console.error('Error resetting password:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
