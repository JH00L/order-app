function Cart({ items, onOrder, onRemoveItem }) {
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
                    <div key={index} className="flex items-center justify-between text-sm group">
                      <span className="text-gray-700 truncate flex-1">
                        {item.menuName}
                        {item.selectedOptions.length > 0 && (
                          <span className="text-gray-500">
                            {' '}({item.selectedOptions.map((o) => o.name).join(', ')})
                          </span>
                        )}
                        {' '}X {item.quantity}
                      </span>
                      <span className="text-gray-600 ml-2 shrink-0">
                        {(item.totalPrice * item.quantity).toLocaleString()}원
                      </span>
                      <button
                        onClick={() => onRemoveItem(index)}
                        className="ml-2 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                        title="삭제"
                      >
                        ✕
                      </button>
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

export default Cart
