import { useId, type CSSProperties } from 'react'
import styles from './Botanical.module.css'

export type Tone = 'rose' | 'lavender' | 'butter' | 'mint'

const TONES: Record<Tone, [string, string, string]> = {
  rose: ['#F0A0B6', '#F8C9D5', '#FFF3F6'],
  lavender: ['#BCA6E4', '#DCCDF2', '#F5F0FC'],
  butter: ['#F2C969', '#F8E2A6', '#FFF7DC'],
  mint: ['#95CFB0', '#C6E9D6', '#F0FAF5'],
}

const PETAL = 'M60 63C45 49 43 22 60 7C77 22 75 49 60 63Z'
const VEIN = 'M60 58C58.5 44 58.5 28 60 16'

interface FlowerProps {
  tone?: Tone
  petals?: number
  /** Skip the entry animation. */
  still?: boolean
  delay?: number
}

/** Drawn inside a 120x120 viewBox, centered at (60, 60). */
function FlowerShape({
  tone = 'rose',
  petals = 6,
  still,
  delay = 0,
  gradId,
}: FlowerProps & { gradId: string }) {
  const step = 360 / petals
  return (
    <g
      className={still ? styles.still : undefined}
      style={{ ['--delay' as string]: `${delay}ms` } as CSSProperties}
    >
      {Array.from({ length: petals }, (_, i) => (
        <g key={`o${i}`} transform={`rotate(${i * step} 60 60)`}>
          <g className={styles.petal} style={{ ['--i' as string]: i } as CSSProperties}>
            <path d={PETAL} fill={`url(#${gradId})`} />
            <path
              d={VEIN}
              stroke="#fff"
              strokeOpacity="0.55"
              strokeWidth="1"
              fill="none"
              strokeLinecap="round"
            />
          </g>
        </g>
      ))}
      {Array.from({ length: petals }, (_, i) => (
        <g
          key={`i${i}`}
          transform={`rotate(${i * step + step / 2} 60 60) translate(60 60) scale(0.6) translate(-60 -60)`}
        >
          <g className={styles.petal} style={{ ['--i' as string]: i + petals } as CSSProperties}>
            <path d={PETAL} fill={TONES[tone][1]} fillOpacity="0.9" />
          </g>
        </g>
      ))}
      <g className={styles.center}>
        <circle cx="60" cy="60" r="7" fill="#F2C969" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4
          return (
            <circle
              key={i}
              cx={60 + Math.cos(a) * 11}
              cy={60 + Math.sin(a) * 11}
              r="1.6"
              fill="#E0A93E"
            />
          )
        })}
        <circle cx="58" cy="58" r="2.2" fill="#fff" fillOpacity="0.55" />
      </g>
    </g>
  )
}

function FlowerGradients({ id, tone }: { id: string; tone: Tone }) {
  const [deep, mid, pale] = TONES[tone]
  return (
    <defs>
      <radialGradient id={id} cx="50%" cy="100%" r="100%" fx="50%" fy="100%">
        <stop offset="0" stopColor={deep} />
        <stop offset="0.55" stopColor={mid} />
        <stop offset="1" stopColor={pale} />
      </radialGradient>
    </defs>
  )
}

interface BloomProps extends FlowerProps {
  size?: number
  spin?: boolean
  className?: string
  style?: CSSProperties
}

/** A standalone blossom illustration. */
export function Bloom({
  size = 96,
  tone = 'rose',
  petals = 6,
  still,
  delay,
  spin,
  className,
  style,
}: BloomProps) {
  const id = useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <FlowerGradients id={id} tone={tone} />
      <g className={spin ? styles.spin : undefined}>
        <FlowerShape tone={tone} petals={petals} still={still} delay={delay} gradId={id} />
      </g>
    </svg>
  )
}

function Leaf({
  x,
  y,
  r,
  s = 1,
  fill,
}: {
  x: number
  y: number
  r: number
  s?: number
  fill: string
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path d="M0 0C-14 -10 -14 -34 0 -50C14 -34 14 -10 0 0Z" fill={fill} />
      <path
        d="M0 -4C0.5 -18 0.5 -34 0 -44"
        stroke="#fff"
        strokeOpacity="0.5"
        strokeWidth="1"
        fill="none"
      />
    </g>
  )
}

interface SprigProps {
  width?: number
  className?: string
  mirror?: boolean
  still?: boolean
}

/** A curving branch with leaves, a full blossom and two buds. */
export function Sprig({ width = 200, className, mirror, still }: SprigProps) {
  const id = useId().replace(/:/g, '')
  const lavId = `${id}l`
  return (
    <svg
      width={width}
      height={(width * 260) / 200}
      viewBox="0 0 200 260"
      className={className}
      style={mirror ? { transform: 'scaleX(-1)' } : undefined}
      aria-hidden="true"
    >
      <FlowerGradients id={id} tone="rose" />
      <FlowerGradients id={lavId} tone="lavender" />
      <g className={still ? undefined : styles.sway}>
        <path
          d="M30 258C46 200 70 160 112 120C140 94 158 70 164 34"
          stroke="#8DB59C"
          strokeWidth="2.6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M78 164C92 150 110 144 128 146"
          stroke="#8DB59C"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
        <Leaf x={50} y={214} r={-52} s={0.8} fill="#BBD8C4" />
        <Leaf x={64} y={186} r={58} s={0.7} fill="#A9CBB3" />
        <Leaf x={92} y={150} r={-48} s={0.75} fill="#BBD8C4" />
        <Leaf x={116} y={120} r={62} s={0.65} fill="#A9CBB3" />
        <Leaf x={140} y={92} r={-40} s={0.55} fill="#BBD8C4" />
        <g transform="translate(70 62) scale(0.95)">
          <FlowerShape tone="rose" petals={6} still={still} gradId={id} delay={200} />
        </g>
        <g transform="translate(92 118) scale(0.42)">
          <FlowerShape tone="lavender" petals={5} still={still} gradId={lavId} delay={500} />
        </g>
        <g transform="translate(112 14) scale(0.5)">
          <FlowerShape tone="rose" petals={5} still={still} gradId={id} delay={700} />
        </g>
        <circle cx="130" cy="146" r="5" fill="#F0A0B6" />
        <circle cx="168" cy="30" r="4" fill="#F8C9D5" />
      </g>
    </svg>
  )
}

const DRIFT_PETALS = [
  { x: '8%', y: '10%', s: 18, tone: 'rose', dur: 13, delay: 0, dx: 14, dy: 26, rot: 30 },
  { x: '86%', y: '18%', s: 14, tone: 'lavender', dur: 17, delay: -4, dx: -16, dy: 30, rot: -40 },
  { x: '18%', y: '58%', s: 12, tone: 'rose', dur: 15, delay: -2, dx: 18, dy: 20, rot: 50 },
  { x: '78%', y: '66%', s: 16, tone: 'butter', dur: 19, delay: -8, dx: -12, dy: 24, rot: -25 },
  { x: '48%', y: '86%', s: 13, tone: 'rose', dur: 16, delay: -6, dx: 10, dy: -22, rot: 35 },
] as const

/** Soft drifting petals; purely decorative backdrop. */
export function PetalDrift({ className }: { className?: string }) {
  return (
    <div
      className={className}
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
    >
      {DRIFT_PETALS.map((p, i) => (
        <span
          key={i}
          className={styles.drift}
          style={
            {
              position: 'absolute',
              left: p.x,
              top: p.y,
              ['--dur' as string]: `${p.dur}s`,
              ['--delay' as string]: `${p.delay}s`,
              ['--dx' as string]: `${p.dx}px`,
              ['--dy' as string]: `${p.dy}px`,
              ['--rot' as string]: `${p.rot}deg`,
            } as CSSProperties
          }
        >
          <svg width={p.s * 1.6} height={p.s * 2} viewBox="0 0 24 32">
            <path
              d="M12 30C2 22 1 8 12 1C23 8 22 22 12 30Z"
              fill={TONES[p.tone][1]}
              fillOpacity="0.75"
            />
          </svg>
        </span>
      ))}
    </div>
  )
}
