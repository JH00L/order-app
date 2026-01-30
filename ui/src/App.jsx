import { useState } from 'react'

// 임시 메뉴 데이터
const menuData = [
  {
    id: 1,
    name: '아메리카노(ICE)',
    price: 4000,
    description: '깔끔하고 시원한 아이스 아메리카노',
    image: 'https://picsum.photos/seed/coffee1/300/200',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 2,
    name: '아메리카노(HOT)',
    price: 4000,
    description: '깊고 진한 핫 아메리카노',
    image: 'https://picsum.photos/seed/coffee2/300/200',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 3,
    name: '카페라떼',
    price: 5000,
    description: '부드러운 우유와 에스프레소의 조화',
    image: 'https://picsum.photos/seed/coffee3/300/200',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 4,
    name: '바닐라라떼',
    price: 5500,
    description: '달콤한 바닐라 향이 가득한 라떼',
    image: 'https://picsum.photos/seed/coffee4/300/200',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 5,
    name: '카라멜마끼아또',
    price: 6000,
    description: '카라멜 드리즐이 올라간 달콤한 마끼아또',
    image: 'https://picsum.photos/seed/coffee5/300/200',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 },
    ],
  },
  {
    id: 6,
    name: '카푸치노',
    price: 5000,
    description: '풍성한 우유 거품이 특징인 카푸치노',
    image: 'https://picsum.photos/seed/coffee6/300/200',
    options: [
      { id: 1, name: '샷 추가', price: 500 },
      { id: 2, name: '시럽 추가', price: 0 },
    ],
  },
]

// 메뉴 카드 컴포넌트
function MenuCard({ menu, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([])

  const handleOptionChange = (option) => {
    setSelectedOptions((prev) => {
      const exists = prev.find((o) => o.id === option.id)
      if (exists) {
        return prev.filter((o) => o.id !== option.id)
      } else {
        return [...prev, option]
      }
    })
  }

  const handleAddToCart = () => {
    onAddToCart(menu, selectedOptions)
    setSelectedOptions([])
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <img
        src={menu.image}
        alt={menu.name}
        className="w-full h-40 object-cover rounded mb-3"
      />
      <h3 className="text-lg font-bold text-gray-800">{menu.name}</h3>
      <p className="text-gray-600 mb-2">{menu.price.toLocaleString()}원</p>
      <p className="text-sm text-gray-500 mb-3">{menu.description}</p>

      <div className="space-y-2 mb-4">
        {menu.options.map((option) => (
          <label key={option.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selectedOptions.some((o) => o.id === option.id)}
              onChange={() => handleOptionChange(option)}
              className="w-4 h-4 text-blue-600 rounded border-gray-300"
            />
            <span>
              {option.name} (+{option.price.toLocaleString()}원)
            </span>
          </label>
        ))}
      </div>

      <button
        onClick={handleAddToCart}
        className="w-full py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
      >
        담기
      </button>
    </div>
  )
}

// 장바구니 컴포넌트
function Cart({ items, onOrder }) {
  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 h-44">
      <div className="max-w-6xl mx-auto h-full">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-full">
          <div className="flex flex-row gap-4 h-full">
            {/* 왼쪽: 주문 내역 */}
            <div className="flex-1 border-r border-gray-200 pr-4 flex flex-col min-w-0">
              <h2 className="text-lg font-bold text-gray-800 mb-2 shrink-0">장바구니</h2>
              {items.length === 0 ? (
                <p className="text-gray-500 text-sm">장바구니가 비어있습니다.</p>
              ) : (
                <div className="space-y-1 overflow-y-auto flex-1 pr-2">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700 truncate">
                        {item.menuName}
                        {item.selectedOptions.length > 0 && (
                          <span className="text-gray-500">
                            {' '}({item.selectedOptions.map((o) => o.name).join(', ')})
                          </span>
                        )}
                        {' '}X {item.quantity}
                      </span>
                      <span className="text-gray-600 ml-4 shrink-0">
                        {(item.totalPrice * item.quantity).toLocaleString()}원
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 오른쪽: 총 금액 및 주문하기 버튼 */}
            <div className="flex flex-col items-end justify-center w-40 shrink-0">
              <div className="text-right mb-2">
                <span className="text-gray-600 block text-sm">총 금액</span>
                <span className="text-xl font-bold text-gray-800">
                  {totalAmount.toLocaleString()}원
                </span>
              </div>
              <button
                onClick={onOrder}
                disabled={items.length === 0}
                className={`w-full px-4 py-2 rounded transition-colors text-sm ${
                  items.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                주문하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 주문하기 페이지 컴포넌트
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
      <Cart items={cartItems} onOrder={handleOrder} />
    </>
  )
}

// 관리자 페이지 컴포넌트 (임시)
function AdminPage() {
  return (
    <div className="text-center py-20">
      <h2 className="text-xl text-gray-600">관리자 화면</h2>
      <p className="text-gray-400 mt-2">곧 구현 예정입니다.</p>
    </div>
  )
}

function App() {
  const [currentPage, setCurrentPage] = useState('order')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">COZY - 커피 주문 앱</h1>
          <nav className="flex gap-2">
            <button
              onClick={() => setCurrentPage('order')}
              className={`px-4 py-2 rounded transition-colors ${
                currentPage === 'order'
                  ? 'bg-white text-blue-600 font-semibold'
                  : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              주문하기
            </button>
            <button
              onClick={() => setCurrentPage('admin')}
              className={`px-4 py-2 rounded transition-colors ${
                currentPage === 'admin'
                  ? 'bg-white text-blue-600 font-semibold'
                  : 'bg-blue-500 text-white hover:bg-blue-400'
              }`}
            >
              관리자
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6">
        {currentPage === 'order' ? <OrderPage /> : <AdminPage />}
      </main>
    </div>
  )
}

export default App
