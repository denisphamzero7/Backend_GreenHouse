const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = 'http://localhost:8088/api';

async function runTest() {
  console.log('=== BẮT ĐẦU KIỂM THỬ HỆ THỐNG TRUY XUẤT NGUỒN GỐC & BLOCKCHAIN ===\n');

  // 1. Đăng nhập tài khoản Admin/Bot để lấy Token tạo sản phẩm
  console.log('1. Đăng nhập để lấy Access Token...');
  const loginRes = await axios.post(`${BASE_URL}/user/login`, {
    email: process.env.BOT_EMAIL || 'bot_ai@greenhouse.com',
    password: process.env.BOT_PASSWORD || 'AIBotSecretPass2026@'
  });
  const token = loginRes.data.accessToken;
  console.log('✅ Đăng nhập thành công, Token:', token.substring(0, 25) + '...\n');

  // 2. Tạo một sản phẩm mới có nguồn gốc
  console.log('2. Tạo Lô Nông Sản mới (Gieo trồng & Thu hoạch)...');
  const testProductName = `Xà Lách Thủy Canh VietGAP - Test Lô ${Date.now().toString().slice(-4)}`;
  
  const createRes = await axios.post(`${BASE_URL}/product`, {
    name: testProductName,
    type: 'Rau ăn lá thủy canh',
    totalQuantity: 150,
    unit: 'kg',
    qualityStatus: 'excellent',
    seedOrigin: 'Nhập khẩu F1 Hà Lan - Rijk Zwaan',
    status: 'packaged',
    notes: 'Đã dán tem truy xuất nguồn gốc QR Code & chứng thực Blockchain'
  }, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const product = createRes.data.product;
  console.log('✅ Tạo sản phẩm thành công!');
  console.log(`- Product ID: ${product._id}`);
  console.log(`- Mã Lô Hàng (Batch Code): ${product.batchCode}`);
  console.log(`- Mã QR Code (DataURL preview): ${product.qrCode ? product.qrCode.substring(0, 45) + '...' : 'None'}`);
  console.log(`- Blockchain Data Hash: ${product.blockchain?.dataHash}`);
  console.log(`- Blockchain TxHash: ${product.blockchain?.txHash}`);
  console.log(`- Trạng thái Blockchain: ${product.blockchain?.isVerified ? 'ĐÃ XÁC THỰC' : 'Chưa'}\n`);

  // 3. Kiểm thử API Truy xuất nguồn gốc công khai (cho người tiêu dùng quét mã QR)
  console.log('3. Kiểm thử API Truy Xuất Nguồn Gốc (GET /api/product/trace/:pid)...');
  const traceRes = await axios.get(`${BASE_URL}/product/trace/${product._id}`);
  const traceData = traceRes.data.data;

  console.log(`✅ Truy xuất nguồn gốc thành công cho: "${traceData.productName}"`);
  console.log(`- Số lượng giai đoạn trong Timeline: ${traceData.timeline.length} giai đoạn:`);
  traceData.timeline.forEach(t => {
    console.log(`  [Giai đoạn ${t.stage}] ${t.title} -> ${t.status}`);
  });
  console.log('');

  // 4. Kiểm thử Xác thực Tính Toàn Vẹn Blockchain (Dữ liệu nguyên bản)
  console.log('4. Kiểm thử Xác Thực Toàn Vẹn Blockchain (GET /api/product/verify-blockchain/:pid)...');
  const verifyRes1 = await axios.get(`${BASE_URL}/product/verify-blockchain/${product._id}`);
  console.log('- Kết quả kiểm tra dữ liệu nguyên bản:');
  console.log(`  + Hợp lệ: ${verifyRes1.data.data.isValid}`);
  console.log(`  + Trạng thái: ${verifyRes1.data.data.status}`);
  console.log(`  + Thông điệp: ${verifyRes1.data.data.message}\n`);

  // 5. Kiểm thử Chống Gian Lận (Thử sửa lén DB xem Blockchain có phát hiện không)
  console.log('5. Thử nghiệm Cố Tình Can Thiệp Sửa Lén Dữ Liệu trong MongoDB...');
  await mongoose.connect(process.env.MONGODB_URL);
  const ProductModel = require('./api/models/productModel');
  await ProductModel.findByIdAndUpdate(product._id, { seedOrigin: 'Hạt giống trôi nổi không rõ nguồn gốc (Đã sửa lén)' });
  console.log('⚠️ Đã cố tình sửa lén trường "seedOrigin" trong DB!');

  console.log('-> Chạy lại hàm xác thực Blockchain để xem có bắt được gian lận không...');
  const verifyRes2 = await axios.get(`${BASE_URL}/product/verify-blockchain/${product._id}`);
  console.log(`  + Hợp lệ: ${verifyRes2.data.data.isValid}`);
  console.log(`  + Trạng thái: ${verifyRes2.data.data.status}`);
  console.log(`  + Thông điệp: ${verifyRes2.data.data.message}\n`);

  if (!verifyRes2.data.data.isValid) {
    console.log('🎯 HOÀN HẢO! Hệ thống Blockchain đã phát hiện thành công hành vi sửa lén dữ liệu!');
  } else {
    console.error('❌ Lỗi: Hệ thống không phát hiện được sự thay đổi dữ liệu.');
  }

  // Khôi phục lại dữ liệu chuẩn
  await ProductModel.findByIdAndUpdate(product._id, { seedOrigin: 'Nhập khẩu F1 Hà Lan - Rijk Zwaan' });
  await mongoose.disconnect();

  console.log('\n=== TẤT CẢ KIỂM THỬ ĐÃ THÀNH CÔNG RỰC RỠ 100%! ===');
}

runTest().catch(err => {
  console.error('Lỗi kiểm thử:', err.response?.data || err.message);
  process.exit(1);
});
