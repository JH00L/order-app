import { useState, useEffect, useCallback } from 'react'
import { api } from '../api/client'

function AdminPage() {
  const [inventory, setInventory] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    accepted: 0,
    preparing: 0,
    completed: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchInventory = useCallback(async () => {
    try {
      const res = await api.getInventory()
      if (res.success && res.data) {
        setInventory(
          res.data.map((item) => ({
            id: item.menuId,
            name: item.menuName,
            stock: item.stock,
          }))
        )
      }
    } catch (e) {
      setError(e.message || '재고를 불러오지 못했습니다.')
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    try {
      const res = await api.getOrders()
      if (res.success && res.data) {
        setOrders(
          res.data.map((order) => ({
            id: order.id,
            createdAt: order.createdAt,
            items: order.items.map((item) => ({
              menuName: item.menuName,
              quantity: item.quantity,
              price: item.unitPrice,
            })),
            totalAmount: order.totalAmount,
            status: order.status,
          }))
        )
      }
    } catch (e) {
      setError(e.message || '주문 목록을 불러오지 못했습니다.')
    }
  }, [])

  const fetchStats = useCallback(async () => {
    try {
      const res = await api.getOrderStats()
      if (res.success && res.data) {
        setStats(res.data)
      }
    } catch (e) {
      setError(e.message || '통계를 불러오지 못했습니다.')
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        await Promise.all([fetchInventory(), fetchOrders(), fetchStats()])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [fetchInventory, fetchOrders, fetchStats])

  const refresh = useCallback(() => {
    fetchInventory()
    fetchOrders()
    fetchStats()
  }, [fetchInventory, fetchOrders, fetchStats])

  const getStockStatus = (stock) => {
    if (stock === 0) return { text: '품절', color: 'text-red-600 bg-red-100' }
    if (stock < 5) return { text: '주의', color: 'text-yellow-600 bg-yellow-100' }
    return { text: '정상', color: 'text-green-600 bg-green-100' }
  }

  const handleIncreaseStock = async (id) => {
    try {
      const res = await api.updateInventory(id, { adjustment: 1 })
      if (res.success && res.data) {
        setInventory((prev) =>
          prev.map((item) =>
            item.id === res.data.menuId
              ? { ...item, stock: res.data.stock }
              : item
          )
        )
      }
    } catch (e) {
      alert(e.message || '재고 수정에 실패했습니다.')
    }
  }

  const handleDecreaseStock = async (id) => {
    try {
      const res = await api.updateInventory(id, { adjustment: -1 })
      if (res.success && res.data) {
        setInventory((prev) =>
          prev.map((item) =>
            item.id === res.data.menuId
              ? { ...item, stock: res.data.stock }
              : item
          )
        )
      }
    } catch (e) {
      alert(e.message || '재고 수정에 실패했습니다.')
    }
  }

  const handleStatusChange = async (orderId) => {
    const order = orders.find((o) => o.id === orderId)
    if (!order) return
    const nextStatus = {
      pending: 'accepted',
      accepted: 'preparing',
      preparing: 'completed',
    }
    const newStatus = nextStatus[order.status]
    if (!newStatus) return
    try {
      const res = await api.updateOrderStatus(orderId, newStatus)
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status: newStatus } : o
          )
        )
        fetchStats()
      }
    } catch (e) {
      alert(e.message || '상태 변경에 실패했습니다.')
    }
  }

  const getStatusButton = (status) => {
    switch (status) {
      case 'pending':
        return { text: '주문 접수', color: 'bg-blue-600 hover:bg-blue-700 text-white' }
      case 'accepted':
        return { text: '제조 시작', color: 'bg-orange-500 hover:bg-orange-600 text-white' }
      case 'preparing':
        return { text: '제조 완료', color: 'bg-green-600 hover:bg-green-700 text-white' }
      default:
        return null
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'pending':
        return { text: '신규', color: 'bg-gray-200 text-gray-700' }
      case 'accepted':
        return { text: '접수', color: 'bg-blue-100 text-blue-700' }
      case 'preparing':
        return { text: '제조중', color: 'bg-orange-100 text-orange-700' }
      case 'completed':
        return { text: '완료', color: 'bg-green-100 text-green-700' }
      default:
        return { text: status, color: 'bg-gray-100 text-gray-600' }
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month}월 ${day}일 ${hours}:${minutes}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-500">데이터를 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          다시 불러오기
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 관리자 대시보드 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">관리자 대시보드</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">총 주문</p>
            <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
            <p className="text-sm text-blue-600 mb-1">주문 접수</p>
            <p className="text-3xl font-bold text-blue-600">{stats.pending + stats.accepted}</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
            <p className="text-sm text-orange-600 mb-1">제조 중</p>
            <p className="text-3xl font-bold text-orange-600">{stats.preparing}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-sm text-green-600 mb-1">제조 완료</p>
            <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
          </div>
        </div>
      </div>

      {/* 재고 현황 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-4">재고 현황</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {inventory.map((item) => {
            const stockStatus = getStockStatus(item.stock)
            return (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">{item.name}</h3>
                  <span
                    className={`text-xs px-2 py-1 rounded ${stockStatus.color}`}
                  >
                    {stockStatus.text}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-800">
                    {item.stock}개
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDecreaseStock(item.id)}
                      disabled={item.stock === 0}
                      className={`w-8 h-8 rounded border flex items-center justify-center transition-colors ${
                        item.stock === 0
                          ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                          : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      -
                    </button>
                    <button
                      onClick={() => handleIncreaseStock(item.id)}
                      className="w-8 h-8 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 주문 현황 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">주문 현황</h2>
          <button
            onClick={refresh}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            새로고침
          </button>
        </div>
        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">주문이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const statusButton = getStatusButton(order.status)
              const statusLabel = getStatusLabel(order.status)
              return (
                <div
                  key={order.id}
                  className="border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    <span
                      className={`text-xs px-2 py-1 rounded w-fit ${statusLabel.color}`}
                    >
                      {statusLabel.text}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="text-gray-800">
                      {order.items.map((item) => `${item.menuName} x ${item.quantity}`).join(', ')}
                    </span>
                    <span className="font-medium text-gray-800">
                      {order.totalAmount.toLocaleString()}원
                    </span>
                  </div>
                  {statusButton && (
                    <button
                      onClick={() => handleStatusChange(order.id)}
                      className={`px-4 py-2 rounded text-sm transition-colors shrink-0 ${statusButton.color}`}
                    >
                      {statusButton.text}
                    </button>
                  )}
                  {order.status === 'completed' && (
                    <span className="text-sm text-green-600 font-medium">완료됨</span>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPage
