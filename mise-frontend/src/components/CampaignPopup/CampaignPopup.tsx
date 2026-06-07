import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function CampaignPopup() {
  const { t } = useTranslation()
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
            style={{ maxWidth: 440, maxHeight: '88vh', width: '90vw' }}
          >
            <img
              src="/campaign-poster.webp"
              alt={t('popup.alt')}
              className="block w-full h-auto rounded-2xl"
              style={{ maxHeight: '88vh', objectFit: 'contain' }}
            />
            <button
              onClick={close}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center text-white text-sm hover:bg-black/90 transition-colors"
              aria-label={t('popup.close')}
            >
              ✕
            </button>
          </motion.div>
          <p className="absolute bottom-5 text-zinc-400 text-xs tracking-widest">
            {t('popup.dismiss')}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
