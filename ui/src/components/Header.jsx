function Header({ currentPage, onPageChange }) {
  return (
    <header className="bg-blue-600 px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">COZY - 커피 주문 앱</h1>
        <nav className="flex gap-2">
          <button
            onClick={() => onPageChange('order')}
            className={`px-4 py-2 rounded transition-colors ${
              currentPage === 'order'
                ? 'bg-white text-blue-600 font-semibold'
                : 'bg-blue-500 text-white hover:bg-blue-400'
            }`}
          >
            주문하기
          </button>
          <button
            onClick={() => onPageChange('admin')}
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
  )
}

export default Header
