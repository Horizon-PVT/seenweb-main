---
name: Obsidian Gold
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c5b3'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#99907f'
  outline-variant: '#4d4638'
  surface-tint: '#e4c36d'
  primary: '#eac872'
  on-primary: '#3e2e00'
  primary-container: '#cdad5a'
  on-primary-container: '#554100'
  inverse-primary: '#745b0d'
  secondary: '#c7c6c6'
  on-secondary: '#303031'
  secondary-container: '#464747'
  on-secondary-container: '#b5b5b5'
  tertiary: '#cccccc'
  on-tertiary: '#2f3131'
  tertiary-container: '#b0b1b1'
  on-tertiary-container: '#424444'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdf92'
  primary-fixed-dim: '#e4c36d'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#594400'
  secondary-fixed: '#e3e2e2'
  secondary-fixed-dim: '#c7c6c6'
  on-secondary-fixed: '#1b1c1c'
  on-secondary-fixed-variant: '#464747'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: '0'
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: '0'
  label-caps:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  mono-sm:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: '1.4'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  container-max: 1280px
  gutter: 16px
---

## Brand & Style

The design system is engineered for the modern YouTube creator—a professional who demands high-performance tools that mirror the sophistication of professional editing suites. The brand personality is disciplined, elite, and focused, utilizing a "Dark UI" aesthetic to reduce cognitive load and keep the creator's content as the focal point.

The visual style is a hybrid of **Minimalism** and **Tactile Glassmorphism**. It leverages deep blacks, precise hairlines, and subtle gold accents to create a sense of exclusivity and technical mastery. This design system prioritizes functional density and clarity, ensuring that complex data sets feel approachable and high-end.

## Colors

The palette is anchored by a "Deep Black" canvas to provide infinite depth. The primary color is a refined **Gold (#CDAD5A)**, used sparingly for critical actions, progress indicators, and "Pro" tier features. This color should never overwhelm; it functions as a signature of quality.

Secondary and neutral tones are derived from cool grays. Borders utilize low-opacity white to create "hairline" separators that feel sharp on Retina displays. Status colors (success, error) should be desaturated to maintain the professional atmosphere, only gaining vibrance upon user interaction or alert states.

## Typography

The system utilizes **Inter** for all UI and prose elements, benefiting from its exceptional legibility in dark environments and its neutral, systematic character. **JetBrains Mono** is introduced as a secondary functional font for data points, IDs, and metadata labels to provide a "tool-like" feel reminiscent of professional dashboards.

Text hierarchy is established through weight and color rather than just size. Primary information uses High-Emphasis White (#FFFFFF), while secondary information drops to Medium-Emphasis Gray (#8A8A8A). On mobile, display headings should scale down by 20% to maintain readability without excessive wrapping.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. The main dashboard operates on a 12-column grid with a maximum width of 1440px for content, centered on the screen. Sidebar and navigation elements are fixed-width to ensure tool accessibility, while the main content area (the "Canvas") fluidly adapts.

All spacing is based on a **4px baseline grid**. Components should use `16px` (md) for internal padding to maintain a spacious, premium feel. For dense data views (like video analytics lists), the system allows for an "Expressive" (16px) or "Compact" (8px) vertical rhythm. Sidebars should utilize a `240px` fixed width on desktop, collapsing to a `64px` icon-only rail on smaller viewports.

## Elevation & Depth

Depth is conveyed through **Tonal Layering** and **Low-contrast Outlines**. Avoid heavy shadows; instead, use slightly lighter background fills to indicate elevation. 

- **Level 0 (Base):** #0A0A0A.
- **Level 1 (Cards/Sidebar):** #141414 with a 1px solid border at 8% white opacity.
- **Level 2 (Modals/Popovers):** #1C1C1C with a subtle 20px blur shadow and a 1px border at 12% white opacity.

Interactive elements use a "Inner Glow" effect on hover—a subtle 1px top-border highlight—to simulate light hitting a physical edge.

## Shapes

The design system utilizes a **Soft (4px - 8px)** corner radius. This "small-radius" approach creates a technical, precise appearance that feels modern and professional, avoiding the playfulness of larger rounded corners. 

Buttons and input fields use a consistent `6px` radius. Large containers or "Artboards" use an `8px` radius. Minimalist icons should follow a consistent 2px stroke weight with slight rounding on terminals to match the UI's geometry.

## Components

### Buttons
- **Primary:** Gold background (#CDAD5A) with black text. No shadow, flat color.
- **Secondary:** Transparent background with a 1px white (8% opacity) border. White text.
- **Ghost:** No border or background. Gold text for actions, Gray for navigation.

### Cards
Cards are the primary container. They feature a `1px` border (#FFFFFF at 8% opacity). On hover, the border opacity increases to 20%, and the background subtly shifts from #141414 to #181818.

### Input Fields
Inputs are dark (#0F0F0F) with a subtle bottom border. Focus state is indicated by the border changing to Gold (#CDAD5A) and a very soft gold outer glow (4px blur, 10% opacity).

### Navigation Rails
Inspired by Linear, the sidebar uses high-contrast icons (20x20px) with "Label-caps" typography for section headers. Active states are indicated by a vertical 2px gold pill on the leading edge of the menu item.

### Analytics Chips
Small, pill-shaped markers used for video tags or status. They should use a "Gold Muted" background (#CDAD5A at 15% opacity) with gold text for a sophisticated, non-distracting highlight.