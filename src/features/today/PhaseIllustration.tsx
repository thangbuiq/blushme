import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import type { Phase } from '@/engine/types'
import { PHASE_COLOR } from './phaseColors'

const WALL = '#F8DDE5'
const WALL_EDGE = '#E6A9BC'
const INK = '#5B4650'

/** The womb lining: its colour, and how much of the cavity is left hollow (smaller = thicker lining). */
const LINING: Record<Phase, { color: string; hollow: number }> = {
  menstrual: { color: '#E99AB2', hollow: 0.86 },
  follicular: { color: '#E07C9A', hollow: 0.7 },
  ovulation: { color: '#D9627F', hollow: 0.52 },
  luteal: { color: '#C84C6E', hollow: 0.36 },
}

/** Square crops of the diagram used by the compact version, zoomed onto where the change happens in each phase (the womb, or the active ovary and tube). */
const COMPACT_VIEW: Record<Phase, string> = {
  menstrual: '70 24 180 180',
  follicular: '176 36 144 144',
  ovulation: '176 36 144 144',
  luteal: '176 36 144 144',
}

const UTERUS =
  'M160 32 C200 32 230 58 222 98 C217 126 190 144 176 168 L176 198 Q160 204 144 198 L144 168 C130 144 103 126 98 98 C90 58 120 32 160 32Z'
const CAVITY =
  'M160 52 C186 52 206 68 200 96 C196 116 176 130 160 146 C144 130 124 116 120 96 C114 68 134 52 160 52Z'
const HOLLOW_ORIGIN = { x: 160, y: 100 }

function Follicle({ cx, cy, r, tone }: { cx: number; cy: number; r: number; tone: string }) {
  return <circle cx={cx} cy={cy} r={r} fill="#fff" stroke={tone} strokeWidth="1.3" />
}

function Egg({ cx, cy, tone }: { cx: number; cy: number; tone: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={12} fill={tone} opacity="0.22" />
      <circle cx={cx} cy={cy} r={7.5} fill="#fff" stroke={tone} strokeWidth="1.8" />
      <circle cx={cx} cy={cy} r={3} fill={tone} />
    </g>
  )
}

function Ovary({ cx, children }: { cx: number; children?: ReactNode }) {
  return (
    <g>
      <ellipse cx={cx} cy="104" rx="29" ry="21" fill={WALL} stroke={WALL_EDGE} strokeWidth="1.5" />
      {children}
    </g>
  )
}

function Callout({
  text,
  x,
  y,
  anchor,
  toX,
  toY,
  textAbove = false,
}: {
  text: string
  x: number
  y: number
  anchor: 'start' | 'end'
  toX: number
  toY: number
  /** The label sits above its target, so the line leaves from under the text. */
  textAbove?: boolean
}) {
  return (
    <g>
      <line
        x1={x + (anchor === 'start' ? 10 : -10)}
        y1={textAbove ? y + 5 : y - 14}
        x2={toX}
        y2={toY}
        stroke={INK}
        strokeWidth="1"
      />
      <circle cx={toX} cy={toY} r="2.4" fill={INK} />
      <text x={x} y={y} textAnchor={anchor} fontSize="11" fontWeight="600" fill={INK}>
        {text}
      </text>
    </g>
  )
}

/** A friendly diagram of what the womb and ovaries are doing in each phase, with short labels. */
export function PhaseIllustration({ phase, compact = false }: { phase: Phase; compact?: boolean }) {
  const { t } = useTranslation()
  const tone = PHASE_COLOR[phase]
  const { color, hollow } = LINING[phase]
  const hollowTransform = `translate(${HOLLOW_ORIGIN.x} ${HOLLOW_ORIGIN.y}) scale(${hollow}) translate(-${HOLLOW_ORIGIN.x} -${HOLLOW_ORIGIN.y})`
  const liningX = 120 + 20 * (1 - hollow)

  return (
    <svg viewBox={compact ? COMPACT_VIEW[phase] : '0 0 320 224'} role="img" aria-hidden="true" style={{ width: '100%', height: 'auto' }}>
      {/* fallopian tubes, with a few fingers where they catch the egg */}
      <g fill="none" stroke={WALL_EDGE} strokeLinecap="round">
        <path d="M214 68 C246 52 278 62 288 88" strokeWidth="6" />
        <path d="M106 68 C74 52 42 62 32 88" strokeWidth="6" />
        <path d="M288 88 l5 6 M288 88 l-1 8 M288 88 l9 2" strokeWidth="2.4" />
        <path d="M32 88 l-5 6 M32 88 l1 8 M32 88 l-9 2" strokeWidth="2.4" />
      </g>

      {/* womb: wall, lining, hollow, cervix */}
      <path d={UTERUS} fill={WALL} stroke={WALL_EDGE} strokeWidth="1.6" strokeLinejoin="round" />
      <path d={CAVITY} fill={color} />
      <path
        d={CAVITY}
        fill="#FFF7F9"
        transform={hollowTransform}
        stroke={phase === 'menstrual' ? color : 'none'}
        strokeWidth="3"
        strokeDasharray="2 3"
      />
      <rect x="154" y="146" width="12" height="48" rx="3" fill="#FFF7F9" />

      {phase === 'menstrual' && (
        <g fill="#C93A66">
          <ellipse cx="150" cy="92" rx="5" ry="3.5" opacity="0.8" />
          <ellipse cx="168" cy="104" rx="4" ry="3" opacity="0.8" />
          <ellipse cx="158" cy="118" rx="3.5" ry="2.6" opacity="0.8" />
          <path d="M160 156 q-3.4 6 0 9 q3.4 -3 0 -9Z" />
          <path d="M160 178 q-3.4 6 0 9 q3.4 -3 0 -9Z" opacity="0.85" />
          <path d="M160 206 q-3.4 6 0 9 q3.4 -3 0 -9Z" opacity="0.6" />
        </g>
      )}

      {/* left ovary: resting */}
      <Ovary cx={46}>
        <Follicle cx={38} cy={102} r={3.5} tone={tone} />
        <Follicle cx={50} cy={110} r={3} tone={tone} />
        <Follicle cx={55} cy={98} r={2.5} tone={tone} />
      </Ovary>

      {/* right ovary: where the change happens */}
      {phase === 'menstrual' && (
        <Ovary cx={274}>
          <Follicle cx={264} cy={102} r={3.5} tone={tone} />
          <Follicle cx={276} cy={112} r={3} tone={tone} />
          <Follicle cx={284} cy={98} r={3} tone={tone} />
          <Follicle cx={270} cy={93} r={2.4} tone={tone} />
        </Ovary>
      )}
      {phase === 'follicular' && (
        <Ovary cx={274}>
          <Follicle cx={262} cy={110} r={4} tone={tone} />
          <Follicle cx={286} cy={110} r={3.5} tone={tone} />
          <Follicle cx={286} cy={96} r={5} tone={tone} />
          <circle cx={268} cy={100} r={12} fill="#fff" stroke={tone} strokeWidth="1.8" />
          <circle cx={268} cy={100} r={4} fill="#FBE3A0" stroke={tone} strokeWidth="1.3" />
        </Ovary>
      )}
      {phase === 'ovulation' && (
        <>
          <Ovary cx={274}>
            <Follicle cx={262} cy={112} r={3.5} tone={tone} />
            <Follicle cx={288} cy={110} r={3} tone={tone} />
            <path
              d="M262 98 C262 108 282 108 284 94"
              fill="#fff"
              stroke={tone}
              strokeWidth="1.3"
            />
            <path
              d="M262 98 C262 86 278 84 284 94"
              fill="none"
              stroke={tone}
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="1 3"
            />
          </Ovary>
          <path
            d="M276 88 C280 78 286 72 292 70"
            fill="none"
            stroke={tone}
            strokeWidth="1.6"
            strokeDasharray="3 3"
            strokeLinecap="round"
          />
          <Egg cx={296} cy={64} tone={tone} />
        </>
      )}
      {phase === 'luteal' && (
        <>
          <Ovary cx={274}>
            <Follicle cx={286} cy={112} r={3} tone={tone} />
            <circle cx={268} cy={102} r={13} fill="#F2C94C" stroke="#D9A21B" strokeWidth="1.6" />
            <circle cx={268} cy={102} r={5} fill="#E3A92B" />
          </Ovary>
          <g fill={tone}>
            <circle cx="246" cy="86" r="2.4" opacity="0.45" />
            <circle cx="236" cy="78" r="2.8" opacity="0.7" />
            <circle cx="226" cy="72" r="3.2" />
          </g>
        </>
      )}

      {!compact && (
        <Callout text={t(`learn.art.lining.${phase}`)} x={10} y={204} anchor="start" toX={liningX} toY={104} />
      )}
      {compact ? null : phase === 'ovulation' ? (
        <Callout text={t(`learn.art.event.${phase}`)} x={310} y={26} anchor="end" toX={296} toY={50} textAbove />
      ) : (
        <Callout
          text={t(`learn.art.event.${phase}`)}
          x={310}
          y={184}
          anchor="end"
          toX={phase === 'luteal' ? 268 : 274}
          toY={phase === 'luteal' ? 108 : 116}
        />
      )}
    </svg>
  )
}
