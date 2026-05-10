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
      <div className="min-h-svh flex flex-col items-center justify-center gap-5 bg-stone-50 p-6">
        <div className="flex items-center justify-center w-24 h-24 bg-stone-100 rounded-full">
          <ShoppingBag className="w-10 h-10 text-stone-300" />
        </div>
        <div className="text-center">
          <p className="text-stone-900 font-bold text-lg">Sepetiniz boş</p>
          <p className="text-stone-400 text-sm mt-1">Menüden ürün ekleyerek başlayın</p>
        </div>
        <button
          onClick={() => navigate('/menu')}
          className="px-8 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 active:scale-95 transition shadow-md shadow-amber-200"
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
    <div className="min-h-svh bg-stone-50 flex flex-col">
      <header className="bg-white border-b border-stone-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-stone-100 transition"
        >
          <ArrowLeft className="w-5 h-5 text-stone-700" />
        </button>
        <h1 className="font-bold text-stone-900 text-lg">Sepetim</h1>
        <span className="ml-auto text-sm text-stone-400 font-medium">{items.length} ürün</span>
      </header>

      <div className="flex-1 px-4 py-4 flex flex-col gap-3 overflow-y-auto">
        {items.map((item) => (
          <div key={item.cartId} className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm shadow-stone-200/50">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1">
                <p className="font-semibold text-stone-900">{item.menuItem.name}</p>
                {item.selectedModifiers.length > 0 && (
                  <p className="text-xs text-stone-400 mt-0.5">
                    {item.selectedModifiers.map((m) => m.name).join(' · ')}
                  </p>
                )}
                {item.itemNote && (
                  <p className="text-xs text-stone-400 italic mt-0.5">"{item.itemNote}"</p>
                )}
              </div>
              <button
                onClick={() => removeItem(item.cartId)}
                className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-stone-300 hover:text-red-400 hover:bg-red-50 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 bg-stone-100 rounded-xl px-3 py-1.5">
                <button
                  onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                  className="text-stone-500 hover:text-stone-900 transition"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="font-bold text-sm w-5 text-center text-stone-900">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                  className="text-stone-500 hover:text-stone-900 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="font-bold text-stone-900">
                {formatTRY(
                  (Number(item.menuItem.basePrice) +
                    item.selectedModifiers.reduce((s, m) => s + m.priceDelta, 0)) *
                    item.quantity,
                )}
              </span>
            </div>
          </div>
        ))}

        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm shadow-stone-200/50">
          <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
            Sipariş Notu
          </label>
          <textarea
            placeholder="Tüm sipariş için not ekleyebilirsiniz..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="w-full text-sm text-stone-700 resize-none focus:outline-none placeholder:text-stone-300"
          />
        </div>
      </div>

      <div className="bg-white border-t border-stone-100 px-4 pt-4 pb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-stone-500 font-medium">Toplam</span>
          <span className="text-2xl font-black text-stone-900">{formatTRY(totalPrice())}</span>
        </div>
        <button
          onClick={handleOrder}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-amber-500 text-white font-bold text-base hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition shadow-lg shadow-amber-200"
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
