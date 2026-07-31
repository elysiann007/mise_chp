import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SEEN_KEY = 'chp_poster_seen'

export default function PosterPopup() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem(SEEN_KEY)) return
    const timer = setTimeout(() => {
      setOpen(true)
      sessionStorage.setItem(SEEN_KEY, '1')
    }, 900)
    return () => clearTimeout(timer)
  }, [])

  function close() {
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="poster-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={close}
        >
          <motion.div
            key="poster-modal"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="relative max-h-[92vh] max-w-[92vw] flex flex-col items-center"
            onClick={e => e.stopPropagation()}
          >
            <div className="relative rounded-xl overflow-hidden shadow-2xl shadow-black/70 border border-zinc-700/40">
              <button
                onClick={close}
                className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white hover:bg-black/80 transition-colors duration-200"
                aria-label="Kapat"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <img
                src="/carlsberg-fici-poster.jpg"
                alt="1+1 Carlsberg Fıçı Bira Kampanyası"
                className="block max-h-[88vh] max-w-[92vw] w-auto h-auto"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
