import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LayoutDashboard, UtensilsCrossed, QrCode, LogOut, Menu, X } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'

const NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/menu', label: 'Menü Yönetimi', icon: UtensilsCrossed },
  { to: '/admin/tables', label: 'Masa Yönetimi', icon: QrCode },
]

function SidebarContent({ onNav }: { onNav?: () => void }) {
  const { clearAuth } = useAuthStore()
  const navigate = useNavigate()

  function logout() { clearAuth(); navigate('/login') }

  return (
    <div className="w-60 bg-stone-900 flex flex-col h-full">
      <div className="px-5 py-5 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center flex-shrink-0">
            <span className="text-sm">🍽</span>
          </div>
          <div>
            <span className="text-base font-black tracking-widest text-white">MISE</span>
            <p className="text-[10px] text-stone-500 font-medium uppercase tracking-wider">Admin</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNav}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                  : 'text-stone-400 hover:text-stone-100 hover:bg-stone-800'
              }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-5 border-t border-stone-800 pt-3">
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-stone-500 hover:text-stone-200 hover:bg-stone-800 transition"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex min-h-svh bg-stone-50">
      {/* Desktop sidebar — hidden below md */}
      <aside className="hidden md:flex flex-col flex-shrink-0 border-r border-stone-800">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setDrawerOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 bottom-0 z-50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent onNav={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex items-center gap-3 px-4 py-3 bg-stone-900 border-b border-stone-800 md:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
            aria-label="Menüyü aç"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500 flex items-center justify-center">
              <span className="text-xs">🍽</span>
            </div>
            <span className="text-sm font-black tracking-widest text-white">MISE</span>
          </div>
          {drawerOpen && (
            <button
              onClick={() => setDrawerOpen(false)}
              className="ml-auto flex items-center justify-center w-9 h-9 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
