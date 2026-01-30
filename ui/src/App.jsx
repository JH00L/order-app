import { useState } from 'react'
import Header from './components/Header'
import OrderPage from './pages/OrderPage'
import AdminPage from './pages/AdminPage'

function App() {
  const [currentPage, setCurrentPage] = useState('order')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      
      <main className="max-w-6xl mx-auto p-6">
        {currentPage === 'order' ? <OrderPage /> : <AdminPage />}
      </main>
    </div>
  )
}

export default App
