import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import vi from './vi.json'

export const SUPPORTED_LANGUAGES = ['vi', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

const STORAGE_KEY = 'blush:lang'

// Vietnamese is the default. The choice made on the sign-in screen (before an
// account exists) is remembered in localStorage; once signed in, the account's
// own setting wins.
export function getStoredLanguage(): SupportedLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'vi') return stored
  } catch {
    // storage unavailable: fall through to the default
  }
  return 'vi'
}

export function setStoredLanguage(lang: SupportedLanguage) {
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // ignore
  }
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, vi: { translation: vi } },
  lng: getStoredLanguage(),
  fallbackLng: 'vi',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})
document.documentElement.lang = i18n.language

export default i18n
