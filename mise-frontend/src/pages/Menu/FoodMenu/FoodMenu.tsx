import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageWrapper from '../../../components/layout/PageWrapper'
import { fadeUp, fadeIn, stagger, slideLeft } from '../../../lib/animations'
import { FOOD_MENU } from '../../../constants/menu'

export default function FoodMenu() {
  const { t } = useTranslation()

  return (
    <PageWrapper>
      <main className="min-h-screen bg-stone-950 pt-20">
        {/* Header */}
        <div className="relative py-20 px-5 border-b border-zinc-800/60 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-400/4 rounded-full blur-[100px] pointer-events-none" />
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto relative z-10"
          >
            <motion.div variants={fadeIn}>
              <Link to="/menu" className="inline-flex items-center gap-1.5 text-zinc-500 text-sm hover:text-amber-400 transition-colors mb-6">
                ← {t('food.back')}
              </Link>
            </motion.div>
            <motion.span variants={fadeUp} className="block text-amber-400 text-[10px] tracking-[0.35em] uppercase mb-2">
              {t('food.label')}
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="font-display text-white"
              style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', letterSpacing: '0.04em' }}
            >
              {t('food.title')}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-zinc-500 mt-3 max-w-md text-sm leading-relaxed">
              {t('food.desc')}
            </motion.p>
          </motion.div>
        </div>

        {/* Full scroll menu */}
        <div className="max-w-3xl mx-auto px-5 py-16 space-y-20">
          {FOOD_MENU.map((section, si) => (
            <motion.section
              key={section.id}
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              {/* Section header */}
              <motion.div variants={slideLeft} className="flex items-center gap-5 mb-10">
                <h2
                  className="font-display text-amber-400 flex-shrink-0"
                  style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', letterSpacing: '0.1em' }}
                >
                  {t(`food.${section.id}`).toUpperCase()}
                </h2>
                <div className="h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
                <span className="text-zinc-700 font-display text-sm tracking-widest flex-shrink-0">
                  0{si + 1}
                </span>
              </motion.div>

              {/* Items */}
              <div className="space-y-0">
                {section.items.map((item, i) => (
                  <motion.div
                    key={item.key}
                    variants={fadeUp}
                    className={`group py-6 ${i < section.items.length - 1 ? 'border-b border-zinc-800/60' : ''}`}
                  >
                    <div className="flex items-baseline gap-3">
                      <span
                        className="font-display text-white group-hover:text-amber-400 transition-colors duration-200"
                        style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', letterSpacing: '0.04em' }}
                      >
                        {`${i + 1}. ${t(`food.items.${item.key}`, item.name)}`.toUpperCase()}
                      </span>
                      <span className="flex-1 border-b border-dotted border-zinc-700 mb-1.5 min-w-[2rem]" />
                      <span className="font-mono text-amber-400 font-semibold text-sm flex-shrink-0">
                        {item.price}
                      </span>
                    </div>
                    <p className="text-zinc-500 text-sm mt-1.5 leading-relaxed group-hover:text-zinc-400 transition-colors duration-200">
                      {item.desc && t(`food.items.${item.key}_desc`, item.desc)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          ))}

          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="border-t border-zinc-800/60 pt-8 text-center"
          >
            <p className="text-zinc-700 text-xs leading-relaxed">
              {t('food.allergen')}
            </p>
          </motion.div>
        </div>
      </main>
    </PageWrapper>
  )
}
