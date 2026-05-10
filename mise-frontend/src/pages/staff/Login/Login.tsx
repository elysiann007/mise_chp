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
    <div className="min-h-svh flex items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black tracking-widest text-white">MISE</h1>
          <p className="text-gray-400 text-sm mt-1">Personel Girişi</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                E-posta
              </label>
              <input
                type="email"
                placeholder="email@restoran.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Şifre
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 transition"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-3.5 mt-1 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
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
