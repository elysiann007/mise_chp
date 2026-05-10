import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, UtensilsCrossed } from 'lucide-react'
import { toast } from 'sonner'
import { getActiveOrders, updateItemStatus } from '../../../services/api/kitchen.api'
import { useAuthStore } from '../../../store/authStore'
import { useWebSocket } from '../../../hooks/useWebSocket'
import type { Order, OrderItem } from '../../../types/entity.types'

const STATUS_LABEL: Record<string, string> = {
  pending: 'Bekliyor',
  preparing: 'Hazırlanıyor',
  ready: 'Hazır ✓',
  served: 'Servis Edildi',
  cancelled: 'İptal',
}

const STATUS_NEXT: Record<string, string> = {
  pending: 'preparing',
  preparing: 'ready',
  ready: 'served',
}

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-50 border-amber-300 text-amber-900',
  preparing: 'bg-blue-50 border-blue-300 text-blue-900',
  ready: 'bg-emerald-50 border-emerald-300 text-emerald-900',
  served: 'bg-gray-100 border-gray-200 text-gray-500',
  cancelled: 'bg-red-50 border-red-300 text-red-900',
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-200 text-amber-800',
  preparing: 'bg-blue-200 text-blue-800',
  ready: 'bg-emerald-200 text-emerald-800',
  served: 'bg-gray-200 text-gray-600',
  cancelled: 'bg-red-200 text-red-800',
}

function orderAgeMin(placedAt: string): number {
  return Math.floor((Date.now() - new Date(placedAt).getTime()) / 60000)
}

type Station = 'all' | 'kitchen' | 'bar'

export default function Kitchen() {
  const navigate = useNavigate()
  const { accessToken, restaurantId, clearAuth } = useAuthStore()
  const [orders, setOrders] = useState<Order[]>([])
  const [station, setStation] = useState<Station>('all')
  const [updating, setUpdating] = useState<Set<string>>(new Set())

  const loadOrders = useCallback(async () => {
    if (!accessToken) return
    try {
      const stationParam = station === 'all' ? undefined : station
      const data = await getActiveOrders(accessToken, stationParam)
      setOrders(data)
    } catch {
      toast.error('Siparişler yüklenemedi.')
    }
  }, [accessToken, station])

  useEffect(() => {
    if (!accessToken) { navigate('/login'); return }
    loadOrders()
    const interval = setInterval(loadOrders, 30_000)
    return () => clearInterval(interval)
  }, [accessToken, loadOrders, navigate])

  const onOrderUpdate = useCallback((updated: Order) => {
    setOrders((prev) => {
      const exists = prev.some((o) => o.id === updated.id)
      if (exists) return prev.map((o) => (o.id === updated.id ? updated : o))
      return [updated, ...prev]
    })
  }, [])

  useWebSocket({
    restaurantId: restaurantId ?? '',
    onOrderPlaced: onOrderUpdate,
    onOrderStatusChanged: onOrderUpdate,
  })

  async function advance(item: OrderItem) {
    const next = STATUS_NEXT[item.status]
    if (!next || !accessToken || updating.has(item.id)) return
    setUpdating((s) => new Set(s).add(item.id))
    try {
      await updateItemStatus(accessToken, item.id, next)
      await loadOrders()
    } catch {
      toast.error('Durum güncellenemedi.')
    } finally {
      setUpdating((s) => { const n = new Set(s); n.delete(item.id); return n })
    }
  }

  function logout() { clearAuth(); navigate('/login') }

  const visibleOrders = orders.filter((o) =>
    o.items.some(
      (i) =>
        ['pending', 'preparing'].includes(i.status) &&
        (station === 'all' || i.prepStation === station),
    ),
  )

  return (
    <div className="min-h-svh bg-slate-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <UtensilsCrossed className="w-5 h-5 text-amber-400" />
          <span className="font-bold text-lg tracking-wide">Mutfak Ekranı</span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition"
        >
          <LogOut className="w-4 h-4" />
          Çıkış
        </button>
      </header>

      {/* Station tabs */}
      <div className="flex gap-2 px-5 py-4">
        {(['all', 'kitchen', 'bar'] as Station[]).map((s) => (
          <button
            key={s}
            onClick={() => setStation(s)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
              station === s
                ? 'bg-white text-slate-900'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {s === 'all' ? 'Tümü' : s === 'kitchen' ? '🍳 Mutfak' : '🍺 Bar'}
          </button>
        ))}
        <span className="ml-auto text-slate-500 text-sm self-center">
          {visibleOrders.length} aktif sipariş
        </span>
      </div>

      {/* Orders grid */}
      <div className="flex-1 px-5 pb-5">
        {visibleOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-slate-500">
            <UtensilsCrossed className="w-12 h-12" />
            <p className="text-lg font-medium">Aktif sipariş yok</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleOrders.map((order) => {
              const tableLabel = order.session?.table?.label ?? '—'
              const age = orderAgeMin(order.placedAt)
              const activeItems = order.items.filter(
                (i) =>
                  ['pending', 'preparing'].includes(i.status) &&
                  (station === 'all' || i.prepStation === station),
              )

              return (
                <div key={order.id} className="bg-slate-800 rounded-2xl overflow-hidden shadow-lg">
                  {/* Card header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">
                    <span className="font-bold text-base text-white">{tableLabel}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 text-xs">#{order.sequenceNo}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        age > 10 ? 'bg-red-900 text-red-300' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {age}dk
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="p-3 flex flex-col gap-2">
                    {activeItems.map((item) => {
                      const canAdvance = !!STATUS_NEXT[item.status]
                      const nextLabel = STATUS_NEXT[item.status]
                        ? STATUS_LABEL[STATUS_NEXT[item.status]]
                        : null

                      return (
                        <div
                          key={item.id}
                          onClick={() => advance(item)}
                          className={`border rounded-xl p-3 transition select-none ${STATUS_STYLE[item.status]} ${
                            canAdvance ? 'cursor-pointer active:scale-95 hover:opacity-90' : 'cursor-default'
                          } ${updating.has(item.id) ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <p className="font-bold text-sm leading-tight">
                              {item.quantity}× {item.nameSnapshot}
                            </p>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[item.status]}`}>
                              {STATUS_LABEL[item.status]}
                            </span>
                          </div>
                          {item.modifiers.length > 0 && (
                            <p className="text-xs opacity-70 mb-1">
                              {item.modifiers.map((m) => m.nameSnapshot).join(' · ')}
                            </p>
                          )}
                          {item.itemNote && (
                            <p className="text-xs italic opacity-60">📝 {item.itemNote}</p>
                          )}
                          {nextLabel && (
                            <p className="text-[10px] font-semibold mt-1.5 opacity-60">
                              Dokun → {nextLabel}
                            </p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
