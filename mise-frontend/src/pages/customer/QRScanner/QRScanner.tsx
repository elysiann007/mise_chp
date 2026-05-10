import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
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
    <div className="min-h-svh bg-stone-50 flex flex-col items-center justify-center p-5 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-amber-100 rounded-full opacity-50 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-amber-50 rounded-full opacity-70 pointer-events-none" />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-stone-900 mb-5 shadow-lg shadow-stone-300">
            <span className="text-3xl">🍽</span>
          </div>
          <h1 className="text-4xl font-black tracking-widest text-stone-900">MISE</h1>
          <p className="text-stone-500 text-sm mt-2 font-medium">Masanızın QR kodunu okutun</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-xl shadow-stone-200/80 border border-stone-100">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-400 uppercase tracking-widest mb-2">
                QR Kod
              </label>
              <input
                data-testid="qr-input"
                type="text"
                placeholder="QR-TABLE-01"
                value={qrToken}
                onChange={(e) => setQrToken(e.target.value)}
                autoFocus
                className="w-full px-4 py-3.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 placeholder:text-stone-300 text-base font-medium focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent focus:bg-white transition"
              />
            </div>
            <button
              data-testid="scan-button"
              type="submit"
              disabled={loading || !qrToken.trim()}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-amber-500 text-white font-bold text-base hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition shadow-md shadow-amber-200"
            >
              {loading ? (
                <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Devam Et
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-stone-400 text-xs mt-6 font-medium">
          QR kodu masanızın üzerinde bulunmaktadır
        </p>
      </div>
    </div>
  )
}
