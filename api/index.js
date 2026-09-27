const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const dbconnect = require('./config/dbconnect');
const introuter = require('./routers/index');
const {init: initSocket} = require ('./config/socket')

// Tạo app Express
const app = express();

// Kết nối cơ sở dữ liệu
dbconnect();

// Cấu hình CORS: Cho phép truy cập từ Frontend React local hoặc bất kỳ domain nào khi deploy
app.use(cors({
  origin: process.env.CLIENT_URL || true,
  credentials: true,
}));

// Parse JSON request body và cookies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Ghi log các request HTTP
app.use(morgan('dev'));

// Kết nối các router API
introuter(app);

// Tạo HTTP server
const httpServer = http.createServer(app);
initSocket(httpServer);

// Khởi chạy server: Ưu tiên process.env.PORT do nền tảng Cloud (Render/Railway) tự cấp phát
const HTTP_PORT = process.env.PORT || process.env.HTTP_PORT || 8080;
httpServer.listen(HTTP_PORT, '0.0.0.0', () => {
  console.log(`HTTP Server is running on port: ${HTTP_PORT}`);
});
