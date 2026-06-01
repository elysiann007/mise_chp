import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  const LINKS = [
    { to: '/menu', label: t('hub.title') },
    { to: '/menu/hookah', label: t('hookah.label') },
    { to: '/menu/food', label: t('food.title') },
    { to: '/menu/drinks', label: t('drinks.title') },
    { to: '/about', label: t('about.label') },
  ]

  return (
    <footer className="bg-stone-950 border-t border-zinc-800/60">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full border border-amber-400/60 flex items-center justify-center">
                <span className="font-display font-bold text-amber-400 text-[10px]">CHP</span>
              </div>
              <span className="font-display font-semibold text-white text-sm tracking-wider">CAFE HOOKAH PUB</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs">{t('footer.tagline')}</p>
          </div>

          <div>
            <h4 className="text-zinc-500 text-[10px] tracking-[0.3em] uppercase mb-5">{t('footer.explore')}</h4>
            <div className="space-y-3">
              {LINKS.map(link => (
                <Link key={link.to} to={link.to} className="block text-zinc-400 hover:text-amber-400 text-sm transition-colors duration-200">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-zinc-500 text-[10px] tracking-[0.3em] uppercase mb-5">{t('footer.visit')}</h4>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>{t('footer.address1')}</p>
              <p>{t('footer.address2')}</p>
              <div className="pt-3 space-y-1.5">
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-500">{t('home.h_mon_thu')}</span>
                  <span className="text-amber-400/80">5 PM – 2 AM</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-500">{t('home.h_fri_sat')}</span>
                  <span className="text-amber-400">4 PM – 4 AM</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-zinc-500">{t('home.h_sun')}</span>
                  <span className="text-amber-400/80">5 PM – 1 AM</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800/60 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-col items-center sm:items-start gap-1">
            <p className="text-zinc-600 text-xs">{t('footer.copy')}</p>
            <p className="text-zinc-800 text-[10px] tracking-[0.2em] uppercase hover:text-zinc-600 transition-colors duration-500 cursor-default select-none">Developed by MISE</p>
          </div>
          <p className="text-zinc-700 text-xs tracking-wider">{t('footer.city')}</p>
        </div>
      </div>
    </footer>
  )
}
