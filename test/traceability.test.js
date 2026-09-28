const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:8088/api';

async function runTest() {
  console.log('=== BẮT ĐẦU KIỂM THỬ HÀNH TRÌNH CHUỖI CUNG ỨNG & LỊCH SỬ TRẠNG THÁI ===\n');

  // 1. Đăng nhập tài khoản Quản lý
  console.log('1. Đăng nhập để lấy Access Token...');
  const loginRes = await axios.post(`${BASE_URL}/user/login`, {
    email: process.env.BOT_EMAIL || 'bot_ai@greenhouse.com',
    password: process.env.BOT_PASSWORD || 'AIBotSecretPass2026@'
  });
  const token = loginRes.data.accessToken;
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };
  console.log('✅ Đăng nhập thành công, Token:', token.substring(0, 25) + '...\n');

  // 2. Tạo một sản phẩm mới (Khởi tạo ở trạng thái 'processing' - Sơ chế sau thu hoạch)
  console.log('2. Tạo Lô Nông Sản mới sau thu hoạch (Trạng thái ban đầu: "processing")...');
  const testProductName = `Dâu Tây Giống Nhật - Lô Test ${Date.now().toString().slice(-4)}`;
  
  const createRes = await axios.post(`${BASE_URL}/product`, {
    name: testProductName,
    type: 'Quả sạch nhà kính',
    totalQuantity: 80,
    unit: 'kg',
    qualityStatus: 'excellent',
    seedOrigin: 'Nhập khẩu F1 Nhật Bản (Tochiotome)',
    status: 'processing',
    notes: 'Vừa thu hoạch xong lúc sáng sớm, đang phân loại trái'
  }, authHeaders);

  const product = createRes.data.product;
  console.log('✅ Khởi tạo lô nông sản thành công!');
  console.log(`- Mã Lô: ${product.batchCode}`);
  console.log(`- Trạng thái ban đầu: ${product.status}`);
  console.log(`- Số lượng lịch sử ban đầu: ${product.statusHistory?.length || 1} bản ghi\n`);

  // 3. Chuyển sang trạng thái 'packaged' (Đóng gói & In dán tem QR)
  console.log('3. Cập nhật trạng thái -> "packaged" (Đã đóng gói bao bì sinh học)...');
  const packRes = await axios.put(`${BASE_URL}/product/${product._id}`, {
    status: 'packaged',
    notes: 'Đã đóng hộp 500g, dán tem QR Code truy xuất nguồn gốc chính hãng',
    location: 'Phòng Đóng Gói Nhà Kính A'
  }, authHeaders);
  console.log('✅ Đã cập nhật sang PACKAGED thành công!\n');

  // 4. Chuyển sang trạng thái 'shipped' (Bàn giao cho xe lạnh vận chuyển)
  console.log('4. Cập nhật trạng thái -> "shipped" (Bàn giao tài xế xe lạnh xuất kho)...');
  const shipRes = await axios.put(`${BASE_URL}/product/${product._id}`, {
    status: 'shipped',
    notes: 'Đã bàn giao cho tài xế Trần Văn C - Xe tải lạnh biển số 51D-98765 (Nhiệt độ thùng xe 6°C)',
    location: 'Cổng xuất hàng Kho Lạnh Trung Tâm'
  }, authHeaders);
  console.log('✅ Đã cập nhật sang SHIPPED thành công!\n');

  // 5. Chuyển sang trạng thái 'delivered' (Siêu thị ký nhận hoàn tất)
  console.log('5. Cập nhật trạng thái -> "delivered" (Siêu thị nghiệm thu và nhập hàng)...');
  const deliverRes = await axios.put(`${BASE_URL}/product/${product._id}`, {
    status: 'delivered',
    notes: 'Quản lý quầy rau Siêu thị Co.opmart đã kiểm tra chất lượng đạt chuẩn và nhập kệ hàng',
    receiver: 'Siêu thị Co.opmart Cống Quỳnh, Q.1'
  }, authHeaders);
  console.log('✅ Đã cập nhật sang DELIVERED thành công!\n');

  // 6. Kiểm tra lại dữ liệu Truy Xuất Nguồn Gốc (GET /api/product/trace/:pid)
  console.log('6. Gọi API Truy Xuất Nguồn Gốc (GET /api/product/trace/:pid) để kiểm tra Timeline...');
  const traceRes = await axios.get(`${BASE_URL}/product/trace/${product._id}`);
  const traceData = traceRes.data.data;

  console.log(`✅ Kết quả truy xuất nguồn gốc cho lô: ${traceData.batchCode}`);
  console.log(`- Trạng thái hiện tại: ${traceData.currentStatus.toUpperCase()}`);

  // Tìm giai đoạn 4 (Chuỗi cung ứng & Hành trình vận chuyển)
  const supplyChainStage = traceData.timeline.find(t => t.stage === 4);
  console.log(`\n📋 CHI TIẾT HÀNH TRÌNH VẬN CHUYỂN (${supplyChainStage.title}):`);
  const journey = supplyChainStage.details.supplyChainJourney;
  console.log(`- Tổng số bước đã lưu vết trong lịch sử: ${journey.length} bước:`);

  journey.forEach((item, index) => {
    console.log(`  [Mốc ${index + 1}] Trạng thái: ${item.status.toUpperCase()}`);
    console.log(`         Thời gian: ${item.updatedAt}`);
    console.log(`         Người cập nhật: ${item.updatedBy}`);
    console.log(`         Ghi chú: ${item.notes}`);
    if (item.location) console.log(`         Vị trí: ${item.location}`);
    console.log('----------------------------------------------------');
  });

  // 7. Xác thực Blockchain
  console.log('\n7. Xác thực Blockchain...');
  const verifyRes = await axios.get(`${BASE_URL}/product/verify-blockchain/${product._id}`);
  console.log(`✅ Tính toàn vẹn Blockchain: ${verifyRes.data.data.status} - ${verifyRes.data.data.message}`);

  console.log('\n=== TẤT CẢ KIỂM THỬ LƯU VẾT LỊCH SỬ ĐÃ HOÀN TẤT XUẤT SẮC! ===');
}

runTest().catch(err => {
  console.error('Lỗi kiểm thử:', err.response?.data || err.message);
  process.exit(1);
});
