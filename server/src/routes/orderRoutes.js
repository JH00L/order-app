/**
 * 주문 관련 라우트
 */
const express = require('express');
const orderController = require('../controllers/orderController');

const router = express.Router();

// GET /api/orders/stats - 주문 통계 조회 (stats를 먼저 정의)
router.get('/stats', orderController.getOrderStats);

// GET /api/orders - 주문 목록 조회
router.get('/', orderController.getAllOrders);

// POST /api/orders - 주문 생성
router.post('/', orderController.createOrder);

// GET /api/orders/:id - 주문 상세 조회
router.get('/:id', orderController.getOrderById);

// PATCH /api/orders/:id/status - 주문 상태 변경
router.patch('/:id/status', orderController.updateOrderStatus);

module.exports = router;
