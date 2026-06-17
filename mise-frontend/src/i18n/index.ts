import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const supportedLanguages = ['en', 'tr', 'es', 'it', 'ru', 'ar', 'de', 'el', 'fa', 'az']

const DEFAULT_LANGUAGE = 'tr'

// Always default to Turkish for first-time visitors (CafeHookahPub is a Turkish
// venue). Only honour a previously saved choice, not the browser language.
const stored = localStorage.getItem('chp_lang')
const initialLanguage = stored && supportedLanguages.includes(stored) ? stored : DEFAULT_LANGUAGE

document.documentElement.lang = initialLanguage
document.documentElement.dir = ['ar', 'fa'].includes(initialLanguage) ? 'rtl' : 'ltr'

const loadLocale = (lang: string): Promise<Record<string, unknown>> =>
  import(`./locales/${lang}.json`).then((m) => m.default)

const ensureBundle = async (lang: string) => {
  if (!supportedLanguages.includes(lang)) return
  if (i18n.hasResourceBundle(lang, 'translation')) return
  const translations = await loadLocale(lang)
  // Re-check after await: a concurrent call may have added it.
  if (!i18n.hasResourceBundle(lang, 'translation')) {
    i18n.addResourceBundle(lang, 'translation', translations)
  }
}

/**
 * Switch the active language. Loads the locale bundle BEFORE calling
 * changeLanguage so react-i18next re-renders with the strings already present.
 * (changeLanguage triggers the re-render; addResourceBundle alone does not.)
 */
export const changeAppLanguage = async (lang: string) => {
  await ensureBundle(lang)
  await i18n.changeLanguage(lang)
}

export const i18nReady: Promise<typeof i18n> = (async () => {
  // Load the initial language and the fallback (tr) up front so that
  // missing keys in any language resolve against a real bundle.
  const [initialTranslations] = await Promise.all([
    loadLocale(initialLanguage),
    initialLanguage === 'tr' ? Promise.resolve(null) : loadLocale('tr'),
  ])

  await i18n.use(initReactI18next).init({
    resources: { [initialLanguage]: { translation: initialTranslations } },
    lng: initialLanguage,
    fallbackLng: 'tr',
    interpolation: { escapeValue: false },
  })

  // Make sure the fallback bundle is registered (no-op if initial === tr).
  await ensureBundle('tr')

  return i18n
})()

export default i18n
