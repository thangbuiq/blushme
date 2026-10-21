import { useEffect, useMemo, useRef, useState } from 'react'
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  formatISO,
  isAfter,
  isBefore,
  isSameDay,
  parseISO,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { vi as viLocale } from 'date-fns/locale'
import { useTranslation } from 'react-i18next'
import { useIsTouchDevice } from './useIsTouchDevice'
import { ChevronIcon } from './Icon'
import styles from './DatePicker.module.css'

interface DatePickerProps {
  id: string
  label: string
  value: string // YYYY-MM-DD
  onChange: (value: string) => void
  max?: string
  min?: string
}

const WEEKDAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export function DatePicker({ id, label, value, onChange, max, min }: DatePickerProps) {
  const { t, i18n } = useTranslation()
  const isTouch = useIsTouchDevice()
  const [open, setOpen] = useState(false)
  const [monthAnchor, setMonthAnchor] = useState(() => parseISO(value))
  const wrapperRef = useRef<HTMLDivElement>(null)
  const dateLocale = i18n.language.startsWith('vi') ? viLocale : undefined

  useEffect(() => {
    if (!open) return
    function onClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onClickOutside)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const days = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(monthAnchor), { weekStartsOn: 1 })
    const monthEnd = endOfMonth(monthAnchor)
    const totalCells = Math.ceil((monthEnd.getTime() - gridStart.getTime()) / 86_400_000 / 7 + 1) * 7
    return Array.from({ length: totalCells }, (_, i) => addDays(gridStart, i))
  }, [monthAnchor])

  if (isTouch) {
    return (
      <div className={styles.wrapper}>
        <label className="label-caps" htmlFor={id}>
          {label}
        </label>
        <input
          id={id}
          type="date"
          className={styles.trigger}
          value={value}
          max={max}
          min={min}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }

  const selectedDate = parseISO(value)
  const maxDate = max ? parseISO(max) : null
  const minDate = min ? parseISO(min) : null

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <label className="label-caps" htmlFor={id}>
        {label}
      </label>
      <button
        id={id}
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {format(selectedDate, 'PPP', { locale: dateLocale })}
      </button>

      {open && (
        <div className={styles.popover} role="dialog" aria-label={label}>
          <div className={styles.popoverHeader}>
            <button
              type="button"
              className={styles.navButton}
              aria-label={t('common.back')}
              onClick={() => setMonthAnchor((d) => subMonths(d, 1))}
            >
              <ChevronIcon size={16} className={styles.rotate180} />
            </button>
            <span>{format(monthAnchor, 'MMMM yyyy', { locale: dateLocale })}</span>
            <button
              type="button"
              className={styles.navButton}
              aria-label={t('common.next')}
              onClick={() => setMonthAnchor((d) => addMonths(d, 1))}
            >
              <ChevronIcon size={16} />
            </button>
          </div>

          <div className={styles.weekdayRow}>
            {WEEKDAY_LABELS.map((d) => (
              <span key={d} className={styles.weekday}>
                {d}
              </span>
            ))}
          </div>

          <div className={styles.grid}>
            {days.map((day) => {
              const disabled = Boolean(
                (maxDate && isAfter(day, maxDate)) || (minDate && isBefore(day, minDate)),
              )
              const isSelected = isSameDay(day, selectedDate)
              const isCurrentMonth = day.getMonth() === monthAnchor.getMonth()
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  className={[
                    styles.day,
                    isSelected && styles.selected,
                    !isCurrentMonth && styles.outside,
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    onChange(formatISO(day, { representation: 'date' }))
                    setOpen(false)
                  }}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
