import { useTranslation } from 'react-i18next'
import styles from './InsightsScreen.module.css'

export function InsightsScreen() {
  const { t } = useTranslation()
  return (
    <div className={styles.screen}>
      <h1>{t('insights.emptyTitle')}</h1>
      <p className={styles.body}>{t('insights.emptyBody')}</p>
    </div>
  )
}
