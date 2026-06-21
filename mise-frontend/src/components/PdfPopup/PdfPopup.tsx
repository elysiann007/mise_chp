import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function PdfPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 900)
    return () => clearTimeout(timer)
  }, [])

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
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            key="pdf-modal"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative bg-stone-900 rounded-2xl shadow-2xl shadow-black/60 border border-zinc-700/60 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-700/60 flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400 text-[10px] tracking-[0.28em] uppercase font-medium">Pizza & Şarap Menüsü</span>
              </div>
              <button
                onClick={close}
                className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-700/60 transition-colors duration-200"
                aria-label="Kapat"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* PDF viewer */}
            <div className="flex-1 min-h-0">
              <iframe
                src="/chp_pizza_sarap_temiz_1.pdf"
                title="Pizza & Şarap Menüsü"
                className="w-full h-full min-h-[65vh]"
                style={{ border: 'none' }}
              />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-700/60 flex-shrink-0">
              <a
                href="/chp_pizza_sarap_temiz_1.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:text-amber-300 text-xs tracking-wider uppercase font-semibold transition-colors"
              >
                Tam Ekranda Aç ↗
              </a>
              <button
                onClick={close}
                className="px-5 py-2 bg-amber-400 text-stone-950 font-bold text-[10px] tracking-[0.2em] uppercase rounded-full hover:bg-amber-300 transition-colors duration-200"
              >
                Kapat
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
