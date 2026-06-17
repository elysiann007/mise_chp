import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageWrapper from '../../../components/layout/PageWrapper'
import { fadeUp, fadeIn, stagger, slideLeft } from '../../../lib/animations'
import { NON_ALCOHOLIC_DRINKS, ALCOHOLIC_DRINKS } from '../../../constants/menu'

export default function DrinksMenu() {
  const { t, i18n } = useTranslation()

  return (
    <PageWrapper>
      <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-20">
        {/* Header */}
        <div className="relative py-20 px-5 border-b border-stone-200 dark:border-zinc-800/60 overflow-hidden">
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto relative z-10"
          >
            <motion.div variants={fadeIn}>
              <Link to="/menu" className="inline-flex items-center gap-1.5 text-stone-500 dark:text-zinc-500 text-sm hover:text-amber-600 dark:hover:text-amber-400 transition-colors mb-6">
                ← {t('drinks.back')}
              </Link>
            </motion.div>
            <motion.span variants={fadeUp} className="block text-amber-600 dark:text-amber-400 text-[10px] tracking-[0.35em] uppercase mb-2">
              {t('drinks.label')}
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="font-display text-stone-900 dark:text-white"
              style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', letterSpacing: '0.04em' }}
            >
              {t('drinks.title')}
            </motion.h1>
            <motion.p variants={fadeUp} className="text-stone-500 dark:text-zinc-500 mt-3 max-w-md text-sm leading-relaxed">
              {t('drinks.desc')}
            </motion.p>
          </motion.div>
        </div>

        {/* Full scroll menu */}
        <div className="max-w-3xl mx-auto px-5 py-16 space-y-20">
          {[
            { label: t('drinks.group_nonalcoholic'), sections: NON_ALCOHOLIC_DRINKS, id: 'nonalcoholic' },
            { label: t('drinks.group_alcoholic'), sections: ALCOHOLIC_DRINKS, id: 'alcoholic' },
          ].map((group) => (
            <div key={group.label} id={group.id} className="space-y-20 scroll-mt-24">
              {/* Group divider */}
              <motion.div
                variants={fadeIn}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="flex items-center gap-5"
              >
                <div className="h-px w-8 bg-amber-500/60 flex-shrink-0" />
                <span className="font-display text-stone-700 dark:text-zinc-300 tracking-[0.2em] text-xs uppercase flex-shrink-0">
                  {group.label}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
              </motion.div>

              {group.sections.map((section, si) => (
                <motion.section
                  key={section.id}
                  variants={stagger}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, margin: '-60px' }}
                >
                  <motion.div variants={slideLeft} className="flex items-center gap-5 mb-10">
                    <h2
                      className="font-display text-amber-600 dark:text-amber-400 flex-shrink-0"
                      style={{ fontSize: 'clamp(2rem, 6vw, 3.5rem)', letterSpacing: '0.1em' }}
                    >
                      {t(`drinks.${section.id}`).toUpperCase()}
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-amber-500/40 to-transparent" />
                    <span className="text-stone-300 dark:text-zinc-700 font-display text-sm tracking-widest flex-shrink-0">
                      0{si + 1}
                    </span>
                  </motion.div>

                  <div className="space-y-0">
                    {section.items.map((item, i) => (
                      <motion.div
                        key={item.key}
                        variants={fadeUp}
                        className={`group py-6 ${i < section.items.length - 1 ? 'border-b border-stone-200 dark:border-zinc-800/60' : ''}`}
                      >
                        <div className="flex items-baseline gap-3">
                          <div>
                            <span
                              className="font-display text-stone-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-200"
                              style={{ fontSize: 'clamp(1.2rem, 3vw, 1.6rem)', letterSpacing: '0.04em' }}
                            >
                              {`${i + 1}. ${t(`drinks.items.${item.key}`, item.name)}`.toUpperCase()}
                            </span>
                            {i18n.language !== 'tr' && (
                              <div className="text-xs text-stone-400 dark:text-zinc-500 mt-1">
                                {i18n.getFixedT('tr')(`drinks.items.${item.key}`)}
                              </div>
                            )}
                          </div>
                          <span className="flex-1 border-b border-dotted border-stone-300 dark:border-zinc-700 mb-1.5 min-w-[2rem]" />
                          <div className="flex flex-col items-end flex-shrink-0">
                            <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold text-sm">{item.price}</span>
                            {item.calories && (
                              <span className="text-stone-400 dark:text-zinc-600 text-[10px] mt-0.5">{item.calories} kcal</span>
                            )}
                          </div>
                        </div>
                        <p className="text-stone-500 dark:text-zinc-500 text-sm mt-1.5 leading-relaxed group-hover:text-stone-600 dark:group-hover:text-zinc-400 transition-colors duration-200">
                          {item.desc && t(`drinks.items.${item.key}_desc`, item.desc)}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              ))}
            </div>
          ))}

          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="border-t border-stone-200 dark:border-zinc-800/60 pt-8 text-center"
          >
            <p className="text-stone-300 dark:text-zinc-700 text-xs leading-relaxed">
              {t('drinks.disclaimer')}
            </p>
          </motion.div>
        </div>
      </main>
    </PageWrapper>
  )
}
