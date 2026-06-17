import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const supportedLanguages = ['en', 'tr', 'es', 'it', 'ru', 'ar', 'de', 'el', 'fa', 'az']

const getBrowserLanguage = () => {
  const browserLanguages = navigator.languages?.length ? navigator.languages : [navigator.language]
  const matchedLanguage = browserLanguages
    .map(language => language.toLowerCase().split('-')[0])
    .find(language => supportedLanguages.includes(language))
  return matchedLanguage ?? 'tr'
}

const stored = localStorage.getItem('chp_lang')
const initialLanguage = stored && supportedLanguages.includes(stored) ? stored : getBrowserLanguage()

document.documentElement.lang = initialLanguage
document.documentElement.dir = ['ar', 'fa'].includes(initialLanguage) ? 'rtl' : 'ltr'

const loadLocale = (lang: string): Promise<Record<string, unknown>> =>
  import(`./locales/${lang}.json`).then((m) => m.default)

export const i18nReady: Promise<typeof i18n> = loadLocale(initialLanguage).then((translations) => {
  i18n.use(initReactI18next).init({
    resources: { [initialLanguage]: { translation: translations } },
    lng: initialLanguage,
    fallbackLng: 'tr',
    interpolation: { escapeValue: false },
  })

  i18n.on('languageChanged', async (lang) => {
    if (!i18n.hasResourceBundle(lang, 'translation')) {
      const mod = await loadLocale(lang)
      i18n.addResourceBundle(lang, 'translation', mod)
    }
  })

  return i18n
})

export default i18n
