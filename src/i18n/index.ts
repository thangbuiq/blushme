import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import vi from './vi.json'

export const SUPPORTED_LANGUAGES = ['en', 'vi'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

// Location, not browser language preference: the device's IANA timezone is
// available fully on-device (no permission prompt, no network call), unlike
// real geolocation, which this app's no-network-calls design rules out.
function detectDeviceLanguage(): SupportedLanguage {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  return timeZone === 'Asia/Ho_Chi_Minh' ? 'vi' : 'en'
}

void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, vi: { translation: vi } },
  lng: detectDeviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
})

export default i18n
