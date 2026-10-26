import type { CSSProperties } from 'react'
import styles from './ButtonVine.module.css'

const delay = (s: number) => ({ ['--d' as string]: `${s}s` }) as CSSProperties

function Leaf({ x, y, r, s = 1, d }: { x: number; y: number; r: number; s?: number; d: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <path
        className={styles.leaf}
        style={delay(d)}
        d="M0 0C-5 -4 -5 -12 0 -17C5 -12 5 -4 0 0Z"
        fill="#8fbf9f"
        fillOpacity="0.85"
      />
    </g>
  )
}

function Mini({ x, y, s, d }: { x: number; y: number; s: number; d: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <g className={styles.flower} style={delay(d)}>
        {[0, 72, 144, 216, 288].map((a) => (
          <ellipse
            key={a}
            cx="0"
            cy="-5.2"
            rx="3.2"
            ry="5.4"
            fill="#f2a7bb"
            fillOpacity="1"
            transform={`rotate(${a})`}
          />
        ))}
        <circle r="2.4" fill="#F2C969" />
      </g>
    </g>
  )
}

/** A decorative vine that grows up in tiers inside a button: stem, then leaves, then blossoms. */
export function ButtonVine({ side }: { side: 'left' | 'right' }) {
  const right = side === 'right'
  return (
    <svg
      className={`${styles.vine} ${right ? styles.right : styles.left}`}
      viewBox="0 0 64 52"
      aria-hidden="true"
      preserveAspectRatio="xMinYMax meet"
    >
      <g className={styles.sway} style={{ animationDelay: right ? '-3s' : '0s' }}>
        <path
          className={styles.stem}
          style={delay(right ? 0.25 : 0)}
          d="M10 54C8 42 16 34 14 24C12 16 18 10 20 4"
          stroke="#6e9b7f"
          strokeOpacity="0.9"
          strokeWidth="1.6"
          strokeLinecap="round"
          fill="none"
        />
        {/* tier 1 */}
        <Leaf x={10.5} y={44} r={-55} s={0.9} d={0.5} />
        <Leaf x={9.5} y={42} r={60} s={0.8} d={0.58} />
        <Mini x={24} y={43} s={0.95} d={0.9} />
        {/* tier 2 */}
        <Leaf x={14} y={31} r={-50} s={0.85} d={0.75} />
        <Leaf x={14.5} y={28} r={55} s={0.8} d={0.85} />
        <Mini x={7} y={27} s={0.7} d={1.15} />
        {/* tier 3 */}
        <Leaf x={17} y={14} r={-45} s={0.7} d={1.0} />
        <Mini x={21} y={9} s={1.0} d={1.4} />
      </g>
    </svg>
  )
}
