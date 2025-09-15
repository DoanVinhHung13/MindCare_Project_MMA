# MindCare - Ứng dụng theo dõi chu kỳ kinh nguyệt

## Cach chay

-B1: npm i
-B2 : bat 2 terminal:

- npm run server
- npm start

## Tổng quan

MindCare là một ứng dụng React Native được thiết kế để giúp phụ nữ theo dõi chu kỳ kinh nguyệt, dự đoán chu kỳ tiếp theo và quản lý các triệu chứng liên quan.

## Tính năng chính

### 🔐 Xác thực và Bảo mật

- Đăng ký và đăng nhập tài khoản
- Phân quyền bắt buộc đăng nhập
- Lưu trữ dữ liệu cục bộ an toàn
- Quản lý thông tin cá nhân

### 📅 Theo dõi Chu kỳ

- Ghi nhận ngày bắt đầu và kết thúc chu kỳ
- Tính toán chu kỳ trung bình
- Đánh dấu ngày kinh nguyệt trên lịch
- Dự đoán chu kỳ tiếp theo

### 📊 Thống kê và Phân tích

- Thống kê chu kỳ trung bình
- Tính toán độ đều đặn của chu kỳ
- Phân tích triệu chứng thường gặp
- Dự đoán ngày rụng trứng và cửa sổ thụ thai

### 🎯 Quản lý Triệu chứng

- Ghi chú triệu chứng theo ngày
- Theo dõi tâm trạng
- Thống kê tần suất triệu chứng

### ⚙️ Cài đặt và Tùy chỉnh

- Cài đặt chu kỳ cá nhân
- Quản lý thông báo
- Chế độ tối
- Xuất/nhập dữ liệu

## Cấu trúc Dự án

```
MindCare_Project/
├── app/                          # Expo Router pages
│   ├── _layout.js               # Root layout với authentication guard
│   ├── login.js                 # Màn hình đăng nhập/đăng ký
│   └── (tabs)/                  # Tab navigation
│       ├── _layout.js           # Tab layout
│       ├── index.js             # Màn hình chính (Lịch)
│       ├── insights.js          # Màn hình thống kê
│       └── settings.js          # Màn hình cài đặt
├── src/
│   ├── services/                # Business logic services
│   │   ├── cycleDataService.js  # Quản lý dữ liệu chu kỳ
│   │   └── authService.js       # Quản lý xác thực
│   ├── contexts/                # React Context providers
│   │   └── AppContext.js        # Global state management
│   ├── components/              # Reusable components
│   └── utils/                   # Utility functions
├── assets/                      # Images và icons
└── package.json                 # Dependencies
```

## Cài đặt và Chạy

### Yêu cầu hệ thống

- Node.js (v16 trở lên)
- npm hoặc yarn
- Expo CLI
- Android Studio (cho Android) hoặc Xcode (cho iOS)

### Cài đặt

1. **Clone repository:**

```bash
git clone <repository-url>
cd MindCare_Project
```

2. **Cài đặt dependencies:**

```bash
npm install
```

3. **Chạy ứng dụng:**

```bash
# Khởi động Expo development server
npm start

# Hoặc chạy trực tiếp trên thiết bị
npm run android  # Cho Android
npm run ios      # Cho iOS
npm run web      # Cho web browser
```

## Kiến trúc và Thiết kế

### 1. Data Service Layer

#### CycleDataService

- **Mục đích:** Quản lý tất cả dữ liệu liên quan đến chu kỳ kinh nguyệt
- **Tính năng:**
  - CRUD operations cho chu kỳ
  - Tính toán thống kê
  - Dự đoán chu kỳ tiếp theo
  - Quản lý triệu chứng
  - Xuất/nhập dữ liệu

#### AuthService

- **Mục đích:** Quản lý xác thực người dùng
- **Tính năng:**
  - Đăng ký/đăng nhập
  - Quản lý session
  - Cập nhật thông tin cá nhân
  - Bảo mật dữ liệu

### 2. State Management

#### AppContext

- **Mục đích:** Quản lý state toàn cục của ứng dụng
- **Tính năng:**
  - Authentication state
  - Cycle data state
  - UI state
  - Error handling

### 3. Authentication Guard

- **Mục đích:** Bảo vệ các route yêu cầu đăng nhập
- **Hoạt động:** Tự động chuyển hướng đến màn hình đăng nhập nếu chưa xác thực

## Cách sử dụng

### Đăng ký tài khoản mới

1. Mở ứng dụng
2. Chọn "Đăng ký ngay"
3. Điền thông tin: Email, mật khẩu, họ tên, tuổi (tùy chọn)
4. Nhấn "Đăng ký"

### Đăng nhập

1. Nhập email và mật khẩu
2. Có thể chọn "Ghi nhớ đăng nhập"
3. Nhấn "Đăng nhập"

### Thêm chu kỳ mới

1. Vào màn hình "Lịch"
2. Chọn ngày bắt đầu chu kỳ
3. Nhấn "Đánh dấu ngày kinh"
4. Xác nhận thông tin

### Xem thống kê

1. Vào màn hình "Thống kê"
2. Xem tổng quan chu kỳ
3. Kiểm tra độ đều đặn
4. Xem triệu chứng thường gặp
5. Xem dự đoán chu kỳ tiếp theo

### Cài đặt

1. Vào màn hình "Cài đặt"
2. Cập nhật thông tin cá nhân
3. Điều chỉnh cài đặt chu kỳ
4. Quản lý thông báo
5. Xuất/nhập dữ liệu

## Lưu trữ Dữ liệu

Ứng dụng sử dụng AsyncStorage để lưu trữ dữ liệu cục bộ:

- **User data:** Thông tin tài khoản và session
- **Cycle data:** Dữ liệu chu kỳ và thống kê
- **Settings:** Cài đặt người dùng
- **Symptoms:** Dữ liệu triệu chứng

## Bảo mật

- Dữ liệu được lưu trữ cục bộ trên thiết bị
- Không gửi dữ liệu cá nhân lên server
- Xác thực bắt buộc để truy cập ứng dụng
- Mã hóa dữ liệu nhạy cảm

## Phát triển và Mở rộng

### Thêm tính năng mới

1. Tạo component trong `src/components/`
2. Thêm logic vào service tương ứng
3. Cập nhật AppContext nếu cần
4. Tích hợp vào UI

### Cấu trúc dữ liệu

#### Cycle Object

```javascript
{
  id: string,
  startDate: string,      // ISO date string
  endDate: string,        // ISO date string (optional)
  periodLength: number,   // Days
  cycleLength: number,    // Days
  symptoms: string[],     // Array of symptoms
  notes: string,          // Additional notes
  createdAt: string,      // ISO date string
  updatedAt: string       // ISO date string
}
```

#### User Object

```javascript
{
  id: string,
  email: string,
  name: string,
  age: number,            // Optional
  createdAt: string,      // ISO date string
  lastLogin: string       // ISO date string
}
```

## Troubleshooting

### Lỗi thường gặp

1. **"User not authenticated"**

   - Kiểm tra xem đã đăng nhập chưa
   - Thử đăng xuất và đăng nhập lại

2. **"Failed to initialize cycle data service"**

   - Kiểm tra quyền truy cập AsyncStorage
   - Thử xóa cache và khởi động lại app

3. **Dữ liệu không hiển thị**
   - Kiểm tra kết nối internet (nếu có)
   - Thử refresh màn hình

## Đóng góp

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT License - Xem file LICENSE để biết thêm chi tiết.

## Liên hệ

Nếu có câu hỏi hoặc góp ý, vui lòng tạo issue trên GitHub repository.
