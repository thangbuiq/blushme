import { useTranslation } from 'react-i18next'
import styles from './CalendarLegendInline.module.css'

export function CalendarLegendInline() {
  const { t } = useTranslation()

  return (
    <div className={styles.legend}>
      <span className={styles.item}>
        <span className={[styles.dot, styles.dotLogged].join(' ')} aria-hidden="true" />
        {t('calendar.legend.period')}
      </span>
      <span className={styles.item}>
        <span className={[styles.dot, styles.dotPredicted].join(' ')} aria-hidden="true" />
        {t('calendar.legend.predicted')}
      </span>
      <span className={styles.item}>
        <span className={[styles.dot, styles.dotFertile].join(' ')} aria-hidden="true" />
        {t('calendar.legend.fertile')}
      </span>
      <span className={styles.item}>
        <span className={[styles.dot, styles.dotOvulation].join(' ')} aria-hidden="true" />
        {t('calendar.legend.ovulation')}
      </span>
      <span className={styles.item}>
        <span className={[styles.dot, styles.dotLow].join(' ')} aria-hidden="true" />
        {t('calendar.legend.low')}
      </span>
      <span className={styles.item}>
        <span className={[styles.dot, styles.dotToday].join(' ')} aria-hidden="true" />
        {t('calendar.legend.today')}
      </span>
    </div>
  )
}
