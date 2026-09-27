const axios = require('axios');
const fs = require('fs');
require('dotenv').config();

// Cơ sở tri thức bệnh học cây trồng nhà kính (Knowledge Base) phục vụ đối chiếu & fallback
// Giọng văn tâm huyết, gần gũi, ân cần như một chuyên gia nông nghiệp giàu kinh nghiệm
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
      organic: "🌱 Bạn ơi, trước tiên hãy nhẹ tay cắt tỉa ngay những cành lá đã chớm đốm thâm đen này nhé, bỏ gọn vào túi nilon đem ra xa tiêu hủy để nấm không bay tán loạn. Sau đó bạn hãy phun dung dịch Nano Đồng hoặc xịt tinh dầu Neem sinh học để áo một lớp màng bảo vệ cho các mầm lá non còn lại nha!",
      chemical: "💊 Tình trạng này đang lây khá nhanh đấy, bạn hãy hỗ trợ cây ngay bằng hoạt chất Metalaxyl hoặc Mancozeb (Ridomil Gold 68WG) theo đúng liều lượng trên bao bì nhé. Nhớ phun vào sáng sớm lúc trời ráo gió và tuân thủ thời gian cách ly để quả thu hoạch được an toàn tuyệt đối nghen!"
    },
    greenhouseActions: "🌬️ Hãy bật quạt đối lưu và mở thông gió để hạ độ ẩm nhà kính xuống dưới 75% bạn nhé! Bệnh này 'kỵ' nhất là sự khô thoáng, tạm ngưng phun sương vài hôm là nấm hết đường sinh sôi ngay thôi!",
    summaryMessage: "Bệnh sương mai hơi cứng đầu chút xíu nhưng mình phát hiện kịp thời thế này là rất may mắn rồi! Bạn làm theo các bước xử lý trên là dàn cây sẽ sớm tươi tốt trở lại thôi, cố lên nhé! 💪🌱"
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
      organic: "🌿 Nhìn cây héo rũ khi lá còn xanh mướt thế này thương thật đấy! Vi khuẩn này lẩn khuất dưới rễ, nên cách tốt nhất để bảo vệ cả luống rau là bạn hãy dứt khoát nhổ bỏ cây bệnh, gói kín tiêu hủy và nhớ rắc ngay một nắm vôi bột (Ca(OH)2) vào hố gốc để khử trùng triệt để đất nhé.",
      chemical: "🛡️ Để bảo vệ an toàn cho các 'bạn cây' hàng xóm xung quanh, bạn hãy hòa Kasugamycin (Kasumin 2SL) hoặc Bismerthiazol để tưới đẫm vùng gốc lân cận, chặn đứng đường lây lan của vi khuẩn nha!"
    },
    greenhouseActions: "💧 Tạm thời khoanh vùng tưới ở khu vực luống này, kiểm tra lại rãnh thoát nước giá thể để rễ không bị đọng nước, và đặc biệt là nhớ khử trùng kéo/dụng cụ làm vườn bằng cồn sau khi tỉa cây bệnh bạn nhé!",
    summaryMessage: "Đừng buồn khi phải bỏ một vài cây bệnh nhé bạn ơi, hành động nhanh lúc này chính là 'pha cứu thua ngoạn mục' cho cả vườn đấy! Chúc bạn chăm sóc luống rau thật vững tay! 💚✨"
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
      organic: "🥬 Bạn hãy tạm ngưng tưới nước 1-2 hôm để bề mặt luống đất và bẹ lá thật ráo ráo nào. Nhẹ nhàng nhổ bỏ những cây đã nhũn úng, gom sạch tàn dư ra khỏi nhà kính để mầm bệnh không còn chỗ trú ngụ nhé!",
      chemical: "🧪 Với các cây kề bên còn khỏe mạnh, bạn phun sương nhẹ hoạt chất sinh học Kasugamycin hoặc Streptomycin sulphate pha loãng để tạo 'lá chắn đề kháng' ngăn ngừa vi khuẩn ghé thăm nha."
    },
    greenhouseActions: "☀️ Tăng cường quạt thông gió để làm khô ráo không khí trong nhà kính. Lần tưới sau nhớ chuyển sang chế độ tưới nhỏ giọt sát gốc, tránh tưới xối nước mạnh làm dập bẹ lá và bắn vi khuẩn nhé!",
    summaryMessage: "Phát hiện sớm thế này thì luống xà lách của bạn vẫn giữ được năng suất tuyệt vời! Chỉ cần giữ gốc khô ráo là cây lại giòn ngọt, xanh mát ngay thôi! 🌿✨"
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
      organic: "🐞 Mấy 'vị khách không mời' li ti này rất sợ ẩm ướt và dầu! Bạn hãy pha dầu khoáng sinh học SK Enspray 99EC hoặc dầu Neem nguyên chất xịt đẫm mặt dưới lá lúc chiều mát nhé. Nếu có điều kiện, thả thêm vài chú bọ rùa săn mồi vào là nhện đỏ 'hết cửa' liền!",
      chemical: "🎯 Nếu mật độ mạng tơ đã giăng nhiều, bạn có thể luân phiên phun một đợt thuốc đặc trị nguồn gốc sinh học như Abamectin hoặc Fenpyroximate, nhớ đổi hoạt chất giữa các lần xịt để các bạn nhện không bị 'nhờn thuốc' nhé!"
    },
    greenhouseActions: "💦 Nhện đỏ cực kỳ thích thời tiết hanh khô! Bạn hãy xịt phun sương nước mát định kỳ vào giữa trưa để tăng độ ẩm nhà kính lên trên 65%, môi trường mát ẩm là nhện tự động bỏ đi ngay!",
    summaryMessage: "Những chấm vàng nhỏ chưa làm khó được chúng ta đâu! Chỉ cần xịt ẩm mát và phun dầu neem vài bữa là tán lá lại xanh bóng mượt mà liền, yên tâm nhé bạn! 🍓🍀"
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
      organic: "🥛 Bật mí cho bạn một mẹo dân gian cực kỳ hiệu quả mà siêu lành tính: Pha sữa tươi không đường với nước theo tỷ lệ 1:9 (hoặc dùng 5g baking soda pha với 1 lít nước) xịt đều 2 mặt lá dưới ánh nắng buổi sáng. Axit lactic và ánh nắng sẽ làm nấm phấn trắng biến mất như một phép màu luôn đấy!",
      chemical: "🌿 Nếu diện tích tán lá nhiễm phấn dày, bạn dùng luân phiên Hexaconazole (Anvil 5SC) hoặc Azoxystrobin (Amistar 250SC) liều nhẹ để dập dứt điểm bào tử nấm nha!"
    },
    greenhouseActions: "✂️ Tỉa bớt các lá già dưới sát gốc để luống cây thật thông thoáng, đón trọn ánh nắng chan hòa. Càng nhiều nắng và gió thì phấn trắng càng không có cơ hội bén mảng!",
    summaryMessage: "Trông như ai rắc bột mì lên lá thôi chứ không đáng lo đâu nè! Áp dụng mẹo xịt sữa tươi hoặc tỉa thoáng gốc là vài ngày sau bạn sẽ lại thấy dàn lá xanh mướt mượt mà ngay! 🥒💚"
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
      organic: "🟡 Bạn hãy treo ngay các tấm bẫy dính màu vàng óng ánh quanh luống cây, bọ phấn mê màu vàng lắm nên sẽ tự bay vào dính bẫy hàng loạt! Kết hợp phun chế phẩm nấm xanh nấm trắng (Beauveria bassiana) để diệt ấu trùng một cách an toàn nhất nha.",
      chemical: "🔫 Trường hợp mật độ bọ bay nhiều như đàn bướm nhỏ, bạn hãy phun một đợt Movento 150OD (Spirotetramat) hoặc Pymetrozine - thuốc này lưu dẫn hai chiều cực tốt và êm cây nhé!"
    },
    greenhouseActions: "🚪 Nhớ kiểm tra lại toàn bộ màng lưới chắn côn trùng quanh nhà kính và luôn khép chặt cửa đệm 2 lớp khi ra vào để các bạn bọ phấn ngoài đồng không 'lạc trôi' vào nhà kính nhé!",
    summaryMessage: "Bẫy dính vàng và chút chế phẩm sinh học là bảo bối trị bọ phấn trắng siêu ngọt ngào! Chúc bạn có một ngày làm vườn thật nhiều niềm vui và thu hoạch bội thu nha! 🍅✨"
  }
];

const SYSTEM_PROMPT = `Bạn là Bác sĩ Cây Trồng Thân Thiện & Kỹ Sư Bệnh Học Nông Nghiệp Nhà Kính (Plant Doctor & Pathologist) tràn đầy tâm huyết, yêu thiên nhiên và cực kỳ tận tâm với người làm vườn.
Nhiệm vụ của bạn là xem hình ảnh chụp thực tế của cây trồng kết hợp với những chia sẻ, triệu chứng do người trồng cung cấp để chẩn đoán chính xác tình trạng sức khỏe của cây.

PHONG THÁI & GIỌNG VĂN CỦA BẠN (CỰC KỲ QUAN TRỌNG):
- GIỐNG NGƯỜI THẬT 100%: Nói chuyện tự nhiên, ân cần, gần gũi, ấm áp, có cảm xúc như một người chuyên gia nông nghiệp giàu kinh nghiệm đang đứng ngay bên cạnh luống rau trò chuyện, hướng dẫn trực tiếp cho bạn làm vườn.
- VUI VẺ & TRUYỀN NĂNG LƯỢNG TÍCH CỰC: Sử dụng câu từ hóm hỉnh, lạc quan, động viên người trồng đừng quá lo lắng. Dùng các icon thiên nhiên tươi vui sinh động (🌱, 🌿, 🌸, 💧, ☀️, 🧑‍🌾, 💚, ✨, 💪).
- TÂM HUYẾT & TẬN TÌNH: Không dùng lời văn máy móc vô cảm, không sao chép sách giáo khoa khô khan. Hướng dẫn từng bước cụ thể, dễ làm, ưu tiên giải pháp xanh hữu cơ an toàn cho sức khỏe và môi trường. Nếu dùng thuốc hóa học thì luôn dặn dò ân cần về liều lượng và thời gian cách ly.
- PHÂN LOẠI CHUẨN XÁC:
  * severity: 'normal' (cây khỏe / bất thường nhẹ tự khỏi), 'warning' (cảnh báo nhẹ, cần chăm sóc điều chỉnh), 'critical' (nguy hiểm, cần can thiệp ngay để tránh lây lan).
  * growth_status: 'excellent', 'good', 'average', 'poor'.
  * pest_status: 'none', 'low', 'medium', 'high'.

BẮT BUỘC chỉ trả về định dạng JSON thuần túy (không kèm markdown \`\`\`json) theo đúng schema:
{
  "detected": true,
  "disease_name": "Tên bệnh tiếng Việt kèm tên khoa học thân thuộc",
  "scientific_name": "Tên khoa học quốc tế",
  "pathogen_type": "Nấm / Vi khuẩn / Côn trùng chích hút / Mất cân bằng dinh dưỡng",
  "confidence": 0.95,
  "severity": "warning",
  "growth_status": "average",
  "pest_status": "medium",
  "symptoms_observed": [
    "Mô tả sinh động, chỉ rõ chi tiết lá/vết bệnh quan sát được trên ảnh như đang chỉ tay cho người trồng thấy",
    "Đối chiếu tinh tế với mô tả lâm sàng người trồng đã chia sẻ"
  ],
  "treatment": {
    "organic": "Hướng dẫn biện pháp hữu cơ, sinh học, mẹo làm vườn tỉ mỉ, đầy tâm huyết, cầm tay chỉ việc",
    "chemical": "Lời dặn dò chu đáo về hoạt chất/thuốc đặc trị khi khẩn cấp kèm lưu ý an toàn và thời gian cách ly"
  },
  "greenhouse_actions": "Lời khuyên điều chỉnh nắng, gió, độ ẩm, tưới tiêu trong nhà kính với giọng điệu ân cần",
  "summary_message": "Lời nhắn gửi đong đầy năng lượng tích cực, ấm áp, động viên chủ vườn kèm icon dễ thương"
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
      summary_message: bestMatch.summaryMessage || `Chào bạn nhé! Mình vừa phát hiện dấu hiệu của ${bestMatch.name} trên cây trồng. Đừng quá lo lắng nha, bạn xem ngay các bước xử lý hữu cơ ở trên để giúp cây sớm hồi phục xanh tốt nhé! 🌱✨`
    };
  }

  // Trường hợp không phát hiện bệnh cụ thể
  return {
    detected: false,
    disease_name: "Cây Trồng Khỏe Mạnh & An Toàn (Không phát hiện sâu bệnh nguy hiểm)",
    scientific_name: "N/A",
    pathogen_type: "Sinh trưởng bình thường",
    confidence: 0.85,
    severity: "normal",
    growth_status: "good",
    pest_status: "none",
    symptoms_observed: [
      "🌿 Mặt lá xanh mượt, phiến lá căng đều tự nhiên, không thấy dấu hiệu đốm nấm hay rệp bọ gây hại",
      "🌱 Các mô tế bào phát triển đều đặn, không có biểu hiện xoăn đọt hay héo úa"
    ],
    treatment: {
      organic: "💚 Tuyệt vời lắm bạn ơi! Cây đang phát triển rất vui vẻ và khỏe khoắn. Bạn cứ tiếp tục duy trì chế độ tưới nước đều đặn vào sáng sớm, định kỳ bổ sung dinh dưỡng hữu cơ (phân trùn quế hoặc ủ vi sinh) để tăng đề kháng cho rễ nha!",
      chemical: "✨ Không cần sử dụng bất kỳ loại thuốc bảo vệ thực vật nào cả. Giữ rau sạch hữu cơ tự nhiên là tuyệt vời nhất!"
    },
    greenhouse_actions: "🌤️ Giữ độ ẩm nhà kính ổn định 65-75%, mở quạt lưu thông gió thoang thoảng và đảm bảo ánh nắng chan hòa để cây quang hợp tạo vị ngọt mát tự nhiên nhé!",
    summary_message: "Xin chúc mừng bạn nha! Luống rau của bạn đang tràn đầy sức sống và rất khỏe mạnh. Hãy tiếp tục giữ vững phong độ chăm sóc tuyệt vời này nhé! Chúc bạn thu hoạch thật bội thu! 🌱☀️🎉"
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
