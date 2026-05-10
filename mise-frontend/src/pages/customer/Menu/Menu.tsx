import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import { useSessionStore } from '../../../store/sessionStore'
import { useCartStore } from '../../../store/cartStore'
import type { MenuItem } from '../../../types/entity.types'
import { formatTRY } from '../../../utils/formatCurrency'
import ItemDetail from './ItemDetail'

export default function Menu() {
  const navigate = useNavigate()
  const { menu, table } = useSessionStore()
  const { totalItems, totalPrice } = useCartStore()
  const [activeCategory, setActiveCategory] = useState<string>(menu[0]?.id ?? '')
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)

  if (!menu.length) return <Navigate to="/" replace />

  const activeMenu = menu.find((c) => c.id === activeCategory)
  const cartCount = totalItems()

  return (
    <div className="min-h-svh bg-gray-50 pb-28">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-900 text-white px-5 py-4 flex items-center justify-between shadow-lg">
        <span className="text-xl font-black tracking-widest">MISE</span>
        <span className="text-sm text-gray-400 font-medium">{table?.label}</span>
      </header>

      {/* Category tabs */}
      <nav className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide bg-white border-b border-gray-100 sticky top-[60px] z-10">
        {menu.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition ${
              activeCategory === cat.id
                ? 'bg-gray-900 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </nav>

      {/* Items grid */}
      <main className="grid grid-cols-2 gap-3 p-4">
        {activeMenu?.items
          .filter((item) => item.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => (
            <div
              key={item.id}
              data-testid={`item-card-${item.id}`}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md active:scale-95 transition cursor-pointer"
            >
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover" />
              ) : (
                <div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <span className="text-3xl">🍽️</span>
                </div>
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-1 mb-1">
                  <p className="font-semibold text-sm text-gray-900 leading-tight">{item.name}</p>
                  {item.isAlcohol && (
                    <span className="flex-shrink-0 text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">18+</span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-gray-400 leading-snug mb-2 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-gray-900">{formatTRY(Number(item.basePrice))}</span>
                  {item.modifierGroups.length > 0 && (
                    <span className="text-xs text-gray-400">seçenekler <ChevronRight className="w-3 h-3 inline" /></span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </main>

      {/* Cart FAB */}
      {cartCount > 0 && (
        <button
          data-testid="checkout-button"
          onClick={() => navigate('/cart')}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-900 text-white px-6 py-3.5 rounded-full shadow-2xl font-semibold text-base hover:bg-gray-700 active:scale-95 transition whitespace-nowrap z-20"
        >
          <span className="flex items-center justify-center w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full">
            {cartCount}
          </span>
          <ShoppingBag className="w-4 h-4" />
          Sepet
          <span className="text-gray-300 text-sm">{formatTRY(totalPrice())}</span>
        </button>
      )}

      {/* Item detail modal */}
      {selectedItem && (
        <ItemDetail item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  )
}
