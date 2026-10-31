---
name: CampusConnect System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#5b598c'
  on-secondary: '#ffffff'
  secondary-container: '#c7c3fe'
  on-secondary-container: '#514f81'
  tertiary: '#434853'
  on-tertiary: '#ffffff'
  tertiary-container: '#5b606b'
  on-tertiary-container: '#d7dbe8'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c4c1fb'
  on-secondary-fixed: '#181445'
  on-secondary-fixed-variant: '#444173'
  tertiary-fixed: '#dee2ef'
  tertiary-fixed-dim: '#c2c6d3'
  on-tertiary-fixed: '#171c25'
  on-tertiary-fixed-variant: '#424751'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-sm: 1rem
  margin: 2rem
  margin-sm: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system embodies a modern, campus-centric network combining institutional credibility with collegiate vibrancy. It balances academic reliability with peer-to-peer approachability, built specifically for authenticated engineering and university student communities in Karnataka (spanning hubs like RVCE, BMSCE, PES University, and NITK Surathkal).

The aesthetic blends **Modern Collegiate Utility** with **Tactile SaaS Clarity**:
- High-structure dual-canvas model: an authoritative, deep slate command rail anchored on the left, paired with an airy, paper-white operational workspace.
- Clear, unpretentious affordances tailored for high-frequency daily student utilities: course note syndication, peer hardware trading, inter-college hackathon rosters, and mess/PG reviews.
- Currency tokens defaulted strictly to Indian Rupee (`₹`), alongside verified `.edu` / institutional identity badges to cultivate unconditional trust.

## Colors

The application operates on a structured dual-plane color strategy. The primary workspace defaults to a crisp, high-legibility light theme, while global persistent navigation sits in a focused deep slate enclave.

### Palette Architecture
- **Primary Accent (`#4F46E5` / Hover `#4338CA`):** Electric Indigo driven by high visual energy. Used for primary CTAs, active item markers, and critical progress trackers.
- **Secondary / Nav Surface (`#0F172A` to `#1E1B4B`):** Deep Navy/Midnight Slate. Houses persistent global actions, college domain switches, and student profile settings.
- **Tertiary Accent / Lavender Wash (`#EEF2FF`):** Soft foundational tint used for tag backdrops, active category pills, and selected table rows.
- **Neutral Stack:**
  - Page Canvas: `#F8FAFC` (Slate 50)
  - Card & Container Surface: `#FFFFFF`
  - Structural Borders: `#E5E7EB` (Gray 200)
  - Primary Typography: `#0F172A` (Slate 900)
  - Secondary & Body Typography: `#475569` (Slate 600)
  - Muted Text & Placeholders: `#94A3B8` (Slate 400)
- **Functional Semantics:**
  - **Success / Campus Verified (`#10B981`):** Online status indicators, verified student checkmarks, peer-to-peer pay receipts.
  - **Warning / Accolade (`#F59E0B`):** Star ratings, seller trust metrics, urgent deadline reminders.
  - **Destructive / Alert (`#EF4444`):** Notification pings, unread flags, active wishlist hearts.

## Typography

The type hierarchy uses **Inter** across all tiers to maximize legibility during dense information processing (such as listing engineering textbooks, lab component specs, and campus notices).

- **Weight Contrast:** High contrast between structured titles (`600` and `700`) and neutral body text (`400`) avoids visual ambiguity in high-density listings.
- **Tabular Numerals:** All rupee numerical prices (`font-variant-numeric: tabular-nums`) must display with fixed metric widths to preserve clean column alignment across transaction tables and marketplace feeds.
- **Letter Spacing:** Tighter letter-spacing is applied to headings above `20px` to maintain optical punch, while labels and metadata chips retain neutral to slightly open tracking for rapid scanning.

## Layout & Spacing

This design system employs a **Desktop-First Shell Architecture** built around a persistent sidebar rail and a flexible operational content canvas.

### Layout Mechanics
- **Navigation Sidebar (Left):** Fixed width of `260px` anchored on desktop viewport (`>= 1024px`), collapsible to an icon dock (`72px`) on tablet (`768px - 1023px`), and converting into an off-canvas drawer or bottom navigation bar on mobile (`< 768px`).
- **Main Canvas:** Centered application grid with a maximum content container width of `1440px` on widescreen displays.
- **Grid Layout:** 12-column responsive fluid grid with `1.5rem` (`24px`) gutters on desktop, reflowing to a 6-column grid with `1rem` (`16px`) gutters on tablet, and a single or dual-column setup on mobile devices.
- **Rhythm Principle:** Internal card padding scales strictly between `1rem` (`16px`) and `1.5rem` (`24px`). Vertical stacking follows a base-8 scale, ensuring consistent cadence between headers, metadata rows, and CTA action strips.

## Elevation & Depth

Visual hierarchy uses a refined hybrid of **low-contrast micro-outlines** and **diffused ambient shadows** to prevent optical clutter across dense content feeds.

- **Level 0 (Flat / Canvas):** Applied to the base background (`#F8FAFC`). No shadow, no border.
- **Level 1 (Surface Cards & Panels):** Pure white background (`#FFFFFF`) framed by a crisp `1px` solid border (`#E5E7EB`) and an ultra-subtle ambient drop shadow:
  `box-shadow: 0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Interactive Hover / Floating Elements):** Lifted cards on hover, popovers, and context menus elevate slightly with an expanded indigo/slate-tinted shadow:
  `box-shadow: 0 8px 20px -4px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04)`. Border shifts dynamically to `#CBD5E1`.
- **Level 3 (Modals & Overlays):** Full overlays, verified student ID presentation sheets, and filter drawers:
  `box-shadow: 0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 10px 10px -5px rgba(15, 23, 42, 0.04)`.
- **Dark Navigation Enclave:** Uses surface contrast instead of elevation; borders within the dark sidebar use `#1E293B` or `#334155` for divider lines with zero box-shadow.

## Shapes

The interface balances soft friendliness with structured professionalism using an intentional `12px` to `16px` curvature strategy:

- **Core Elements (`roundedness: 2` - `0.5rem` / `8px`):** Used for micro-components including badges, checkboxes, input controls, action chips, and nested inner elements.
- **Mid-Tier Elements (`rounded-lg` - `0.75rem` - `1rem` / `12px` - `16px`):** Primary standard for marketplace cards, peer profiles, filter widgets, and navigation pill items.
- **Containers & Overlays (`rounded-xl` - `1.25rem` / `20px`):** Applied to overarching display modals, hero spotlights, and full-screen dialogs.
- **Pills (`rounded-full`):** Reserved exclusively for active rail navigation highlights, numerical badge counters, and campus verification tags.

## Components

### Buttons
- **Primary:** Background `#4F46E5`, text `#FFFFFF`, border `transparent`, `radius: 10px`. Hover transitions to `#4338CA`. Active state scales down subtly (`scale: 0.99`).
- **Secondary:** Background `#EEF2FF`, text `#4F46E5`, border `transparent`. Hover transitions to `#E0E7FF`.
- **Outline / Neutral:** Background `#FFFFFF`, text `#0F172A`, border `1px solid #E5E7EB`. Hover shifts to `#F8FAFC` with border `#CBD5E1`.
- **Dark Rail Button:** Used in sidebar actions; background `#1E293B`, text `#F8FAFC`, hover `#334155`.

### Navigation Sidebar Items
- **Inactive Item:** Transparent background, text `#94A3B8`, padding `10px 14px`, transition to text `#FFFFFF` and subtle background `#1E293B` on hover.
- **Active Item:** Highlight pill using background `#4F46E5`, text `#FFFFFF`, font-weight `600`, with an optional `3px` white vertical accent strip on the left edge.

### Chips & Badges
- **Campus Identifier Tag:** Background `#EEF2FF`, text `#4F46E5`, font-weight `600`, padding `4px 10px`, `radius: 9999px`. Displays college acronyms (e.g., `RVCE`, `PESU`, `NITK`).
- **Status Indicator:** Online dot (`#10B981`) paired with `12px` label; verified badges combine a micro checkmark icon with a soft emerald background (`#ECFDF5`).
- **Wishlist & Counter Badges:** Solid `#EF4444` background with pure `#FFFFFF` typography.

### Input Fields
- White background (`#FFFFFF`), `1px solid #E5E7EB` border, `radius: 10px`, padding `10px 14px`.
- Typography: Input text `#0F172A`, placeholder `#94A3B8`.
- Focus state: `1px solid #4F46E5` accompanied by a focus ring: `box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15)`.

### Cards (Product & Peer Services)
- White card canvas, `1px solid #E5E7EB` perimeter border, `16px` border-radius, `16px` internal padding.
- Imagery framed within an inner `12px` rounded shell with `overflow: hidden`.
- Pricing block: Displayed prominently using `₹` prefix, styled with `#0F172A`, `fontWeight: 700`, `fontSize: 18px`, aligned beside college trust badges and seller ratings (`#F59E0B` star score).

### Checkboxes & Radios
- Size `18px x 18px`, border `1.5px solid #CBD5E1`, border-radius `5px` (checkbox) or `50%` (radio).
- Checked state: `#4F46E5` background with white glyph fill; focus halo matching input ring styles.