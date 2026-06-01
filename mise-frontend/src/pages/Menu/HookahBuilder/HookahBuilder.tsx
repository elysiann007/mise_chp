import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageWrapper from '../../../components/layout/PageWrapper'
import { stagger, fadeUp, scaleIn, fadeIn } from '../../../lib/animations'

const AROMAS: Record<string, { id: string; name: string; color: string }[]> = {
  fruity: [
    { id: 'watermelon', name: 'Watermelon', color: '#f87171' },
    { id: 'mango', name: 'Mango', color: '#fb923c' },
    { id: 'blueberry', name: 'Blueberry', color: '#818cf8' },
    { id: 'lemon', name: 'Lemon', color: '#facc15' },
    { id: 'strawberry', name: 'Strawberry', color: '#f472b6' },
    { id: 'grape', name: 'Grape', color: '#c084fc' },
  ],
  minty: [
    { id: 'peppermint', name: 'Peppermint', color: '#38bdf8' },
    { id: 'spearmint', name: 'Spearmint', color: '#34d399' },
    { id: 'apple-mint', name: 'Apple Mint', color: '#6ee7b7' },
    { id: 'pure-ice', name: 'Pure Ice', color: '#bae6fd' },
  ],
  floral: [
    { id: 'rose', name: 'Rose', color: '#fb7185' },
    { id: 'jasmine', name: 'Jasmine', color: '#fde68a' },
    { id: 'lavender', name: 'Lavender', color: '#a78bfa' },
  ],
  exotic: [
    { id: 'coconut', name: 'Coconut', color: '#fef9c3' },
    { id: 'pineapple', name: 'Pineapple', color: '#fcd34d' },
    { id: 'passion-fruit', name: 'Passion Fruit', color: '#fb923c' },
    { id: 'guava', name: 'Guava', color: '#f9a8d4' },
  ],
  tobacco: [
    { id: 'double-apple', name: 'Double Apple', color: '#ef4444' },
    { id: 'vanilla', name: 'Vanilla', color: '#e5e7eb' },
    { id: 'caramel', name: 'Caramel', color: '#d97706' },
    { id: 'honey', name: 'Honey Blend', color: '#fbbf24' },
  ],
}

type Category = keyof typeof AROMAS

const CATEGORY_KEYS: Category[] = ['fruity', 'minty', 'floral', 'exotic', 'tobacco']

interface SelectedAroma {
  id: string
  name: string
  color: string
  percentage: number
}

function HookahVisual({ aromas, model }: { aromas: SelectedAroma[]; model: string }) {
  const primaryColor = aromas[0]?.color ?? '#fbbf24'
  const hasBlend = aromas.length > 0

  return (
    <div className="flex flex-col items-center justify-center py-8 relative">
      {/* Smoke particles */}
      {hasBlend && (
        <div className="absolute top-2 flex gap-1.5">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="rounded-full animate-float"
              style={{
                width: `${8 - i * 2}px`,
                height: `${8 - i * 2}px`,
                backgroundColor: aromas[i % aromas.length]?.color ?? primaryColor,
                opacity: 0.5,
                filter: 'blur(3px)',
                animationDelay: `${i * 0.6}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Hookah bowl */}
      <div
        className="w-14 h-6 rounded-t-full border border-amber-500/40 transition-all duration-700"
        style={{
          background: hasBlend
            ? `radial-gradient(ellipse at 50% 0%, ${primaryColor}60, ${primaryColor}20)`
            : 'linear-gradient(180deg, #3f3f46, #27272a)',
        }}
      />

      {/* Stem */}
      <div
        className="w-20 h-28 rounded-lg border-x border-b border-amber-500/30 flex items-center justify-center transition-all duration-700"
        style={{
          background: hasBlend
            ? `radial-gradient(ellipse at 50% 30%, ${primaryColor}15, #18181b 70%)`
            : 'linear-gradient(180deg, #27272a, #18181b)',
          boxShadow: hasBlend ? `0 0 30px ${primaryColor}25, inset 0 0 20px ${primaryColor}10` : 'none',
        }}
      >
        {model === 'premium' && (
          <div className="w-8 h-8 rounded-full border border-amber-400/30 flex items-center justify-center">
            <span className="text-amber-400/50 text-xs">✦</span>
          </div>
        )}
      </div>

      {/* Base connector */}
      <div className="w-10 h-2 bg-zinc-700 rounded" />

      {/* Base vase */}
      <div
        className="w-16 h-14 rounded-b-full border border-amber-500/20 transition-all duration-700"
        style={{
          background: hasBlend
            ? `radial-gradient(ellipse at 50% 80%, ${primaryColor}20, #18181b)`
            : 'linear-gradient(180deg, #27272a, #1c1c1e)',
          boxShadow: hasBlend ? `0 0 20px ${primaryColor}15` : 'none',
        }}
      />
    </div>
  )
}

export default function HookahBuilder() {
  const { t } = useTranslation()
  const [model, setModel] = useState('classic')
  const [activeCategory, setActiveCategory] = useState<Category>('fruity')
  const [aromas, setAromas] = useState<SelectedAroma[]>([])

  const MODELS = [
    { id: 'classic', name: t('hookah.classic_name'), desc: t('hookah.classic_desc'), icon: '◎' },
    { id: 'modern', name: t('hookah.modern_name'), desc: t('hookah.modern_desc'), icon: '⬡' },
    { id: 'premium', name: t('hookah.premium_name'), desc: t('hookah.premium_desc'), icon: '✦' },
  ]

  const CATEGORIES = CATEGORY_KEYS.map(key => ({ key, label: t(`hookah.${key}`) }))

  const total = aromas.reduce((s, a) => s + a.percentage, 0)
  const remaining = 100 - total
  const isComplete = total === 100

  const toggleAroma = (aroma: { id: string; name: string; color: string }) => {
    const exists = aromas.find(a => a.id === aroma.id)
    if (exists) {
      setAromas(prev => prev.filter(a => a.id !== aroma.id))
    } else if (remaining > 0) {
      const defaultPct = Math.min(remaining, Math.max(5, Math.floor(remaining / (aromas.length + 1))))
      setAromas(prev => [...prev, { ...aroma, percentage: defaultPct }])
    }
  }

  const updatePct = (id: string, value: number) => {
    setAromas(prev => prev.map(a => (a.id === id ? { ...a, percentage: value } : a)))
  }

  const circumference = 2 * Math.PI * 34

  return (
    <PageWrapper>
    <main className="min-h-screen bg-stone-950 pt-20">
      {/* Header */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="py-16 px-5 border-b border-zinc-800/60"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeIn}>
            <Link
              to="/menu"
              className="inline-flex items-center gap-1.5 text-zinc-500 text-sm hover:text-amber-400 transition-colors mb-6"
            >
              ← {t('hookah.back')}
            </Link>
          </motion.div>
          <motion.span variants={fadeUp} className="block text-amber-400 text-[10px] tracking-[0.35em] uppercase mb-2">
            {t('hookah.label')}
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="font-display text-white"
            style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', letterSpacing: '0.04em' }}
          >
            {t('hookah.title')}
          </motion.h1>
          <motion.p variants={fadeUp} className="text-zinc-500 mt-3 max-w-lg">
            {t('hookah.desc')}
          </motion.p>
        </div>
      </motion.div>

      <div className="max-w-6xl mx-auto px-5 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left column: steps */}
          <div className="lg:col-span-2 space-y-10">

            {/* Step 1: Model */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 text-xs font-bold flex items-center justify-center">1</span>
                <h2 className="text-white font-semibold tracking-wide">{t('hookah.step1')}</h2>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {MODELS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setModel(m.id)}
                    className={`p-5 rounded-xl border text-center transition-all duration-300 ${
                      model === m.id
                        ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/15'
                        : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                    }`}
                  >
                    <div className="text-3xl mb-2 text-amber-400">{m.icon}</div>
                    <div className="text-white text-sm font-semibold">{m.name}</div>
                    <div className="text-zinc-500 text-xs mt-0.5">{m.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Aromas */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 text-xs font-bold flex items-center justify-center">2</span>
                <h2 className="text-white font-semibold tracking-wide">{t('hookah.step2')}</h2>
                {remaining <= 0 && aromas.length > 0 && (
                  <span className="ml-auto text-xs text-zinc-500 italic">{t('hookah.full')}</span>
                )}
              </div>

              {/* Category pills */}
              <div className="flex gap-2 mb-5 overflow-x-auto scrollbar-hide pb-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider whitespace-nowrap transition-all duration-200 ${
                      activeCategory === cat.key
                        ? 'bg-amber-400 text-stone-950'
                        : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Aroma grid */}
              <motion.div
                key={activeCategory}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 gap-2.5"
              >
                {AROMAS[activeCategory].map(aroma => {
                  const selected = aromas.some(a => a.id === aroma.id)
                  const disabled = !selected && remaining <= 0
                  return (
                    <motion.button
                      key={aroma.id}
                      variants={scaleIn}
                      whileTap={{ scale: disabled ? 1 : 0.93 }}
                      whileHover={{ scale: disabled ? 1 : 1.02 }}
                      onClick={() => !disabled && toggleAroma(aroma)}
                      disabled={disabled}
                      className={`p-3.5 rounded-xl border text-left transition-colors duration-200 ${
                        selected
                          ? 'border-amber-400/60 bg-amber-400/10'
                          : disabled
                          ? 'border-zinc-800 bg-zinc-900/50 opacity-40 cursor-not-allowed'
                          : 'border-zinc-700 bg-zinc-900 hover:border-zinc-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: aroma.color }}
                        />
                        <span className={`text-sm font-medium ${selected ? 'text-amber-400' : 'text-zinc-300'}`}>
                          {aroma.name}
                        </span>
                        {selected && <span className="ml-auto text-amber-400 text-xs">✓</span>}
                      </div>
                    </motion.button>
                  )
                })}
              </motion.div>
            </div>

            {/* Step 3: Percentages */}
            <AnimatePresence>
            {aromas.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 text-xs font-bold flex items-center justify-center">3</span>
                  <h2 className="text-white font-semibold tracking-wide">{t('hookah.step3')}</h2>
                  <span
                    className={`ml-auto text-sm font-mono font-semibold ${
                      isComplete ? 'text-green-400' : total > 100 ? 'text-red-400' : 'text-zinc-400'
                    }`}
                  >
                    {total}% / 100%
                  </span>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                  {aromas.map(aroma => (
                    <motion.div
                      key={aroma.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-zinc-900 rounded-xl p-4 border border-zinc-800"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: aroma.color }}
                        />
                        <span className="text-white text-sm font-medium flex-1">{aroma.name}</span>
                        <span className="text-amber-400 font-mono text-sm font-semibold">{aroma.percentage}%</span>
                        <button
                          onClick={() => setAromas(prev => prev.filter(a => a.id !== aroma.id))}
                          className="text-zinc-600 hover:text-zinc-300 text-sm leading-none ml-1 transition-colors"
                          aria-label={`Remove ${aroma.name}`}
                        >
                          ✕
                        </button>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        step={5}
                        value={aroma.percentage}
                        onChange={e => updatePct(aroma.id, Number(e.target.value))}
                        style={{
                          width: '100%',
                          background: `linear-gradient(to right, ${aroma.color} ${aroma.percentage}%, #3f3f46 ${aroma.percentage}%)`,
                        }}
                      />
                    </motion.div>
                  ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
            </AnimatePresence>
          </div>

          {/* Right column: preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Hookah visual */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
                <span className="text-zinc-500 text-[10px] tracking-[0.25em] uppercase">{t('hookah.preview')}</span>
                <HookahVisual aromas={aromas} model={model} />
                {aromas.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {aromas.map(a => (
                      <div key={a.id} className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.color }} />
                        <span className="text-zinc-400 text-xs flex-1">{a.name}</span>
                        <span className="text-zinc-600 text-xs font-mono">{a.percentage}%</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-600 text-xs text-center mt-2">{t('hookah.empty')}</p>
                )}
              </div>

              {/* Progress ring */}
              <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-5 text-center">
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#27272a" strokeWidth="5" />
                    <circle
                      cx="40" cy="40" r="34"
                      fill="none"
                      stroke={isComplete ? '#4ade80' : '#fbbf24'}
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference * (1 - Math.min(total, 100) / 100)}
                      className="transition-all duration-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-lg font-bold font-mono ${isComplete ? 'text-green-400' : 'text-amber-400'}`}>
                      {total}%
                    </span>
                  </div>
                </div>
                <p className="text-zinc-500 text-xs">
                  {isComplete
                    ? t('hookah.complete')
                    : aromas.length === 0
                    ? t('hookah.start')
                    : `${remaining}${t('hookah.remaining')}`}
                </p>
                {isComplete && (
                  <button className="mt-4 w-full py-2.5 bg-amber-400 text-stone-950 text-xs font-bold tracking-widest uppercase rounded-full hover:bg-amber-300 transition-colors">
                    {t('hookah.order')}
                  </button>
                )}
                {aromas.length > 0 && !isComplete && (
                  <button
                    onClick={() => setAromas([])}
                    className="mt-3 w-full py-2 border border-zinc-700 text-zinc-500 text-xs rounded-full hover:border-zinc-600 hover:text-zinc-400 transition-colors"
                  >
                    {t('hookah.reset')}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    </PageWrapper>
  )
}
