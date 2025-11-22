# Kho Triệu Lợi - Warehouse Management System

Hệ thống quản lý kho hàng toàn diện cho Công ty Triệu Lợi.

## 🚀 Tính năng

### Quản lý cơ bản
- ✅ **Sản phẩm**: Quản lý danh mục sản phẩm, giá cả, đơn vị tính
- ✅ **Danh mục**: Phân loại sản phẩm theo danh mục
- ✅ **Kho hàng**: Quản lý nhiều kho, theo dõi tồn kho
- ✅ **Đơn hàng**: Tạo và quản lý đơn hàng bán

### Quản lý kho
- ✅ **Nhập kho**: Phiếu nhập hàng từ nhà cung cấp
- ✅ **Xuất kho**: Phiếu xuất hàng cho khách hàng
- ✅ **Chuyển kho**: Di chuyển hàng giữa các kho
- ✅ **Tồn kho**: Theo dõi chi tiết tồn kho theo sản phẩm và kho

### Quản lý người dùng
- ✅ **Phân quyền**: Hệ thống phân quyền chi tiết (ADMIN, USER)
- ✅ **Người dùng**: Quản lý tài khoản người dùng
- ✅ **Nhật ký**: Theo dõi hoạt động của người dùng

### Báo cáo & Thống kê
- ✅ **Dashboard**: Tổng quan thống kê
- ✅ **Báo cáo**: Báo cáo doanh thu, tồn kho, xuất nhập
- ✅ **Sao lưu**: Tự động sao lưu dữ liệu

## 🛠️ Công nghệ sử dụng

- **Framework**: Next.js 14.1.0
- **Database**: SQLite với Prisma ORM 5.22.0
- **Authentication**: JWT với jose
- **UI**: React, Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **State Management**: Zustand
- **HTTP Client**: Axios

## 📦 Cài đặt

### Yêu cầu
- Node.js 18+ 
- npm hoặc yarn

### Các bước cài đặt

1. **Clone repository**
```bash
git clone git@github.com:NguyenKiet0607/KhoTrieuLoi.git
cd KhoTrieuLoi
```

2. **Cài đặt dependencies**
```bash
npm install
```

3. **Tạo file .env**
```bash
cp .env.example .env
```

Cập nhật các biến môi trường:
```env
JWT_SECRET=your-secret-key-here
DATABASE_URL="file:./prisma/dev.db"
```

4. **Khởi tạo database**
```bash
npx prisma generate
npx prisma db push
```

5. **Tạo admin user**
```bash
node scripts/create-admin.js
```

Thông tin đăng nhập mặc định:
- Email: `admin@trieuloi.com`
- Password: `admin`

6. **Chạy development server**
```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem ứng dụng.

## 📁 Cấu trúc thư mục

```
kho-trieu-loi/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── admin/             # Admin pages
│   ├── products/          # Product management
│   ├── orders/            # Order management
│   ├── warehouses/        # Warehouse management
│   └── ...
├── components/            # React components
│   ├── forms/            # Form components
│   ├── ui/               # UI components
│   └── ...
├── lib/                   # Utility libraries
│   ├── api.ts            # API client
│   ├── auth.ts           # Authentication
│   └── prisma.ts         # Prisma client
├── prisma/               # Database schema
│   └── schema.prisma     # Prisma schema
├── stores/               # Zustand stores
└── scripts/              # Utility scripts
```

## 🔐 Phân quyền

### ADMIN
- Toàn quyền quản lý hệ thống
- Quản lý người dùng và phân quyền
- Xem nhật ký hoạt động
- Sao lưu và khôi phục dữ liệu

### USER
- Quản lý sản phẩm, đơn hàng, kho
- Nhập/xuất/chuyển kho
- Xem báo cáo

## 📊 Database Schema

Xem chi tiết schema tại `prisma/schema.prisma`

Các model chính:
- User
- Product
- Category
- Warehouse
- Order
- StockItem
- StockReceipt
- StockIssue
- StockTransfer
- ActivityLog

## 🧪 Testing

### Test API endpoints
```bash
node scripts/test-all-apis.js
```

### Reset admin password
```bash
node scripts/reset-admin-password.js
```

### Check users
```bash
node scripts/check-users.js
```

## 📝 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm start` - Chạy production server
- `npm run lint` - Chạy ESLint

## 🔧 Cấu hình

### Environment Variables

```env
# JWT Secret for authentication
JWT_SECRET=your-secret-key

# Database URL
DATABASE_URL="file:./prisma/dev.db"

# Port (optional)
PORT=3000
```

## 📖 API Documentation

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/verify` - Xác thực token

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/[id]` - Cập nhật sản phẩm
- `DELETE /api/products/[id]` - Xóa sản phẩm

### Orders
- `GET /api/orders` - Lấy danh sách đơn hàng
- `POST /api/orders` - Tạo đơn hàng mới
- `PUT /api/orders/[id]` - Cập nhật đơn hàng
- `DELETE /api/orders/[id]` - Xóa đơn hàng

### Stock Management
- `GET /api/stock/overview` - Tổng quan tồn kho
- `GET /api/stock/details` - Chi tiết tồn kho
- `POST /api/receipts` - Tạo phiếu nhập
- `POST /api/issues` - Tạo phiếu xuất
- `POST /api/transfers` - Tạo phiếu chuyển kho

## 🐛 Troubleshooting

### Prisma Client Error
```bash
npx prisma generate
```

### Database Reset
```bash
npx prisma db push --force-reset
node scripts/create-admin.js
```

### Port Already in Use
```bash
# Windows
$env:PORT=3001; npm run dev

# Linux/Mac
PORT=3001 npm run dev
```

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## 👥 Contributors

- Nguyễn Kiệt - Developer

## 📞 Liên hệ

- Email: support@trieuloi.com
- Website: https://trieuloi.vn

---

Made with ❤️ by Triệu Lợi Team
