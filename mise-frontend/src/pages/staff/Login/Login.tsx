import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { toast } from 'sonner'
import { login } from '../../../services/api/auth.api'
import { useAuthStore } from '../../../store/authStore'
import type { StaffRole } from '../../../store/authStore'

export default function Login() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await login(email, password)
      setAuth(data.accessToken, data.role as StaffRole, data.restaurantId)
      if (data.role === 'kitchen' || data.role === 'bar') {
        navigate('/kitchen')
      } else {
        navigate('/admin')
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Giriş başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh flex items-center justify-center bg-stone-900 p-5 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 mb-5 shadow-lg shadow-amber-500/30">
            <span className="text-2xl">🍽</span>
          </div>
          <h1 className="text-3xl font-black tracking-widest text-white">MISE</h1>
          <p className="text-stone-500 text-sm mt-1.5 font-medium">Personel Girişi</p>
        </div>

        <div className="bg-stone-800 rounded-2xl p-6 border border-stone-700 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
                E-posta
              </label>
              <input
                type="email"
                placeholder="email@restoran.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
                className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-white placeholder:text-stone-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
                Şifre
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-stone-900 border border-stone-700 text-white placeholder:text-stone-600 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3.5 mt-1 rounded-xl bg-amber-500 text-white font-bold hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition shadow-lg shadow-amber-500/20"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Giriş Yap
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
