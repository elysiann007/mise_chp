import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock, ChefHat, UtensilsCrossed, Plus } from 'lucide-react'
import { ordersApi } from '../../../services/api/orders.api'
import { useSessionStore } from '../../../store/sessionStore'
import { useWebSocket } from '../../../hooks/useWebSocket'
import type { Order, OrderStatus } from '../../../types/entity.types'
import { formatTRY } from '../../../utils/formatCurrency'

const STATUS_META: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  placed: {
    label: 'Sipariş Alındı',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <Clock className="w-6 h-6 text-amber-500" />,
  },
  preparing: {
    label: 'Hazırlanıyor',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <ChefHat className="w-6 h-6 text-blue-500" />,
  },
  ready: {
    label: 'Hazır! 🎉',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
  },
  served: {
    label: 'Teslim Edildi',
    color: 'text-stone-600',
    bg: 'bg-stone-50',
    border: 'border-stone-200',
    icon: <UtensilsCrossed className="w-6 h-6 text-stone-400" />,
  },
  cancelled: {
    label: 'İptal Edildi',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <span className="text-2xl text-red-400">✕</span>,
  },
}

const STEPS: OrderStatus[] = ['placed', 'preparing', 'ready', 'served']

export default function OrderTracking() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const { sessionToken } = useSessionStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId || !sessionToken) return
    ordersApi.get(sessionToken, orderId)
      .then(setOrder)
      .finally(() => setLoading(false))
  }, [orderId, sessionToken])

  const handleOrderUpdate = useCallback((updated: Order) => {
    if (updated.id === orderId) setOrder(updated)
  }, [orderId])

  useWebSocket({
    sessionToken: sessionToken ?? undefined,
    onOrderStatusChanged: handleOrderUpdate,
    onOrderReady: handleOrderUpdate,
  })

  if (loading) {
    return (
      <div className="min-h-svh flex items-center justify-center bg-stone-50">
        <div className="w-8 h-8 border-2 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-4 bg-stone-50 p-6">
        <p className="text-stone-500 font-medium">Sipariş bulunamadı.</p>
        <button
          onClick={() => navigate('/menu')}
          className="px-6 py-2.5 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition"
        >
          Menüye Dön
        </button>
      </div>
    )
  }

  const meta = STATUS_META[order.status] ?? STATUS_META.placed
  const stepIndex = STEPS.indexOf(order.status as OrderStatus)

  const itemTotal = useMemo(
    () =>
      order.items.reduce(
        (sum, item) =>
          sum +
          (Number(item.unitPriceSnapshot) +
            item.modifiers.reduce((s, m) => s + Number(m.priceDeltaSnapshot), 0)) *
            item.quantity,
        0,
      ),
    [order],
  )

  return (
    <div className="min-h-svh bg-stone-50 pb-8">
      <header className="bg-white border-b border-stone-100 px-4 py-4 flex items-center gap-3 sticky top-0 z-10">
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-stone-100 transition"
        >
          <ArrowLeft className="w-5 h-5 text-stone-700" />
        </button>
        <div>
          <h1 className="font-bold text-stone-900 text-lg leading-tight">Sipariş #{order.sequenceNo}</h1>
          <p className="text-xs text-stone-400">
            {new Date(order.placedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </header>

      <div className="px-4 pt-4 flex flex-col gap-3">
        <div className={`flex items-center gap-4 p-5 rounded-2xl border ${meta.bg} ${meta.border}`}>
          <div className="flex-shrink-0">{meta.icon}</div>
          <div>
            <p className={`font-bold text-xl ${meta.color}`}>{meta.label}</p>
            <p className="text-xs text-stone-400 mt-0.5 font-medium">
              Siparişiniz takip ediliyor
            </p>
          </div>
        </div>

        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm shadow-stone-200/50">
            <div className="flex items-center justify-between mb-1">
              {STEPS.map((step, i) => {
                const done = i <= stepIndex
                const active = i === stepIndex
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-3.5 h-3.5 rounded-full transition-all ${
                          done ? 'bg-amber-500' : 'bg-stone-200'
                        } ${active ? 'ring-2 ring-amber-400 ring-offset-2' : ''}`}
                      />
                      <span className={`text-[10px] font-semibold text-center max-w-[52px] leading-tight ${
                        done ? 'text-stone-700' : 'text-stone-300'
                      }`}>
                        {STATUS_META[step]?.label.replace(' 🎉', '') ?? step}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-5 transition-colors ${i < stepIndex ? 'bg-amber-500' : 'bg-stone-100'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 border border-stone-100 shadow-sm shadow-stone-200/50">
          <h3 className="font-semibold text-stone-700 text-sm mb-3">Ürünler</h3>
          <div className="flex flex-col divide-y divide-stone-50">
            {order.items.map((item) => {
              const total =
                (Number(item.unitPriceSnapshot) +
                  item.modifiers.reduce((s, m) => s + Number(m.priceDeltaSnapshot), 0)) *
                item.quantity
              return (
                <div key={item.id} className="flex items-start justify-between py-3 gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-stone-900">{item.nameSnapshot}</p>
                    {item.modifiers.length > 0 && (
                      <p className="text-xs text-stone-400 mt-0.5">
                        {item.modifiers.map((m) => m.nameSnapshot).join(' · ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-stone-400 font-medium">×{item.quantity}</span>
                    <span className="text-sm font-bold text-stone-900">{formatTRY(total)}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-stone-100 mt-1">
            <span className="text-sm text-stone-500 font-medium">Toplam</span>
            <span className="font-black text-stone-900 text-base">{formatTRY(itemTotal)}</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/menu')}
          className="w-full py-4 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 active:scale-[0.98] transition flex items-center justify-center gap-2 shadow-md shadow-amber-200"
        >
          <Plus className="w-4 h-4" />
          Yeni Sipariş Ver
        </button>
      </div>
    </div>
  )
}
