/**
 * 재고 컨트롤러
 */
const db = require('../models/db');

/**
 * 재고 현황 조회
 * GET /api/inventory
 */
const getAllInventory = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT id as "menuId", name as "menuName", stock, is_available as "isAvailable"
      FROM menus
      ORDER BY id
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 재고 수정
 * PATCH /api/inventory/:menuId
 */
const updateInventory = async (req, res, next) => {
  try {
    const { menuId } = req.params;
    const { stock, adjustment } = req.body;

    // stock이나 adjustment 둘 중 하나는 있어야 함
    if (stock === undefined && adjustment === undefined) {
      return res.status(400).json({
        success: false,
        error: 'stock 또는 adjustment 값이 필요합니다.',
      });
    }

    let result;

    if (stock !== undefined) {
      // 절대값 설정 방식
      const newStock = Math.max(0, parseInt(stock));
      result = await db.query(`
        UPDATE menus
        SET stock = $1,
            is_available = CASE WHEN $1 > 0 THEN TRUE ELSE FALSE END
        WHERE id = $2
        RETURNING id as "menuId", name as "menuName", stock, is_available as "isAvailable"
      `, [newStock, menuId]);
    } else {
      // 증감 방식
      result = await db.query(`
        UPDATE menus
        SET stock = GREATEST(0, stock + $1),
            is_available = CASE WHEN GREATEST(0, stock + $1) > 0 THEN TRUE ELSE FALSE END
        WHERE id = $2
        RETURNING id as "menuId", name as "menuName", stock, is_available as "isAvailable"
      `, [parseInt(adjustment), menuId]);
    }

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '메뉴를 찾을 수 없습니다.',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllInventory,
  updateInventory,
};
