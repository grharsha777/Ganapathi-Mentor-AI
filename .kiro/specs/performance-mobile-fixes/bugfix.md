# Bugfix Requirements Document

## Introduction

The deployed Ganapathi Mentor AI application at https://ganapathi-mentor-ai.vercel.app/ suffers from critical performance, responsiveness, and mobile usability issues. These defects manifest as lag/jank, zoom-lock on mobile, footer cut-off, wasteful chatbot space allocation, non-responsive sections, broken cursor UX on touch devices, and missing GitHub deployment. The application performs poorly on mobile devices with viewport widths ≤ 640px and exhibits heavy main-thread blocking from Framer Motion animations, excessive mousemove handlers, and backdrop-blur rendering on mobile.

This bugfix addresses performance bottlenecks, mobile responsiveness, touch device UX, and deployment workflow to ensure the application functions optimally across all device types (desktop, tablet, mobile) and pointer input methods (mouse, touch).

## Bug Analysis

### Current Behavior (Defect)

#### 1. Performance Issues

1.1 WHEN the user interacts with the page on any device THEN heavy Framer Motion blob animations run on the main thread causing lag and jank

1.2 WHEN the user moves the mouse over the hero section THEN expensive mousemove handlers fire every frame causing performance degradation

1.3 WHEN the user views the page on mobile (viewport ≤ 640px) THEN backdrop-blur effects render at full strength causing significant GPU overhead

1.4 WHEN Framer Motion animations run THEN will-change CSS properties persist unnecessarily across animation lifecycle

#### 2. Mobile Zoom Lock

2.1 WHEN the user attempts to pinch-zoom on mobile THEN overscroll-behavior: none + touch-action: manipulation prevents zoom/pan gestures

2.2 WHEN the user tries to zoom the page on touch devices THEN the viewport is locked and pinch-zoom is disabled

#### 3. Footer Layout on Mobile

3.1 WHEN the user views the footer on screens < 640px THEN the giant heading with whitespace-nowrap + clamp(4rem,15vw,12rem) overflows horizontally

3.2 WHEN the footer renders on small screens THEN excessive padding (pt-32 pb-20) wastes vertical space

3.3 WHEN the footer renders on iPhone notched devices THEN safe-area-inset-bottom is not applied causing content cut-off

#### 4. Chatbot Space Usage

4.1 WHEN the chatbot SheetContent opens on mobile THEN fixed w-[400px] sm:w-[540px] forces full viewport width wastefully

4.2 WHEN the chatbot opens on mobile THEN it occupies 100% of screen height (h-full) leaving no context of underlying content

4.3 WHEN message bubbles render on mobile THEN font sizes remain desktop-sized reducing readability

#### 5. Non-Responsive Sections

5.1 WHEN the Bento grid renders THEN fixed auto-rows-[240px] prevents cards from expanding to content naturally

5.2 WHEN the hero section renders on mobile THEN heavy 3D perspective mouse tracking continues to execute

5.3 WHEN section snap scrolling applies on mobile THEN viewport height enforcement (min-h-screen) forces awkward scrolling behavior

5.4 WHEN the CLI snippet button renders on small screens THEN overflow-x causes horizontal scrolling issues

#### 6. Custom Cursor on Touch Devices

6.1 WHEN the CustomCursor component renders on touch devices THEN cursor: none !important applies breaking native pointer visibility

6.2 WHEN touch device users interact with the UI THEN the hidden cursor provides no visual feedback

#### 7. GitHub Deployment

7.1 WHEN fixes are completed THEN changes are not pushed to GitHub for Vercel auto-deployment

### Expected Behavior (Correct)

#### 1. Performance Optimizations

2.1 WHEN the user interacts with the page on mobile THEN Aurora blob count SHALL be reduced to 2 (from 5) with reduced animation complexity

2.2 WHEN the user moves the mouse over the hero section THEN mousemove handlers SHALL be throttled or disabled on mobile devices

2.3 WHEN the user views the page on mobile (viewport ≤ 640px) THEN backdrop-blur SHALL be reduced from blur-xl (blur(24px)) to blur(8px) for glass-card and blur(10px) for glass

2.4 WHEN animations complete THEN will-change: auto SHALL be applied inside @media (prefers-reduced-motion: reduce) block

2.5 WHEN heavy sections render THEN contain: layout style SHALL be applied for paint isolation

#### 2. Mobile Zoom Enablement

2.6 WHEN the user attempts to pinch-zoom on touch devices (pointer: coarse) THEN touch-action: pan-x pan-y pinch-zoom SHALL allow zoom and pan gestures

2.7 WHEN the layout renders THEN viewport meta SHALL include initial-scale=1, viewport-fit=cover to ensure proper mobile rendering

2.8 WHEN the user is on a desktop device (pointer: fine) THEN overscroll-behavior: none SHALL apply

#### 3. Footer Mobile Layout

2.9 WHEN the footer giant heading renders on mobile THEN whitespace-nowrap SHALL be changed to break-words and clamp reduced to clamp(2.5rem,10vw,8rem)

2.10 WHEN the footer renders on mobile THEN padding SHALL be reduced to pt-16 pb-10

2.11 WHEN the footer renders on iPhone notched devices THEN padding-bottom: env(safe-area-inset-bottom) SHALL be applied

2.12 WHEN the footer heading renders THEN overflow: hidden + text-overflow: clip SHALL prevent horizontal overflow

#### 4. Chatbot Mobile Optimization

2.13 WHEN the chatbot opens on mobile THEN SheetContent SHALL use w-full (100% width) and change to side="bottom" drawer style

2.14 WHEN the chatbot opens on mobile THEN height SHALL be h-[65vh] (65% viewport height) with rounded-t-2xl styling

2.15 WHEN the chatbot opens on desktop THEN width SHALL be sm:w-[380px] and height SHALL be sm:h-full

2.16 WHEN message bubbles render on mobile THEN font sizes SHALL be reduced using max-sm:text-xs and max-sm:p-2.5

2.17 WHEN the floating trigger button renders THEN mb-safe SHALL be applied for bottom safe area inset

#### 5. Responsive Section Fixes

2.18 WHEN the Bento grid renders THEN auto-rows-[240px] SHALL be changed to auto-rows-auto with min-h-[200px] so cards expand to content

2.19 WHEN the hero section renders on mobile THEN 3D mouse tracking SHALL be disabled (isMobile flag skips spring calculations)

2.20 WHEN section snap scrolling applies on mobile (max-width: 640px) THEN min-h-[auto] SHALL override min-h-screen

2.21 WHEN MarqueeRow renders on mobile THEN animation SHALL pause (paused prop set based on isMobile)

2.22 WHEN the CLI snippet button renders THEN overflow-x: auto SHALL allow horizontal scrolling without breaking layout

#### 6. Custom Cursor Touch Device Fix

2.23 WHEN the CustomCursor component initializes on touch devices (pointer: coarse) THEN it SHALL return null (not render)

2.24 WHEN cursor: none is applied THEN it SHALL only apply on desktop devices via @media (pointer: fine)

#### 7. GitHub Deployment

2.25 WHEN all fixes are verified locally THEN changes SHALL be committed and pushed to GitHub triggering Vercel auto-deployment

### Unchanged Behavior (Regression Prevention)

#### 1. Desktop Performance

3.1 WHEN the user interacts with the page on desktop (viewport > 640px) THEN the system SHALL CONTINUE TO render all 5 Aurora blobs with full animation complexity

3.2 WHEN the user moves the mouse over the hero section on desktop THEN 3D perspective mouse tracking SHALL CONTINUE TO function with spring animations

3.3 WHEN animations run on desktop with (pointer: fine) THEN will-change: transform and backface-visibility: hidden SHALL CONTINUE TO be applied

#### 2. Desktop Cursor

3.4 WHEN the CustomCursor renders on desktop (pointer: fine) THEN cursor: none !important SHALL CONTINUE TO apply and CustomCursor component SHALL CONTINUE TO render

3.5 WHEN desktop users hover over interactive elements THEN cursor scale and hover effects SHALL CONTINUE TO function

#### 3. Desktop Layout

3.6 WHEN the footer renders on desktop THEN large heading with clamp(2.5rem,10vw,8rem) SHALL CONTINUE TO scale appropriately

3.7 WHEN the chatbot opens on desktop THEN side="right" with w-[380px] and h-full SHALL CONTINUE TO function

3.8 WHEN sections render on desktop THEN snap-start and min-h-screen SHALL CONTINUE TO provide full-screen section snapping

#### 4. Core Functionality

3.9 WHEN any interactive element is clicked or tapped THEN event handlers SHALL CONTINUE TO function correctly across all devices

3.10 WHEN the user navigates between sections THEN smooth scroll behavior SHALL CONTINUE TO work

3.11 WHEN accordion items expand in FAQ section THEN animation and state management SHALL CONTINUE TO function

3.12 WHEN the CLI copy button is clicked THEN clipboard copy functionality SHALL CONTINUE TO work

3.13 WHEN the user signs up or logs in THEN authentication flows SHALL CONTINUE TO function

#### 5. Visual Design

3.14 WHEN glass effects render on desktop THEN backdrop-blur-xl SHALL CONTINUE TO apply

3.15 WHEN gradient blobs animate THEN color schemes and opacity values SHALL CONTINUE TO match design system

3.16 WHEN hover effects trigger THEN card lift, glow, and border color transitions SHALL CONTINUE TO function

3.17 WHEN typography renders THEN font families, weights, and responsive clamp values SHALL CONTINUE TO scale correctly on desktop

#### 6. Accessibility

3.18 WHEN screen readers parse the page THEN ARIA labels and semantic HTML SHALL CONTINUE TO provide proper accessibility

3.19 WHEN keyboard navigation is used THEN focus states and tab order SHALL CONTINUE TO function correctly

3.20 WHEN reduced motion is preferred THEN @media (prefers-reduced-motion: reduce) SHALL CONTINUE TO disable animations
