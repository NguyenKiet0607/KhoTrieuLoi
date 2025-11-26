import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const productCount = await prisma.product.count();
    console.log(`Total products: ${productCount}`);

    const customerCount = await prisma.customer.count();
    console.log(`Total customers: ${customerCount}`);

    if (productCount > 0) {
        const products = await prisma.product.findMany({ take: 5 });
        console.log('Sample products:', products.map(p => ({ id: p.id, name: p.name, code: p.code })));
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
