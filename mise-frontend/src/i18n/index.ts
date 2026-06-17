import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import tr from './locales/tr.json'
import es from './locales/es.json'
import it from './locales/it.json'
import ru from './locales/ru.json'
import ar from './locales/ar.json'
import de from './locales/de.json'
import el from './locales/el.json'
import fa from './locales/fa.json'
import az from './locales/az.json'

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

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    tr: { translation: tr },
    es: { translation: es },
    it: { translation: it },
    ru: { translation: ru },
    ar: { translation: ar },
    de: { translation: de },
    el: { translation: el },
    fa: { translation: fa },
    az: { translation: az },
  },
  lng: initialLanguage,
  fallbackLng: 'tr',
  interpolation: { escapeValue: false },
})

export default i18n
