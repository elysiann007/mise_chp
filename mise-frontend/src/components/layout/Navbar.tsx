import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../LanguageSwitcher'
import { VENUE } from '../../constants/venue'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const { t } = useTranslation()

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => { setOpen(false) }, [location.pathname])

  const NAV_LINKS = [
    { to: '/menu', label: t('nav.menu') },
    { to: '/about', label: t('nav.about') },
  ]

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || open
            ? 'bg-stone-950/90 backdrop-blur-xl border-b border-amber-500/10 py-3'
            : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/logo.png"
              alt="Cafe Hookah Pub"
              className="h-14 w-auto group-hover:scale-105 transition-transform duration-300"
            />
          </Link>

          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-xs tracking-[0.2em] uppercase font-medium transition-colors duration-200 ${
                  location.pathname.startsWith(link.to)
                    ? 'text-amber-400'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <LanguageSwitcher />
            <a
              href={`tel:${VENUE.phone.replace(/\s/g, '')}`}
              className="px-5 py-2.5 bg-amber-400 text-stone-950 text-xs font-bold tracking-[0.15em] uppercase rounded-full hover:bg-amber-300 transition-colors duration-200"
            >
              {t('nav.reserve')}
            </a>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <LanguageSwitcher />
          <button
            onClick={() => setOpen(o => !o)}
            className="flex flex-col gap-1.5 p-1.5 relative z-50"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            <span className={`block w-6 h-[2px] bg-amber-400 transition-all duration-300 origin-center ${open ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block w-6 h-[2px] bg-amber-400 transition-all duration-300 ${open ? 'opacity-0 scale-x-0' : ''}`} />
            <span className={`block w-6 h-[2px] bg-amber-400 transition-all duration-300 origin-center ${open ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      <div
        className={`fixed inset-0 z-40 bg-stone-950 flex flex-col items-center justify-center gap-8 transition-all duration-500 md:hidden ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-0 w-80 h-80 bg-amber-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-0 w-60 h-60 bg-amber-600/5 rounded-full blur-3xl" />
        </div>
        {NAV_LINKS.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className="font-display text-4xl text-white hover:text-amber-400 transition-colors duration-200"
            style={{ letterSpacing: '0.06em' }}
          >
            {link.label.toUpperCase()}
          </Link>
        ))}
        <a
          href={`tel:${VENUE.phone.replace(/\s/g, '')}`}
          className="mt-2 px-10 py-4 border-2 border-amber-400 text-amber-400 font-bold text-sm uppercase tracking-widest rounded-full hover:bg-amber-400 hover:text-stone-950 transition-all duration-300"
        >
          {t('nav.reserve')}
        </a>
      </div>
    </>
  )
}
