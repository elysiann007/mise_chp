import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageWrapper from '../../components/layout/PageWrapper'
import { stagger, fadeUp, scaleIn } from '../../lib/animations'

export default function MenuHub() {
  const { t } = useTranslation()

  const CATEGORIES = [
    {
      id: 'hookah', to: '/menu/hookah',
      number: '01', tag: t('hub.h_tag'), title: t('hub.h_title'), desc: t('hub.h_desc'), cta: t('hub.h_cta'),
      borderClass: 'border-amber-500/40 hover:border-amber-500/80 dark:border-amber-500/40 dark:hover:border-amber-400/80', glowClass: 'hover:shadow-amber-400/20',
    },
    {
      id: 'food', to: '/menu/food',
      number: '02', tag: t('hub.f_tag'), title: t('hub.f_title'), desc: t('hub.f_desc'), cta: t('hub.f_cta'),
      borderClass: 'border-stone-200 dark:border-zinc-700 hover:border-amber-500/50 dark:hover:border-amber-400/50', glowClass: 'hover:shadow-amber-400/10',
    },
    {
      id: 'nonalcoholic', to: '/menu/drinks/nonalcoholic',
      number: '03', tag: t('hub.na_tag'), title: t('hub.na_title'), desc: t('hub.na_desc'), cta: t('hub.na_cta'),
      borderClass: 'border-stone-200 dark:border-zinc-700 hover:border-amber-500/50 dark:hover:border-amber-400/50', glowClass: 'hover:shadow-amber-400/10',
    },
    {
      id: 'alcoholic', to: '/menu/drinks/alcoholic',
      number: '04', tag: t('hub.al_tag'), title: t('hub.al_title'), desc: t('hub.al_desc'), cta: t('hub.al_cta'),
      borderClass: 'border-stone-200 dark:border-zinc-700 hover:border-amber-500/50 dark:hover:border-amber-400/50', glowClass: 'hover:shadow-amber-400/10',
    },
  ]

  return (
    <PageWrapper>
      <main className="min-h-screen bg-stone-50 dark:bg-stone-950 pt-20">
        <motion.div variants={stagger} initial="hidden" animate="visible" className="relative py-24 px-5 text-center overflow-hidden border-b border-stone-200 dark:border-zinc-800/60">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-amber-400/4 rounded-full blur-[100px] pointer-events-none" />
          <motion.span variants={fadeUp} className="relative z-10 block text-amber-600 dark:text-amber-400 text-[10px] tracking-[0.35em] uppercase">{t('hub.label')}</motion.span>
          <motion.h1 variants={fadeUp} className="relative z-10 font-display text-stone-900 dark:text-white mt-3" style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', letterSpacing: '0.06em' }}>{t('hub.title')}</motion.h1>
          <motion.p variants={fadeUp} className="relative z-10 text-stone-500 dark:text-zinc-500 text-lg mt-4 max-w-sm mx-auto">{t('hub.sub')}</motion.p>
        </motion.div>

        <motion.div variants={stagger} initial="hidden" animate="visible" className="max-w-4xl mx-auto px-5 py-16 space-y-5">
          {CATEGORIES.map(cat => (
            <motion.div key={cat.id} variants={scaleIn}>
              <Link to={cat.to} className={`group relative flex flex-col sm:flex-row items-start sm:items-center gap-6 overflow-hidden rounded-2xl border ${cat.borderClass} bg-stone-100 dark:bg-zinc-900 p-8 sm:p-10 transition-all duration-500 hover:shadow-2xl ${cat.glowClass} block`}>
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 group-hover:from-amber-400/4 to-transparent transition-all duration-700" />
                <span className="font-display font-black text-stone-200/80 dark:text-zinc-800 text-7xl sm:text-8xl leading-none select-none flex-shrink-0 relative z-10">{cat.number}</span>
                <div className="flex-1 relative z-10">
                  <span className="text-amber-600 dark:text-amber-400 text-[10px] tracking-[0.25em] uppercase">{cat.tag}</span>
                  <h2 className="font-display text-stone-900 dark:text-white mt-1" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', letterSpacing: '0.06em' }}>{cat.title.toUpperCase()}</h2>
                  <p className="text-stone-500 dark:text-zinc-500 text-sm leading-relaxed mt-3 max-w-xl group-hover:text-stone-600 dark:group-hover:text-zinc-400 transition-colors duration-300">{cat.desc}</p>
                  <div className="inline-flex items-center gap-2 mt-5 text-amber-600 dark:text-amber-400 text-xs font-semibold tracking-widest uppercase">
                    <span>{cat.cta}</span>
                    <span className="transform group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </PageWrapper>
  )
}
