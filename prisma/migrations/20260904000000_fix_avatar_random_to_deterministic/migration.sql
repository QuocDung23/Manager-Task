-- Backfill avatar cho user có background=random.
-- REPLACE 'background=random' -> 'background=3498DB' (màu fallback cố định).
-- Mục tiêu: bỏ 'random' để ảnh avatar không nhảy màu giữa các request.
-- User mới đăng ký sau fix sẽ dùng hash deterministic từ name (xử lý ở BE code).
UPDATE "users"
SET "avatar" = REPLACE("avatar", 'background=random', 'background=3498DB')
WHERE "avatar" LIKE '%background=random%';
