import type { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Field({ label, id, className, ...props }: FieldProps) {
  return (
    <div className={styles.field}>
      <label className="label-caps" htmlFor={id}>
        {label}
      </label>
      <input id={id} className={[styles.input, className].filter(Boolean).join(' ')} {...props} />
    </div>
  )
}
