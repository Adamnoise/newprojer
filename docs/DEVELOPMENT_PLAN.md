# WinMix.hu Development Plan - Launch UI Upgrade

This document outlines the step-by-step plan to upgrade the WinMix.hu application design and components to match the "Launch UI" aesthetic.

## 1. Design System Foundation

**Goal:** Establish the visual language (Colors, Typography, Spacing) based on the Launch UI specification.

- [ ] **Update `app/globals.css`**:
    -   Replace existing HSL color variables with the new **Zinc** (Neutral) and **Brand** (Indigo/Blue) palette.
    -   Implement the Brand color using OKLCH format (e.g., `--brand: oklch(66.5% 0.1804 47.04);`).
    -   Ensure Dark Mode variables are correctly set for a high-contrast, premium look.
    -   Add utility classes for glassmorphism effects if not present.
- [ ] **Typography**:
    -   Confirm usage of `Inter` or `Geist Sans` via `next/font`.
    -   Ensure `text-balance` and `text-pretty` utilities are available.

## 2. Component Development (Modular Approach)

**Goal:** Build reusable, high-quality UI sections as standalone components.

- [ ] **Header Component (`components/landing/Header.tsx`)**:
    -   Sticky positioning with glass-effect background (`backdrop-blur`).
    -   Logo (Left), Navigation (Center), "Get Started" Button (Right).
- [ ] **Hero Section (`components/landing/Hero.tsx`)**:
    -   Impactful H1 with `text-balance`.
    -   Subheadline with `text-muted-foreground`.
    -   Primary (Brand Color) and Secondary (Outline) CTA buttons.
    -   "Trusted By" logo strip with grayscale opacity.
- [ ] **Features Section (`components/landing/Features.tsx`)**:
    -   Implement a "Bento Grid" layout for feature highlights.
    -   Use Lucide React icons for visual cues.
- [ ] **How It Works (`components/landing/HowItWorks.tsx`)**:
    -   Step-by-step visual flow with connecting lines or numbered cards.
- [ ] **Testimonials (`components/landing/Testimonials.tsx`)**:
    -   Scrolling marquee or grid layout for social proof.
- [ ] **Pricing Section (`components/landing/Pricing.tsx`)**:
    -   3-card layout (Starter, Pro, Enterprise).
    -   Highlight "Pro" tier with brand border and badge.
- [ ] **FAQ Section (`components/landing/FAQ.tsx`)**:
    -   Use `shadcn/ui` Accordion component for collapsible questions.
- [ ] **CTA & Footer (`components/landing/Footer.tsx`)**:
    -   Large bottom CTA with gradient background.
    -   Multi-column footer with links and social icons.

## 3. Page Assembly & Integration

**Goal:** Assemble the components into a cohesive Landing Page.

- [ ] **Update `app/page.tsx`**:
    -   Replace the current dashboard-centric view with the new Landing Page structure for unauthenticated users (or move the dashboard to `/dashboard`).
    -   Stack the new components: Header -> Hero -> Features -> HowItWorks -> Testimonials -> Pricing -> FAQ -> Footer.

## 4. Refinement & Polish

**Goal:** Ensure a premium feel and perfect responsiveness.

- [ ] **Mobile Responsiveness**: Verify stacking order and padding on mobile devices.
- [ ] **Dark Mode**: Test all sections in dark mode for contrast and visual appeal.
- [ ] **Animations**: Add subtle entry animations (fade-in, slide-up) using `framer-motion` or Tailwind CSS animations.

## Next Steps

1.  Approve this plan.
2.  Begin with **Phase 1: Design System Foundation** to set up the colors and global styles.
