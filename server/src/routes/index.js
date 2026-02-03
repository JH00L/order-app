/**
 * API 라우트 통합
 */
const express = require('express');
const menuRoutes = require('./menuRoutes');
const orderRoutes = require('./orderRoutes');
const inventoryRoutes = require('./inventoryRoutes');

const router = express.Router();

// 라우트 등록
router.use('/menus', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/inventory', inventoryRoutes);

// API 정보 엔드포인트
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '커피 주문 앱 API',
    version: '1.0.0',
    endpoints: {
      menus: '/api/menus',
      orders: '/api/orders',
      inventory: '/api/inventory',
    },
  });
});

module.exports = router;
