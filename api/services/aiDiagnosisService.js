const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Cơ sở tri thức bệnh học cây trồng nhà kính (Knowledge Base) phục vụ đối chiếu & fallback
const AGRICULTURAL_KNOWLEDGE_BASE = [
  {
    name: "Bệnh Mốc Sương / Sương Mai (Late Blight)",
    scientificName: "Phytophthora infestans",
    crop: "Cà chua",
    pathogenType: "Nấm mốc nước (Oomycete)",
    keySymptoms: ["đốm nâu đen ủng nước", "mốc trắng ở mặt dưới lá", "vết thâm đen thân", "thối quả cứng"],
    severity: "critical",
    growthStatus: "poor",
    pestStatus: "high",
    treatment: {
      organic: "Cắt tỉa ngay cành lá bệnh đem đốt. Phun dung dịch nano đồng hoặc dầu neem.",
      chemical: "Phun hoạt chất Metalaxyl, Mancozeb (Ridomil Gold 68WG) hoặc Dimethomorph liều lượng khuyến cáo."
    },
    greenhouseActions: "Hạ độ ẩm nhà kính dưới 75%, tăng cường quạt thông gió, ngừng tưới phun sương."
  },
  {
    name: "Bệnh Héo Xanh Vi Khuẩn (Bacterial Wilt)",
    scientificName: "Ralstonia solanacearum",
    crop: "Cà chua / Ớt",
    pathogenType: "Vi khuẩn (Bacteria)",
    keySymptoms: ["héo rũ đột ngột khi lá còn xanh", "ban ngày héo đêm phục hồi nhẹ", "dịch vi khuẩn trắng ở vết cắt"],
    severity: "critical",
    growthStatus: "poor",
    pestStatus: "high",
    treatment: {
      organic: "Nhổ bỏ cây bệnh cho vào túi rác tiêu hủy ngay. Rắc vôi bột (Ca(OH)2) vào hố gốc để khử trùng.",
      chemical: "Tưới gốc bằng Kasugamycin (Kasumin 2SL), Bismerthiazol hoặc Oxytetracycline để chặn lây lan."
    },
    greenhouseActions: "Cách ly luống đất, kiểm tra hệ thống thoát nước giá thể, khử trùng dụng cụ cắt tỉa."
  },
  {
    name: "Bệnh Thối Nhũn Vi Khuẩn (Bacterial Soft Rot)",
    scientificName: "Pectobacterium carotovorum",
    crop: "Xà lách / Cải bắp",
    pathogenType: "Vi khuẩn (Bacteria)",
    keySymptoms: ["bẹ lá úng nước nhũn nát", "mùi hôi tanh khó chịu", "cây đổ rạp nhớt"],
    severity: "high",
    growthStatus: "poor",
    pestStatus: "high",
    treatment: {
      organic: "Ngưng tưới nước 1-2 ngày, nhổ cây bệnh, phơi khô bề mặt luống đất.",
      chemical: "Phun Streptomycin sulphate hoặc Kasugamycin quanh các cây lân cận."
    },
    greenhouseActions: "Kiểm tra độ ẩm giá thể, tưới nhỏ giọt dưới gốc tránh tưới văng nước lên bẹ lá."
  },
  {
    name: "Nhện Đỏ Hại Lá (Two-Spotted Spider Mite)",
    scientificName: "Tetranychus urticae",
    crop: "Dâu tây / Cà chua / Dưa leo",
    pathogenType: "Côn trùng gây hại (Arachnida)",
    keySymptoms: ["mặt trên lá lấm tấm chấm vàng bạc", "mặt dưới có màng tơ mỏng li ti", "chấm đỏ di chuyển", "lá vàng khô rụng"],
    severity: "warning",
    growthStatus: "average",
    pestStatus: "medium",
    treatment: {
      organic: "Phun dầu khoáng sinh học (SK Enspray 99EC), dầu neem hoặc thả bọ rùa săn mồi.",
      chemical: "Phun luân phiên thuốc đặc trị nhện: Abamectin, Propargite, Fenpyroximate."
    },
    greenhouseActions: "Tăng độ ẩm nhà kính lên trên 65% bằng phun sương nhẹ vì nhện đỏ ưa thời tiết khô nóng."
  },
  {
    name: "Bệnh Phấn Trắng (Powdery Mildew)",
    scientificName: "Erysiphe cichoracearum",
    crop: "Dưa leo / Xà lách",
    pathogenType: "Nấm (Fungal)",
    keySymptoms: ["lớp phấn trắng như rắc bột trên mặt lá", "lá chuyển vàng nâu quăn queo", "lá khô giòn"],
    severity: "warning",
    growthStatus: "average",
    pestStatus: "medium",
    treatment: {
      organic: "Phun dung dịch sữa tươi pha nước (tỷ lệ 1:9) hoặc dung dịch baking soda loãng (5g/lít).",
      chemical: "Phun Hexaconazole (Anvil 5SC), Azoxystrobin (Amistar 250SC) hoặc Difenoconazole."
    },
    greenhouseActions: "Tỉa bớt lá già dưới gốc, giãn khoảng cách luống để đón đủ ánh sáng."
  },
  {
    name: "Bọ Phấn Trắng (Whiteflies)",
    scientificName: "Bemisia tabaci",
    crop: "Cà chua / Ớt / Dưa leo",
    pathogenType: "Côn trùng chích hút",
    keySymptoms: ["rung cây thấy côn trùng nhỏ màu trắng bay ra", "nấm muội đen bám mặt lá", "lá vàng xoăn còi cọc"],
    severity: "warning",
    growthStatus: "average",
    pestStatus: "medium",
    treatment: {
      organic: "Treo bẫy dính màu vàng khắp nhà kính. Phun chế phẩm nấm ký sinh Beauveria bassiana.",
      chemical: "Phun Pymetrozine, Spirotetramat (Movento 150OD) hoặc Dinotefuran."
    },
    greenhouseActions: "Kiểm tra lưới chắn côn trùng nhà kính, đóng kín cửa 2 lớp."
  }
];

const SYSTEM_PROMPT = `Bạn là Bác sĩ Cây trồng & Chuyên gia Bệnh học Nông nghiệp Nhà Kính (Plant Pathologist).
Nhiệm vụ: Phân tích ảnh chụp lá/thân/quả cây trồng kết hợp với triệu chứng lâm sàng người nông dân nhập để chẩn đoán chính xác sâu bệnh.
Quy định phân loại:
- severity: 'normal' (bình thường), 'warning' (cảnh báo nhẹ, cần theo dõi), 'critical' (nguy hiểm, lây lan mạnh).
- growth_status: 'excellent', 'good', 'average', 'poor'.
- pest_status: 'none', 'low', 'medium', 'high'.

BẮT BUỘC chỉ trả về JSON thuần túy (không kèm markdown code block \`\`\`json) theo cấu trúc:
{
  "detected": true,
  "disease_name": "Tên bệnh tiếng Việt (Tên khoa học / Tiếng Anh)",
  "scientific_name": "Tên khoa học",
  "pathogen_type": "Nấm / Vi khuẩn / Côn trùng / Rối loạn dinh dưỡng",
  "confidence": 0.95,
  "severity": "critical",
  "growth_status": "poor",
  "pest_status": "high",
  "symptoms_observed": [
    "Triệu chứng 1 quan sát được trên ảnh",
    "Triệu chứng 2 khớp với mô tả người dùng"
  ],
  "treatment": {
    "organic": "Biện pháp hữu cơ / sinh học / tỉa cành an toàn",
    "chemical": "Thuốc bảo vệ thực vật khuyên dùng (nêu tên hoạt chất hoặc tên thuốc phổ biến tại Việt Nam)"
  },
  "greenhouse_actions": "Biện pháp điều chỉnh nhiệt độ, độ ẩm, thông gió trong nhà kính",
  "summary_message": "Lời dặn ngắn gọn dành cho nhân viên vận hành luống rau"
}`;

/**
 * Lấy dữ liệu Base64 từ URL ảnh Cloudinary hoặc file cục bộ
 */
async function getImageBase64(imageUrlOrPath) {
  if (imageUrlOrPath.startsWith('http://') || imageUrlOrPath.startsWith('https://')) {
    const response = await axios.get(imageUrlOrPath, { responseType: 'arraybuffer' });
    const mimeType = response.headers['content-type'] || 'image/jpeg';
    const base64 = Buffer.from(response.data, 'binary').toString('base64');
    return { base64, mimeType };
  } else {
    const data = fs.readFileSync(imageUrlOrPath);
    const base64 = data.toString('base64');
    let mimeType = 'image/jpeg';
    if (imageUrlOrPath.endsWith('.png')) mimeType = 'image/png';
    else if (imageUrlOrPath.endsWith('.webp')) mimeType = 'image/webp';
    return { base64, mimeType };
  }
}

/**
 * Tra cứu từ điển nội bộ khi không có API Key hoặc mất mạng
 */
function fallbackDiagnose(symptoms = '', cropType = '') {
  const query = `${symptoms} ${cropType}`.toLowerCase();
  
  let bestMatch = null;
  let maxScore = -1;

  for (const item of AGRICULTURAL_KNOWLEDGE_BASE) {
    let score = 0;
    if (cropType && item.crop.toLowerCase().includes(cropType.toLowerCase())) {
      score += 3;
    }
    for (const symptom of item.keySymptoms) {
      if (query.includes(symptom.toLowerCase()) || symptom.toLowerCase().split(' ').some(w => query.includes(w))) {
        score += 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && maxScore > 0) {
    return {
      detected: true,
      disease_name: bestMatch.name,
      scientific_name: bestMatch.scientificName,
      pathogen_type: bestMatch.pathogenType,
      confidence: 0.85,
      severity: bestMatch.severity,
      growth_status: bestMatch.growthStatus,
      pest_status: bestMatch.pestStatus,
      symptoms_observed: [
        ...bestMatch.keySymptoms.slice(0, 2),
        `Triệu chứng người dùng cung cấp: ${symptoms || 'Quan sát thấy bất thường trên lá'}`
      ],
      treatment: bestMatch.treatment,
      greenhouse_actions: bestMatch.greenhouseActions,
      summary_message: `Phát hiện dấu hiệu ${bestMatch.name} trên cây trồng. Vui lòng áp dụng phác đồ xử lý sớm.`
    };
  }

  // Trường hợp không phát hiện bệnh cụ thể
  return {
    detected: false,
    disease_name: "Không phát hiện dấu hiệu sâu bệnh nguy hiểm",
    scientific_name: "N/A",
    pathogen_type: "Bình thường",
    confidence: 0.70,
    severity: "normal",
    growth_status: "good",
    pest_status: "none",
    symptoms_observed: ["Lá cây không có dấu hiệu nấm bệnh hoặc côn trùng chích hút rõ rệt"],
    treatment: {
      organic: "Tiếp tục chế độ chăm sóc, tưới tiêu và bón phân hữu cơ định kỳ",
      chemical: "Không cần sử dụng hóa chất bảo vệ thực vật"
    },
    greenhouse_actions: "Duy trì độ ẩm 65-75% và thông gió thoáng mát trong nhà kính",
    summary_message: "Cây trồng ở trạng thái an toàn. Tiếp tục theo dõi chu kỳ sinh trưởng."
  };
}

/**
 * Hàm phân tích chính: Gọi Gemini Vision API kết hợp triệu chứng và ảnh
 */
async function diagnosePlantDisease({ imageUrl, symptoms = '', cropType = '' }) {
  const apiKey = process.env.GEMINI_API_KEY;
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // 1. Nếu có API Key, ưu tiên gọi Gemini Vision
  if (apiKey) {
    try {
      const { base64, mimeType } = await getImageBase64(imageUrl);

      let userPrompt = "Hãy chẩn đoán sâu bệnh cho cây trồng trong bức ảnh này.\n";
      if (cropType) userPrompt += `- Loại cây trồng: ${cropType}\n`;
      if (symptoms) userPrompt += `- Triệu chứng người trồng ghi nhận: ${symptoms}\n`;
      userPrompt += "Yêu cầu: Phân tích kỹ các vết tổn thương trên ảnh và trả về JSON theo đúng định dạng.";

      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

      const payload = {
        system_instruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: [
          {
            parts: [
              { text: userPrompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          response_mime_type: "application/json"
        }
      };

      const response = await axios.post(url, payload, { timeout: 35000 });
      if (response.data && response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          let text = candidate.content.parts[0].text.trim();
          // Làm sạch code block markdown nếu có
          if (text.startsWith('```json')) text = text.substring(7);
          if (text.endsWith('```')) text = text.substring(0, text.length - 3);
          const parsed = JSON.parse(text.trim());
          return parsed;
        }
      }
    } catch (err) {
      console.error('[AI Diagnosis Service] Gemini Vision error:', err.response?.data || err.message);
      console.log('[AI Diagnosis Service] Chuyển hướng sang bộ chẩn đoán đối chiếu Knowledge Base...');
    }
  } else {
    console.log('[AI Diagnosis Service] Không tìm thấy GEMINI_API_KEY trong .env. Sử dụng Knowledge Base...');
  }

  // 2. Fallback sang Knowledge Base nội bộ
  return fallbackDiagnose(symptoms, cropType);
}

module.exports = {
  diagnosePlantDisease,
  fallbackDiagnose,
  AGRICULTURAL_KNOWLEDGE_BASE
};
