import { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Chip } from '@/ui/Chip'
import { Avatar } from '@/ui/Avatar'
import { AVATARS } from '@/ui/avatars'
import { Field } from '@/ui/Input'
import { Button } from '@/ui/Button'
import { ToggleSwitch } from '@/ui/ToggleSwitch'
import { InfoTip } from '@/ui/InfoTip'
import { useConfirm } from '@/ui/ConfirmDialog'
import { LogoutIcon } from '@/ui/Icon'
import { REVEAL } from '@/ui/motion'
import { setStoredLanguage } from '@/i18n'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useLogStore } from '@/store/logStore'
import { useUiStore } from '@/store/uiStore'
import { deleteAllData } from '@/data/exportImport'
import { deleteAccount } from '@/data/repo'
import { NAME_MAX, type Units, type WeekStart } from '@/data/settings'
import styles from './SettingsScreen.module.css'

function ToggleRow({
  label,
  tip,
  checked,
  onChange,
}: {
  label: string
  tip?: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className={styles.row}>
      <span className={styles.rowText}>
        {label}
        {tip && <InfoTip>{tip}</InfoTip>}
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
  const confirm = useConfirm()
  const [busy, setBusy] = useState<string | null>(null)
  const [name, setName] = useState(settings.displayName)

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

  async function handleDeleteAll() {
    if (!(await confirm(t('settings.deleteAllConfirm'), t('settings.deleteAll'), { danger: true })))
      return
    await run('delete', async () => {
      await deleteAllData()
      await reloadAll()
    })
  }

  async function handleDeleteAccount() {
    if (
      !(await confirm(t('settings.deleteAccountConfirm'), t('settings.deleteAccount'), {
        danger: true,
      }))
    )
      return
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
        <div className={styles.profileTop}>
          <Avatar id={settings.avatar} size={64} />
          <span className={styles.who}>
            <span className={styles.name}>
              {settings.displayName.trim() || t('settings.profile.noName')}
            </span>
            <span className={styles.email} title={user?.email ?? undefined}>
              {user?.email}
            </span>
            <span className={styles.sub}>{t(demo ? 'settings.demoNote' : 'settings.synced')}</span>
          </span>
        </div>
        <Field
          id="settings-name"
          label={t('settings.profile.nameLabel')}
          placeholder={t('settings.profile.namePlaceholder')}
          maxLength={NAME_MAX}
          autoComplete="given-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            const trimmed = name.trim()
            if (trimmed !== settings.displayName) void update({ displayName: trimmed })
          }}
        />
        <div
          className={styles.avatarPicker}
          role="radiogroup"
          aria-label={t('settings.profile.avatarLabel')}
        >
          {AVATARS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={settings.avatar === option.id}
              aria-label={option.id}
              className={[
                styles.avatarOption,
                settings.avatar === option.id && styles.avatarSelected,
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => void update({ avatar: option.id })}
            >
              <Avatar id={option.id} size={44} />
            </button>
          ))}
        </div>
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
          <span className={styles.rowHint}>
            {t('settings.weekStart')}
            <InfoTip>{t('settings.weekStartTip')}</InfoTip>
          </span>
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
          label={t('settings.periodReminder')}
          tip={t('settings.periodReminderTip')}
          checked={settings.periodReminder}
          onChange={(periodReminder) => update({ periodReminder })}
        />
        <ToggleRow
          label={t('settings.advancedTracking')}
          tip={t('settings.advancedTip')}
          checked={settings.advancedTracking}
          onChange={(advancedTracking) => update({ advancedTracking })}
        />
        {settings.advancedTracking && (
          <div className={styles.stack}>
            <span className={styles.rowHint}>
              {t('settings.units')}
              <InfoTip>{t('settings.unitsTip')}</InfoTip>
            </span>
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
      </motion.section>

      <motion.section className={styles.group} {...reveal(4)}>
        <h2 className={styles.groupTitle}>{t('settings.account')}</h2>
        <div className={styles.buttons}>
          <Button variant="secondary" onClick={() => void signOut()}>
            <LogoutIcon size={18} />
            {t(demo ? 'settings.exitDemo' : 'settings.signOut')}
          </Button>
          {!demo && (
            <>
              <Button
                variant="danger"
                loading={busy === 'delete'}
                onClick={() => void handleDeleteAll()}
              >
                {t('settings.deleteAll')}
              </Button>
              <Button
                variant="danger"
                loading={busy === 'account'}
                onClick={() => void handleDeleteAccount()}
              >
                {t('settings.deleteAccount')}
              </Button>
            </>
          )}
        </div>
      </motion.section>

      <motion.p className={styles.about} {...reveal(5)}>
        {t('settings.aboutBody')}
      </motion.p>
    </div>
  )
}
