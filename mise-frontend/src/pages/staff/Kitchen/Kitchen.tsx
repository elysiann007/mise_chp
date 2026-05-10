import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, UtensilsCrossed, Flame } from 'lucide-react'
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
  pending: 'bg-amber-500/10 border-amber-500/30 text-amber-100',
  preparing: 'bg-blue-500/10 border-blue-500/30 text-blue-100',
  ready: 'bg-emerald-500/10 border-emerald-400/30 text-emerald-100',
  served: 'bg-stone-700/50 border-stone-600/30 text-stone-500',
  cancelled: 'bg-red-500/10 border-red-500/30 text-red-200',
}

const STATUS_BADGE: Record<string, string> = {
  pending: 'bg-amber-500/20 text-amber-400',
  preparing: 'bg-blue-500/20 text-blue-400',
  ready: 'bg-emerald-500/20 text-emerald-400',
  served: 'bg-stone-600 text-stone-400',
  cancelled: 'bg-red-500/20 text-red-400',
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
    <div className="min-h-svh bg-stone-950 text-white flex flex-col">
      <header className="flex items-center justify-between px-5 py-4 border-b border-stone-800 bg-stone-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-base text-white tracking-wide">Mutfak Ekranı</span>
            <span className="ml-3 text-xs text-stone-500 font-medium">
              {visibleOrders.length} aktif sipariş
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-stone-500 hover:text-white text-sm font-medium transition px-3 py-1.5 rounded-lg hover:bg-stone-800"
        >
          <LogOut className="w-4 h-4" />
          Çıkış
        </button>
      </header>

      <div className="flex gap-2 px-5 py-3 border-b border-stone-800 bg-stone-900">
        {(['all', 'kitchen', 'bar'] as Station[]).map((s) => (
          <button
            key={s}
            onClick={() => setStation(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
              station === s
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20'
                : 'bg-stone-800 text-stone-400 hover:bg-stone-700 hover:text-stone-200'
            }`}
          >
            {s === 'all' ? 'Tümü' : s === 'kitchen' ? '🍳 Mutfak' : '🍺 Bar'}
          </button>
        ))}
      </div>

      <div className="flex-1 p-4">
        {visibleOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-stone-600">
            <UtensilsCrossed className="w-12 h-12" />
            <p className="text-lg font-semibold">Aktif sipariş yok</p>
            <p className="text-sm">Yeni siparişler burada görünecek</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {visibleOrders.map((order) => {
              const tableLabel = order.session?.table?.label ?? '—'
              const age = orderAgeMin(order.placedAt)
              const isUrgent = age > 10
              const activeItems = order.items.filter(
                (i) =>
                  ['pending', 'preparing'].includes(i.status) &&
                  (station === 'all' || i.prepStation === station),
              )

              return (
                <div
                  key={order.id}
                  className={`bg-stone-900 rounded-2xl overflow-hidden border transition ${
                    isUrgent ? 'border-red-500/40' : 'border-stone-800'
                  }`}
                >
                  <div className={`flex items-center justify-between px-4 py-3 border-b ${
                    isUrgent ? 'bg-red-500/10 border-red-500/20' : 'border-stone-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-base text-white">{tableLabel}</span>
                      <span className="text-stone-500 text-xs font-medium">#{order.sequenceNo}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
                      isUrgent
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-stone-800 text-stone-400'
                    }`}>
                      {isUrgent && <Flame className="w-3 h-3" />}
                      {age}dk
                    </div>
                  </div>

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
                          className={`border rounded-xl p-3 transition-all select-none ${STATUS_STYLE[item.status]} ${
                            canAdvance ? 'cursor-pointer active:scale-95 hover:brightness-110' : 'cursor-default'
                          } ${updating.has(item.id) ? 'opacity-40' : ''}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-bold text-sm leading-tight flex-1">
                              {item.quantity}× {item.nameSnapshot}
                            </p>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_BADGE[item.status]}`}>
                              {STATUS_LABEL[item.status]}
                            </span>
                          </div>
                          {item.modifiers.length > 0 && (
                            <p className="text-xs opacity-60 mb-1">
                              {item.modifiers.map((m) => m.nameSnapshot).join(' · ')}
                            </p>
                          )}
                          {item.itemNote && (
                            <p className="text-xs italic opacity-50">📝 {item.itemNote}</p>
                          )}
                          {nextLabel && canAdvance && (
                            <p className="text-[10px] font-semibold mt-2 opacity-50 uppercase tracking-wide">
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
