import { Bloom } from './art/Botanical'
import { AVATARS } from './avatars'
import styles from './Avatar.module.css'

/** The user's chosen botanical avatar; unknown ids fall back to the first. */
export function Avatar({ id, size = 48 }: { id: string; size?: number }) {
  const avatar = AVATARS.find((a) => a.id === id) ?? AVATARS[0]
  return (
    <span className={styles.avatar} style={{ width: size, height: size }} aria-hidden="true">
      <Bloom size={Math.round(size * 0.9)} tone={avatar.tone} petals={avatar.petals} still />
    </span>
  )
}
