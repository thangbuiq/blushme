import { useEffect } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import type { CycleState, Phase } from '@/engine/types'
import { PHASE_COLOR, cycleGeometry } from './phaseColors'
import vine from '@/ui/art/ButtonVine.module.css'
import styles from './CycleRing.module.css'

const SIZE = 280
const C = SIZE / 2
const R = 98
const PETAL_R = R + 18
const GAP_DEG = 3.2
const PETAL = 'M0 0C-4 -5 -4 -14 0 -19C4 -14 4 -5 0 0Z'

function polar(angleDeg: number, radius = R) {
  const a = ((angleDeg - 90) * Math.PI) / 180
  return { x: C + radius * Math.cos(a), y: C + radius * Math.sin(a) }
}

function arcPath(from: number, to: number) {
  const start = polar(from)
  const end = polar(to)
  const large = to - from > 180 ? 1 : 0
  return `M${start.x} ${start.y}A${R} ${R} 0 ${large} 1 ${end.x} ${end.y}`
}

const GARLAND_R = 80

/** A delicate inner sprig along the ring: a thin stem, small leaves and a blossom at the tip. */
function RingGarland({
  from,
  to,
  color,
  delay,
  flip,
}: {
  from: number
  to: number
  color: string
  delay: number
  flip?: boolean
}) {
  const start = polar(from, GARLAND_R)
  const end = polar(to, GARLAND_R)
  const steps = [0.18, 0.4, 0.62, 0.82]
  return (
    <g className={vine.sway} style={{ animationDelay: flip ? '-3s' : '0s' }}>
      <path
        className={vine.stem}
        style={{ ['--d' as string]: `${delay}s` }}
        d={`M${start.x} ${start.y}A${GARLAND_R} ${GARLAND_R} 0 0 1 ${end.x} ${end.y}`}
        stroke="#8DBBA0"
        strokeOpacity="0.8"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      {steps.map((t, i) => {
        const a = from + (to - from) * t
        const p = polar(a, GARLAND_R)
        const side = i % 2 === 0 ? 52 : -52
        return (
          <g key={t} transform={`translate(${p.x} ${p.y}) rotate(${a + 180 + side})`}>
            <path
              className={vine.leaf}
              style={{ ['--d' as string]: `${delay + 0.35 + i * 0.12}s` }}
              d="M0 0C-3.4 -3 -3.4 -8.5 0 -12C3.4 -8.5 3.4 -3 0 0Z"
              fill="#A9CBB3"
              fillOpacity="0.9"
            />
          </g>
        )
      })}
      {[flip ? from : to].map((a) => {
        const p = polar(a, GARLAND_R)
        return (
          <g key={a} transform={`translate(${p.x} ${p.y}) scale(0.8)`}>
            <g className={vine.flower} style={{ ['--d' as string]: `${delay + 0.95}s` }}>
              {[0, 72, 144, 216, 288].map((r) => (
                <ellipse
                  key={r}
                  cx="0"
                  cy="-5.2"
                  rx="3.2"
                  ry="5.4"
                  fill={color}
                  fillOpacity="0.85"
                  transform={`rotate(${r})`}
                />
              ))}
              <circle r="2.3" fill="#F2C969" />
            </g>
          </g>
        )
      })}
    </g>
  )
}

interface CycleRingProps {
  state: CycleState
  periodLength: number
}

export function CycleRing({ state, periodLength }: CycleRingProps) {
  const { t } = useTranslation()
  const reduceMotion = useReducedMotion()

  const { cycleLength, segments } = cycleGeometry(state, periodLength)
  const degPerDay = 360 / cycleLength

  const phaseOfDay = (day: number): Phase =>
    segments.find((seg) => day > seg.from && day <= seg.to)?.phase ?? 'luteal'

  const day = Math.min(Math.max(state.dayOfCycle, 1), cycleLength)
  const targetAngle = (day - 0.5) * degPerDay

  const angle = useMotionValue(reduceMotion ? targetAngle : 0)
  const x = useTransform(angle, (a) => polar(a).x)
  const y = useTransform(angle, (a) => polar(a).y)

  useEffect(() => {
    if (reduceMotion) {
      angle.set(targetAngle)
      return
    }
    const controls = animate(angle, targetAngle, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.35,
    })
    return () => controls.stop()
  }, [angle, targetAngle, reduceMotion])

  const color = PHASE_COLOR[state.phase]

  return (
    <div className={styles.wrap}>
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className={styles.svg}
        role="img"
        aria-label={t('today.ringLabel', { day: state.dayOfCycle, total: cycleLength })}
      >
        <RingGarland from={196} to={236} color={color} delay={0.7} />
        <RingGarland from={14} to={54} color={color} delay={1.0} flip />

        {Array.from({ length: cycleLength }, (_, i) => {
          const d = i + 1
          const isToday = d === day
          return (
            <g key={d} transform={`rotate(${(i + 0.5) * degPerDay} ${C} ${C})`}>
              <motion.path
                d={PETAL}
                transform={`translate(${C} ${C - PETAL_R - (isToday ? 4 : 0)}) scale(${isToday ? 1.45 : 1})`}
                fill={PHASE_COLOR[phaseOfDay(d)]}
                initial={reduceMotion ? false : { opacity: 0 }}
                animate={{ opacity: d <= day ? (isToday ? 1 : 0.85) : 0.28 }}
                transition={{ duration: 0.5, delay: 0.3 + i * 0.025 }}
              />
            </g>
          )
        })}

        <circle cx={C} cy={C} r={R} className={styles.track} />
        {segments.map((seg, i) => (
          <motion.path
            key={seg.phase}
            d={arcPath(seg.from * degPerDay + GAP_DEG / 2, seg.to * degPerDay - GAP_DEG / 2)}
            className={styles.arc}
            stroke={PHASE_COLOR[seg.phase]}
            strokeOpacity={seg.phase === state.phase ? 1 : 0.5}
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.1 + i * 0.16, ease: [0.22, 1, 0.36, 1] }}
          />
        ))}

        <motion.g style={{ x, y }}>
          <circle className={styles.pulse} r={16} fill={color} />
          <circle className={styles.marker} r={13} />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse
              key={a}
              cx={0}
              cy={-5}
              rx={3}
              ry={5.2}
              fill={color}
              transform={`rotate(${a})`}
            />
          ))}
          <circle r={2.6} fill="#F2C969" />
        </motion.g>
      </svg>
      <div className={styles.center}>
        <span className={styles.dayLabel}>{t('today.dayWord')}</span>
        <motion.span
          key={state.dayOfCycle}
          className={styles.day}
          initial={reduceMotion ? false : { opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.3 }}
        >
          {state.dayOfCycle}
        </motion.span>
      </div>
    </div>
  )
}
