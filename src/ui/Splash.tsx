import { Bloom } from './art/Botanical'

export function Splash() {
  return (
    <div
      role="status"
      aria-busy="true"
      style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}
    >
      <Bloom size={96} spin />
    </div>
  )
}
