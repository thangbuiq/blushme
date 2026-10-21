---
version: alpha
name: Blush
description: A private, bilingual (EN/VI) cycle journal. Printed-paper calm in white and blush pink, set in refined serif type with hairline detail and restrained corners.
colors:
  primary: "#4A3540"
  secondary: "#76606B"
  tertiary: "#B5546E"
  on-tertiary: "#FFFFFF"
  neutral: "#FFFBFA"
  surface: "#FFFFFF"
  blush: "#F4B6C2"
  blush-tint: "#FDEEF1"
  hairline: "#EBD3D9"
  lavender: "#C9B6E4"
  butter: "#F6D88C"
  mint: "#BFE3D0"
typography:
  display:
    fontFamily: Fraunces
    fontSize: 3.5rem
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: -0.01em
  h1:
    fontFamily: Fraunces
    fontSize: 2rem
    fontWeight: 500
    lineHeight: 1.15
  h2:
    fontFamily: Fraunces
    fontSize: 1.5rem
    fontWeight: 500
    lineHeight: 1.2
  body-md:
    fontFamily: Lora
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Lora
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.55
  label-caps:
    fontFamily: Lora
    fontSize: 0.6875rem
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.14em
  numeral:
    fontFamily: Lora
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.2
    fontFeature: "'tnum' 1, 'lnum' 1"
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
components:
  screen:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    padding: 24px
  card:
    backgroundColor: "{colors.blush-tint}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.md}"
    padding: 24px
  sheet:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.lg}"
    padding: 24px
  divider:
    backgroundColor: "{colors.hairline}"
    height: 1px
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.sm}"
    height: 48px
    padding: 16px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.tertiary}"
    typography: "{typography.label-caps}"
    rounded: "{rounded.sm}"
    height: 48px
    padding: 16px
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    height: 44px
    padding: 12px
  chip-selected:
    backgroundColor: "{colors.blush}"
    textColor: "{colors.primary}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    height: 44px
    padding: 12px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    height: 48px
    padding: 12px
  calendar-day-period:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    typography: "{typography.numeral}"
    rounded: "{rounded.sm}"
    size: 44px
  calendar-day-predicted:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.secondary}"
    typography: "{typography.numeral}"
    rounded: "{rounded.sm}"
    size: 44px
  calendar-day-fertile:
    backgroundColor: "{colors.lavender}"
    textColor: "{colors.primary}"
    typography: "{typography.numeral}"
    rounded: "{rounded.sm}"
    size: 44px
  calendar-day-ovulation:
    backgroundColor: "{colors.butter}"
    textColor: "{colors.primary}"
    typography: "{typography.numeral}"
    rounded: "{rounded.sm}"
    size: 44px
  calendar-day-low:
    backgroundColor: "{colors.mint}"
    textColor: "{colors.primary}"
    typography: "{typography.numeral}"
    rounded: "{rounded.sm}"
    size: 44px
---

## Overview

Blush is a private cycle journal for a thoughtful reader. It should feel like a well-made paper diary: quiet, warm, editorial. The tone is refined and adult, never clinical and never cutesy.

The interface is calm by default and deep on demand. Each screen shows at most three information elements above the fold, one primary action, and nothing decorative that does not earn its place. Depth (formulas, ranges, confidence) sits one deliberate tap away.

Elegance comes from restraint: generous whitespace, hairline rules instead of heavy boxes, small capitals for labels, and a single accent color. When in doubt, remove an element rather than shrink it.

## Colors

A white-and-pink palette, warm rather than sugary. Pure black and saturated colors are never used.

- **Primary (#4A3540):** plum ink for all text and the strongest lines.
- **Secondary (#76606B):** softened ink for captions and metadata. Meets AA on white.
- **Tertiary (#B5546E):** deep rose, the single interaction color. Used for primary buttons, the logged period, focus rings and links. White text on it passes AA.
- **Neutral (#FFFBFA):** cream-white page background. **Surface (#FFFFFF)** for sheets and inputs.
- **Blush (#F4B6C2)** and **Blush tint (#FDEEF1):** selected states and quiet card fills.
- **Hairline (#EBD3D9):** 1px dividers and borders.
- **Lavender (#C9B6E4), Butter (#F6D88C), Mint (#BFE3D0):** the fertility layer (higher-chance window, estimated ovulation, lower-chance days) and, reused for the same warm association, the Today screen's phase card fill (one of tertiary/mint/butter/lavender per phase). Muted pastels, always carrying plum ink text.

State is never conveyed by color alone. Pair color with form: logged period is a filled cell, predicted period is a dashed 1px outline on white, estimated ovulation carries a small filled dot, the fertile window carries a thin underline.

Light only — no dark mode.

## Typography

Serif throughout, chosen for warmth and clarity, self-hosted with `font-display: swap`, no CDN.

- **Fraunces** for display and headings — a soft, characterful serif with full native Vietnamese diacritic support (latin and vietnamese subsets), so no per-glyph font fallback is needed. Display and body copy sit at weight 400; h1/h2 step up to weight 500. Use italic sparingly for a single emphasized word.
- **Lora** for body text, labels and numerals (full Vietnamese diacritic support, latin and vietnamese subsets). Calendar and data numbers use tabular lining figures (`tnum`, `lnum`).
- **Label caps:** 11px, uppercase, 0.14em tracking, used for section labels and buttons. Do not uppercase Vietnamese body text.
- Keep lines short (about 15 words per sentence on the surface) and verify "Thắng, Kỳ kinh dự kiến, Hoàng thể, Rụng trứng" renders cleanly in Fraunces.

## Layout

Mobile-first from 360px, single column, centered phone-width container (max 440px) on large screens. Spacing follows a 4px base scale; sections breathe with 40px to 64px between them.

Bottom navigation has four items: Today, Calendar, Insights, Settings. Logging opens as a bottom sheet. Touch targets are at least 44px. The Today screen holds exactly three stacked cards, in a single column, each one tap target: date and day-of-cycle (with the status line underneath), phase name, and a self-care suggestion with a "learn more" link; below them, one primary button.

## Elevation & Depth

Depth is mostly flat. Separate content with hairline rules and tonal fills, not shadows.

- Cards: no shadow, 1px hairline border.
- Bottom sheet: one soft, large-blur shadow tinted with plum at 8% opacity, plus a 1px top hairline.
- Never stack more than two levels of elevation.

## Shapes

Corners are restrained and precise, in keeping with a printed page.

- Buttons, chips, inputs and calendar cells: 4px.
- Cards: 8px. Bottom sheet top corners: 12px.
- Fully round shapes are reserved for small status dots.
- Strokes are 1px hairline; icons are thin-stroke (1.25px to 1.5px) custom SVG: drop, petal, moon, flower. No emoji in the interface chrome.

## Components

- **Button primary:** solid deep rose, white small-caps label, 48px high. One per screen.
- **Button secondary:** white with a 1px rose border and rose label. Quiet.
- **Chip:** 44px touch height, hairline border; selected state fills with blush.
- **Calendar day:** see state rules in Colors. Predicted days are visibly fainter than logged ones.
- **Today cards:** three full-width tappable cards, 8px corners, 1px hairline border, no shadow. Date card and phase card open sheets on tap; the suggestion card is static text plus a small "learn more" link.
- **Disclosure ("How is this calculated?"):** a single quiet row with a chevron, opening one layer at a time (sentence, then math, then your numbers). Formulas are set in KaTeX serif.
- **Details sheet:** holds range, confidence in soft words and the disclosure. Never inline on Today.
- **Learn sheet:** cycle education pulled from `KNOWLEDGE.md` — what a cycle is, the four phases as a disclosure list, and when to see a doctor. Never inline on Today.

## Do's and Don'ts

- Do keep copy gentle, human and bilingual (EN and VI), with natural Vietnamese using "bạn".
- Do use one accent color and let whitespace do the work.
- Do pair every color state with a shape or glyph.
- Do reveal detail on demand and keep at most one notice visible at a time.
- Don't use pure black, neon colors, heavy shadows or gradients on surfaces.
- Don't round corners beyond 12px, except the ring and dots.
- Don't label days "safe" or "dangerous"; use "higher chance" and "lower chance" of conception.
- Don't repeat disclaimers on every screen; show once, then a small "i".
- Don't add more than the three cards, the log button and the learn link to Today — no badges or dashboards.
