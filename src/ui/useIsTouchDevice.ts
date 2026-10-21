import { useEffect, useState } from 'react'

// Phones/tablets (coarse pointer) get the OS's own date picker; everything
// else (mouse/trackpad) gets Blush's own calendar popover.
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches,
  )

  useEffect(() => {
    const media = window.matchMedia('(pointer: coarse)')
    const listener = (e: MediaQueryListEvent) => setIsTouch(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  return isTouch
}
