---
version: alpha
name: Blushme
description: A premium, Vietnamese-first cycle journal. Airy white and blush pink, delicate botanical illustration, refined serif headlines over a clean humanist sans, restrained, crisp corners.
colors:
  primary: '#3E2A33'
  secondary: '#7A6671'
  tertiary: '#B8416A'
  on-tertiary: '#FFFFFF'
  neutral: '#FFFFFF'
  surface: '#FFFFFF'
  blush: '#F8C9D5'
  blush-tint: '#FFF0F3'
  blush-deep: '#F2A7BB'
  hairline: '#F3DEE4'
  rose-deep: '#8F2D50'
  lavender: '#DCCDF2'
  butter: '#F8E2A6'
  mint: '#C6E9D6'
  leaf: '#A9CBB3'
  leaf-deep: '#6E9B7F'
  sky: '#D4E8F7'
  sky-deep: '#4F93C4'
typography:
  display:
    fontFamily: Fraunces
    fontSize: 3.5rem
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -0.02em
  h1:
    fontFamily: Fraunces
    fontSize: 2rem
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: -0.01em
  h2:
    fontFamily: Fraunces
    fontSize: 1.5rem
    fontWeight: 500
    lineHeight: 1.2
  body-md:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.55
  label-caps:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: 0.8125rem
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: 0.01em
  numeral:
    fontFamily: Fraunces
    fontSize: 1rem
    fontWeight: 500
    lineHeight: 1.2
rounded:
  none: 0px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
---

## Overview

Blushme is a private, comforting cycle journal for Vietnamese women. It should feel like a handwritten letter on soft paper: airy, warm, a little poetic, never clinical and never childish. Delicate botanical illustration carries the emotion; whitespace carries the calm.

Each screen answers three questions at a glance: where am I in my cycle, what should I pay attention to, and what can I do next. Depth (formulas, ranges, confidence) sits one deliberate tap away.

## Colors

White-and-pink, warm rather than sugary. Pure black and saturated colors are never used.

- **Primary (#3E2A33):** warm plum ink for text. **Secondary (#7A6671):** softened ink for captions (AA on white).
- **Tertiary (#B8416A):** deep rose, the single interaction color: primary buttons, logged period, focus rings, links. White text on it passes AA. **Rose deep (#8F2D50)** for text on blush fills.
- **Neutral (#FFFFFF)** page, **Surface (#FFFFFF)** cards and inputs.
- **Blush (#F8C9D5), Blush deep (#F2A7BB), Blush tint (#FFF0F3):** petals, selected states, quiet fills.
- **Hairline (#F3DEE4):** borders and dividers.
- **Lavender, Butter, Mint:** fertility layer and phase accents. **Leaf / Leaf deep:** foliage in illustrations.

State is never conveyed by color alone: logged period is a filled cell, predicted period is a dashed outline, ovulation carries a dot, the fertile window an underline.

Light only.

## Typography

- **Fraunces** (self-hosted, latin + vietnamese subsets) for display, headings and big numerals: soft, characterful, full Vietnamese diacritics. Italic for a single emphasized word.
- **System humanist sans** (`system-ui` stack, native Vietnamese support, no download) for body, labels and controls, for crisp small-size legibility.
- Labels are sentence case, semibold, lightly tracked. Never uppercase Vietnamese text.

## Layout

Mobile-first from 360px, single column. On wide screens the app sits in a centered phone-width frame (max 480px) over a soft floral backdrop. Spacing follows a 4px scale. Touch targets are at least 44px. Navigation is a floating bar with three destinations: Today, Insights, Account. Logging opens as a bottom sheet.

## Elevation & Depth

Soft, plum-tinted, large-blur shadows lift cards and the floating nav; hairlines separate rows. Never more than two levels.

## Shapes

Restrained: buttons, inputs and chips 6px to 8px, cards 12px to 16px, sheets 16px at the top. Fully round shapes are reserved for dots, toggles, progress tracks and calendar day cells. Icons are thin-stroke custom SVG. Botanical illustrations (blossoms, sprigs, petals) are custom SVG with soft gradients.

## Motion

Calm and alive: blooming flowers on entry, a slow sway on sprigs, spring taps, sliding nav pill, staggered card reveals. All motion respects `prefers-reduced-motion`.

## Do's and Don'ts

- Do write natural Vietnamese, addressing the reader as "em" sparingly (omit the pronoun where possible). Vietnamese is the default language.
- Do pair every color state with a shape or glyph.
- Do reveal detail on demand.
- Don't use pure black, neon colors or heavy shadows.
- Don't label days "safe" or "dangerous"; use "higher chance" and "lower chance".
- Don't repeat disclaimers on every screen.
