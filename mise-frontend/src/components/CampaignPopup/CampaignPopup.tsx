import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CampaignPopup() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('chp_campaign_seen')) setVisible(true)
  }, [])

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
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{ width: '90vw', maxWidth: 440, maxHeight: '85vh' }}
          >
            <iframe
              src="/campaign-poster.pdf#toolbar=0&navpanes=0&scrollbar=0&view=FitH"
              className="w-full border-0 rounded-2xl"
              style={{ height: '80vh', maxHeight: 720, display: 'block' }}
              title="Kampanya"
            />
            <button
              onClick={close}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white text-sm hover:bg-black/90 transition-colors"
              aria-label="Kapat"
            >
              ✕
            </button>
          </motion.div>
          <p className="absolute bottom-5 text-zinc-400 text-xs tracking-widest">
            Kapatmak için tıklayın
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
