/**
 * 메뉴 컨트롤러
 */
const db = require('../models/db');

/**
 * 메뉴 목록 조회
 * GET /api/menus
 */
const getAllMenus = async (req, res, next) => {
  try {
    // 메뉴 목록 조회
    const menusResult = await db.query(`
      SELECT id, name, description, price, image, stock, is_available as "isAvailable",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM menus
      ORDER BY id
    `);

    // 각 메뉴의 옵션 조회
    const menus = await Promise.all(
      menusResult.rows.map(async (menu) => {
        const optionsResult = await db.query(`
          SELECT id, name, price
          FROM options
          WHERE menu_id = $1
          ORDER BY id
        `, [menu.id]);

        return {
          ...menu,
          options: optionsResult.rows,
        };
      })
    );

    res.json({
      success: true,
      data: menus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 메뉴 상세 조회
 * GET /api/menus/:id
 */
const getMenuById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 메뉴 조회
    const menuResult = await db.query(`
      SELECT id, name, description, price, image, stock, is_available as "isAvailable",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM menus
      WHERE id = $1
    `, [id]);

    if (menuResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '메뉴를 찾을 수 없습니다.',
      });
    }

    // 옵션 조회
    const optionsResult = await db.query(`
      SELECT id, name, price
      FROM options
      WHERE menu_id = $1
      ORDER BY id
    `, [id]);

    const menu = {
      ...menuResult.rows[0],
      options: optionsResult.rows,
    };

    res.json({
      success: true,
      data: menu,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllMenus,
  getMenuById,
};
