import { format, parseISO } from 'date-fns'
import { vi as viLocale } from 'date-fns/locale'
import type { ISODate } from '@/engine/types'

// date-fns' vi locale abbreviates months as "thg 10", which reads oddly
// mid-sentence in Vietnamese copy ("từ thg 10 19"). Vietnamese gets the full
// word instead ("19 tháng 10"); English keeps the conventional "Oct 19".
export function formatShortDate(iso: ISODate, language: string): string {
  const date = parseISO(iso)
  if (language.startsWith('vi')) {
    return format(date, 'd MMMM', { locale: viLocale })
  }
  return format(date, 'MMM d')
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function formatMonthYear(date: Date, language: string): string {
  if (language.startsWith('vi')) return `Tháng ${format(date, 'M')}, ${format(date, 'yyyy')}`
  return format(date, 'LLLL yyyy')
}

export function formatLongDate(date: Date, language: string): string {
  if (language.startsWith('vi'))
    return capitalize(format(date, 'EEEE, d MMMM yyyy', { locale: viLocale }))
  return format(date, 'EEEE, MMMM d, yyyy')
}

export function formatWeekdayDay(date: Date, language: string): string {
  if (language.startsWith('vi'))
    return capitalize(format(date, 'EEEE, d MMMM', { locale: viLocale }))
  return format(date, 'EEEE, MMMM d')
}
