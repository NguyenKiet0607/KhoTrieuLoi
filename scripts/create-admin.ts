import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    // Check if admin user exists
    const existingAdmin = await prisma.user.findFirst({
        where: { email: 'admin@admin.com' }
    });

    if (existingAdmin) {
        console.log('✓ Admin user already exists:', existingAdmin.email);
        console.log('  Name:', existingAdmin.name);
        console.log('  Role:', existingAdmin.role);
        return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin', 10);

    const admin = await prisma.user.create({
        data: {
            id: `user_${Date.now()}_admin`,
            username: 'admin',
            name: 'Administrator',
            email: 'admin@admin.com',
            hashedPassword,
            role: 'ADMIN',
            permissions: JSON.stringify({
                products: { view: true, create: true, edit: true, delete: true },
                orders: { view: true, create: true, edit: true, delete: true },
                stock: { view: true, create: true, edit: true, delete: true },
                reports: { view: true, create: true, edit: true, delete: true },
                users: { view: true, create: true, edit: true, delete: true },
            }),
            pagePermissions: '{}',
        }
    });

    console.log('✓ Admin user created successfully!');
    console.log('  Email:', admin.email);
    console.log('  Password: admin');
    console.log('  Role:', admin.role);
}

main()
    .catch((e) => {
        console.error('Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
