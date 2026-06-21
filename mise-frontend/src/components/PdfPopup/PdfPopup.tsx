import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as pdfjsLib from 'pdfjs-dist'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString()

export default function PdfPopup() {
  const [open, setOpen] = useState(false)
  const [rendered, setRendered] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 900)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!open || rendered) return
    let cancelled = false

    async function renderPage() {
      const pdf = await pdfjsLib.getDocument({ url: '/pizza-makarna-poster.pdf' }).promise
      if (cancelled) return
      const page = await pdf.getPage(1)
      if (cancelled || !canvasRef.current) return

      const viewport = page.getViewport({ scale: 2 })
      const canvas = canvasRef.current
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')!
      await page.render({ canvas, canvasContext: ctx, viewport }).promise
      if (!cancelled) setRendered(true)
    }

    renderPage()
    return () => { cancelled = true }
  }, [open, rendered])

  function close() {
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="pdf-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            key="pdf-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[92vh] max-w-[92vw] flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            {/* Canvas poster */}
            <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/70 border border-zinc-700/40">
              {/* Close button — only after render, inside poster */}
              {rendered && (
                <button
                  onClick={close}
                  className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 transition-colors duration-200"
                  aria-label="Kapat"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}

              {!rendered && (
                <div className="flex items-center justify-center bg-stone-900 min-w-[280px] min-h-[400px]">
                  <div className="w-7 h-7 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="block max-h-[85vh] max-w-[88vw] w-auto h-auto"
                style={{ display: rendered ? 'block' : 'none' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
