# Fashcon Project Instructions

## Current State & Recent Changes

### Smooth Scroll Implementation (Lenis)
- **Status:** Experimental (Toggleable via Admin Topbar).
- **Library:** `lenis` and `lenis/react`.
- **Configuration:** Snappy inertial scroll (lerp: 0.1, duration: 1.5).
- **Control:** State managed via Zustand in `src/lib/store.ts`.
- **Toggle:** Located in the **Admin Topbar** (Mouse icon).

### Navbar Animation Optimization
- **Library:** `framer-motion`.
- **Logo:** Hardware-accelerated scaling using `layout` and `animate` props.
- **Text:** The "FASHCON" text collapses smoothly on scroll with opacity and width transitions.
- **Fixes:** 
    - Resolved italic 'N' clipping by adding right-padding safe zones.
    - Switched from layout-heavy CSS transitions to `transform` and `opacity` based motion for 90Hz+ fluidity.

## Development Standards

### Styling
- **Tailwind CSS v4 (Beta):** Use the new `@theme` block in `globals.css` for variables.
- **Vanilla CSS:** Preferred for complex brand-specific components.
- **Hardware Acceleration:** Always use `transform`, `opacity`, and `will-change` for scroll-linked animations to avoid jitter.

### Components
- **Client Components:** Ensure `'use client'` is present for any component using hooks or animation libraries.
- **Responsive Design:** Mobile-first approach is mandatory for this luxury aesthetic.

## Tech Stack
- **Framework:** Next.js 15+ (App Router).
- **Animations:** Framer Motion & GSAP.
- **Smooth Scroll:** Lenis.
- **State:** Zustand.
- **Styling:** Tailwind CSS v4.
- **Fonts:** Geist (Sans), Playfair Display (Serif).
