import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, UtensilsCrossed, QrCode, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/menu', label: 'Menü Yönetimi', icon: UtensilsCrossed },
  { to: '/admin/tables', label: 'Masa Yönetimi', icon: QrCode },
]

export default function AdminLayout() {
  const { clearAuth } = useAuthStore()
  const navigate = useNavigate()

  function logout() { clearAuth(); navigate('/login') }

  return (
    <div className="flex min-h-svh bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-slate-900 flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-slate-700">
          <span className="text-xl font-black tracking-widest text-white">MISE</span>
          <p className="text-xs text-slate-500 mt-0.5">Admin Paneli</p>
        </div>
        <nav className="flex-1 py-4 flex flex-col gap-0.5 px-3">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/10 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 pb-4">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 transition"
          >
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
