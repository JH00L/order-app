/**
 * 메뉴 관련 라우트
 */
const express = require('express');
const menuController = require('../controllers/menuController');

const router = express.Router();

// GET /api/menus - 메뉴 목록 조회
router.get('/', menuController.getAllMenus);

// GET /api/menus/:id - 메뉴 상세 조회
router.get('/:id', menuController.getMenuById);

module.exports = router;
