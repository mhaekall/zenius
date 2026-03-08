# OpenMenu "Warm iOS" Design System Guide

This document serves as a guideline for the new visual design system implemented in OpenMenu (previously Zenius). The goal is to achieve a "Warm iOS" feel—combining the premium, refined aesthetics of iOS native apps with a warm, welcoming Indonesian identity.

## 1. Typography
We use **Plus Jakarta Sans** as the primary font, falling back to system-ui and Apple's native sans-serif.

### iOS Typography Scale
- **Large Title**: 32px, Bold (700), Tracking: -0.5px, Line Height: 1.2
- **Title 1**: 28px, Bold (700), Tracking: -0.3px, Line Height: 1.25
- **Title 2**: 22px, Semi-Bold (600), Tracking: -0.2px, Line Height: 1.3
- **Headline**: 17px, Semi-Bold (600), Tracking: 0, Line Height: 1.4
- **Body**: 17px, Regular (400), Tracking: 0, Line Height: 1.5
- **Callout**: 15px, Regular (400), Tracking: 0, Line Height: 1.45
- **Subheadline**: 14px, Medium (500), Tracking: 0.1px, Line Height: 1.4
- **Caption 1**: 12px, Regular (400), Tracking: 0.2px, Line Height: 1.4
- **Caption 2**: 11px, Regular (400), Tracking: 0.3px, Line Height: 1.4

*Tailwind Classes*: `.text-ios-large-title`, `.text-ios-body`, etc.

## 2. Color Palette (Warm Theme)
The color palette focuses on soft, warm off-whites and grays instead of stark white and black.

- **Background (`warm-bg`)**: `#FAFAF8`
- **Surface 1 (`warm-surface`)**: `#F5F4F0` - Used for cards and elevated components.
- **Surface 2 (`warm-surface2`)**: `#EEECEA` - Used for inputs and secondary elements.
- **Border (`warm-border`)**: `#E8E6E1`
- **Black (`warm-black`)**: `#1C1917` - Deep warm gray for text, softer than pure black.
- **Dark Stone (`stone-950`)**: `#0C0A09` - Used for interactions (e.g., hover on primary buttons).

## 3. Radii & Shadows (iOS Native Feel)
We use squircle-like smooth radii and multi-layered soft shadows.

### Border Radius
- `ios-xs`: 6px
- `ios-sm`: 10px
- `ios-md`: 14px
- `ios-lg`: 18px
- `ios-xl`: 22px
- `ios-2xl`: 28px

### Shadows
- `ios-sm`: Subtle elevation (`0 1px 3px ... , 0 4px 12px ...`)
- `ios-md`: Medium elevation
- `ios-lg`: Floating elements like Bottom Nav (`0 8px 32px ...`)

## 4. Materials & Effects

### Glassmorphism (Backdrop Blurs)
Four levels of glass effect for navigation and floating elements:
1. `.glass-ultra-thin`: 60% opacity, 8px blur
2. `.glass-thin`: 75% opacity, 16px blur
3. `.glass-regular`: 85% opacity, 20px blur
4. `.glass-thick`: 95% opacity, 24px blur (Used in Bottom Navigation)

### Interactions
- `.ios-press`: A subtle scaling down (`scale: 0.97`) and slight opacity drop when active, mimicking native iOS buttons.

## 5. UI Components Updated
- **Buttons**:
  - Primary: Warm black (`#1C1917`) background with `ios-sm` shadow and `active:scale-[0.97]` for the iOS press effect.
  - Secondary / Outline / Ghost: Utilizes warm surfaces (`#EEECEA`, `#F5F4F0`) and borders.
- **Inputs**: 
  - Filled iOS style using `warm-surface2` (`#EEECEA`), 14px radius, without default borders, active ring with amber focus.
- **Cards**:
  - `bg-[#F5F4F0]` (`warm-surface`), 18px radius, subtle `0.06` black border, and `ios-sm` shadow.
- **Bottom Navigation**:
  - Floating pill-shape (`rounded-[28px]`), using `.glass-thick` and `shadow-ios-lg`. 
  - Active indicators use `#EEECEA` and icons/text transition smoothly between `#A8A29E` (Inactive) and `#1C1917` (Active).
- **Page Loader**:
  - Replaced the violet theme with an elegant amber-gradient pulsing square and iOS caption typography.

## 6. PWA & Web Optimizations
- iOS Safe Area support via CSS environment variables (`env(safe-area-inset-top)` / `bottom`) combined with Tailwind utilities (`.pt-safe`, `.pb-safe`, etc.).
- Over-scroll behavior set to `none` to prevent bouncing body backgrounds.
- Webkit touch callouts, tap highlights, and font-smoothing optimized for Apple devices.
- Meta tags implemented in `index.html` to enable full-screen iOS PWA mode and prevent zooming on inputs.

---
*Note: The brand name across UI has been transitioned from "Zenius" to "OpenMenu" as per the new guidelines.*