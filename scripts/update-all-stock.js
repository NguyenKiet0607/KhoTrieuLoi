const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Starting stock update...');

        // Get the default warehouse
        const warehouse = await prisma.warehouse.findFirst();
        if (!warehouse) {
            console.error('No warehouse found!');
            return;
        }
        console.log(`Using warehouse: ${warehouse.name} (${warehouse.id})`);

        // Get all products
        const products = await prisma.product.findMany();
        console.log(`Found ${products.length} products.`);

        let updatedCount = 0;

        for (const product of products) {
            await prisma.stockItem.upsert({
                where: {
                    productId_warehouseId: {
                        productId: product.id,
                        warehouseId: warehouse.id
                    }
                },
                update: {
                    quantity: 10
                },
                create: {
                    id: `STOCK-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    productId: product.id,
                    warehouseId: warehouse.id,
                    quantity: 10,
                    updatedAt: new Date()
                }
            });
            updatedCount++;
            if (updatedCount % 10 === 0) process.stdout.write('.');
        }

        console.log(`\nSuccessfully updated stock for ${updatedCount} products to 10.`);

    } catch (error) {
        console.error('Error updating stock:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
