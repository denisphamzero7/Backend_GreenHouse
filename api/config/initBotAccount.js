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
        role: 'staff',
        isVerified: true
      });
      console.log(`[Bot Service Account] ✅ Khởi tạo tài khoản Bot AI thành công: ${botEmail} (role: staff)`);
    } else {
      // Đảm bảo bot luôn được verified và đúng role staff
      let needSave = false;
      if (!botUser.isVerified) {
        botUser.isVerified = true;
        needSave = true;
      }
      if (botUser.role !== 'staff' && botUser.role !== 'manager') {
        botUser.role = 'staff';
        needSave = true;
      }
      if (needSave) {
        await botUser.save();
        console.log(`[Bot Service Account] ✅ Cập nhật trạng thái Bot AI: ${botEmail} (isVerified: true, role: staff)`);
      }
    }
  } catch (err) {
    console.error('[Bot Service Account] ❌ Lỗi khởi tạo tài khoản Bot:', err.message);
  }
};

module.exports = initBotAccount;
