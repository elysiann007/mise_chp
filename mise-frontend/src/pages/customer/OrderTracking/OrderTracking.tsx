import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle, Clock, ChefHat, UtensilsCrossed } from 'lucide-react'
import { ordersApi } from '../../../services/api/orders.api'
import { useSessionStore } from '../../../store/sessionStore'
import { useWebSocket } from '../../../hooks/useWebSocket'
import type { Order, OrderStatus } from '../../../types/entity.types'
import { formatTRY } from '../../../utils/formatCurrency'

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  placed: {
    label: 'Sipariş Alındı',
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    icon: <Clock className="w-6 h-6 text-amber-600" />,
  },
  preparing: {
    label: 'Hazırlanıyor',
    color: 'text-blue-700',
    bg: 'bg-blue-50 border-blue-200',
    icon: <ChefHat className="w-6 h-6 text-blue-600" />,
  },
  ready: {
    label: 'Hazır!',
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
  },
  served: {
    label: 'Teslim Edildi',
    color: 'text-gray-600',
    bg: 'bg-gray-50 border-gray-200',
    icon: <UtensilsCrossed className="w-6 h-6 text-gray-500" />,
  },
  cancelled: {
    label: 'İptal Edildi',
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    icon: <X />,
  },
}

const STEPS: OrderStatus[] = ['placed', 'preparing', 'ready', 'served']

function X() { return <span className="text-red-500 text-2xl">✕</span> }

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
      <div className="min-h-svh flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center gap-3">
        <p className="text-gray-500">Sipariş bulunamadı.</p>
        <button onClick={() => navigate('/menu')} className="text-gray-900 font-semibold underline">
          Menüye Dön
        </button>
      </div>
    )
  }

  const meta = STATUS_META[order.status] ?? STATUS_META.placed
  const stepIndex = STEPS.indexOf(order.status)

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
    <div className="min-h-svh bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/menu')}
          className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-gray-100 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-bold text-gray-900 text-lg">Sipariş #{order.sequenceNo}</h1>
      </header>

      <div className="px-4 pt-5 flex flex-col gap-4">
        {/* Status card */}
        <div className={`flex items-center gap-4 p-4 rounded-2xl border ${meta.bg}`}>
          <div className="flex-shrink-0">{meta.icon}</div>
          <div>
            <p className={`font-bold text-lg ${meta.color}`}>{meta.label}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.placedAt).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>

        {/* Progress stepper */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <div className="flex items-center">
              {STEPS.map((step, i) => {
                const done = i <= stepIndex
                const active = i === stepIndex
                return (
                  <div key={step} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={`w-3 h-3 rounded-full transition-colors ${
                          done ? 'bg-gray-900' : 'bg-gray-200'
                        } ${active ? 'ring-2 ring-gray-900 ring-offset-2' : ''}`}
                      />
                      <span className={`text-[10px] font-medium text-center max-w-14 leading-tight ${
                        done ? 'text-gray-700' : 'text-gray-300'
                      }`}>
                        {STATUS_META[step]?.label ?? step}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < stepIndex ? 'bg-gray-900' : 'bg-gray-200'}`} />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <h3 className="font-semibold text-gray-700 text-sm mb-3">Ürünler</h3>
          <div className="flex flex-col divide-y divide-gray-50">
            {order.items.map((item) => {
              const total =
                (Number(item.unitPriceSnapshot) +
                  item.modifiers.reduce((s, m) => s + Number(m.priceDeltaSnapshot), 0)) *
                item.quantity
              return (
                <div key={item.id} className="flex items-start justify-between py-2.5 gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.nameSnapshot}</p>
                    {item.modifiers.length > 0 && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.modifiers.map((m) => m.nameSnapshot).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs text-gray-400">x{item.quantity}</span>
                    <span className="text-sm font-semibold text-gray-900">{formatTRY(total)}</span>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-1">
            <span className="text-sm text-gray-500">Toplam</span>
            <span className="font-bold text-gray-900">{formatTRY(itemTotal)}</span>
          </div>
        </div>

        {/* New order */}
        <button
          onClick={() => navigate('/menu')}
          className="w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-700 active:scale-95 transition"
        >
          + Yeni Sipariş Ver
        </button>
      </div>
    </div>
  )
}
