import { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Camera, X } from 'lucide-react'
import { toast } from 'sonner'
import { sessionsApi } from '../../../services/api/sessions.api'
import { useSessionStore } from '../../../store/sessionStore'

export default function QRScanner() {
  const [qrToken, setQrToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [scanning, setScanning] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>(0)
  const navigate = useNavigate()
  const setSession = useSessionStore((s) => s.setSession)
  const [searchParams] = useSearchParams()

  async function openSession(token: string) {
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

  useEffect(() => {
    const qr = searchParams.get('qr')
    if (qr) openSession(qr)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const token = qrToken.trim()
    if (!token) return
    await openSession(token)
  }

  async function startCamera() {
    if (!('BarcodeDetector' in window)) {
      toast.error('Tarayıcınız kamera taramayı desteklemiyor. Kodu manuel girin.')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      })
      streamRef.current = stream
      setScanning(true)
    } catch {
      toast.error('Kameraya erişim sağlanamadı.')
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    setScanning(false)
  }

  useEffect(() => {
    if (!scanning || !videoRef.current || !streamRef.current) return
    const video = videoRef.current
    video.srcObject = streamRef.current
    video.play()

    // @ts-ignore BarcodeDetector not in TS lib yet
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] })

    async function detect() {
      if (video.readyState < 2) { rafRef.current = requestAnimationFrame(detect); return }
      try {
        const codes = await detector.detect(video)
        if (codes.length > 0) {
          let token: string = codes[0].rawValue
          try {
            const url = new URL(token)
            token = url.searchParams.get('qr') ?? token
          } catch {}
          stopCamera()
          await openSession(token)
          return
        }
      } catch {}
      rafRef.current = requestAnimationFrame(detect)
    }
    rafRef.current = requestAnimationFrame(detect)
    return () => cancelAnimationFrame(rafRef.current)
  }, [scanning])

  useEffect(() => () => stopCamera(), [])

  if (scanning) {
    return (
      <div className="min-h-svh bg-stone-950 flex flex-col items-center justify-center p-4">
        <p className="text-stone-400 text-sm font-medium mb-4">QR kodu kameraya gösterin</p>
        <div className="relative w-full max-w-sm">
          <video ref={videoRef} className="w-full rounded-2xl" playsInline muted />
          <div className="absolute inset-0 rounded-2xl pointer-events-none">
            <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-amber-400 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-amber-400 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-amber-400 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-amber-400 rounded-br-2xl" />
          </div>
          <button
            onClick={stopCamera}
            className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 bg-stone-900/80 backdrop-blur rounded-full text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    )
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
          <button
            onClick={startCamera}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-stone-900 text-white font-bold text-base hover:bg-stone-700 disabled:opacity-40 active:scale-95 transition mb-4 shadow-md shadow-stone-900/20"
          >
            <Camera className="w-5 h-5" />
            Kamera ile Tara
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-stone-100" />
            <span className="text-xs text-stone-400 font-medium">veya manuel gir</span>
            <div className="flex-1 h-px bg-stone-100" />
          </div>

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
