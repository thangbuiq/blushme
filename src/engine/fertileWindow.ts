import { addDays, formatISO, parseISO } from 'date-fns'
import type { FertileWindow, ISODate } from './types'

const iso = (date: Date) => formatISO(date, { representation: 'date' })

// [O-5, O+1], with likelihood peaking across O-2..O.
export function fertileWindow(ovulationDate: ISODate): FertileWindow {
  const o = parseISO(ovulationDate)
  return {
    start: iso(addDays(o, -5)),
    end: iso(addDays(o, 1)),
    peakStart: iso(addDays(o, -2)),
    peakEnd: iso(o),
  }
}
