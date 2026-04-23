---
name: Ancestral Loom
colors:
  surface: '#fcf9f5'
  surface-dim: '#dcdad6'
  surface-bright: '#fcf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3ef'
  surface-container: '#f0ede9'
  surface-container-high: '#eae8e4'
  surface-container-highest: '#e5e2de'
  on-surface: '#1c1c1a'
  on-surface-variant: '#54433d'
  inverse-surface: '#31302e'
  inverse-on-surface: '#f3f0ec'
  outline: '#87736c'
  outline-variant: '#d9c1ba'
  surface-tint: '#914b30'
  primary: '#8a452b'
  on-primary: '#ffffff'
  primary-container: '#a85d41'
  on-primary-container: '#fff5f2'
  inverse-primary: '#ffb59b'
  secondary: '#4c6078'
  on-secondary: '#ffffff'
  secondary-container: '#cde1fe'
  on-secondary-container: '#51647d'
  tertiary: '#77512e'
  on-tertiary: '#ffffff'
  tertiary-container: '#926944'
  on-tertiary-container: '#fff6f1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcf'
  primary-fixed-dim: '#ffb59b'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#74341b'
  secondary-fixed: '#d1e4ff'
  secondary-fixed-dim: '#b4c8e4'
  on-secondary-fixed: '#061d32'
  on-secondary-fixed-variant: '#35485f'
  tertiary-fixed: '#ffdcc1'
  tertiary-fixed-dim: '#f0bc91'
  on-tertiary-fixed: '#2e1600'
  on-tertiary-fixed-variant: '#623f1e'
  background: '#fcf9f5'
  on-background: '#1c1c1a'
  surface-variant: '#e5e2de'
typography:
  headline-xl:
    fontFamily: notoSerif
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg:
    fontFamily: notoSerif
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-md:
    fontFamily: notoSerif
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.4'
  body-lg:
    fontFamily: beVietnamPro
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: beVietnamPro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-sm:
    fontFamily: beVietnamPro
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  margin-mobile: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is rooted in the intersection of ancient craftsmanship and modern exploration. It captures the rhythmic nature of weaving and the vastness of the landscapes where these traditions thrive. The visual language moves away from utility-first interfaces toward a sophisticated editorial experience, treating every screen like a high-end travel journal.

The style is **Contemporary Editorial**, characterized by expansive whitespace, intentional asymmetry, and a focus on high-fidelity photography. It evokes a sense of "slow travel"—inviting users to linger and discover rather than just transact. The emotional goal is to establish deep trust through a polished, tactile aesthetic that feels both artisanal and technologically seamless.

## Colors

The palette is derived from natural dyes and Earth-tones found in Andean and traditional weaving landscapes. 

*   **Primary (Terracotta):** Used for key actions and to denote heat/energy in the journey. It represents the clay and dyed wool.
*   **Secondary (Indigo Night):** A deep, trustworthy blue used for navigation elements and high-contrast text to ensure authority and depth.
*   **Tertiary (Sandy Ochre):** Used for accents, highlights, and secondary interactive elements, mimicking the sun-drenched paths.
*   **Neutral (Parchment):** A warm, off-white base that avoids the clinical feel of pure white, providing a soft canvas that makes photography pop.

## Typography

This design system utilizes a typographic pairing that balances heritage with modernity. 

**Noto Serif** is reserved for headlines and editorial pull-quotes. Its classic proportions and elegant serifs communicate the "story" aspect of the app. It should be used with generous leading to maintain a breathable, book-like feel.

**Be Vietnam Pro** handles all functional and body copy. Its contemporary, clean letterforms ensure high legibility on mobile devices, even at smaller sizes. Labels should occasionally use all-caps with light tracking to create a clear distinction between data and narrative.

## Layout & Spacing

The layout philosophy follows a **fluid-contextual grid**. Being mobile-first, the design relies on a 4-column grid for standard content, but frequently breaks the grid for "editorial moments"—such as full-bleed imagery or overlapping elements that mimic a layered textile.

Spacing is generous. We use a 4px baseline shift, but emphasize larger "breathing zones" (48px+) between distinct content sections to prevent the "backoffice" density. Margins are set at a wide 24px to frame the content elegantly, creating a premium, centered feel for the viewport.

## Elevation & Depth

Depth is achieved through **Tonal Layers** and **Ambient Shadows** rather than stark borders. 

Instead of traditional shadows, this design system uses soft, colored glows (using a low-opacity version of the Indigo Night or Terracotta) to lift cards off the Parchment background. This mimics the way fabric sits on a surface. Surfaces are tiered:
1.  **Level 0 (Base):** Parchment neutral.
2.  **Level 1 (Cards):** Pure white or slightly lighter sand tones with very soft, diffused shadows (20% blur, 4% opacity).
3.  **Level 2 (Modals/Overlays):** Subtle backdrop blurs (glassmorphism) that keep the context of the landscape visible behind the interaction.

## Shapes

The shape language is defined by **Soft Corners**. There are no sharp, aggressive angles, nor are there overly "bubbly" pill shapes. 

Standard components (Cards, Buttons, Inputs) use a medium radius (rounded-lg/16px) to feel approachable and tactile, like smoothed stone or worn ceramic. Smaller elements like chips or tags use a slightly tighter radius to maintain structural integrity while remaining part of the soft-visual family.

## Components

### Buttons
Primary buttons use the Terracotta fill with white text, featuring a subtle inner-glow to feel "pressed" or tactile. Secondary buttons are Indigo Night outlines with a slightly heavier 1.5pt stroke.

### Elegant Cards
Cards are the hero of the interface. They feature high-quality imagery with a 4:5 aspect ratio (vertical, editorial feel). Text is overlaid using a subtle gradient scrim or placed below in a dedicated container with plenty of padding.

### Lists
Lists are "airy." Each item is separated by a 1px Sandy Ochre divider that doesn't span the full width, leaving space at the margins to maintain the open-grid feel.

### Input Fields
Inputs use a minimal bottom-border style or a very light "Sand" fill. The focus state transitions the border to Terracotta with a graceful animation.

### Navigation
The bottom navigation bar uses a frosted-glass effect (Backdrop Blur), allowing the vibrant colors of the route and landscapes to peek through, keeping the experience immersive.

### Specialized Components
*   **The Loom Map:** A customized map interface using a simplified, warm-toned cartography style.
*   **Heritage Badges:** Circular, textured icons used to denote the type of weaving or artisan level.