# Center7 - Design System & UI Kit

This document outlines the strict visual language and component architecture for Center7. It adheres to "Anti-Slop" design principles, ensuring a sophisticated, accessible, and mathematically sound user interface.

## 1. Core Principles
- **No AI Slop:** No purple-to-blue gradients, gradient text, or arbitrary glassmorphism.
- **Mathematical Scaling:** Padding, margins, border radii, and typography strictly follow mathematical ratios.
- **Flattened Depth:** Hierarchy is established through typography, whitespace, and subtle dividers rather than nested box-shadows.
- **Strict Contrast:** Passes WCAG AA. Neutrals are tinted with slight temperature (cool or warm), never pure #000 or #FFF.

## 2. Typography
A distinctive display font paired with a highly legible body font.
- **Display Font:** *Playfair Display* or *Instrument Serif* (for premium, structural headers).
- **Body Font:** *Plus Jakarta Sans* or *Inter* (for dense UI flexibility).
- **Scale (Major Second 1.125 for dense UI):**
  - **H1:** 36px / Line Height 1.2 / Tracking -0.02em
  - **H2:** 32px / Line Height 1.3 / Tracking -0.01em
  - **H3:** 24px / Line Height 1.4
  - **Body (Base):** 16px / Line Height 1.6 / Max Width 65ch
  - **Small/Caption:** 14px / Line Height 1.5

*Rule:* Never skip heading levels. No all-caps for body text. Text inside controls is strictly single-line (`white-space: nowrap`).

## 3. Colors (Sophisticated Neutrals)
Colors are grouped by theme and intentionality.

### Light Mode (Warm Neutrals)
- **Background:** `#FCFCFA` (Warm off-white, 2% saturation)
- **Surface/Card:** `#FFFFFF`
- **Text Primary:** `#1C1C1A` (Warm near-black)
- **Text Secondary:** `#686865`
- **Border/Divider:** `#E6E6E3`
- **Accent (Primary Action):** `#232321` (High contrast dark)
- **Destructive/Penalty:** `#D93B3B`

### Dark Mode (Cool Neutrals)
- **Background:** `#0F0F11` (Cool near-black, 3% saturation)
- **Surface/Card:** `#161619` (Brightness difference ≤7% from background)
- **Text Primary:** `#F3F3F5`
- **Text Secondary:** `#9A9A9E`
- **Border/Divider:** `#2A2A2E`
- **Accent (Primary Action):** `#EAEAEA` (High contrast light)
- **Destructive/Penalty:** `#E85D5D`

## 4. Spacing & Rhythm
Strict adherence to an 8px grid system.
- **Padding Math:** Container outer padding must *always* equal or exceed the inner padding between its child elements. Minimum container padding is `16px`.
- **Button Sizing:** Horizontal padding is exactly 2x vertical padding (e.g., `px-6 py-3`).
- **Spacing Scale:** `4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px`, `96px`.

## 5. Borders & Shapes (Radii)
- **Card Border Radius:** Cap at `12px` or `16px`. Never use extreme radii for structural cards.
- **Pills/Buttons:** `9999px` (Full rounded) for tags or primary action buttons, or match the card radius (e.g., `8px`) for standard UI buttons.
- **Nested Radius Rule:** `Inner Radius = Outer Radius - Padding`. (e.g., Outer card `16px`, padding `8px` -> Inner element radius must be `8px`).
- **No Ghost Cards:** Do not mix 1px hairline borders with wide soft shadows. Choose one.

## 6. Component Specs

### Buttons
- **Primary:** Solid Accent background, inverted text.
- **Secondary:** Transparent background, Border outline, primary text color.
- **Ghost:** Transparent, subtle background on hover (`hover:bg-opacity-10`).
- *Feedback:* Active states scale down slightly (`scale-95` via Framer Motion).

### Cards
- Clean surfaces. No "side-tab borders" (thick left line).
- Use subtle 1px borders (`border-border`) in light mode; subtle lightness shifts in dark mode.

### Inputs & Forms
- **Structure:** Clear label above, 1px border. Focus state emphasizes the border (e.g., `ring-1 ring-primary`).
- **Validation:** Error states color the border Destructive and show a 14px error message below. No generic icons inside the input unless functionally required (e.g., Search).

### Navigation
- **Desktop:** Clean sidebar or top-nav with minimal icons. Active states marked by text brightness or a subtle background pill.
- **Mobile:** Bottom navigation bar or hamburger menu with large touch targets (min `44px`).

### Dialogs & Modals
- Centered on screen.
- Scrim/Overlay: Darkened with blur (`bg-black/50 backdrop-blur-sm`).
- Must trap focus and support `Esc` to close.

## 7. Icons
- **Library:** Lucide React.
- **Style:** Consistent 2px stroke width. Unfilled (outline) for inactive, filled (or heavier stroke) for active states where applicable.

## 8. Animations
Powered by Framer Motion (`motion/react`).
- **Transitions:** Smooth, ease-out curves (e.g., `ease: [0.16, 1, 0.3, 1]`, `duration: 0.3`).
- **Route Changes:** Subtle fade-in (`opacity: 0` to `opacity: 1`) and slight upward slide (`y: 10` to `y: 0`).
- **Hover States:** Immediate visual feedback (<100ms).
