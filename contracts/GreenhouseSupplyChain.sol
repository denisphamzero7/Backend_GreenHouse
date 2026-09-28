// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title GreenhouseSupplyChain
 * @dev Hợp đồng thông minh lưu trữ và xác thực tính bất biến của nông sản nhà kính
 */
contract GreenhouseSupplyChain {
    address public admin;

    enum BatchStatus { Harvested, Packaged, Shipped, Delivered }

    struct ProductBatch {
        string productId;        // ID trong MongoDB
        string batchCode;        // Mã lô sản phẩm (VD: BATCH-2026-XALACH-001)
        string cropName;         // Tên giống rau
        string greenhouseName;   // Nhà kính canh tác
        bytes32 dataHash;        // Mã băm SHA-256 dữ liệu phả hệ & nhật ký AI
        BatchStatus status;      // Trạng thái chuỗi cung ứng
        uint256 harvestTime;     // Thời điểm thu hoạch
        uint256 recordedTime;    // Thời điểm ghi lên chuỗi khối
        address recorder;        // Địa chỉ ví người ghi nhận
    }

    // Mapping từ productId (MongoDB ID) -> ProductBatch
    mapping(string => ProductBatch) public batches;
    string[] public batchIds;

    event BatchRegistered(
        string indexed productId,
        string batchCode,
        string cropName,
        bytes32 dataHash,
        uint256 recordedTime,
        address recorder
    );

    event BatchStatusUpdated(
        string indexed productId,
        BatchStatus newStatus,
        uint256 updatedTime,
        string notes
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "Chi Admin moi co quyen thuc thi");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /**
     * @dev Đăng ký lô nông sản mới lên chuỗi khối
     */
    function registerBatch(
        string memory _productId,
        string memory _batchCode,
        string memory _cropName,
        string memory _greenhouseName,
        bytes32 _dataHash,
        uint256 _harvestTime
    ) public {
        require(bytes(batches[_productId].productId).length == 0, "Lo hang nay da ton tai tren chuoi");

        batches[_productId] = ProductBatch({
            productId: _productId,
            batchCode: _batchCode,
            cropName: _cropName,
            greenhouseName: _greenhouseName,
            dataHash: _dataHash,
            status: BatchStatus.Harvested,
            harvestTime: _harvestTime,
            recordedTime: block.timestamp,
            recorder: msg.sender
        });

        batchIds.push(_productId);

        emit BatchRegistered(
            _productId,
            _batchCode,
            _cropName,
            _dataHash,
            block.timestamp,
            msg.sender
        );
    }

    /**
     * @dev Cập nhật trạng thái chuỗi cung ứng (Packaged, Shipped, Delivered)
     */
    function updateBatchStatus(
        string memory _productId,
        BatchStatus _newStatus,
        string memory _notes
    ) public {
        require(bytes(batches[_productId].productId).length > 0, "Khong tim thay lo hang");
        batches[_productId].status = _newStatus;

        emit BatchStatusUpdated(_productId, _newStatus, block.timestamp, _notes);
    }

    /**
     * @dev Xác thực tính toàn vẹn của lô hàng: So sánh mã băm hiện tại với mã băm bất biến trên chuỗi
     */
    function verifyBatch(
        string memory _productId,
        bytes32 _currentHash
    ) public view returns (
        bool isValid,
        string memory batchCode,
        string memory cropName,
        bytes32 recordedHash,
        uint256 recordedTime,
        BatchStatus status
    ) {
        ProductBatch memory b = batches[_productId];
        require(bytes(b.productId).length > 0, "Lo hang chua duoc ghi tren chuoi");

        isValid = (b.dataHash == _currentHash);
        return (
            isValid,
            b.batchCode,
            b.cropName,
            b.dataHash,
            b.recordedTime,
            b.status
        );
    }

    /**
     * @dev Lấy tổng số lượng lô hàng đã ghi nhận
     */
    function getTotalBatches() public view returns (uint256) {
        return batchIds.length;
    }
}
