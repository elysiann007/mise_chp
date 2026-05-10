import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, X, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '../../../store/cartStore'
import { useSessionStore } from '../../../store/sessionStore'
import { ordersApi } from '../../../services/api/orders.api'
import { formatTRY } from '../../../utils/formatCurrency'

export default function Cart() {
  const navigate = useNavigate()
  const { items, removeItem, updateQuantity, clear, totalPrice } = useCartStore()
  const { sessionToken } = useSessionStore()
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)

  if (!items.length) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-4 bg-gray-50 p-6">
        <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">Sepetiniz boş</p>
        <button
          onClick={() => navigate('/menu')}
          className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-700 transition"
        >
          Menüye Dön
        </button>
      </div>
    )
  }

  async function handleOrder() {
    if (!sessionToken) { navigate('/'); return }
    setLoading(true)
    try {
      const order = await ordersApi.place(sessionToken, {
        items: items.map((i) => ({
          menuItemId: i.menuItem.id,
          quantity: i.quantity,
          modifiers: i.selectedModifiers.map((m) => ({ modifierId: m.modifierId })),
          itemNote: i.itemNote || undefined,
        })),
        customerNote: note || undefined,
      })
      clear()
      toast.success('Siparişiniz alındı!')
      navigate(`/order/${order.id}`)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sipariş gönderilemedi.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 text-lg">Sepet</h1>
      </header>

      {/* Items */}
      <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-y-auto">
        {items.map((item) => (
          <div key={item.cartId} className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1">
                <p className="font-semibold text-gray-900">{item.menuItem.name}</p>
                {item.selectedModifiers.length > 0 && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {item.selectedModifiers.map((m) => m.name).join(', ')}
                  </p>
                )}
                {item.itemNote && (
                  <p className="text-xs text-gray-400 italic mt-0.5">"{item.itemNote}"</p>
                )}
              </div>
              <button
                onClick={() => removeItem(item.cartId)}
                className="flex-shrink-0 text-gray-300 hover:text-red-500 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              {/* Quantity controls */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-1.5">
                <button
                  onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                  className="text-gray-500 hover:text-gray-900 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-semibold text-sm w-5 text-center">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                  className="text-gray-500 hover:text-gray-900 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="font-bold text-gray-900">
                {formatTRY(
                  (Number(item.menuItem.basePrice) +
                    item.selectedModifiers.reduce((s, m) => s + m.priceDelta, 0)) *
                    item.quantity,
                )}
              </span>
            </div>
          </div>
        ))}

        {/* Note */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Sipariş Notu
          </label>
          <textarea
            placeholder="Tüm sipariş için not ekleyebilirsiniz..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full text-sm text-gray-700 resize-none focus:outline-none"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-gray-600 font-medium">Toplam</span>
          <span className="text-2xl font-black text-gray-900">{formatTRY(totalPrice())}</span>
        </div>
        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gray-900 text-white font-bold text-base hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 transition"
        >
          {loading ? (
            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            'Siparişi Gönder'
          )}
        </button>
      </div>
    </div>
  )
}
