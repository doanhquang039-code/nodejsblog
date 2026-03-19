# 1. Sử dụng Node.js phiên bản 20 (bản nhẹ alpine cho nhanh)
FROM node:20-alpine

# 2. Tạo thư mục làm việc bên trong container
WORKDIR /app

# 3. Copy file quản lý thư viện vào trước để cài đặt
COPY package*.json ./

# 4. Chạy lệnh cài đặt thư viện (nó sẽ tạo node_modules bên trong container)
RUN npm install

# 5. Copy toàn bộ code nguồn từ máy sếp vào container
COPY . .

# 6. Mở cổng 8080 (khớp với file .env của sếp)
EXPOSE 8080

# 7. Lệnh để khởi động server
CMD ["npm", "start"]