# Design Brief

## Concept
Premium grocery delivery app (Brinjal Fresh Store) with bold lime-green primary and orange accent. Full-width hero banner with food imagery and text overlay. Modern, clean, aspirational aesthetic inspired by Zepto/Blinkit.

## Color Palette

| Name | OKLCH | Usage |
|------|-------|-------|
| Primary (Lime Green) | 0.62 0.19 140 | Buttons, active states, brand accent |
| Accent (Orange) | 0.7 0.18 50 | Highlights, slide indicators, CTAs |
| Background | 0.99 0 0 | Page background |
| Foreground | 0.18 0.02 145 | Body text |
| Muted | 0.96 0.01 145 | Secondary backgrounds |
| Destructive | 0.58 0.22 25 | Error states |

## Typography
- Display: Bricolage Grotesque (bold headlines, 600-800wt)
- Body: Figtree (text, UI, 400-600wt)
- Scale: 12px (xs), 14px (sm), 16px (base), 20px (lg), 24px (xl), 32px (2xl)

## Structural Zones
| Zone | Treatment |
|------|-----------|
| Header | Compact sticky header, lime green text on white |
| Hero Banner | Full-width background image, dark gradient overlay, centered white text, dot indicators |
| Product Rows | Clean card grid, rounded corners, shadow elevation |
| Bottom Nav | Fixed orange bar, 5 tabs |

## Hero Banner (Premium)
- Full-width vegetable background images (fresh tomatoes, onions, leafy greens)
- Semi-transparent dark gradient overlay (top 60% opacity → bottom 40%)
- Centered white headline (bold Bricolage, 24-28px)
- Secondary text overlay (Figtree, 14px white)
- Dot slide indicators at bottom (orange accent for active)
- Smooth 0.5s fade transitions between slides
- Rounded card corners on hero container

## Component Patterns
- Cards: rounded corners (0.75rem), subtle shadow (card), white backgrounds
- Buttons: lime green primary, orange accent for secondary, smooth transitions
- Quantity selectors: inline buttons with green highlight on select
- Product images: high quality, consistent aspect ratio

## Motion & Interactions
- Slide transitions: 0.5s cubic-bezier (fade-in, not linear)
- Dot indicators: smooth opacity transitions
- Button taps: 0.2s feedback
- Auto-rotate: 3-4 second interval per slide

## Constraints
- No animations on scroll (performance)
- Maintain 4.5:1 contrast on all text overlays
- Mobile-first responsive design
- Image compression for fast load times

## Signature Detail
Dark gradient overlay on full-width hero images paired with bold white typography and orange dot indicators creates premium grocery app aesthetic. Aspiration meets functionality.
