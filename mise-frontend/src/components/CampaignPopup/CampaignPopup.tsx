import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CampaignPopup() {
  const [visible, setVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const seen = sessionStorage.getItem('chp_campaign_seen')
    if (!seen) setVisible(true)
  }, [])

  useEffect(() => {
    if (!visible) return

    let cancelled = false

    async function renderPdf() {
      try {
        const pdfjsLib = await import('pdfjs-dist')
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.mjs',
          import.meta.url,
        ).toString()

        const pdf = await pdfjsLib.getDocument({ url: '/campaign-poster.pdf' }).promise
        const page = await pdf.getPage(1)

        if (cancelled || !canvasRef.current) return

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d')!
        const dpr = window.devicePixelRatio || 1

        const viewport = page.getViewport({ scale: 1 })
        const maxW = Math.min(window.innerWidth * 0.9, 480)
        const scale = (maxW / viewport.width) * dpr
        const scaled = page.getViewport({ scale })

        canvas.width = scaled.width
        canvas.height = scaled.height
        canvas.style.width = `${scaled.width / dpr}px`
        canvas.style.height = `${scaled.height / dpr}px`

        await page.render({ canvasContext: ctx, viewport: scaled, canvas: canvas }).promise

        // Detect and trim white margins
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const d = imageData.data
        const w = canvas.width
        const h = canvas.height

        const isWhite = (x: number, y: number) => {
          const i = (y * w + x) * 4
          return d[i] > 235 && d[i + 1] > 235 && d[i + 2] > 235
        }

        let left = 0
        outer1: for (let x = 0; x < w; x++) {
          for (let y = 0; y < h; y++) { if (!isWhite(x, y)) { left = x; break outer1 } }
        }
        let right = w
        outer2: for (let x = w - 1; x >= 0; x--) {
          for (let y = 0; y < h; y++) { if (!isWhite(x, y)) { right = x + 1; break outer2 } }
        }

        if (right - left < w) {
          const cropped = document.createElement('canvas')
          const cw = right - left
          cropped.width = cw
          cropped.height = h
          cropped.style.width = `${cw / dpr}px`
          cropped.style.height = `${h / dpr}px`
          cropped.getContext('2d')!.putImageData(ctx.getImageData(left, 0, cw, h), 0, 0)
          canvas.width = cropped.width
          canvas.height = cropped.height
          canvas.style.width = cropped.style.width
          canvas.style.height = cropped.style.height
          ctx.putImageData(cropped.getContext('2d')!.getImageData(0, 0, cw, h), 0, 0)
        }

        if (!cancelled) setLoaded(true)
      } catch {
        if (!cancelled) setLoaded(true)
      }
    }

    renderPdf()
    return () => { cancelled = true }
  }, [visible])

  const close = () => {
    sessionStorage.setItem('chp_campaign_seen', '1')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
          onClick={close}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={e => e.stopPropagation()}
            className="relative max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{ maxWidth: 480 }}
          >
            {!loaded && (
              <div className="flex items-center justify-center bg-zinc-900 rounded-2xl" style={{ width: 320, height: 480 }}>
                <div className="w-8 h-8 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
              </div>
            )}
            <canvas
              ref={canvasRef}
              className="rounded-2xl block"
              style={{ display: loaded ? 'block' : 'none' }}
            />
            <button
              onClick={close}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white text-sm hover:bg-black/80 transition-colors"
              aria-label="Kapat"
            >
              ✕
            </button>
          </motion.div>
          <p className="absolute bottom-6 text-zinc-400 text-xs tracking-widest">
            Kapatmak için tıklayın
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
