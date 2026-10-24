import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from 'react'
import styles from './Input.module.css'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon?: ReactNode
  action?: ReactNode
}

export function Field({ label, id, icon, action, className, ...props }: FieldProps) {
  return (
    <div className={styles.field}>
      <label className="label-caps" htmlFor={id}>
        {label}
      </label>
      <div className={styles.control}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          id={id}
          className={[styles.input, icon && styles.withIcon, action && styles.withAction, className]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {action}
      </div>
    </div>
  )
}

export function FieldAction({ children, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={styles.action} {...props}>
      {children}
    </button>
  )
}
