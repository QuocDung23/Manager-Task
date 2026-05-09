# Plan triển khai đổi mật khẩu

## 1. Mục tiêu

Triển khai tính năng đổi mật khẩu theo 2 luồng riêng:

- `change password`: user đã đăng nhập, đổi mật khẩu bằng `currentPassword`
- `forgot password / reset password`: user quên mật khẩu, dùng OTP qua email để đặt mật khẩu mới

Ưu tiên:

- tận dụng flow `auth`, `otp`, `mail` hiện có
- không đổi schema DB nếu chưa thật sự cần
- tách rõ API đăng nhập và API khôi phục mật khẩu

## 2. Hiện trạng codebase

### 2.1. Những gì đã có

- `accounts` lưu `password` và `salt` trong [schema.prisma](/Users/keke/Meeee/MT/Manage%20-Task/BE/prisma/schema.prisma)
- `register` đang tạo `salt` mới và hash password trong [auth.service.ts](/Users/keke/Meeee/MT/Manage%20-Task/BE/src/modules/auth/auth.service.ts)
- `login` đang verify password bằng cách `hash(input, account.salt)` rồi so sánh với `account.password`
- đã có `verifyAccessToken` trong [auth.middleware.ts](/Users/keke/Meeee/MT/Manage%20-Task/BE/src/common/middlewares/auth.middleware.ts)
- đã có OTP service + mail service cho xác minh email

### 2.2. Những gì chưa có

- chưa có endpoint đổi mật khẩu cho user đang đăng nhập
- chưa có endpoint reset password bằng OTP
- chưa có DTO/request schema cho password flow
- `AuthRepository` chưa có hàm update `accounts.password` và `accounts.salt`
- chưa có rule xử lý session sau khi đổi mật khẩu

## 3. Đề xuất phạm vi

Nên chia làm 2 phase thay vì gom một lần.

### Phase 1: Change password khi đã đăng nhập

Đây là phần nên làm trước vì:

- ít rủi ro hơn
- không cần thêm flow mới ngoài access token
- bám sát nhu cầu "đổi mật khẩu" đúng nghĩa

### Phase 2: Forgot password bằng OTP

Phần này nên làm sau khi phase 1 ổn vì:

- cần thêm flow xác thực tạm thời
- cần quyết định có tái dùng bảng `otps` hiện tại hay tách purpose cho OTP

## 4. Thiết kế API đề xuất

### 4.1. Change password

Endpoint đề xuất:

- `PATCH /user/me/password`

Auth:

- bắt buộc `authMiddleware.verifyAccessToken`

Request body:

- `currentPassword`
- `newPassword`
- `confirmNewPassword`

Validation:

- `currentPassword`: bắt buộc
- `newPassword`: min 6 hoặc 8 ký tự
- `confirmNewPassword` phải bằng `newPassword`
- `newPassword` không được trùng `currentPassword`

Response:

- chỉ trả message success, không trả password data

### 4.2. Forgot password

Nên tách thành 2 endpoint:

- `POST /auth/forgot-password/send-otp`
- `POST /auth/forgot-password/reset`

`send-otp` request:

- `email`

`reset` request:

- `email`
- `otp`
- `newPassword`
- `confirmNewPassword`

Validation:

- email phải tồn tại
- OTP phải đúng và còn hạn
- `newPassword` và `confirmNewPassword` phải khớp

## 5. Thay đổi code cần có

### 5.1. DTO và validation schema

Tạo mới DTO/request schema theo pattern hiện tại.

Đề xuất file:

- `src/modules/user/dtos/request/changePassword.req.ts`
- `src/modules/auth/dtos/requests/forgotPassword.req.ts`
- `src/modules/auth/dtos/requests/resetPassword.req.ts`

Export lại trong:

- `src/modules/user/dtos/request/index.ts`
- `src/modules/auth/dtos/requests/index.ts`

### 5.2. Repository

Hiện `UserRepository` chỉ update bảng `users`, nên phần password nên nằm ở `AuthRepository`.

Nên thêm:

- `findAccountByUserId(...)` hoặc nới `findAccount(...)` để support `userId` mà không bắt buộc `email`
- `updateAccountPassword({ userId, password, salt })`

Lý do:

- password thuộc bảng `accounts`
- tránh đặt logic password trong `UserRepository`

### 5.3. Service

#### Trong `AuthService`

Nên thêm:

- `changePassword(userId, dto)`
- `sendForgotPasswordOtp(dto)`
- `resetPassword(dto)`

`changePassword` flow:

1. tìm account theo `userId`
2. verify `currentPassword`
3. tạo `salt` mới
4. hash `newPassword`
5. update `accounts.password` và `accounts.salt`
6. tùy chọn rotate hoặc revoke refresh token hiện tại

`resetPassword` flow:

1. tìm account theo `email`
2. verify OTP bằng `OtpService`
3. tạo `salt` mới
4. hash `newPassword`
5. update `accounts.password` và `accounts.salt`
6. revoke token cũ nếu muốn buộc login lại

### 5.4. Controller + router

#### User module

Thêm vào [user.router.ts](/Users/keke/Meeee/MT/Manage%20-Task/BE/src/modules/user/user.router.ts):

- `PATCH /me/password`

Thêm vào `UserController` hoặc chuyển sang `AuthController` đều được.

Khuyến nghị:

- đặt endpoint authenticated password change trong `user`
- đặt forgot/reset password trong `auth`

Lý do:

- `/user/me/password` là thao tác trên user hiện tại
- `/auth/forgot-password/*` là flow xác thực

#### Auth module

Thêm vào [auth.router.ts](/Users/keke/Meeee/MT/Manage%20-Task/BE/src/modules/auth/auth.router.ts):

- `POST /forgot-password/send-otp`
- `POST /forgot-password/reset`

## 6. Quyết định kỹ thuật quan trọng

### 6.1. Có nên dùng `bcrypt.compare`

Hiện code đang verify bằng:

- `hash(input, storedSalt) === storedPassword`

Flow này vẫn chạy được vì salt được lưu riêng.

Tuy nhiên nên cân nhắc chuẩn hóa sang:

- chỉ lưu hash chuẩn bcrypt
- dùng `compare(password, hash)`

Nếu chưa muốn refactor auth rộng, phase này có thể giữ cách hiện tại để giảm scope.

Khuyến nghị thực tế:

- ngắn hạn: giữ nguyên cơ chế hiện tại để triển khai nhanh
- trung hạn: refactor register/login/change/reset sang `bcrypt.compare`

### 6.2. Sau khi đổi mật khẩu có logout toàn bộ session không

Nên chốt sớm một trong 2 cách:

- cách đơn giản: chỉ update password, giữ session hiện tại
- cách an toàn hơn: xóa `tokens` hiện tại để buộc đăng nhập lại

Với schema hiện tại, mỗi user chỉ có 1 refresh token trong bảng `tokens`, nên revoke khá đơn giản.

Khuyến nghị:

- `change password`: giữ access token hiện tại, xóa refresh token để buộc refresh/login lại sau đó
- `reset password`: xóa refresh token ngay để toàn bộ session cũ mất hiệu lực

### 6.3. Có nên tái dùng OTP hiện tại

Hiện bảng `otps` chỉ có:

- `userId`
- `otp`
- `expiresAt`

Chưa có `purpose`.

Rủi ro nếu tái dùng nguyên bản:

- cùng một OTP table cho verify account và reset password nhưng không phân biệt mục đích

Khuyến nghị:

- ngắn hạn: có thể tái dùng nếu flow đơn giản và chấp nhận mỗi user chỉ có 1 OTP active tại một thời điểm
- tốt hơn: thêm field `purpose` như `VERIFY_ACCOUNT | RESET_PASSWORD`

Nếu chưa muốn sửa schema trong phase đầu, chỉ nên làm `change password` trước.

## 7. Kế hoạch triển khai đề xuất

### Phase 1: Change password

1. Tạo DTO + zod schema cho `PATCH /user/me/password`
2. Thêm method update password trong `AuthRepository`
3. Thêm service `changePassword(userId, dto)`
4. Thêm controller + router + OpenAPI
5. Test các case:
  - current password sai
  - confirm password không khớp
  - user không tồn tại
  - đổi mật khẩu thành công

### Phase 2: Forgot password

1. Tạo DTO/schema cho `send-otp` và `reset`
2. Reuse `OtpService.generateOtp` để gửi OTP
3. Thêm `resetPassword(dto)` trong `AuthService`
4. Thêm revoke token sau reset password
5. Test các case:
  - email không tồn tại
  - OTP sai
  - OTP hết hạn
  - reset thành công

### Phase 3: Hardening

1. Giới hạn tần suất gửi OTP
2. Chuẩn hóa message lỗi để không lộ quá nhiều thông tin
3. Cân nhắc migrate sang `bcrypt.compare`
4. Cân nhắc thêm `purpose` cho OTP

## 8. Khuyến nghị triển khai ngay

Nếu mục tiêu hiện tại là "đổi mật khẩu", nên làm theo thứ tự này:

1. triển khai `PATCH /user/me/password`
2. chốt chính sách revoke token sau đổi mật khẩu
3. sau đó mới làm `forgot password`

Đây là hướng ít ảnh hưởng codebase nhất vì:

- không cần sửa DB ngay
- không đụng sâu vào OTP flow hiện có
- phù hợp với kiến trúc đang tách `user` và `auth`

## 9. Các file sẽ đụng tới nếu implement

- [src/modules/user/user.router.ts](/Users/keke/Meeee/MT/Manage%20-Task/BE/src/modules/user/user.router.ts)
- [src/modules/user/user.controller.ts](/Users/keke/Meeee/MT/Manage%20-Task/BE/src/modules/user/user.controller.ts)
- [src/modules/user/dtos/request/index.ts](/Users/keke/Meeee/MT/Manage%20-Task/BE/src/modules/user/dtos/request/index.ts)
- `src/modules/user/dtos/request/changePassword.req.ts`
- [src/modules/auth/auth.router.ts](/Users/keke/Meeee/MT/Manage%20-Task/BE/src/modules/auth/auth.router.ts)
- [src/modules/auth/auth.controller.ts](/Users/keke/Meeee/MT/Manage%20-Task/BE/src/modules/auth/auth.controller.ts)
- [src/modules/auth/auth.service.ts](/Users/keke/Meeee/MT/Manage%20-Task/BE/src/modules/auth/auth.service.ts)
- [src/modules/auth/auth.repository.ts](/Users/keke/Meeee/MT/Manage%20-Task/BE/src/modules/auth/auth.repository.ts)
- `src/modules/auth/dtos/requests/forgotPassword.req.ts`
- `src/modules/auth/dtos/requests/resetPassword.req.ts`

## 10. Kết luận

Rep o hiện tại đủ nền để làm `change password` ngay mà chưa cần migration DB.

Nếu cần scope gọn và an toàn, nên ưu tiên:

- `PATCH /user/me/password`

Nếu cần full flow phục hồi tài khoản, thêm tiếp:

- `POST /auth/forgot-password/send-otp`
- `POST /auth/forgot-password/reset`

