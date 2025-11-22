const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAllAPIs() {
    console.log('🧪 Testing All API Endpoints\n');
    console.log('='.repeat(60));

    // Step 1: Login
    console.log('\n📝 Step 1: Login');
    try {
        const loginResponse = await axios.post(`${BASE_URL}/api/auth/login`, {
            identifier: 'admin@trieuloi.com',
            password: 'admin'
        });

        const token = loginResponse.data.token;
        const user = loginResponse.data.user;

        console.log('✅ Login successful!');
        console.log(`   User: ${user.name} (${user.email})`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Token: ${token.substring(0, 30)}...`);

        // Step 2: Test all API endpoints
        const endpoints = [
            { name: 'Products', url: '/api/products?page=1&limit=10' },
            { name: 'Categories', url: '/api/categories' },
            { name: 'Orders', url: '/api/orders?page=1&limit=10' },
            { name: 'Warehouses', url: '/api/warehouses' },
            { name: 'Users', url: '/api/users' },
            { name: 'Activity Logs', url: '/api/activity-logs?page=1&limit=10' },
            { name: 'Reports Summary', url: `/api/reports?type=summary&dateFrom=2024-01-01&dateTo=2024-12-31` },
            { name: 'Dashboard Stats', url: '/api/dashboard/stats' },
        ];

        console.log('\n📊 Step 2: Testing API Endpoints');
        console.log('='.repeat(60));

        const results = [];

        for (const endpoint of endpoints) {
            try {
                const response = await axios.get(`${BASE_URL}${endpoint.url}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const dataSize = JSON.stringify(response.data).length;
                console.log(`✅ ${endpoint.name.padEnd(20)} - Status: ${response.status} - Data: ${dataSize} bytes`);
                results.push({ endpoint: endpoint.name, status: 'SUCCESS', code: response.status });
            } catch (error) {
                const status = error.response?.status || 'ERROR';
                const message = error.response?.data?.error || error.message;
                console.log(`❌ ${endpoint.name.padEnd(20)} - Status: ${status} - Error: ${message}`);
                results.push({ endpoint: endpoint.name, status: 'FAILED', code: status, error: message });
            }
        }

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('📈 SUMMARY');
        console.log('='.repeat(60));

        const successful = results.filter(r => r.status === 'SUCCESS').length;
        const failed = results.filter(r => r.status === 'FAILED').length;

        console.log(`Total Endpoints: ${results.length}`);
        console.log(`✅ Successful: ${successful}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`Success Rate: ${((successful / results.length) * 100).toFixed(1)}%`);

        if (failed > 0) {
            console.log('\n❌ Failed Endpoints:');
            results.filter(r => r.status === 'FAILED').forEach(r => {
                console.log(`   - ${r.endpoint}: ${r.error}`);
            });
        }

    } catch (error) {
        console.log('❌ Login failed:', error.response?.data?.error || error.message);
        process.exit(1);
    }
}

testAllAPIs();
