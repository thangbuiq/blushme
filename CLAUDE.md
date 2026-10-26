# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Blushme (repo folder `blush`) is a premium, Vietnamese-first (EN available) menstrual cycle tracking PWA. React 18 + TypeScript (strict) + Vite, Zustand for state, Supabase (email/password auth + Postgres with row level security) for accounts and storage, react-i18next for translations, Framer Motion for animation, Vitest for tests. No analytics. The only network calls are to Supabase. The product name is **Blushme**; "blush" in `--color-blush*` tokens and "blush pink" in prose refers to the colour and stays unchanged.

`README.md` is the public face (screenshots, install, setup, troubleshooting); this file is for developers working in the code.

### Setup

1. `bun install`, then copy `.env.example` to `.env.local` and fill `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Only the publishable key ever belongs in the client. `.env` (committed) holds non-secret defaults such as an empty `VITE_SITE_URL`; `.env.local` is git-ignored.
2. Run `supabase/migrations/0001_blush_init.sql` once in the Supabase SQL editor. It creates `cycle_settings`, `daily_logs`, the RLS policies and the `delete_my_account` RPC. Until it has run, the API reports `PGRST205 Could not find the table`. The file name keeps `blush` because it was already applied.
3. Supabase email confirmation is on by default, so new accounts must confirm their email before signing in (turn off "Confirm email" under Authentication, Providers, Email for local development).
4. `VITE_SITE_URL` must be an absolute origin in production, otherwise `og:image` stays relative and social crawlers ignore it.

### Demo mode

The login page's "Sử dụng tài khoản demo" link calls `authStore.enterDemo()`. This is a local-only session (`authStore.demo === true`): `settingsStore` and `logStore` seed in-memory data from `src/data/demoLogs.ts` (about 10 cycles, ends on day 26 of the last cycle so the period reminder dialog shows) and skip every Supabase read and write. Visitors never share state, nothing persists, and `signOut` just clears the flag. Settings hides reset/delete account and shows "Thoát chế độ demo". There is no real demo account in Supabase.

## Commands

```bash
bun run dev          # Vite dev server
bun run build        # tsc -b && vite build (production build, must pass typecheck first)
bun run typecheck    # tsc --noEmit (note: root tsconfig uses project references; `bunx tsc -b` is the real check)
bun run lint         # eslint . (one known react-refresh warning in ConfirmDialog.tsx)
bun test             # vitest run (single pass, CI-style)
bun run test:watch   # vitest, watch mode
bun run tokens       # regenerate src/ui/tokens.css from DESIGN.md's frontmatter
```

Run a single test file: `bunx vitest run src/engine/__tests__/regular.test.ts`
Run tests matching a name: `bunx vitest run -t "irregular"`

Before declaring work done run `bunx tsc -b`, `bun run lint`, `bun run test` and, for anything touching assets or config, `bun run build`.

After editing `DESIGN.md`'s frontmatter, always run `bun run tokens` and, if available, `bunx @google/design.md lint DESIGN.md` to validate it.

Fraunces (`public/fonts/*.woff2`, referenced from `src/ui/fonts.css`) is committed/self-hosted; don't fetch it from Google Fonts at build or run time. Body text uses Bricolage Grotesque (self-hosted variable font in `public/fonts`, also never fetched from Google Fonts).

## Design system rules

`DESIGN.md` is the source of truth for colours, type, radii and spacing. Never hand-edit `src/ui/tokens.css`. UI components reference `var(--...)` tokens, not hard-coded hex/px, except the shared shadows/easing in `src/ui/global.css` and illustration colours inside SVG art.

Decisions made while designing, worth keeping:

- **Corners are restrained.** Radius scale is `sm 3 / md 5 / lg 6 / xl 8`. Buttons, inputs, chips, the nav bar, tabs and badges are rectangles with `sm`/`md` radius, not pills. `radius-full` is only for dots, toggles, progress tracks and calendar day cells. Do not reintroduce pill buttons or large radii.
- **Buttons are flat.** Primary is solid `--color-tertiary` with white text and a soft shadow; no gradients or glows. The one decorative exception is the "Hiểu rõ dự đoán này" button, which has `ButtonVine` sprigs growing inside it (clipped by `overflow: hidden`).
- **Typography:** Fraunces for display/headings/big numerals, Bricolage Grotesque for everything else. `.label-caps` is sentence case (never uppercase Vietnamese).
- **Decoration is botanical SVG,** not emoji and not icon fonts: `src/ui/art/Botanical.tsx` (`Bloom`, `Sprig`, `PetalDrift`) and `src/ui/art/ButtonVine.tsx`. Animation is CSS-driven (`Botanical.module.css`, `ButtonVine.module.css`) so it respects `prefers-reduced-motion` through the global rule.
- **Copy voice (Vietnamese):** address the reader as "em", sparingly; prefer dropping the pronoun. Avoid "bạn" and "mình" (reads robotic). The app speaks as "Blushme". Phase names are the same everywhere in the UI (`today.phase.*`: Kỳ kinh / Nang trứng / Rụng trứng / Hoàng thể; en Menstrual / Follicular / Ovulation / Luteal); there is no separate gentle naming set. Days may be called "an toàn" / "nguy hiểm" (safe / dangerous) in explanations, but always as "relatively safe" and never as dependable contraception: calendar estimates can be off, so keep the caveat next to it.
- **No em dashes** in code, comments, docs or copy.
- **Light theme only.**

## Architecture

### Design tokens pipeline

`DESIGN.md`'s YAML frontmatter (colors, typography, rounded, spacing) is the single source of design values. `scripts/gen-tokens.ts` parses it and writes `src/ui/tokens.css` as CSS custom properties (`--color-*`, `--radius-*`, `--space-*`, `--font-*`). A `fontFamily` containing a comma is emitted verbatim as a font stack. Run `bun run tokens` any time `DESIGN.md` changes; nothing watches it automatically.

### `src/engine/`: pure prediction logic

Deterministic, side-effect-free TypeScript with no React/DOM/store imports. Each concern is its own module (`cycleLengths.ts`, `outliers.ts`, `weightedStats.ts`, `coldStart.ts`, `predict.ts`, `ovulation.ts`, `fertileWindow.ts`, `phases.ts`, `confidence.ts`), but the only thing the rest of the app calls is the facade in `index.ts`:

```ts
computeCycle(logs: DailyLog[], settings: CycleSettings, today?: ISODate): CycleState
```

`CycleState` (see `types.ts`) carries everything a screen needs: phase, `dayOfCycle`, predicted next period + range, ovulation estimate (calendar/BBT/LH-confirmed), fertile window, confidence, and a `math` sub-object with the raw weighted cycles/exclusions. The formula-transparency UI (`src/features/formulas/`) and Insights read `math`, so it must stay live-computed, never hard-coded.

Key algorithm facts:

- Valid cycle lengths exclude anything outside `[21, 45]` days, then (once at least 5 valid cycles) anything beyond 2.5 scaled-MAD from the median (`outliers.ts`).
- Weighted mean/stdev use `w_k = 0.8^k`, most recent first, over the last 6 valid cycles (`weightedStats.ts`).
- Fewer than 3 valid cycles triggers the cold-start blend with the stated cycle length (`coldStart.ts`) and forces `confidence: 'low'`.
- Ovulation resolution order is BBT shift > LH-positive > calendar estimate (`resolveOvulation` in `index.ts`).
- All date arithmetic goes through `date-fns` on `YYYY-MM-DD` strings (`ISODate`), never raw `Date` math, to stay DST/month/leap-year safe.

Engine tests in `src/engine/__tests__/` cover one scenario each; expected values are computed inline from the documented formulas.

### `src/data/`: persistence

`repo.ts` is the only code that talks to Supabase tables: `cycle_settings` (one jsonb row per user) and `daily_logs` (one jsonb row per user per date). RLS (`auth.uid() = user_id`) isolates users. `settings.ts` holds `SettingsRecord` and `DEFAULT_SETTINGS`. `exportImport.ts` only exposes `deleteAllData` (the "reset data" action; export/import were removed). `demoLogs.ts` builds the deterministic sample history. `crypto.ts` is an unused AES-GCM/PBKDF2 helper (no PIN lock exists; the old lock/reminder toggles were removed because they did nothing).

### `src/store/`: Zustand state

`authStore` wraps Supabase auth (session, signIn/signUp/signOut, mapped error codes, `demo` flag). `settingsStore` and `logStore` load the signed-in user's rows, update optimistically, write through `repo.ts`, and roll back plus show a toast on failure. `App.tsx` loads them when a user id appears and resets them on sign-out. `cycleStore.ts` is **not** a store: it's a `useCycleState()` hook that memoizes `computeCycle` over both stores. `uiStore.ts` holds UI state (active screen, log sheet, details sheet, toast); there is no router, `App.tsx` switches on `screen` (`'today' | 'insights' | 'settings'`).

App gate order in `App.tsx`: `Splash` while auth/data load, then `AuthScreen`, then `OnboardingFlow` until `onboardingComplete`, then the three screens plus `LogSheet`, `TodaySheets` and `BottomNav`.

### `src/features/` and `src/ui/`

- **Auth** (`features/auth`): sign in / sign up tabs, mapped error messages, "check your email" state, language switch, demo link.
- **Onboarding**: 4 steps (language and goal, last period, typical lengths with steppers, disclaimer) with a progress bar. `Frame` is module-level on purpose (defining it inside the component remounts steps on every render).
- **Today** (`features/today`) is one scrollable page, in order: greeting, hero card (`CycleRing`, status line, "Hiểu rõ dự đoán này" button), "Điều nên chú ý" focus card (phase text and three tips), the log card (`PhaseTimeline`, one-tap mood chips, log and "period started today" buttons), then `CalendarSection`. There is no separate Calendar route.
  - `CycleRing`: SVG "petal dial": one petal per cycle day coloured by phase (past solid, future faint, today larger), thin phase arcs, a flower marker that animates to today, and two inner `RingGarland` sprigs. No filled background behind the centre text. Geometry comes from `cycleGeometry()` in `phaseColors.ts`, shared with the timeline.
  - `PhaseTimeline`: thin linear timeline (symbol above, coloured line, optional day ranges, footer "Ngày 1 ... Ngày N, rồi vòng mới ↻") with an italic footnote saying the numbers are days of the cycle, not of the month (`timeline.note`). `detailed` adds ranges and makes segments tappable.
  - `DetailsSheet` ("Dự đoán của em") is the single info sheet, mounted by `TodaySheets` at the app root: range, confidence, cycle variability (std dev), then `LearnContent` (intro, typical length, timeline and four-phase accordion, when to see a doctor), and last the "how is this calculated" formula disclosure. Keep the formula section at the bottom.
- **Insights**: computed from `state.math` plus `insightsData.ts` (average period length, regularity, symptom/mood tallies; unit tested). Needs at least 1 valid cycle, otherwise shows an empty state with progress.
- **Settings**: account card, language, tracking options, account management (sign out, reset data, delete account via RPC). Reset and delete are hidden in demo mode.
- `src/ui/` holds primitives: `Button` (variants primary/secondary/ghost/danger, `loading`), `Chip`, `Field`/`FieldAction`, `Sheet` (bottom sheet, drag-to-dismiss via the handle), `ConfirmDialog`, `ToggleSwitch`, `DatePicker`, `Toast`, `BottomNav`, `Splash`, `Collapse`, `Icon`.

Gotchas:

- **Sheets and nav are positioned relative to `#root`, not the viewport.** `#root` is a `position: relative` app frame (`100dvh`, full width: the layout is the same single column everywhere; on desktop (min-width 700px) `#root` becomes a 430px phone-sized card centred on a blush gradient); `Sheet`'s backdrop, `BottomNav` and `Toast` use `position: absolute` against it. Do not change them to `position: fixed`.
- **Mount sheets outside the scrolling screen container** (as `LogSheet` and `TodaySheets` are in `App.tsx`). A sheet rendered inside the scrolling `motion.div` anchors to that scrolled box and opens at the wrong place.
- **Periods are recorded as a start date only** (`periodStart`, via "Kỳ kinh tới" on Today or in the log sheet). There is no per-day flow or on/off toggle; days after the start are shown for `statedPeriodLength`. Tapping a calendar day that already has a log opens `DayActionsSheet` (edit or delete). Moods are multi-select (`moods: string[]`; read legacy `mood` through `moodsOf()`). The fertile window is always on and predictions can't be paused.
- The page itself never scrolls: `html`/`body` are `overflow: hidden` and `position: fixed`, only `.scroll` containers scroll (keeps the nav still on touch overscroll). Avoid infinite SVG animations and `backdrop-filter` on large areas, they cause jank on phones.
- The user's `displayName` and `avatar` (an `Avatar` id, edited in Settings, name also asked in onboarding) greet them on Today.
- Phases are shown with `PhaseTag` (the gentle name in the phase's own colour, no symbol; only the timeline uses symbols). The calendar's fertile window uses the `sky` tokens so it is not confused with phase colours. Explanations in settings use `InfoTip`.
- Confirmations use `useConfirm()` (`ui/ConfirmDialog.tsx`), not `window.confirm()`.
- `DatePicker` renders a native `<input type="date">` on touch devices and a custom popover otherwise.
- User-facing dates go through `src/ui/dateFormat.ts` (`formatShortDate`, `formatMonthYear`, `formatLongDate`, `formatWeekdayDay`), which special-case Vietnamese ("Tháng 10, 2026"). Never call `date-fns` `format` or `toLocaleDateString` directly for display.
- Motion presets live in `src/ui/motion.ts` (`TAP_SCALE`, `SPRING`, `SOFT_SPRING`, `REVEAL`, ...). Respect `useReducedMotion()`.
- `useCycleState()` accepts a date (the log sheet uses it for the selected day).

### i18n

Vietnamese is the default (`src/i18n/index.ts`; the pre-login choice is stored in `localStorage` under `blush:lang`, afterwards `settings.language` wins and `null` means "don't override"). `src/i18n/en.json` and `vi.json` must stay key-for-key identical: `src/i18n/__tests__/parity.test.ts` fails on any mismatch or empty string. Add new keys to both in the same change. Auth errors map to `auth.errors.*`; save/load failures to `errors.*` (shown as toasts).

### Assets and branding

- `public/favicon.svg` (six-petal blossom), `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (full-bleed square, no transparent corners, because iOS adds its own rounding), `og-image.png` (1200x630). The PWA manifest lives in `vite.config.ts`; `og-image.png` is excluded from precache.
- `index.html` carries the title, description and Open Graph / Twitter tags (`%VITE_SITE_URL%/og-image.png`).
- PNGs were rendered with headless Chrome from SVG/HTML (Fraunces loaded from `public/fonts`); regenerate them the same way if the brand changes.
- `docs/screenshots/*.png` are README images captured with Playwright (390x844 @2x, Vietnamese locale) in demo mode. Retake them after visible UI changes.
