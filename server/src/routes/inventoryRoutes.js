/**
 * 재고 관련 라우트
 */
const express = require('express');
const inventoryController = require('../controllers/inventoryController');

const router = express.Router();

// GET /api/inventory - 재고 현황 조회
router.get('/', inventoryController.getAllInventory);

// PATCH /api/inventory/:menuId - 재고 수정
router.patch('/:menuId', inventoryController.updateInventory);

module.exports = router;
