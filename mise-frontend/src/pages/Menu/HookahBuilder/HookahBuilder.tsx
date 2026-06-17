import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PageWrapper from '../../../components/layout/PageWrapper'
import { stagger, fadeUp, scaleIn, fadeIn, slideLeft } from '../../../lib/animations'

const BRANDS = [
  {
    id: 'revoshi',
    name: 'Revoshi',
    desc: 'Premium Tobacco',
    price: '₺500',
    icon: '◎',
    aromas: [
      { id: 'r-double-apple',      name: 'Double Apple',       color: '#ef4444' },
      { id: 'r-uzum',              name: 'Üzüm',               color: '#a855f7',  nameKey: 'hookah.aromas.uzum' },
      { id: 'r-uzum-nane',         name: 'Üzüm Nane',          color: '#818cf8',  nameKey: 'hookah.aromas.uzum_nane' },
      { id: 'r-biskuvi',           name: 'Bisküvi',             color: '#d4a574',  nameKey: 'hookah.aromas.biskuvi' },
      { id: 'r-portakal',          name: 'Portakal',            color: '#f97316',  nameKey: 'hookah.aromas.portakal' },
      { id: 'r-limon',             name: 'Limon',               color: '#facc15',  nameKey: 'hookah.aromas.limon' },
      { id: 'r-kavun',             name: 'Kavun',               color: '#fbbf24',  nameKey: 'hookah.aromas.kavun' },
      { id: 'r-yaban-bogurtleni',  name: 'Yaban Böğürtleni',   color: '#9333ea',  nameKey: 'hookah.aromas.yaban_bogurtleni' },
      { id: 'r-cilek',             name: 'Çilek',               color: '#ec4899',  nameKey: 'hookah.aromas.cilek' },
      { id: 'r-ananas',            name: 'Ananas',              color: '#eab308',  nameKey: 'hookah.aromas.ananas' },
      { id: 'r-cikolata-nane',     name: 'Çikolata Nane',       color: '#a16207',  nameKey: 'hookah.aromas.cikolata_nane' },
      { id: 'r-eskimo-karpuz',     name: 'Eskimo Karpuz',       color: '#f87171' },
      { id: 'r-nane',              name: 'Nane',                color: '#34d399',  nameKey: 'hookah.aromas.nane' },
      { id: 'r-pismis-seftali',    name: 'Pişmiş Şeftali',      color: '#fb923c',  nameKey: 'hookah.aromas.pismis_seftali' },
      { id: 'r-eskimo-kola',       name: 'Eskimo Kola',         color: '#6b7280' },
      { id: 'r-mamdelas',          name: 'Mamdelas 27',         color: '#84cc16' },
      { id: 'r-te-extrano',        name: 'Te Extrano Fidel',    color: '#22d3ee' },
      { id: 'r-mastic',            name: 'Mastic',              color: '#fef9c3' },
      { id: 'r-pancho-villa',      name: 'Pancho Villa',        color: '#f59e0b' },
      { id: 'r-strawberry-banana', name: 'Strawberry Banana',   color: '#f472b6' },
      { id: 'r-peach-marmalade',   name: 'Peach Marmalade',     color: '#fb923c' },
      { id: 'r-fosbury',           name: 'Fosbury',             color: '#06b6d4' },
      { id: 'r-kiwi-mango',        name: 'Kiwi Mango',          color: '#4ade80' },
      { id: 'r-domingo',           name: 'Domingo',             color: '#f43f5e' },
      { id: 'r-vanilya-melonade',  name: 'Vanilya Melonade',    color: '#fde68a',  nameKey: 'hookah.aromas.vanilya_melonade' },
      { id: 'r-cinnamon',          name: 'Cinnamon',            color: '#92400e' },
      { id: 'r-choco-nut',         name: 'Choco Nut',           color: '#78350f' },
    ],
  },
  {
    id: 'hookah_special',
    name: 'Hookah Special',
    desc: 'Ice Cream Series',
    price: '₺650',
    icon: '❋',
    aromas: [
      { id: 'hs-blueberry-ice',   name: 'Blueberry Ice Cream',   color: '#818cf8' },
      { id: 'hs-strawberry-ice',  name: 'Strawberry Ice Cream',  color: '#f472b6' },
      { id: 'hs-chocolate-ice',   name: 'Chocolate Ice Cream',   color: '#78350f' },
      { id: 'hs-peach-ice',       name: 'Peach Ice Cream',       color: '#fb923c' },
      { id: 'hs-hookah-special',  name: 'Hookah Special',        color: '#fbbf24' },
    ],
  },
  {
    id: 'al_fakher',
    name: 'Al Fakher',
    desc: 'Classic Blend',
    price: '₺500',
    icon: '⬡',
    aromas: [
      { id: 'af-double-apple',   name: 'Double Apple',   color: '#ef4444' },
      { id: 'af-uzum',           name: 'Üzüm',           color: '#a855f7', nameKey: 'hookah.aromas.uzum' },
      { id: 'af-yaban-mersini',  name: 'Yaban Mersini',  color: '#6366f1', nameKey: 'hookah.aromas.yaban_mersini' },
    ],
  },
  {
    id: 'nakhla',
    name: 'Nakhla',
    desc: 'Dark Leaf',
    price: '₺600',
    icon: '◆',
    aromas: [
      { id: 'n-seftali',    name: 'Şeftali',    color: '#fb923c', nameKey: 'hookah.aromas.seftali' },
      { id: 'n-cappuccino', name: 'Cappuccino', color: '#92400e' },
    ],
  },
  {
    id: 'adalya',
    name: 'Adalya',
    desc: 'Special Edition',
    price: '₺500',
    icon: '✦',
    aromas: [
      { id: 'a-love-66',       name: 'Love 66',       color: '#f43f5e' },
      { id: 'a-lady-killer',   name: 'Lady Killer',   color: '#e879f9' },
      { id: 'a-ice-bonbon',    name: 'Ice Bonbon',    color: '#7dd3fc' },
      { id: 'a-berlin-night',  name: 'Berlin Night',  color: '#6366f1' },
      { id: 'a-moscow-night',  name: 'Moskow Night',  color: '#4f46e5' },
      { id: 'a-baku-night',    name: 'Bakü Night',    color: '#7c3aed' },
      { id: 'a-izmir-romantik',name: 'İzmir Romantik',color: '#e879f9' },
      { id: 'a-mia-mor',       name: 'Mia Mor',       color: '#c026d3' },
    ],
  },
]

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
                <span className="text-stone-300 dark:text-zinc-700 font-display text-sm tracking-widest flex-shrink-0">0{bi + 1}</span>
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
