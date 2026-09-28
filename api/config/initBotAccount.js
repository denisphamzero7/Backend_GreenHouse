const User = require('../models/userModel');

/**
 * Tự động kiểm tra và khởi tạo tài khoản Bot Service Account cho MCP Server / AI Worker
 * Đảm bảo tài khoản luôn tồn tại với quyền 'staff' và đã được kích hoạt (isVerified: true)
 */
const initBotAccount = async () => {
  try {
    const botEmail = (process.env.BOT_EMAIL || 'bot_ai@greenhouse.com').toLowerCase();
    const botPassword = process.env.BOT_PASSWORD || 'AIBotSecretPass2026@';
    
    let botUser = await User.findOne({ email: botEmail });
    if (!botUser) {
      botUser = await User.create({
        name: 'AI Pest Detector Bot',
        email: botEmail,
        phone: '0900000000',
        password: botPassword,
        role: 'manager',
        isVerified: true
      });
      console.log(`[Bot Service Account] ✅ Khởi tạo tài khoản Bot AI thành công: ${botEmail} (role: manager)`);
    } else {
      // Đảm bảo bot luôn được verified và đúng role manager
      let needSave = false;
      if (!botUser.isVerified) {
        botUser.isVerified = true;
        needSave = true;
      }
      if (botUser.role !== 'manager' && botUser.role !== 'admin') {
        botUser.role = 'manager';
        needSave = true;
      }
      if (needSave) {
        await botUser.save();
        console.log(`[Bot Service Account] ✅ Cập nhật trạng thái Bot AI: ${botEmail} (isVerified: true, role: manager)`);
      }
    }
  } catch (err) {
    console.error('[Bot Service Account] ❌ Lỗi khởi tạo tài khoản Bot:', err.message);
  }
};

module.exports = initBotAccount;
