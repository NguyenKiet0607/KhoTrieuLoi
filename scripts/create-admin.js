const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        // Check if admin exists
        const existing = await prisma.user.findFirst({
            where: { OR: [{ email: 'admin@admin.com' }, { username: 'admin' }] }
        });

        if (existing) {
            console.log('✓ Admin user already exists');
            console.log('  Email:', existing.email);
            console.log('  Username:', existing.username);
            return;
        }

        // Create admin
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

        console.log('✓ Admin user created!');
        console.log('  Email: admin@admin.com');
        console.log('  Password: admin');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

createAdmin();
