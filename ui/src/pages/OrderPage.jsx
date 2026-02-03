import { useState, useEffect } from 'react'
import MenuCard from '../components/MenuCard'
import Cart from '../components/Cart'
import { api } from '../api/client'

function OrderPage() {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cartItems, setCartItems] = useState([])
  const [orderSubmitting, setOrderSubmitting] = useState(false)

  // 메뉴 목록 API 조회
  useEffect(() => {
    let cancelled = false
    async function fetchMenus() {
      try {
        setLoading(true)
        setError(null)
        const res = await api.getMenus()
        if (!cancelled && res.success && res.data) {
          setMenus(res.data)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.message || '메뉴를 불러오지 못했습니다.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchMenus()
    return () => { cancelled = true }
  }, [])

  const handleAddToCart = (menu, selectedOptions) => {
    const optionIds = selectedOptions.map((o) => o.id).sort()
    const optionPrice = selectedOptions.reduce((sum, o) => sum + o.price, 0)
    const totalPrice = menu.price + optionPrice

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.menuId === menu.id &&
          item.selectedOptions.map((o) => o.id).sort().join(',') === optionIds.join(',')
      )

      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        }
        return updated
      }

      return [
        ...prev,
        {
          menuId: menu.id,
          menuName: menu.name,
          basePrice: menu.price,
          selectedOptions,
          quantity: 1,
          totalPrice,
        },
      ]
    })
  }

  const handleRemoveItem = (index) => {
    setCartItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleOrder = async () => {
    if (cartItems.length === 0) return
    try {
      setOrderSubmitting(true)
      const body = {
        items: cartItems.map((item) => ({
          menuId: item.menuId,
          quantity: item.quantity,
          selectedOptions: item.selectedOptions.map((o) => o.id),
        })),
      }
      const res = await api.createOrder(body)
      if (res.success) {
        setCartItems([])
        alert('주문이 완료되었습니다!')
      } else {
        alert(res.error || '주문에 실패했습니다.')
      }
    } catch (e) {
      alert(e.message || '주문에 실패했습니다.')
    } finally {
      setOrderSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-gray-500">메뉴를 불러오는 중...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-48">
        {menus.map((menu) => (
          <MenuCard key={menu.id} menu={menu} onAddToCart={handleAddToCart} />
        ))}
      </div>
      <Cart
        items={cartItems}
        onOrder={handleOrder}
        onRemoveItem={handleRemoveItem}
        submitting={orderSubmitting}
      />
    </>
  )
}

export default OrderPage
