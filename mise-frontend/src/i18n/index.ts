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

const stored = localStorage.getItem('chp_lang') ?? 'en'

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
  },
  lng: stored,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
