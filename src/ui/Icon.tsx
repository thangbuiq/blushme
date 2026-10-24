interface IconProps {
  size?: number
  className?: string
}

const common = {
  fill: 'none',
  strokeWidth: 1.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function DropIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        {...common}
        stroke="currentColor"
        d="M12 3c4 5 7 8.5 7 12a7 7 0 1 1-14 0c0-3.5 3-7 7-12Z"
      />
    </svg>
  )
}

export function PetalIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        {...common}
        stroke="currentColor"
        d="M12 4c3 2 5 5 5 8s-2 6-5 8c-3-2-5-5-5-8s2-6 5-8Z"
      />
    </svg>
  )
}

export function MoonIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        {...common}
        stroke="currentColor"
        d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
      />
    </svg>
  )
}

export function FlowerIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle {...common} stroke="currentColor" cx="12" cy="12" r="2.5" />
      <path
        {...common}
        stroke="currentColor"
        d="M12 9.5c-1.5-2.5-1.5-5 0-6.5 1.5 1.5 1.5 4 0 6.5ZM12 14.5c1.5 2.5 1.5 5 0 6.5-1.5-1.5-1.5-4 0-6.5ZM9.5 12c-2.5-1.5-5-1.5-6.5 0 1.5 1.5 4 1.5 6.5 0ZM14.5 12c2.5-1.5 5-1.5 6.5 0-1.5 1.5-4 1.5-6.5 0Z"
      />
    </svg>
  )
}

export function ChevronIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...common} stroke="currentColor" d="M8 5l8 7-8 7" />
    </svg>
  )
}

export function InfoIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle {...common} stroke="currentColor" cx="12" cy="12" r="8.5" />
      <path {...common} stroke="currentColor" d="M12 11v5" />
      <circle cx="12" cy="8" r="0.9" fill="currentColor" />
    </svg>
  )
}

export function CheckIcon({ size = 14, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...common} stroke="currentColor" d="M5 13l4.5 4.5L19 8" />
    </svg>
  )
}

export function CloseIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...common} stroke="currentColor" d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

export function MailIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect {...common} stroke="currentColor" x="3.5" y="5.5" width="17" height="13" rx="3" />
      <path {...common} stroke="currentColor" d="M4.5 8l7.5 5.5L19.5 8" />
    </svg>
  )
}

export function LockIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <rect {...common} stroke="currentColor" x="5" y="10.5" width="14" height="9.5" rx="3" />
      <path {...common} stroke="currentColor" d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
    </svg>
  )
}

export function EyeIcon({ size = 20, className, off }: IconProps & { off?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        {...common}
        stroke="currentColor"
        d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
      />
      <circle {...common} stroke="currentColor" cx="12" cy="12" r="3" />
      {off && <path {...common} stroke="currentColor" d="M4 4l16 16" />}
    </svg>
  )
}

export function PlusIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...common} stroke="currentColor" d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function ChartIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...common} stroke="currentColor" d="M5 20V12M12 20V5M19 20v-5" />
    </svg>
  )
}

export function UserIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <circle {...common} stroke="currentColor" cx="12" cy="8.5" r="3.5" />
      <path {...common} stroke="currentColor" d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
    </svg>
  )
}

export function SparkIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        {...common}
        stroke="currentColor"
        d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7Z"
      />
    </svg>
  )
}

export function LogoutIcon({ size = 20, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        {...common}
        stroke="currentColor"
        d="M14 4.5h3.5A2 2 0 0 1 19.5 6.5v11a2 2 0 0 1-2 2H14M10 8l-4 4 4 4M6 12h9"
      />
    </svg>
  )
}

export function LeafIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...common} stroke="currentColor" d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14ZM5 19l7-7" />
    </svg>
  )
}

export function LoopIcon({ size = 16, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        {...common}
        stroke="currentColor"
        d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7M20 4v4.7h-4.7M20 12a8 8 0 0 1-13.7 5.6L4 15.3M4 20v-4.7h4.7"
      />
    </svg>
  )
}

export function SigmaIcon({ size = 18, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path {...common} stroke="currentColor" d="M18 5H6l6 7-6 7h12" />
    </svg>
  )
}
