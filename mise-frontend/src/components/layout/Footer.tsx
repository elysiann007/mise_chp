import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { VENUE } from '../../constants/venue'

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
                <span className="text-amber-400 text-sm">◎</span>
              </div>
              <span className="font-display font-semibold text-white text-sm tracking-wider">CAFE HOOKAH PUB</span>
            </div>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-xs mb-5">{t('footer.tagline')}</p>

            {/* Social links */}
            <div className="flex gap-3">
              {VENUE.instagram && (
                <a
                  href={VENUE.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-amber-400/50 hover:text-amber-400 transition-all duration-200"
                  aria-label="Instagram"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>
              )}
              {VENUE.tiktok && (
                <a
                  href={VENUE.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-amber-400/50 hover:text-amber-400 transition-all duration-200"
                  aria-label="TikTok"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.31 6.31 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.53V6.77a4.85 4.85 0 01-1.02-.08z"/>
                  </svg>
                </a>
              )}
              <a
                href={VENUE.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-500 hover:border-amber-400/50 hover:text-amber-400 transition-all duration-200"
                aria-label="Google Maps"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </a>
            </div>
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
              <a
                href={`tel:${VENUE.phone.replace(/\s/g, '')}`}
                className="flex items-center gap-2 pt-3 text-zinc-400 hover:text-amber-400 transition-colors duration-200 group"
              >
                <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span className="text-sm">{VENUE.phone}</span>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-zinc-800/60 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-zinc-600 text-xs">{t('footer.copy')}</p>
          <p className="text-zinc-700 text-xs tracking-wider">{t('footer.city')}</p>
        </div>
      </div>
    </footer>
  )
}
