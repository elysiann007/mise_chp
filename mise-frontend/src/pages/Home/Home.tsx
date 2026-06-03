import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageWrapper from '../../components/layout/PageWrapper'
import { fadeUp, fadeIn, stagger, scaleIn, slideLeft } from '../../lib/animations'
import { VENUE } from '../../constants/venue'

const STATS_KEYS = [
  { value: '50+', key: 's_aromas' },
  { value: '80+', key: 's_items' },
  { value: '120', key: 's_seats' },
  { value: '∞',   key: 's_nights' },
]

export default function Home() {
  const { t } = useTranslation()

  const PILLARS = [
    {
      id: 'hookah', to: '/menu/hookah',
      number: '01', tag: t('home.p1_tag'), title: t('home.p1_title'), desc: t('home.p1_desc'),
      borderHover: 'hover:border-amber-400/60', glowHover: 'hover:shadow-amber-400/15',
    },
    {
      id: 'food', to: '/menu/food',
      number: '02', tag: t('home.p2_tag'), title: t('home.p2_title'), desc: t('home.p2_desc'),
      borderHover: 'hover:border-amber-400/40', glowHover: 'hover:shadow-amber-400/10',
    },
    {
      id: 'drinks', to: '/menu/drinks',
      number: '03', tag: t('home.p3_tag'), title: t('home.p3_title'), desc: t('home.p3_desc'),
      borderHover: 'hover:border-amber-400/40', glowHover: 'hover:shadow-amber-400/10',
    },
  ]

  return (
    <PageWrapper>
      <main>
        {/* ── Hero ── */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-950">
          <div className="absolute top-1/4 right-[-5%] w-[500px] h-[500px] rounded-full bg-amber-400/6 blur-[120px] animate-float pointer-events-none" />
          <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-amber-600/5 blur-[100px] animate-float-delayed pointer-events-none" />
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(251,191,36,0.06) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />

          <div className="relative z-10 text-center px-5 max-w-5xl mx-auto">
            <motion.div variants={stagger} initial="hidden" animate="visible" className="flex flex-col items-center">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-amber-500/25 bg-amber-400/5 mb-10">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-amber-400 text-[10px] tracking-[0.3em] uppercase font-medium">{t('home.badge')}</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="font-display leading-none mb-6">
                <span className="block text-white" style={{ fontSize: 'clamp(5rem, 18vw, 13rem)', letterSpacing: '0.04em' }}>CAFE</span>
                <span className="block text-gradient-amber" style={{ fontSize: 'clamp(2.2rem, 8vw, 6rem)', letterSpacing: '0.18em' }}>HOOKAH & PUB</span>
              </motion.h1>

              <motion.div variants={fadeUp} className="flex items-center gap-5 justify-center mb-8">
                <span className="h-px w-14 bg-gradient-to-r from-transparent to-amber-500/50" />
                <span className="text-zinc-400 text-[11px] tracking-[0.3em] uppercase">{t('home.tagline')}</span>
                <span className="h-px w-14 bg-gradient-to-l from-transparent to-amber-500/50" />
              </motion.div>

              <motion.p variants={fadeUp} className="text-zinc-300 text-lg sm:text-xl max-w-lg mx-auto mb-10 leading-relaxed">
                {t('home.desc')}
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/menu" className="px-9 py-4 bg-amber-400 text-stone-950 font-bold text-xs tracking-[0.2em] uppercase rounded-full hover:bg-amber-300 transition-all duration-300 hover:shadow-xl hover:shadow-amber-400/25 hover:-translate-y-0.5">
                  {t('home.cta_menu')}
                </Link>
                <Link to="/about" className="px-9 py-4 border border-zinc-600/70 text-zinc-300 font-semibold text-xs tracking-[0.2em] uppercase rounded-full hover:border-amber-400/50 hover:text-white transition-all duration-300 hover:-translate-y-0.5">
                  {t('home.cta_story')}
                </Link>
              </motion.div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.8 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <span className="text-zinc-600 text-[10px] tracking-[0.25em] uppercase">{t('home.scroll')}</span>
            <div className="w-px h-10 bg-gradient-to-b from-amber-400/40 to-transparent animate-float" />
          </motion.div>
        </section>

        {/* ── Pillars ── */}
        <section className="py-28 px-5 bg-stone-950">
          <div className="max-w-6xl mx-auto">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center mb-16">
              <span className="text-amber-400 text-[10px] tracking-[0.35em] uppercase">{t('home.exp_label')}</span>
              <h2 className="font-display text-white mt-3" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', letterSpacing: '0.06em' }}>{t('home.exp_title')}</h2>
            </motion.div>

            <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {PILLARS.map(p => (
                <motion.div key={p.id} variants={scaleIn}>
                  <Link to={p.to} className={`group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-8 ${p.borderHover} hover:shadow-2xl ${p.glowHover} transition-all duration-500 block`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 group-hover:from-amber-400/5 to-transparent transition-all duration-500" />
                    <div className="relative z-10">
                      <span className="font-display font-black text-7xl text-zinc-800/80 select-none block mb-4 leading-none">{p.number}</span>
                      <span className="text-amber-400 text-[10px] tracking-[0.25em] uppercase">{p.tag}</span>
                      <h3 className="font-display text-white mt-1 mb-3" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', letterSpacing: '0.06em' }}>{p.title.toUpperCase()}</h3>
                      <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors duration-300">{p.desc}</p>
                      <div className="flex items-center gap-2 mt-7 text-amber-400 text-xs font-semibold tracking-wider uppercase">
                        <span>{t('home.explore')}</span>
                        <span className="transform group-hover:translate-x-1.5 transition-transform duration-300">→</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Atmosphere ── */}
        <section className="py-24 px-5 bg-zinc-900/40 border-y border-zinc-800/50">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="flex items-center justify-center gap-4 mb-10">
              <span className="h-px w-12 bg-amber-500/30" />
              <span className="text-amber-400 text-[10px] tracking-[0.35em] uppercase">{t('home.amb_label')}</span>
              <span className="h-px w-12 bg-amber-500/30" />
            </motion.div>
            <motion.h2 variants={slideLeft} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="font-display text-white leading-tight mb-6" style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', letterSpacing: '0.04em' }}>
              {t('home.amb_t1')}<br /><span className="text-gradient-amber">{t('home.amb_t2')}</span>
            </motion.h2>
            <motion.p variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="text-zinc-400 text-lg max-w-2xl mx-auto leading-relaxed">
              {t('home.amb_desc')}
            </motion.p>
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
              <Link to="/about" className="inline-flex items-center gap-2 mt-9 text-amber-400 text-sm font-semibold hover:text-amber-300 transition-colors group">
                <span>{t('home.amb_cta')}</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ── Stats ── */}
        <section className="py-20 px-5 bg-stone-950">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {STATS_KEYS.map(s => (
              <motion.div key={s.key} variants={fadeUp}>
                <div className="font-display text-4xl sm:text-5xl text-amber-400 mb-2" style={{ letterSpacing: '0.04em' }}>{s.value}</div>
                <div className="text-zinc-500 text-sm tracking-wider">{t(`home.${s.key}`)}</div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* ── Hours + Location ── */}
        <section className="py-20 px-5 border-t border-zinc-800/60">
          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-14">
            <motion.div variants={slideLeft}>
              <span className="text-amber-400 text-[10px] tracking-[0.3em] uppercase">{t('home.h_label')}</span>
              <h3 className="font-display text-white mt-2 mb-6" style={{ fontSize: '1.8rem', letterSpacing: '0.06em' }}>{t('home.h_title')}</h3>
              <div className="space-y-4">
                {[
                  { key: 'h_mon_thu', hours: '5 PM – 2 AM', hi: false },
                  { key: 'h_fri_sat', hours: '4 PM – 4 AM', hi: true },
                  { key: 'h_sun',     hours: '5 PM – 1 AM', hi: false },
                ].map(row => (
                  <div key={row.key} className="flex justify-between border-b border-zinc-800/60 pb-4">
                    <span className="text-zinc-300 text-sm">{t(`home.${row.key}`)}</span>
                    <span className={`text-sm font-medium ${row.hi ? 'text-amber-400' : 'text-zinc-500'}`}>{row.hours}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <span className="text-amber-400 text-[10px] tracking-[0.3em] uppercase">{t('home.l_label')}</span>
              <h3 className="font-display text-white mt-2 mb-6" style={{ fontSize: '1.8rem', letterSpacing: '0.06em' }}>{t('home.l_title')}</h3>
              <p className="text-zinc-300 text-sm leading-relaxed mb-5">{t('home.l_address')}</p>

              <a
                href={`tel:${VENUE.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-3 mb-4 group"
              >
                <div className="w-9 h-9 rounded-full border border-amber-400/40 flex items-center justify-center group-hover:border-amber-400 group-hover:bg-amber-400/10 transition-all duration-200 flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-amber-400 font-semibold text-sm group-hover:text-amber-300 transition-colors">{VENUE.phone}</p>
                  <p className="text-zinc-500 text-xs">{t('home.l_call_info')}</p>
                </div>
              </a>

              <a href={VENUE.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-zinc-400 text-sm font-semibold hover:text-amber-400 transition-colors group">
                <span>{t('home.l_directions')}</span>
                <span className="transform group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </PageWrapper>
  )
}
