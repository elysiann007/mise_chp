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
    <div className="min-h-svh bg-stone-50 pb-32">
      <header className="sticky top-0 z-20 bg-stone-900">
        <div className="px-5 py-4 flex items-center justify-between">
          <span className="text-lg font-black tracking-widest text-white">MISE</span>
          {table?.label && (
            <span className="text-xs bg-white/10 text-stone-300 px-3 py-1 rounded-full font-medium">
              {table.label}
            </span>
          )}
        </div>
        <nav className="flex overflow-x-auto scrollbar-hide border-t border-stone-800">
          {menu.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-5 py-3 text-sm font-semibold transition-colors border-b-2 ${
                activeCategory === cat.id
                  ? 'border-amber-400 text-white'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </nav>
      </header>

      <main className="grid grid-cols-2 gap-3 p-4">
        {activeMenu?.items
          .filter((item) => item.isActive)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => (
            <div
              key={item.id}
              data-testid={`item-card-${item.id}`}
              onClick={() => setSelectedItem(item)}
              className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm shadow-stone-200/60 hover:shadow-md hover:shadow-stone-200 active:scale-95 transition-all cursor-pointer"
            >
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-36 object-cover" />
              ) : (
                <div className="w-full h-36 bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center">
                  <span className="text-4xl">🍽️</span>
                </div>
              )}
              <div className="p-3">
                <div className="flex items-start justify-between gap-1 mb-1">
                  <p className="font-semibold text-sm text-stone-900 leading-tight">{item.name}</p>
                  {item.isAlcohol && (
                    <span className="flex-shrink-0 text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full">
                      18+
                    </span>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-stone-400 leading-snug mb-2 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-stone-900">{formatTRY(Number(item.basePrice))}</span>
                  {item.modifierGroups.length > 0 && (
                    <span className="text-[10px] text-stone-400 flex items-center gap-0.5 font-medium">
                      seçenekler <ChevronRight className="w-3 h-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
      </main>

      {cartCount > 0 && (
        <div className="fixed bottom-5 inset-x-4 z-20">
          <button
            data-testid="checkout-button"
            onClick={() => navigate('/cart')}
            className="flex items-center gap-3 w-full bg-amber-500 text-white px-5 py-4 rounded-2xl shadow-xl shadow-amber-300/50 font-semibold text-base hover:bg-amber-600 active:scale-[0.98] transition-all"
          >
            <span className="flex items-center justify-center w-7 h-7 bg-white/20 text-sm font-bold rounded-full">
              {cartCount}
            </span>
            <ShoppingBag className="w-5 h-5" />
            <span>Sepete Git</span>
            <span className="ml-auto font-bold">{formatTRY(totalPrice())}</span>
          </button>
        </div>
      )}

      {selectedItem && (
        <ItemDetail item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}
    </div>
  )
}
