import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LANGS = [
  { code: 'en', label: 'EN', name: 'English' },
  { code: 'tr', label: 'TR', name: 'Türkçe' },
  { code: 'es', label: 'ES', name: 'Español' },
  { code: 'it', label: 'IT', name: 'Italiano' },
  { code: 'ru', label: 'RU', name: 'Русский' },
  { code: 'ar', label: 'AR', name: 'العربية' },
  { code: 'de', label: 'DE', name: 'Deutsch' },
  { code: 'el', label: 'EL', name: 'Ελληνικά' },
  { code: 'fa', label: 'FA', name: 'فارسی' },
  { code: 'az', label: 'AZ', name: 'Azərbaycanca' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LANGS.find(l => l.code === i18n.language) ?? LANGS[0]

  const switchLang = (code: string) => {
    i18n.changeLanguage(code)
    localStorage.setItem('chp_lang', code)
    setOpen(false)
  }

  useEffect(() => {
    document.documentElement.dir = ['ar', 'fa'].includes(i18n.language) ? 'rtl' : 'ltr'
    document.documentElement.lang = i18n.language
  }, [i18n.language])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold tracking-wider transition-all duration-200 ${
          open
            ? 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400'
            : 'border-stone-300 dark:border-zinc-700 text-stone-600 dark:text-zinc-400 hover:border-stone-400 dark:hover:border-zinc-500 hover:text-stone-900 dark:hover:text-white'
        }`}
      >
        <span>{current.label}</span>
        <span className={`text-[10px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {open && (
        <div className="absolute top-full mt-2 end-0 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 rounded-xl overflow-hidden shadow-2xl shadow-black/10 dark:shadow-black/50 z-50 min-w-[140px]">
          {LANGS.map(lang => (
            <button
              key={lang.code}
              onClick={() => switchLang(lang.code)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-start transition-colors ${
                lang.code === i18n.language
                  ? 'bg-amber-50 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400'
                  : 'text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <span className="text-xs font-bold tracking-wider w-6 flex-shrink-0">{lang.label}</span>
              <span className="text-stone-400 dark:text-zinc-500 text-xs">{lang.name}</span>
              {lang.code === i18n.language && <span className="ms-auto text-amber-600 dark:text-amber-400 text-xs">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
