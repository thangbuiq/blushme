import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Chip } from '@/ui/Chip'
import { Button } from '@/ui/Button'
import { Collapse } from '@/ui/Collapse'
import { ToggleSwitch } from '@/ui/ToggleSwitch'
import { useConfirm } from '@/ui/ConfirmDialog'
import { useSettingsStore } from '@/store/settingsStore'
import { useLogStore } from '@/store/logStore'
import { exportToJson, importFromJson, deleteAllData } from '@/data/exportImport'
import { loadDemoData, removeDemoData } from '@/data/demoData'
import type { Goal, Units, WeekStart } from '@/data/db'
import styles from './SettingsScreen.module.css'

const GOALS: Goal[] = ['track', 'ttc', 'avoiding']

export function SettingsScreen() {
  const { t, i18n } = useTranslation()
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.update)
  const loadLogs = useLogStore((s) => s.load)
  const [moreOpen, setMoreOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const confirm = useConfirm()

  async function handleExport() {
    const json = await exportToJson()
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `blush-export-${new Date().toISOString().slice(0, 10)}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  async function handleImportFile(file: File) {
    const text = await file.text()
    await importFromJson(text)
    await Promise.all([loadLogs(), useSettingsStore.getState().load()])
  }

  async function handleDeleteAll() {
    if (!(await confirm(t('settings.deleteAllConfirm'), t('settings.deleteAll')))) return
    await deleteAllData()
    await Promise.all([loadLogs(), useSettingsStore.getState().load()])
  }

  async function handleToggleDemoData() {
    if (settings.demoDataLoaded) {
      await removeDemoData()
    } else {
      await loadDemoData()
    }
    await loadLogs()
  }

  return (
    <div className={styles.screen}>
      <h1>{t('nav.settings')}</h1>

      <div className={styles.section}>
        <span className="label-caps">{t('settings.language')}</span>
        <div className={styles.chipGroup}>
          {(['en', 'vi'] as const).map((lang) => (
            <Chip
              key={lang}
              selected={(settings.language ?? i18n.language.slice(0, 2)) === lang}
              onClick={() => {
                void i18n.changeLanguage(lang)
                void update({ language: lang })
              }}
            >
              {lang === 'en' ? 'English' : 'Tiếng Việt'}
            </Chip>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.row} style={{ borderTop: 'none' }}>
          <span>{t('settings.privacyLock')}</span>
          <ToggleSwitch
            checked={settings.lockEnabled}
            onChange={(lockEnabled) => update({ lockEnabled })}
            ariaLabel={t('settings.privacyLock')}
          />
        </div>
        <div className={styles.row}>
          <span>{t('settings.reminders')}</span>
          <ToggleSwitch
            checked={settings.remindersEnabled}
            onChange={(remindersEnabled) => update({ remindersEnabled })}
            ariaLabel={t('settings.reminders')}
          />
        </div>
      </div>

      <div className={styles.section}>
        <span className="label-caps">{t('settings.data')}</span>
        <Button variant="secondary" onClick={handleExport}>
          {t('settings.export')}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="visually-hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) void handleImportFile(file)
          }}
        />
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          {t('settings.import')}
        </Button>
        <Button variant="secondary" onClick={handleDeleteAll}>
          {t('settings.deleteAll')}
        </Button>
      </div>

      {!moreOpen && (
        <button type="button" className={styles.moreToggle} onClick={() => setMoreOpen(true)}>
          {t('settings.more')}
        </button>
      )}

      <Collapse open={moreOpen}>
        <div className={styles.moreGroup}>
          <div className={styles.section}>
            <span className="label-caps">{t('settings.weekStart')}</span>
            <div className={styles.chipGroup}>
              {(['monday', 'sunday'] as WeekStart[]).map((option) => (
                <Chip
                  key={option}
                  selected={settings.weekStart === option}
                  onClick={() => update({ weekStart: option })}
                >
                  {option}
                </Chip>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <span className="label-caps">{t('settings.units')}</span>
            <div className={styles.chipGroup}>
              {(['metric', 'imperial'] as Units[]).map((option) => (
                <Chip
                  key={option}
                  selected={settings.units === option}
                  onClick={() => update({ units: option })}
                >
                  {option}
                </Chip>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <span className="label-caps">{t('settings.goal')}</span>
            <div className={styles.chipGroup}>
              {GOALS.map((goal) => (
                <Chip key={goal} selected={settings.goal === goal} onClick={() => update({ goal })}>
                  {t(`onboarding.step1.goal${goal === 'track' ? 'Track' : goal === 'ttc' ? 'Ttc' : 'Avoiding'}`)}
                </Chip>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.row} style={{ borderTop: 'none' }}>
              <span>{t('settings.advancedTracking')}</span>
              <ToggleSwitch
                checked={settings.advancedTracking}
                onChange={(advancedTracking) => update({ advancedTracking })}
                ariaLabel={t('settings.advancedTracking')}
              />
            </div>
            <div className={styles.row}>
              <span>{t('settings.pausePredictions')}</span>
              <ToggleSwitch
                checked={settings.predictionsPaused}
                onChange={(predictionsPaused) => update({ predictionsPaused })}
                ariaLabel={t('settings.pausePredictions')}
              />
            </div>
            <div className={styles.row}>
              <span>{t('settings.fertilityWindow')}</span>
              <ToggleSwitch
                checked={settings.fertilityLayerEnabled}
                onChange={(fertilityLayerEnabled) => update({ fertilityLayerEnabled })}
                ariaLabel={t('settings.fertilityWindow')}
              />
            </div>
          </div>

          <div className={styles.section}>
            <span className="label-caps">{t('settings.about')}</span>
            <p>{t('settings.aboutBody')}</p>
          </div>

          <div className={styles.section}>
            <Button variant="secondary" onClick={handleToggleDemoData}>
              {t(settings.demoDataLoaded ? 'settings.removeDemoData' : 'settings.loadDemoData')}
            </Button>
          </div>
        </div>
      </Collapse>
    </div>
  )
}
