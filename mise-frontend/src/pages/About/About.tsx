import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageWrapper from '../../components/layout/PageWrapper'
import { fadeUp, fadeIn, stagger, scaleIn, slideLeft } from '../../lib/animations'

const STATS = [
  { value: '2008', key: 's_est' },
  { value: '50+', key: 's_aromas' },
  { value: '80+', key: 's_items' },
  { value: '120', key: 's_seats' },
]

const VALUES = [
  { icon: '◎', titleKey: 'craft_t', descKey: 'craft_d' },
  { icon: '◆', titleKey: 'atm_t', descKey: 'atm_d' },
  { icon: '○', titleKey: 'con_t', descKey: 'con_d' },
]

export default function About() {
  const { t } = useTranslation()

  return (
    <PageWrapper>
      <main className="min-h-screen bg-stone-950 pt-20">
        {/* Hero */}
        <section className="relative py-32 px-5 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-400/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-amber-600/4 rounded-full blur-[80px] pointer-events-none" />

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="max-w-3xl mx-auto relative z-10 text-center"
          >
            <motion.span variants={fadeUp} className="text-amber-400 text-[10px] tracking-[0.35em] uppercase">
              {t('about.label')}
            </motion.span>
            <motion.h1
              variants={fadeUp}
              className="font-display text-white mt-3 leading-tight"
              style={{ fontSize: 'clamp(3rem, 10vw, 7rem)', letterSpacing: '0.04em' }}
            >
              {t('about.t1')}
              <br />
              <span className="text-gradient-amber">{t('about.t2')}</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-zinc-300 text-xl leading-relaxed mt-8 max-w-2xl mx-auto">
              {t('about.intro')}
            </motion.p>
          </motion.div>
        </section>

        {/* Story + Stats */}
        <section className="py-20 px-5 border-t border-zinc-800/60">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              variants={slideLeft}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
            >
              <span className="text-amber-400 text-[10px] tracking-[0.3em] uppercase">{t('about.v_label')}</span>
              <h2
                className="font-display text-white mt-2 mb-5"
                style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.06em' }}
              >
                {t('about.v_title')}
              </h2>
              <p className="text-zinc-400 leading-relaxed mb-5">{t('about.v_p1')}</p>
              <p className="text-zinc-400 leading-relaxed mb-5">{t('about.v_p2')}</p>
              <p className="text-zinc-400 leading-relaxed">{t('about.v_p3')}</p>
            </motion.div>

            <motion.div
              variants={scaleIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-80px' }}
              className="bg-zinc-900 rounded-2xl border border-zinc-800 p-8"
            >
              <div className="divide-y divide-zinc-800">
                {STATS.map(s => (
                  <div key={s.key} className="flex items-baseline gap-4 py-5 first:pt-0 last:pb-0">
                    <span className="font-display text-4xl text-amber-400" style={{ letterSpacing: '0.04em' }}>
                      {s.value}
                    </span>
                    <span className="text-zinc-400 text-sm">{t(`about.${s.key}`)}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-5 bg-zinc-900/30 border-y border-zinc-800/60">
          <div className="max-w-5xl mx-auto">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              className="text-center mb-12"
            >
              <span className="text-amber-400 text-[10px] tracking-[0.35em] uppercase">{t('about.pil_label')}</span>
              <h2
                className="font-display text-white mt-2"
                style={{ fontSize: 'clamp(1.8rem, 5vw, 3rem)', letterSpacing: '0.06em' }}
              >
                {t('about.pil_title')}
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-40px' }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-5"
            >
              {VALUES.map(v => (
                <motion.div
                  key={v.titleKey}
                  variants={scaleIn}
                  className="bg-zinc-900 rounded-2xl border border-zinc-800 p-7"
                >
                  <div className="text-amber-400 text-2xl mb-4">{v.icon}</div>
                  <h3
                    className="font-display text-white mb-3"
                    style={{ fontSize: '1.3rem', letterSpacing: '0.06em' }}
                  >
                    {t(`about.${v.titleKey}`).toUpperCase()}
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{t(`about.${v.descKey}`)}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="py-24 px-5 text-center"
        >
          <motion.span variants={fadeUp} className="text-amber-400 text-[10px] tracking-[0.35em] uppercase">
            {t('about.cta_label')}
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="font-display text-white mt-3 mb-8"
            style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', letterSpacing: '0.06em' }}
          >
            {t('about.cta_title')}
          </motion.h2>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/menu"
              className="px-9 py-4 bg-amber-400 text-stone-950 font-bold text-xs tracking-[0.2em] uppercase rounded-full hover:bg-amber-300 transition-all hover:shadow-xl hover:shadow-amber-400/25"
            >
              {t('about.cta_menu')}
            </Link>
            <Link
              to="/menu/hookah"
              className="px-9 py-4 border border-zinc-600 text-zinc-300 font-semibold text-xs tracking-[0.2em] uppercase rounded-full hover:border-amber-400/50 hover:text-white transition-all"
            >
              {t('about.cta_hookah')}
            </Link>
          </motion.div>
        </motion.section>
      </main>
    </PageWrapper>
  )
}
