import { useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Chip } from '@/ui/Chip'
import { Button } from '@/ui/Button'
import { ToggleSwitch } from '@/ui/ToggleSwitch'
import { useConfirm } from '@/ui/ConfirmDialog'
import { Bloom } from '@/ui/art/Botanical'
import { LogoutIcon } from '@/ui/Icon'
import { REVEAL } from '@/ui/motion'
import { setStoredLanguage } from '@/i18n'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useLogStore } from '@/store/logStore'
import { useUiStore } from '@/store/uiStore'
import { exportToJson, importFromJson, deleteAllData } from '@/data/exportImport'
import { deleteAccount } from '@/data/repo'
import type { Goal, Units, WeekStart } from '@/data/settings'
import styles from './SettingsScreen.module.css'

const GOALS: { goal: Goal; key: string }[] = [
  { goal: 'track', key: 'Track' },
  { goal: 'ttc', key: 'Ttc' },
  { goal: 'avoiding', key: 'Avoiding' },
]

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string
  hint?: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className={styles.row}>
      <span className={styles.rowText}>
        <span>{label}</span>
        {hint && <span className={styles.rowHint}>{hint}</span>}
      </span>
      <ToggleSwitch checked={checked} onChange={onChange} ariaLabel={label} />
    </div>
  )
}

export function SettingsScreen() {
  const { t, i18n } = useTranslation()
  const reduceMotion = useReducedMotion()
  const user = useAuthStore((s) => s.user)
  const signOut = useAuthStore((s) => s.signOut)
  const demo = useAuthStore((s) => s.demo)
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.update)
  const loadLogs = useLogStore((s) => s.load)
  const showToast = useUiStore((s) => s.showToast)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const confirm = useConfirm()
  const [busy, setBusy] = useState<string | null>(null)

  const reveal = (i: number) => ({
    variants: REVEAL,
    initial: reduceMotion ? 'show' : 'hidden',
    animate: 'show',
    custom: i,
  })

  async function run(name: string, task: () => Promise<void>, failKey = 'errors.saveFailed') {
    setBusy(name)
    try {
      await task()
    } catch {
      showToast(failKey)
    }
    setBusy(null)
  }

  async function reloadAll() {
    await Promise.all([loadLogs(), useSettingsStore.getState().load()])
  }

  const handleExport = () =>
    run('export', async () => {
      const json = await exportToJson()
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `blushme-export-${new Date().toISOString().slice(0, 10)}.json`
      anchor.click()
      URL.revokeObjectURL(url)
    })

  const handleImportFile = (file: File) =>
    run(
      'import',
      async () => {
        await importFromJson(await file.text())
        await reloadAll()
        showToast('settings.imported')
      },
      'settings.importFailed',
    )

  async function handleDeleteAll() {
    if (!(await confirm(t('settings.deleteAllConfirm'), t('settings.deleteAll')))) return
    await run('delete', async () => {
      await deleteAllData()
      await reloadAll()
    })
  }

  async function handleDeleteAccount() {
    if (!(await confirm(t('settings.deleteAccountConfirm'), t('settings.deleteAccount')))) return
    await run('account', async () => {
      await deleteAccount()
      await signOut()
    })
  }

  return (
    <div className={styles.screen}>
      <motion.header className={styles.head} {...reveal(0)}>
        <h1>{t('settings.title')}</h1>
      </motion.header>

      <motion.section className={styles.profile} {...reveal(1)}>
        <span className={styles.avatar} aria-hidden="true">
          <Bloom size={56} petals={5} still />
        </span>
        <span className={styles.who}>
          <span className={styles.email} title={user?.email ?? undefined}>
            {user?.email}
          </span>
          <span className={styles.sub}>{t(demo ? 'settings.demoNote' : 'settings.synced')}</span>
        </span>
      </motion.section>

      <motion.section className={styles.group} {...reveal(2)}>
        <h2 className={styles.groupTitle}>{t('settings.language')}</h2>
        <div className={styles.stack}>
          <div className={styles.chipGroup}>
            {(['vi', 'en'] as const).map((lang) => (
              <Chip
                key={lang}
                selected={(settings.language ?? i18n.language.slice(0, 2)) === lang}
                onClick={() => {
                  setStoredLanguage(lang)
                  void i18n.changeLanguage(lang)
                  void update({ language: lang })
                }}
              >
                {lang === 'en' ? 'English' : 'Tiếng Việt'}
              </Chip>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section className={styles.group} {...reveal(3)}>
        <h2 className={styles.groupTitle}>{t('settings.tracking')}</h2>
        <div className={styles.stack}>
          <span className={styles.rowHint}>{t('settings.goal')}</span>
          <div className={styles.chipGroup}>
            {GOALS.map(({ goal, key }) => (
              <Chip key={goal} selected={settings.goal === goal} onClick={() => update({ goal })}>
                {t(`onboarding.step1.goal${key}`)}
              </Chip>
            ))}
          </div>
        </div>
        <div className={styles.stack}>
          <span className={styles.rowHint}>{t('settings.weekStart')}</span>
          <div className={styles.chipGroup}>
            {(['monday', 'sunday'] as WeekStart[]).map((option) => (
              <Chip
                key={option}
                selected={settings.weekStart === option}
                onClick={() => update({ weekStart: option })}
              >
                {t(`settings.weekStartOptions.${option}`)}
              </Chip>
            ))}
          </div>
        </div>
        <ToggleRow
          label={t('settings.fertilityWindow')}
          checked={settings.fertilityLayerEnabled}
          onChange={(fertilityLayerEnabled) => update({ fertilityLayerEnabled })}
        />
        <ToggleRow
          label={t('settings.advancedTracking')}
          hint={t('settings.advancedHint')}
          checked={settings.advancedTracking}
          onChange={(advancedTracking) => update({ advancedTracking })}
        />
        {settings.advancedTracking && (
          <div className={styles.stack}>
            <span className={styles.rowHint}>{t('settings.units')}</span>
            <div className={styles.chipGroup}>
              {(['metric', 'imperial'] as Units[]).map((option) => (
                <Chip
                  key={option}
                  selected={settings.units === option}
                  onClick={() => update({ units: option })}
                >
                  {t(`settings.unitsOptions.${option}`)}
                </Chip>
              ))}
            </div>
          </div>
        )}
        <ToggleRow
          label={t('settings.pausePredictions')}
          checked={settings.predictionsPaused}
          onChange={(predictionsPaused) => update({ predictionsPaused })}
        />
      </motion.section>

      {!demo && (
        <motion.section className={styles.group} {...reveal(4)}>
          <h2 className={styles.groupTitle}>{t('settings.data')}</h2>
          <div className={styles.buttons}>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              className="visually-hidden"
              tabIndex={-1}
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) void handleImportFile(file)
              }}
            />
            <Button
              variant="secondary"
              loading={busy === 'export'}
              onClick={() => void handleExport()}
            >
              {t('settings.export')}
            </Button>
            <Button
              variant="secondary"
              loading={busy === 'import'}
              onClick={() => fileInputRef.current?.click()}
            >
              {t('settings.import')}
            </Button>
            <Button
              variant="danger"
              loading={busy === 'delete'}
              onClick={() => void handleDeleteAll()}
            >
              {t('settings.deleteAll')}
            </Button>
          </div>
        </motion.section>
      )}

      <motion.section className={styles.group} {...reveal(5)}>
        <h2 className={styles.groupTitle}>{t('settings.account')}</h2>
        <div className={styles.buttons}>
          <Button variant="secondary" onClick={() => void signOut()}>
            <LogoutIcon size={18} />
            {t(demo ? 'settings.exitDemo' : 'settings.signOut')}
          </Button>
          {!demo && (
            <Button
              variant="danger"
              loading={busy === 'account'}
              onClick={() => void handleDeleteAccount()}
            >
              {t('settings.deleteAccount')}
            </Button>
          )}
        </div>
      </motion.section>

      <motion.p className={styles.about} {...reveal(6)}>
        {t('settings.aboutBody')}
      </motion.p>
    </div>
  )
}
