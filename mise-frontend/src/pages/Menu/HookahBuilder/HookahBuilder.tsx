import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageWrapper from '../../../components/layout/PageWrapper'
import { stagger, fadeUp, scaleIn, fadeIn, slideLeft } from '../../../lib/animations'
import { HOOKAH_BRANDS as BRANDS } from '../../../constants/hookah'

export default function HookahBuilder() {
  const { t, i18n } = useTranslation()

  return (
    <PageWrapper>
      <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-20">
        {/* Header */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="py-16 px-5 border-b border-stone-200 dark:border-zinc-800/60"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div variants={fadeIn}>
              <Link
                to="/menu"
                className="inline-flex items-center gap-1.5 text-stone-500 dark:text-zinc-500 text-sm hover:text-amber-600 dark:hover:text-amber-400 transition-colors mb-6"
              >
                ← {t('hookah.back')}
              </Link>
            </motion.div>
            <motion.span variants={fadeUp} className="block text-amber-600 dark:text-amber-400 text-[10px] tracking-[0.35em] uppercase mb-2">
              {t('hookah.label')}
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="font-display text-stone-900 dark:text-white"
              style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', letterSpacing: '0.04em' }}
            >
              {t('hookah.title')}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-stone-500 dark:text-zinc-500 mt-3 max-w-lg">
              {t('hookah.desc')}
            </motion.p>
          </div>
        </motion.div>

        {/* Brand showcase */}
        <div className="max-w-6xl mx-auto px-5 py-12 space-y-20">
          {BRANDS.map((brand, bi) => (
            <motion.section
              key={brand.id}
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              {/* Brand header */}
              <motion.div variants={slideLeft} className="flex items-center gap-5 mb-8">
                <span className="text-amber-600 dark:text-amber-400 text-2xl flex-shrink-0">{brand.icon}</span>
                <div className="flex-shrink-0">
                  <h2
                    className="font-display text-amber-600 dark:text-amber-400"
                    style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', letterSpacing: '0.08em' }}
                  >
                    {brand.name.toUpperCase()}
                  </h2>
                  <p className="text-stone-500 dark:text-zinc-500 text-xs tracking-widest uppercase mt-0.5">{brand.desc}</p>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
                <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold text-sm flex-shrink-0">{brand.price}</span>
                <span className="text-stone-300 dark:text-zinc-700 font-display text-sm tracking-widest flex-shrink-0">{String(bi + 1).padStart(2, '0')}</span>
              </motion.div>

              {/* Aroma grid */}
              <motion.div
                variants={stagger}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5"
              >
                {brand.aromas.map(aroma => (
                  <motion.div
                    key={aroma.id}
                    variants={scaleIn}
                    className="p-3.5 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-100 dark:bg-zinc-900"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                        style={{ backgroundColor: aroma.color }}
                      />
                      <div>
                        <span className="text-sm font-medium text-stone-700 dark:text-zinc-300">{aroma.nameKey ? t(aroma.nameKey, aroma.name) : aroma.name}</span>
                        {i18n.language !== 'tr' && aroma.nameKey && (
                          <div className="text-xs text-stone-400 dark:text-zinc-600 mt-0.5">{aroma.name}</div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.section>
          ))}
        </div>
      </main>
    </PageWrapper>
  )
}
