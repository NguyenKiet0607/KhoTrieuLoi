const routes = [
    '/api/products',
    '/api/customers',
    '/api/warehouses',
    '/api/orders',
    '/api/receipts',
    '/api/issues',
    '/api/transfers',
    '/api/categories',
    '/api/suppliers',
];

async function testRoutes() {
    const token = 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOiJjbWh0MmJxNWswMDAwazVtY3Q3cXRlYnN3Iiwicm9sZSI6IkFETUlOIiwibmFtZSI6IkFkbWluIiwiaWF0IjoxNzMyMjY0MzY3fQ.kH4wZPOqkECLHhqGQmJhKqJLQJNZfLJqKqJLQJNZfLI';

    for (const route of routes) {
        try {
            const response = await fetch(`http://localhost:3000${route}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            console.log(`✓ ${route}: ${response.status}`, Array.isArray(data) ? `${data.length} items` : typeof data);
        } catch (error) {
            console.error(`✗ ${route}:`, error.message);
        }
    }
}

testRoutes();
