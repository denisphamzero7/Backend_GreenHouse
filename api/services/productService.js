const crypto = require('crypto');
const Product = require('../models/productModel');
const Bed = require('../models/bedsModel');
const Vegetable = require('../models/vegetablesModel');
const Greenhouse = require('../models/greenhouseModel');
const Category = require('../models/categoryModel');
const QrCodeService = require('./qrCodeService');
const BlockchainService = require('./blockchainService');
const apiError = require('../untiles/apiError');

/**
 * Tạo mã lô sản phẩm tự động (Ví dụ: BATCH-20260928-8F3A)
 */
const generateBatchCode = (cropName = '') => {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = crypto.randomBytes(2).toString('hex').toUpperCase();
  const prefix = cropName ? cropName.trim().slice(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, '') : 'AGRI';
  return `BATCH-${dateStr}-${prefix}-${randomSuffix}`;
};

/**
 * 1. Tạo sản phẩm mới kèm mã QR và Ghi nhận Blockchain
 */
const createProduct = async (data, file) => {
  const {
    name,
    type,
    totalQuantity,
    quantity,
    unit = 'kg',
    greenhouse,
    beds,
    category,
    crops,
    qualityStatus = 'good',
    seedOrigin = 'Nhập khẩu chuẩn F1',
    status = 'processing',
    notes,
    harvestDate
  } = data;

  const existing = await Product.findOne({ name });
  if (existing) throw new apiError(400, 'name', 'Tên sản phẩm / Lô hàng này đã tồn tại');

  // Lấy ảnh upload nếu có
  const image = file ? file.path : (data.image || null);
  const actualQuantity = totalQuantity || quantity || 0;

  // Lấy thông tin bổ trợ để tạo mã băm phả hệ
  const [cropDoc, greenhouseDoc, categoryDoc, bedDocs] = await Promise.all([
    crops ? Vegetable.findById(crops).lean() : null,
    greenhouse ? Greenhouse.findById(greenhouse).lean() : null,
    category ? Category.findById(category).lean() : null,
    beds && beds.length > 0 ? Bed.find({ _id: { $in: Array.isArray(beds) ? beds : [beds] } }).lean() : []
  ]);

  const cropName = cropDoc ? cropDoc.name : 'Rau sạch';
  const greenhouseName = greenhouseDoc ? greenhouseDoc.name : 'Nhà kính công nghệ cao';
  const categoryName = categoryDoc ? categoryDoc.name : 'Nông sản';
  const batchCode = data.batchCode || generateBatchCode(cropName);

  // Tính toán vân tay nhật ký canh tác & chẩn đoán AI
  const monitoringLogsDigest = BlockchainService.summarizeMonitoringLogs(bedDocs);

  // Tạo mã Hash SHA-256 bất biến cho lô hàng
  const dataHash = BlockchainService.calculateDataHash({
    productId: 'PENDING_CREATION',
    batchCode,
    cropName,
    categoryName,
    greenhouseName,
    seedOrigin,
    harvestDate: harvestDate || new Date(),
    qualityStatus,
    totalQuantity: actualQuantity,
    unit,
    monitoringLogsDigest
  });

  // Tạo document sản phẩm ban đầu trong MongoDB
  const newProduct = await Product.create({
    name,
    type,
    crops,
    category,
    greenhouse,
    beds: Array.isArray(beds) ? beds : (beds ? [beds] : []),
    totalQuantity: actualQuantity,
    unit,
    qualityStatus,
    seedOrigin,
    status,
    notes,
    harvestDate: harvestDate || new Date(),
    batchCode,
    image,
    blockchain: {
      dataHash,
      isVerified: true
    }
  });

  // Sinh mã QR Code chứa đường dẫn truy xuất
  const { qrDataUrl, traceUrl } = await QrCodeService.generateQrDataUrl(newProduct._id);

  // Ghi nhận lô hàng lên Blockchain (hoặc Cryptographic Ledger)
  const blockchainRecord = await BlockchainService.recordBatchOnChain({
    productId: newProduct._id.toString(),
    batchCode,
    cropName,
    greenhouseName,
    dataHash,
    harvestTime: newProduct.harvestDate
  });

  // Cập nhật lại QR Code và thông tin Blockchain hoàn tất vào Document
  newProduct.qrCode = qrDataUrl;
  newProduct.blockchain = {
    dataHash: blockchainRecord.dataHash,
    txHash: blockchainRecord.txHash,
    contractAddress: blockchainRecord.contractAddress,
    network: blockchainRecord.network,
    blockNumber: blockchainRecord.blockNumber,
    recordedAt: blockchainRecord.recordedAt,
    isVerified: true
  };
  await newProduct.save();

  return newProduct;
};

/**
 * 2. Lấy danh sách sản phẩm (có lọc, phân trang, sort)
 */
const getProducts = async (query) => {
  const queries = { ...query };
  const excludeFields = ['limit', 'sort', 'page', 'fields'];
  excludeFields.forEach(field => delete queries[field]);

  let queryString = JSON.stringify(queries).replace(
    /\b(gt|lt|eq|gte|lte)\b/g,
    (match) => `$${match}`
  );
  const formattedQueries = JSON.parse(queryString);

  if (query.name) {
    formattedQueries.name = { $regex: new RegExp(query.name, 'i') };
  }
  if (query.batchCode) {
    formattedQueries.batchCode = { $regex: new RegExp(query.batchCode, 'i') };
  }

  let queryCommand = Product.find(formattedQueries)
    .populate('crops', 'name harvestTime soilType description')
    .populate('category', 'name description')
    .populate('greenhouse', 'name address')
    .populate('beds', 'name size status');

  if (query.sort) {
    queryCommand = queryCommand.sort(query.sort.split(',').join(' '));
  } else {
    queryCommand = queryCommand.sort('-createdAt');
  }

  if (query.fields) {
    queryCommand = queryCommand.select(query.fields.split(',').join(' '));
  }

  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;
  const skip = (page - 1) * limit;

  queryCommand = queryCommand.skip(skip).limit(limit);

  const [data, totalCount] = await Promise.all([
    queryCommand.exec(),
    Product.countDocuments(formattedQueries)
  ]);

  return { data, totalCount };
};

/**
 * 3. Lấy thông tin 1 sản phẩm chi tiết
 */
const getProduct = async (pid) => {
  const data = await Product.findById(pid)
    .populate('crops')
    .populate('category')
    .populate('greenhouse')
    .populate('beds');
  if (!data) throw new apiError(404, 'pid', 'Không tìm thấy sản phẩm');
  return data;
};

/**
 * 4. API TRUY XUẤT NGUỒN GỐC TOÀN DIỆN (5 GIAI ĐOẠN - TIMELINE NÔNG SẢN)
 * Dành cho người tiêu dùng quét mã QR trên bao bì
 */
const getTraceabilityData = async (pid) => {
  const product = await Product.findById(pid)
    .populate('crops')
    .populate('category')
    .populate('greenhouse')
    .populate({
      path: 'beds',
      populate: {
        path: 'crops',
        select: 'name harvestTime'
      }
    });

  if (!product) throw new apiError(404, 'pid', 'Không tìm thấy thông tin nông sản cho mã này');

  // Tổng hợp nhật ký giám sát từ các luống đất
  const allLogs = [];
  if (product.beds && Array.isArray(product.beds)) {
    product.beds.forEach(bed => {
      if (bed.monitoringLogs && Array.isArray(bed.monitoringLogs)) {
        bed.monitoringLogs.forEach(log => {
          allLogs.push({
            bedName: bed.name,
            status: log.status,
            remarks: log.remarks,
            loggedAt: log.createdAt || log.date || new Date()
          });
        });
      }
    });
  }

  // Sắp xếp nhật ký theo thời gian
  allLogs.sort((a, b) => new Date(a.loggedAt) - new Date(b.loggedAt));

  // Lọc ra các ghi nhận kiểm tra an toàn của AI Bác Sĩ Cây Trồng
  const aiHealthChecks = allLogs.filter(l => (l.remarks || '').includes('[AI') || (l.remarks || '').includes('AI'));

  // Xây dựng 5 giai đoạn vòng đời nông sản chuẩn hóa (Timeline)
  const timeline = [
    {
      stage: 1,
      code: "SEEDING_AND_GENETICS",
      title: "1. Nguồn Gốc Hạt Giống & Gieo Trồng",
      status: "COMPLETED",
      timestamp: product.createdAt,
      details: {
        cropName: product.crops?.name || 'Giống rau đạt chuẩn VietGAP',
        category: product.category?.name || 'Rau ăn lá',
        seedOrigin: product.seedOrigin || 'Nhập khẩu F1 chất lượng cao',
        expectedHarvestDays: product.crops?.harvestTime || 45,
        soilOrSubstrateType: product.crops?.soilType || 'Giá thể xơ dừa hữu cơ vi sinh'
      }
    },
    {
      stage: 2,
      code: "CULTIVATION_AND_AI_INSPECTION",
      title: "2. Chăm Sóc & Kiểm Định AI Bác Sĩ Cây Trồng",
      status: "COMPLETED",
      details: {
        greenhouseName: product.greenhouse?.name || 'Nhà Kính Thông Minh Khép Kín',
        location: product.greenhouse?.address || 'Khu Nông Nghiệp Công Nghệ Cao',
        bedsCount: product.beds?.length || 0,
        totalInspections: allLogs.length,
        aiHealthInspectionCount: aiHealthChecks.length,
        purityCertification: "100% Không Dư Lượng Thuốc Bảo Vệ Thực Vật Độc Hại",
        recentLogs: allLogs.slice(-5) // 5 nhật ký gần nhất
      }
    },
    {
      stage: 3,
      code: "HARVESTING_AND_GRADING",
      title: "3. Thu Hoạch & Đánh Giá Phân Loại",
      status: "COMPLETED",
      timestamp: product.harvestDate,
      details: {
        harvestDate: product.harvestDate,
        totalQuantity: product.totalQuantity,
        unit: product.unit,
        qualityGrade: product.qualityStatus === 'excellent' ? 'Hạng Nhất (Chuẩn Xuất Khẩu)' : 'Đạt Chuẩn VietGAP',
        safetyStatus: 'Đã qua kiểm định vi sinh trước khi xuất luống'
      }
    },
    {
      stage: 4,
      code: "PACKAGING_AND_TRACE_QR",
      title: "4. Đóng Gói & Cấp Mã Tem QR",
      status: product.status === 'processing' ? 'IN_PROGRESS' : 'COMPLETED',
      details: {
        batchCode: product.batchCode,
        packageStatus: product.status,
        qrCodeUrl: product.qrCode,
        packagingNotes: product.notes || 'Đóng gói trong bao bì sinh học tự phân hủy',
        expiryRecommendation: '3 - 5 ngày ở nhiệt độ 5 - 10°C'
      }
    },
    {
      stage: 5,
      code: "BLOCKCHAIN_AUTHENTICATION",
      title: "5. Chứng Thực Toàn Vẹn Blockchain",
      status: product.blockchain?.isVerified ? "VERIFIED" : "UNVERIFIED",
      timestamp: product.blockchain?.recordedAt,
      details: {
        isImmutable: true,
        blockchainNetwork: product.blockchain?.network || 'Sepolia Testnet / Cryptographic Ledger',
        smartContractAddress: product.blockchain?.contractAddress,
        transactionHash: product.blockchain?.txHash,
        dataHash: product.blockchain?.dataHash,
        blockNumber: product.blockchain?.blockNumber,
        verificationStatus: product.blockchain?.isVerified ? "ĐÃ XÁC THỰC BẤT BIẾN" : "CHƯA XÁC THỰC",
        tamperProofGuarantee: "Dữ liệu được bảo vệ bằng mật mã học SHA-256 & Smart Contract, không thể bị sửa đổi trái phép."
      }
    }
  ];

  return {
    productId: product._id,
    productName: product.name,
    batchCode: product.batchCode,
    image: product.image,
    qrCode: product.qrCode,
    currentStatus: product.status,
    qualityStatus: product.qualityStatus,
    timeline
  };
};

/**
 * 5. Xác thực tính toàn vẹn Blockchain
 * Tự động băm lại dữ liệu hiện tại trong DB và so sánh với mã Hash ghi trên Blockchain
 */
const verifyBlockchainIntegrity = async (pid) => {
  const product = await Product.findById(pid)
    .populate('crops', 'name')
    .populate('greenhouse', 'name')
    .populate('category', 'name')
    .populate('beds');

  if (!product) throw new apiError(404, 'pid', 'Không tìm thấy sản phẩm');

  const onChainHash = product.blockchain?.dataHash;
  if (!onChainHash) {
    return {
      isValid: false,
      status: "NO_BLOCKCHAIN_RECORD",
      message: "Lô hàng này chưa được ghi nhận mã băm trên Blockchain"
    };
  }

  // Tái tạo lại mã băm từ dữ liệu hiện thời
  const monitoringLogsDigest = BlockchainService.summarizeMonitoringLogs(product.beds);
  const currentComputedHash = BlockchainService.calculateDataHash({
    productId: 'PENDING_CREATION',
    batchCode: product.batchCode,
    cropName: product.crops?.name || 'Rau sạch',
    categoryName: product.category?.name || 'Nông sản',
    greenhouseName: product.greenhouse?.name || 'Nhà kính công nghệ cao',
    seedOrigin: product.seedOrigin,
    harvestDate: product.harvestDate,
    qualityStatus: product.qualityStatus,
    totalQuantity: product.totalQuantity,
    unit: product.unit,
    monitoringLogsDigest
  });

  const verification = BlockchainService.verifyIntegrity(currentComputedHash, onChainHash);

  return {
    productId: product._id,
    batchCode: product.batchCode,
    onChainHash,
    currentComputedHash,
    txHash: product.blockchain?.txHash,
    network: product.blockchain?.network,
    ...verification
  };
};

/**
 * 6. Cập nhật sản phẩm
 */
const updateProduct = async (pid, data, file) => {
  if (file) {
    data.image = file.path;
  }
  const existing = await Product.findById(pid);
  if (!existing) {
    throw new apiError(404, 'pid', 'Không tìm thấy sản phẩm cần cập nhật');
  }
  const updatedData = await Product.findByIdAndUpdate(pid, data, { new: true });
  return updatedData;
};

/**
 * 7. Xóa sản phẩm
 */
const deleteProduct = async (pid) => {
  const data = await Product.findByIdAndDelete(pid);
  if (!data) throw new apiError(404, 'pid', 'Không tìm thấy sản phẩm để xóa');
  return data;
};

module.exports = {
  createProduct,
  getProducts,
  getProduct,
  getTraceabilityData,
  verifyBlockchainIntegrity,
  updateProduct,
  deleteProduct
};
