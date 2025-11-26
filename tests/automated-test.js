// Automated Test Suite for Kho Trieu Loi
// Run with: node tests/automated-test.js

const { chromium } = require('playwright');

const BASE_URL = 'http://localhost:3000';
const TEST_USER = { username: 'admin', password: '123456' };

let browser, page, context;

// Test results
const results = {
    passed: [],
    failed: [],
    skipped: []
};

// Helper functions
async function login() {
    console.log('🔐 Logging in...');
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[type="text"]', TEST_USER.username);
    await page.fill('input[type="password"]', TEST_USER.password);
    await page.click('button:has-text("Đăng nhập")');
    await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 5000 });
    console.log('✅ Login successful\n');
}

async function testPage(name, url, checks) {
    try {
        console.log(`📄 Testing ${name}...`);
        await page.goto(`${BASE_URL}${url}`, { waitUntil: 'networkidle' });

        for (const check of checks) {
            await check();
        }

        results.passed.push(name);
        console.log(`✅ ${name} - PASSED\n`);
    } catch (error) {
        results.failed.push({ name, error: error.message });
        console.log(`❌ ${name} - FAILED: ${error.message}\n`);
    }
}

async function runTests() {
    console.log('🚀 Starting Automated Test Suite\n');
    console.log('='.repeat(50) + '\n');

    try {
        // Setup
        browser = await chromium.launch({ headless: false });
        context = await browser.newContext();
        page = await context.newPage();

        // Login
        await login();

        // Test 1: Dashboard
        await testPage('Dashboard', '/dashboard', [
            async () => {
                await page.waitForSelector('text=Tổng sản phẩm');
                await page.waitForSelector('text=Giá trị tồn kho');
                await page.waitForSelector('text=Sản phẩm sắp hết');
                await page.waitForSelector('text=Đơn hàng chờ');
            }
        ]);

        // Test 2: Products List
        await testPage('Products - List', '/products', [
            async () => {
                await page.waitForSelector('text=Quản lý sản phẩm', { timeout: 5000 });
                const productCount = await page.locator('tbody tr').count();
                if (productCount === 0) throw new Error('No products found');
            }
        ]);

        // Test 3: Products Search
        await testPage('Products - Search', '/products', [
            async () => {
                await page.fill('input[placeholder*="Tìm kiếm"]', 'Xi');
                await page.waitForTimeout(1000);
                const results = await page.locator('tbody tr').count();
                if (results === 0) throw new Error('Search returned no results');
            }
        ]);

        // Test 4: Products Create Modal
        await testPage('Products - Create Modal', '/products', [
            async () => {
                await page.click('button:has-text("Thêm mới")');
                await page.waitForSelector('text=Thêm sản phẩm mới', { timeout: 3000 });
                await page.click('button:has-text("Hủy")');
            }
        ]);

        // Test 5: Inventory Overview
        await testPage('Inventory - Overview', '/inventory/overview', [
            async () => {
                await page.waitForSelector('text=Tổng quan tồn kho');
            }
        ]);

        // Test 6: Inventory Adjustments
        await testPage('Inventory - Adjustments', '/inventory/adjustments', [
            async () => {
                await page.waitForSelector('text=Điều chỉnh tồn kho');
            }
        ]);

        // Test 7: Orders List
        await testPage('Orders - List', '/orders', [
            async () => {
                await page.waitForSelector('text=Quản lý đơn hàng');
            }
        ]);

        // Test 8: Orders Create Form
        await testPage('Orders - Create Form', '/orders/new', [
            async () => {
                await page.waitForSelector('text=Tạo Đơn Hàng Mới');
                await page.waitForSelector('input[name="customerName"]');
                await page.waitForSelector('button:has-text("Thêm Sản Phẩm")');
            }
        ]);

        // Test 9: Orders - Add Product
        await testPage('Orders - Add Product', '/orders/new', [
            async () => {
                await page.click('button:has-text("Thêm Sản Phẩm")');
                await page.waitForTimeout(500);
                const rows = await page.locator('tbody tr').count();
                if (rows === 0) throw new Error('Product row not added');
            }
        ]);

        // Test 10: Receipts
        await testPage('Receipts', '/receipts', [
            async () => {
                await page.waitForSelector('text=Phiếu nhập kho');
            }
        ]);

        // Test 11: Issues
        await testPage('Issues', '/issues', [
            async () => {
                await page.waitForSelector('text=Phiếu xuất kho');
            }
        ]);

        // Test 12: Transfers
        await testPage('Transfers', '/transfers', [
            async () => {
                await page.waitForSelector('text=Phiếu chuyển kho');
            }
        ]);

        // Test 13: Customers
        await testPage('Customers', '/customers', [
            async () => {
                await page.waitForSelector('text=Quản lý khách hàng');
            }
        ]);

        // Test 14: Suppliers
        await testPage('Suppliers', '/suppliers', [
            async () => {
                await page.waitForSelector('text=Quản lý nhà cung cấp');
            }
        ]);

        // Test 15: Warehouses
        await testPage('Warehouses', '/warehouses', [
            async () => {
                await page.waitForSelector('text=Quản lý kho');
            }
        ]);

        // Test 16: Navigation - Quick Actions
        await testPage('Navigation - Quick Actions', '/dashboard', [
            async () => {
                await page.click('text=Tạo đơn hàng');
                await page.waitForURL(`${BASE_URL}/orders/new`);
                await page.goBack();
            }
        ]);

        // Test 17: Console Errors Check
        const consoleErrors = [];
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        await page.goto(`${BASE_URL}/dashboard`);
        await page.waitForTimeout(2000);

        if (consoleErrors.length > 0) {
            console.log('⚠️  Console Errors Found:');
            consoleErrors.forEach(err => console.log(`   - ${err}`));
        } else {
            results.passed.push('Console Errors Check');
            console.log('✅ Console Errors Check - PASSED\n');
        }

    } catch (error) {
        console.error('❌ Test suite failed:', error);
    } finally {
        // Cleanup
        if (browser) {
            await browser.close();
        }

        // Print summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 TEST SUMMARY');
        console.log('='.repeat(50));
        console.log(`✅ Passed: ${results.passed.length}`);
        console.log(`❌ Failed: ${results.failed.length}`);
        console.log(`⏭️  Skipped: ${results.skipped.length}`);
        console.log('='.repeat(50));

        if (results.passed.length > 0) {
            console.log('\n✅ Passed Tests:');
            results.passed.forEach(test => console.log(`   - ${test}`));
        }

        if (results.failed.length > 0) {
            console.log('\n❌ Failed Tests:');
            results.failed.forEach(({ name, error }) => {
                console.log(`   - ${name}: ${error}`);
            });
        }

        console.log('\n🏁 Test suite completed!\n');

        // Exit with appropriate code
        process.exit(results.failed.length > 0 ? 1 : 0);
    }
}

// Run tests
runTests();
