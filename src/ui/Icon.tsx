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
      <path {...common} stroke="currentColor" d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z" />
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
