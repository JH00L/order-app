import { useState } from 'react'

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

  const isAvailable = menu.isAvailable !== false

  return (
    <div className={`bg-white border rounded-lg p-4 ${!isAvailable ? 'opacity-60 border-gray-200' : 'border-gray-200'}`}>
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
        disabled={!isAvailable}
        className={`w-full py-2 border rounded transition-colors ${
          isAvailable
            ? 'border-gray-300 hover:bg-gray-50'
            : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
        }`}
      >
        {isAvailable ? '담기' : '품절'}
      </button>
    </div>
  )
}

export default MenuCard
