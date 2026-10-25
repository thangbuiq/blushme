import { useTranslation } from 'react-i18next'
import { Sheet } from '@/ui/Sheet'
import { Button } from '@/ui/Button'
import { useConfirm } from '@/ui/ConfirmDialog'
import { formatLongDate } from '@/ui/dateFormat'
import { useUiStore } from '@/store/uiStore'
import { useLogStore } from '@/store/logStore'
import { parseISO } from 'date-fns'

// Tapping a day that already has a log asks what to do with it. Mounted at the
// app root, outside the scrolling screen, like the other sheets.
export function DayActionsSheet() {
  const { t, i18n } = useTranslation()
  const date = useUiStore((s) => s.dayActionsDate)
  const close = useUiStore((s) => s.closeDayActions)
  const openLogSheet = useUiStore((s) => s.openLogSheet)
  const deleteLog = useLogStore((s) => s.deleteLog)
  const confirm = useConfirm()

  function edit() {
    if (!date) return
    close()
    openLogSheet(date)
  }

  async function remove() {
    if (!date) return
    if (
      !(await confirm(t('calendar.dayActions.deleteConfirm'), t('calendar.dayActions.delete'), {
        danger: true,
      }))
    )
      return
    close()
    await deleteLog(date)
  }

  return (
    <Sheet
      open={date !== null}
      onClose={close}
      title={date ? formatLongDate(parseISO(date), i18n.language) : ''}
      subtitle={t('calendar.dayActions.title')}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
        <Button variant="primary" onClick={edit}>
          {t('calendar.dayActions.edit')}
        </Button>
        <Button variant="danger" onClick={() => void remove()}>
          {t('calendar.dayActions.delete')}
        </Button>
      </div>
    </Sheet>
  )
}
