const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function checkUsers() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                role: true,
                hashedPassword: true
            }
        });

        console.log(`\n✓ Found ${users.length} users in database:\n`);

        for (const user of users) {
            console.log(`  Email: ${user.email}`);
            console.log(`  Username: ${user.username || 'N/A'}`);
            console.log(`  Name: ${user.name}`);
            console.log(`  Role: ${user.role}`);

            // Test if password 'admin' works
            const isAdminPassword = await bcrypt.compare('admin', user.hashedPassword);
            console.log(`  Password 'admin' works: ${isAdminPassword ? 'YES ✓' : 'NO ✗'}`);
            console.log('  ---');
        }

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
