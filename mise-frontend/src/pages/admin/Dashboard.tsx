import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ShoppingBag, Activity } from 'lucide-react'
import { getDashboard } from '../../services/api/admin.api'
import { useAuthStore } from '../../store/authStore'
import type { DashboardStats } from '../../services/api/admin.api'

const STAT_CARDS = [
  {
    key: 'activeSessions' as const,
    label: 'Aktif Oturum',
    icon: Users,
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    valueSuffix: '',
  },
  {
    key: 'ordersToday' as const,
    label: 'Bugünkü Sipariş',
    icon: ShoppingBag,
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
    valueSuffix: '',
  },
]

export default function Dashboard() {
  const { accessToken } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!accessToken) { navigate('/login'); return }
    getDashboard(accessToken)
      .then(setStats)
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [accessToken, navigate])

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-stone-400">
        <div className="w-5 h-5 border-2 border-stone-200 border-t-amber-500 rounded-full animate-spin" />
        <span className="text-sm font-medium">Yükleniyor...</span>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-stone-900">
          {stats?.restaurant?.name ?? 'Dashboard'}
        </h1>
        <p className="text-stone-400 text-sm mt-1 font-medium">
          {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, iconBg, iconColor }) => (
          <div
            key={key}
            className="bg-white rounded-2xl p-6 border border-stone-100 shadow-sm shadow-stone-200/50 hover:shadow-md hover:shadow-stone-200/50 transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-stone-500">{label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
            </div>
            <p className="text-4xl font-black text-stone-900">
              {stats?.[key] ?? '—'}
            </p>
          </div>
        ))}

        <div className="bg-stone-900 rounded-2xl p-6 border border-stone-800 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-stone-400">Sistem Durumu</span>
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <p className="text-base font-bold text-white">Tüm servisler aktif</p>
            </div>
            <p className="text-stone-600 text-xs mt-1.5 font-medium">Gerçek zamanlı sipariş takibi çalışıyor</p>
          </div>
        </div>
      </div>
    </div>
  )
}
