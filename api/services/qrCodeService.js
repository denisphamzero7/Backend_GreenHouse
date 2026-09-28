const QRCode = require('qrcode');

/**
 * Service tạo mã QR Code cho Lô Nông Sản
 */
class QrCodeService {
  /**
   * Tạo URL công khai cho người tiêu dùng quét mã
   */
  static getTraceUrl(productId) {
    const clientBaseUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    return `${clientBaseUrl.replace(/\/$/, '')}/trace/${productId}`;
  }

  /**
   * Sinh mã QR dạng Base64 Data URL (tiện lưu trực tiếp vào DB và hiển thị trên Web ngay lập tức)
   */
  static async generateQrDataUrl(productId, extraInfo = {}) {
    try {
      const traceUrl = this.getTraceUrl(productId);
      
      const qrDataUrl = await QRCode.toDataURL(traceUrl, {
        errorCorrectionLevel: 'H', // Mức sửa sai cao nhất (High) để in trên tem nhãn vẫn quét tốt
        type: 'image/png',
        margin: 2,
        width: 320,
        color: {
          dark: '#1b5e20', // Màu xanh lá nông nghiệp sang trọng
          light: '#ffffff'
        }
      });

      return {
        traceUrl,
        qrDataUrl
      };
    } catch (err) {
      console.error('[QRCode Service] Lỗi tạo mã QR:', err);
      throw new Error(`Không thể sinh mã QR: ${err.message}`);
    }
  }
}

module.exports = QrCodeService;
