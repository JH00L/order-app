import { useState } from 'react'
import MenuCard from '../components/MenuCard'
import Cart from '../components/Cart'
import { menuData } from '../data/menuData'

function OrderPage() {
  const [cartItems, setCartItems] = useState([])

  const handleAddToCart = (menu, selectedOptions) => {
    const optionIds = selectedOptions.map((o) => o.id).sort().join(',')
    const optionPrice = selectedOptions.reduce((sum, o) => sum + o.price, 0)
    const totalPrice = menu.price + optionPrice

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.menuId === menu.id && 
        item.selectedOptions.map((o) => o.id).sort().join(',') === optionIds
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

  const handleOrder = () => {
    if (cartItems.length === 0) return
    alert('주문이 완료되었습니다!')
    setCartItems([])
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-48">
        {menuData.map((menu) => (
          <MenuCard key={menu.id} menu={menu} onAddToCart={handleAddToCart} />
        ))}
      </div>
      <Cart items={cartItems} onOrder={handleOrder} onRemoveItem={handleRemoveItem} />
    </>
  )
}

export default OrderPage
