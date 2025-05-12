const http = require('http');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();
const dbconnect = require('./config/dbconnect');
const introuter = require('./routers/index');
const app = express();
// Kết nối cơ sở dữ liệu
dbconnect();
// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, // Nếu bạn cần gửi cookie hay token
}));
// Parse JSON request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Parse cookies
app.use(cookieParser());

// Ghi log các request HTTP
app.use(morgan('dev'));

// Kết nối các router API
introuter(app);

// Route chính
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Greenhouse' });
});

// Tạo HTTP server
const httpServer = http.createServer(app);

// Lắng nghe cổng
const HTTP_PORT = process.env.HTTP_PORT || 8080;

httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP Server is running on http://localhost:${HTTP_PORT}`);
});
