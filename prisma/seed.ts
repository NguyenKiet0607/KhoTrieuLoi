import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('admin', 10);

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            hashedPassword: hashedPassword,
            role: 'ADMIN',
            name: 'Administrator',
            email: 'admin@trieuloi.vn', // Ensure email is set
        },
        create: {
            username: 'admin',
            hashedPassword: hashedPassword,
            role: 'ADMIN',
            name: 'Administrator',
            email: 'admin@trieuloi.vn',
        },
    });

    console.log({ admin });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
