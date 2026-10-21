# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Blush is a local-first, bilingual (EN/VI) menstrual cycle tracking PWA. React 18 + TypeScript (strict) + Vite, Zustand for state, Dexie (IndexedDB) for storage, react-i18next for translations, Framer Motion for animation, Vitest for tests. No backend, no accounts, no analytics, no network calls at runtime — everything lives on-device.

`DESIGN.md` at the repo root is the source of truth for the design system (colors, typography, spacing, component tokens). Never hand-edit `src/ui/tokens.css` — it's generated. If a design token needs to change, edit `DESIGN.md`'s YAML frontmatter and regenerate (see Commands).

## Commands

```bash
bun run dev          # Vite dev server
bun run build         # tsc -b && vite build (production build, must pass typecheck first)
bun run typecheck     # tsc --noEmit, no emit
bun run lint          # eslint .
bun test              # vitest run (single pass, CI-style)
bun run test:watch    # vitest, watch mode
bun run tokens         # regenerate src/ui/tokens.css from DESIGN.md's frontmatter
```

Run a single test file: `bunx vitest run src/engine/__tests__/regular.test.ts`
Run tests matching a name: `bunx vitest run -t "irregular"`

After editing `DESIGN.md`'s frontmatter, always run `bun run tokens` and, if available, `bunx @google/design.md lint DESIGN.md` to validate it.

There is no `bun install` postinstall step beyond the usual — fonts (`public/fonts/*.woff2`, referenced from `src/ui/fonts.css`) are already committed/self-hosted; don't fetch them from Google Fonts at build or run time.

## Architecture

### Design tokens pipeline

`DESIGN.md`'s YAML frontmatter (colors, typography, rounded, spacing) is the single source of design values. `scripts/gen-tokens.ts` parses it and writes `src/ui/tokens.css` as CSS custom properties (`--color-*`, `--radius-*`, `--space-*`, `--font-*`). It also appends a small hand-authored dark-mode override block (`[data-theme="dark"]`) since dark values aren't in the frontmatter. Run `bun run tokens` any time `DESIGN.md` changes — nothing watches it automatically. UI components should only ever reference `var(--...)` tokens, never hard-coded hex/px values.

### `src/engine/` — pure prediction logic

Deterministic, side-effect-free TypeScript with no React/DOM/store imports. Each concern is its own module (`cycleLengths.ts`, `outliers.ts`, `weightedStats.ts`, `coldStart.ts`, `predict.ts`, `ovulation.ts`, `fertileWindow.ts`, `phases.ts`, `confidence.ts`), but the only thing the rest of the app calls is the single facade in `index.ts`:

```ts
computeCycle(logs: DailyLog[], settings: CycleSettings, today?: ISODate): CycleState
```

`CycleState` (see `types.ts`) carries everything a screen needs to render: phase, predicted next period + range, ovulation estimate (calendar/BBT/LH-confirmed), fertile window, confidence, and a `math` sub-object with the raw weighted cycles/exclusions used — this `math` object is what the "with your numbers" formula-transparency UI (`src/features/formulas/`) reads from, so it must stay live-computed, never hard-coded.

Key algorithm facts worth knowing before changing this code:
- Valid cycle lengths exclude anything outside `[21, 45]` days, then (once ≥5 valid cycles) anything beyond 2.5 scaled-MAD from the median (`outliers.ts`).
- The weighted mean/stdev use `w_k = 0.8^k`, most recent cycle first, over the last 6 valid cycles (`weightedStats.ts`).
- Fewer than 3 valid cycles triggers the cold-start blend with the user's stated cycle length (`coldStart.ts`) and forces `confidence: 'low'`.
- Ovulation resolution order is BBT-confirmed shift > LH-positive > calendar estimate (`ovulation.ts`, orchestrated in `index.ts`'s `resolveOvulation`).
- All date arithmetic goes through `date-fns` on `YYYY-MM-DD` strings (the `ISODate` type) — never raw `Date` math, to stay DST/month/leap-year safe.

Engine tests in `src/engine/__tests__/` cover one scenario each (regular, irregular, outlier, cold-start, late, BBT-confirmed, date-boundary); expected values are computed inline from the documented formulas rather than hard-coded, so a test still fails if the formula changes but passes if only the fixture dates change.

### `src/data/` — persistence

Dexie (`db.ts`) defines two tables: `logs` (keyed by date, shape = engine's `DailyLog`) and `settings` (single row, `SettingsRecord`). `exportImport.ts` handles JSON export/import/delete-all; `demoData.ts` generates a deterministic multi-cycle history for the Settings → More → "Load demo data" feature; `crypto.ts` is a working AES-GCM/PBKDF2 helper for an eventual PIN-lock feature but is not yet wired into the Dexie read/write path.

### `src/store/` — Zustand state

`settingsStore` and `logStore` wrap Dexie with simple load/update actions. `cycleStore.ts` is **not** a Zustand store — it's a `useCycleState()` hook that reads both stores and memoizes a call into `computeCycle`, so predictions recompute reactively whenever logs or settings change. `uiStore.ts` holds only UI state (which screen is active, sheet open/date) — there is no router; `App.tsx` switches screens by reading `uiStore`'s `screen` field (`'today' | 'insights' | 'settings'`).

### `src/features/` and `src/ui/`

`src/ui/` holds design-system primitives (`Button`, `Chip`, `Input`, `Sheet`, `ConfirmDialog`, `ToggleSwitch`, `DatePicker`, `CalendarDay`-adjacent bits live under `features/calendar` since they're calendar-specific). `src/features/<name>/` holds screen-level composition. Two things are easy to miss:

- **Today and Calendar are one screen.** `TodayScreen.tsx` renders the hero (cycle ring/status/log button) and then `CalendarSection` (month grid, inline legend, period summary, past-period range-select) on the same scrollable page. There is no separate Calendar tab/route.
- **Sheets/modals are positioned relative to `#root`, not the browser viewport.** `#root` is a fixed-height (`height: 100vh`), `position: relative` app frame (see `src/ui/global.css`); `Sheet`'s backdrop and the `BottomNav` use `position: absolute` against that frame so they stay visually attached to the app even when `#root` is centered on a wide desktop viewport. Do not change these back to `position: fixed` without accounting for that centering.
- Confirmations use `useConfirm()` from `src/ui/ConfirmDialog.tsx` (an async, Promise-based in-app dialog), not `window.confirm()` — keep new "are you sure?" flows consistent with that.
- `DatePicker` renders a native `<input type="date">` on touch devices (`useIsTouchDevice`, via `matchMedia('(pointer: coarse)')`) and a custom calendar popover otherwise.
- Date strings shown to users go through `src/ui/dateFormat.ts#formatShortDate`, which special-cases Vietnamese to spell out "tháng" instead of date-fns' default "thg" abbreviation — use it instead of calling `date-fns`' `format` directly for any user-facing date.
- Motion timings/eases are centralized in `src/ui/motion.ts` (`TAP_SCALE`, `TAP_TRANSITION`, `SCREEN_TRANSITION`) — reuse them instead of inventing new durations, and respect `useReducedMotion()` the way existing components do.

### i18n

`src/i18n/en.json` and `src/i18n/vi.json` must stay key-for-key identical — `src/i18n/__tests__/parity.test.ts` walks both trees and fails on any mismatch or empty string. Add new keys to both files in the same change. Vietnamese copy uses "bạn"; don't uppercase Vietnamese body text (the `label-caps` CSS class's `text-transform: uppercase` is meant for English/Latin labels).
