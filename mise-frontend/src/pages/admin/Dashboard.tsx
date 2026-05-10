import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, ShoppingBag, TrendingUp } from 'lucide-react'
import { getDashboard } from '../../services/api/admin.api'
import { useAuthStore } from '../../store/authStore'
import type { DashboardStats } from '../../services/api/admin.api'

const STAT_CARDS = [
  {
    key: 'activeSessions' as const,
    label: 'Aktif Oturum',
    icon: Users,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
  },
  {
    key: 'ordersToday' as const,
    label: 'Bugünkü Sipariş',
    icon: ShoppingBag,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
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
      <div className="p-8 flex items-center gap-2 text-gray-400">
        <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
        Yükleniyor...
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {stats?.restaurant?.name ?? 'Dashboard'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Genel bakış</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-500">{label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
            </div>
            <p className="text-4xl font-black text-gray-900">
              {stats?.[key] ?? '—'}
            </p>
          </div>
        ))}

        <div className="bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl p-6 shadow-sm text-white">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-300">Durum</span>
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-lg font-semibold">Sistem aktif</p>
          <p className="text-slate-400 text-xs mt-1">Tüm servisler çalışıyor</p>
        </div>
      </div>
    </div>
  )
}
