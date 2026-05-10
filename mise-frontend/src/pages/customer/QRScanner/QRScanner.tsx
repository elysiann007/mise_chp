import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ScanLine, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { sessionsApi } from '../../../services/api/sessions.api'
import { useSessionStore } from '../../../store/sessionStore'

export default function QRScanner() {
  const [qrToken, setQrToken] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const setSession = useSessionStore((s) => s.setSession)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const token = qrToken.trim()
    if (!token) return

    setLoading(true)
    try {
      const data = await sessionsApi.open(token)
      setSession(data)
      navigate('/menu')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'QR kodu geçersiz veya masa bulunamadı.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <ScanLine className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-black tracking-widest text-white">MISE</h1>
          <p className="text-gray-400 mt-2 text-sm">Masanızın QR kodunu okutun</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                QR Token
              </label>
              <input
                data-testid="qr-input"
                type="text"
                placeholder="QR-TABLE-01"
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-base focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition"
              />
            </div>
            <button
              data-testid="scan-button"
              type="submit"
              disabled={loading || !qrToken.trim()}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-gray-900 text-white font-semibold text-base hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Devam Et <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          QR kodu masanızın üzerinde bulunmaktadır
        </p>
      </div>
    </div>
  )
}
