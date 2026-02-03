/**
 * 주문 컨트롤러
 */
const db = require('../models/db');

/**
 * 주문 목록 조회
 * GET /api/orders
 */
const getAllOrders = async (req, res, next) => {
  try {
    // 주문 목록 조회
    const ordersResult = await db.query(`
      SELECT id, total_amount as "totalAmount", status,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM orders
      ORDER BY created_at DESC
    `);

    // 각 주문의 상세 정보 조회
    const orders = await Promise.all(
      ordersResult.rows.map(async (order) => {
        // 주문 아이템 조회
        const itemsResult = await db.query(`
          SELECT id, menu_id as "menuId", menu_name as "menuName",
                 quantity, unit_price as "unitPrice", subtotal
          FROM order_items
          WHERE order_id = $1
        `, [order.id]);

        // 각 아이템의 옵션 조회
        const items = await Promise.all(
          itemsResult.rows.map(async (item) => {
            const optionsResult = await db.query(`
              SELECT option_name as "name", option_price as "price"
              FROM order_item_options
              WHERE order_item_id = $1
            `, [item.id]);

            return {
              ...item,
              options: optionsResult.rows,
            };
          })
        );

        return {
          ...order,
          items,
        };
      })
    );

    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 주문 생성
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
  const client = await db.getClient();

  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: '주문 항목이 필요합니다.',
      });
    }

    await client.query('BEGIN');

    let totalAmount = 0;
    const orderItems = [];

    // 각 아이템 처리
    for (const item of items) {
      const { menuId, quantity, selectedOptions = [] } = item;

      // 메뉴 정보 조회
      const menuResult = await client.query(`
        SELECT id, name, price, stock, is_available
        FROM menus
        WHERE id = $1
      `, [menuId]);

      if (menuResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `메뉴 ID ${menuId}를 찾을 수 없습니다.`,
        });
      }

      const menu = menuResult.rows[0];

      // 재고 확인
      if (menu.stock < quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          error: `'${menu.name}' 메뉴의 재고가 부족합니다. (현재 재고: ${menu.stock})`,
        });
      }

      // 옵션 정보 조회 및 가격 계산
      let unitPrice = menu.price;
      const optionDetails = [];

      for (const optionId of selectedOptions) {
        const optionResult = await client.query(`
          SELECT id, name, price
          FROM options
          WHERE id = $1 AND menu_id = $2
        `, [optionId, menuId]);

        if (optionResult.rows.length > 0) {
          const option = optionResult.rows[0];
          unitPrice += option.price;
          optionDetails.push({
            optionId: option.id,
            name: option.name,
            price: option.price,
          });
        }
      }

      const subtotal = unitPrice * quantity;
      totalAmount += subtotal;

      orderItems.push({
        menuId,
        menuName: menu.name,
        quantity,
        unitPrice,
        subtotal,
        options: optionDetails,
      });

      // 재고 차감
      await client.query(`
        UPDATE menus
        SET stock = stock - $1,
            is_available = CASE WHEN stock - $1 > 0 THEN TRUE ELSE FALSE END
        WHERE id = $2
      `, [quantity, menuId]);
    }

    // 주문 생성
    const orderResult = await client.query(`
      INSERT INTO orders (total_amount, status)
      VALUES ($1, 'pending')
      RETURNING id, total_amount as "totalAmount", status,
                created_at as "createdAt", updated_at as "updatedAt"
    `, [totalAmount]);

    const order = orderResult.rows[0];

    // 주문 아이템 저장
    const savedItems = [];
    for (const item of orderItems) {
      const itemResult = await client.query(`
        INSERT INTO order_items (order_id, menu_id, menu_name, quantity, unit_price, subtotal)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `, [order.id, item.menuId, item.menuName, item.quantity, item.unitPrice, item.subtotal]);

      const orderItemId = itemResult.rows[0].id;

      // 주문 아이템 옵션 저장
      for (const option of item.options) {
        await client.query(`
          INSERT INTO order_item_options (order_item_id, option_id, option_name, option_price)
          VALUES ($1, $2, $3, $4)
        `, [orderItemId, option.optionId, option.name, option.price]);
      }

      savedItems.push({
        menuId: item.menuId,
        menuName: item.menuName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.subtotal,
        options: item.options.map(o => ({ name: o.name, price: o.price })),
      });
    }

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        ...order,
        items: savedItems,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

/**
 * 주문 상세 조회
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 주문 조회
    const orderResult = await db.query(`
      SELECT id, total_amount as "totalAmount", status,
             created_at as "createdAt", updated_at as "updatedAt"
      FROM orders
      WHERE id = $1
    `, [id]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.',
      });
    }

    const order = orderResult.rows[0];

    // 주문 아이템 조회
    const itemsResult = await db.query(`
      SELECT id, menu_id as "menuId", menu_name as "menuName",
             quantity, unit_price as "unitPrice", subtotal
      FROM order_items
      WHERE order_id = $1
    `, [id]);

    // 각 아이템의 옵션 조회
    const items = await Promise.all(
      itemsResult.rows.map(async (item) => {
        const optionsResult = await db.query(`
          SELECT option_name as "name", option_price as "price"
          FROM order_item_options
          WHERE order_item_id = $1
        `, [item.id]);

        return {
          ...item,
          options: optionsResult.rows,
        };
      })
    );

    res.json({
      success: true,
      data: {
        ...order,
        items,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 주문 상태 변경
 * PATCH /api/orders/:id/status
 */
const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'accepted', 'preparing', 'completed'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `유효하지 않은 상태입니다. 허용된 값: ${validStatuses.join(', ')}`,
      });
    }

    // 주문 존재 확인 및 업데이트
    const result = await db.query(`
      UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING id, total_amount as "totalAmount", status,
                created_at as "createdAt", updated_at as "updatedAt"
    `, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: '주문을 찾을 수 없습니다.',
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

/**
 * 주문 통계 조회
 * GET /api/orders/stats
 */
const getOrderStats = async (req, res, next) => {
  try {
    const result = await db.query(`
      SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending,
        COUNT(*) FILTER (WHERE status = 'accepted') as accepted,
        COUNT(*) FILTER (WHERE status = 'preparing') as preparing,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
      FROM orders
    `);

    const stats = result.rows[0];

    res.json({
      success: true,
      data: {
        total: parseInt(stats.total),
        pending: parseInt(stats.pending),
        accepted: parseInt(stats.accepted),
        preparing: parseInt(stats.preparing),
        completed: parseInt(stats.completed),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllOrders,
  createOrder,
  getOrderById,
  updateOrderStatus,
  getOrderStats,
};
