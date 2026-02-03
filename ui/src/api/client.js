/**
 * 백엔드 API 클라이언트
 */
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }
  const res = await fetch(url, config)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `요청 실패 (${res.status})`)
  }
  return data
}

export const api = {
  /** 메뉴 목록 조회 */
  getMenus: () => request('/menus'),

  /** 메뉴 상세 조회 */
  getMenuById: (id) => request(`/menus/${id}`),

  /** 주문 목록 조회 */
  getOrders: () => request('/orders'),

  /** 주문 생성 - body: { items: [{ menuId, quantity, selectedOptions: [optionId, ...] }] } */
  createOrder: (body) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  /** 주문 상세 조회 */
  getOrderById: (id) => request(`/orders/${id}`),

  /** 주문 상태 변경 - body: { status } */
  updateOrderStatus: (id, status) =>
    request(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  /** 주문 통계 */
  getOrderStats: () => request('/orders/stats'),

  /** 재고 현황 조회 */
  getInventory: () => request('/inventory'),

  /** 재고 수정 - body: { stock } 또는 { adjustment: +1/-1 } */
  updateInventory: (menuId, body) =>
    request(`/inventory/${menuId}`, {
      method: 'PATCH',
      body: JSON.stringify(body),
    }),
}
