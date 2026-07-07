# Performance & Mobile Fixes Bugfix Design

## Overview

The Ganapathi Mentor AI application suffers from critical performance degradation, mobile responsiveness failures, and touch device UX breakage. The bugs manifest as main-thread blocking from heavy Framer Motion animations, zoom-lock from improper touch-action directives, footer horizontal overflow on small screens, wasteful chatbot space allocation, non-responsive bento grid layouts, broken cursor UX on touch devices, and missing GitHub deployment workflow.

This design provides a comprehensive fix strategy targeting: (1) Performance optimization through animation reduction, blur throttling, and CSS containment; (2) Mobile zoom enablement via touch-action policy adjustment; (3) Footer responsive layout via text wrapping and safe-area-inset; (4) Chatbot mobile optimization via bottom drawer pattern; (5) Section responsiveness via auto-rows and mobile-specific overrides; (6) Custom cursor touch detection; (7) GitHub deployment workflow.

## Glossary

- **Bug_Condition (C)**: The condition that triggers performance degradation, layout overflow, or UX breakage - when viewport ≤ 640px OR pointer input type is coarse (touch) OR specific component renders with fixed dimensions
- **Property (P)**: The desired behavior for mobile/touch devices - smooth 60fps performance, pinch-zoom enabled, responsive layouts, appropriate chatbot sizing, disabled 3D tracking, visible native cursor
- **Preservation**: Desktop (viewport > 640px, pointer: fine) behavior that must remain unchanged - full animation complexity, 3D mouse tracking, custom cursor, full-width chatbot, min-h-screen sections
- **Aurora Blob**: Animated gradient circles in the hero section created with Framer Motion - 5 on desktop, should be reduced to 2 on mobile
- **3D Mouse Tracking**: Heavy spring-based mousemove handlers that apply rotateX, rotateY, translateX, translateY transformations based on cursor position
- **Backdrop-blur**: CSS filter that creates frosted glass effect - blur-xl (24px) on desktop should be reduced to blur(8-10px) on mobile
- **Touch-action**: CSS property controlling gesture behavior - currently set to manipulation which blocks pinch-zoom on mobile
- **Safe-area-inset**: CSS environment variable for iPhone notch spacing - env(safe-area-inset-bottom) ensures content isn't cut off
- **Sheet Component**: Shadcn UI drawer/modal component - currently renders as side="right" on all devices, should use side="bottom" on mobile
- **Bento Grid**: CSS Grid layout for feature cards - currently uses fixed auto-rows-[240px] preventing content expansion
- **CustomCursor**: React component rendering custom animated cursor - should only render on pointer: fine devices
- **isMobile Hook**: Custom React hook detecting mobile viewport via window.matchMedia

## Bug Details

### Bug Condition

The bugs manifest when users interact with the application on mobile devices (viewport ≤ 640px) or touch-enabled devices (pointer: coarse). The application executes desktop-optimized code paths without mobile-specific adaptations, resulting in performance degradation, layout overflow, and broken touch interactions.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { viewport: Dimensions, pointerType: PointerType, component: ComponentName }
  OUTPUT: boolean
  
  RETURN (input.viewport.width <= 640 AND input.component IN ['NeuralLanding', 'Footer', 'ChatPanel'])
         OR (input.pointerType == 'coarse' AND input.component IN ['CustomCursor', 'globals.css'])
         OR (input.component == 'ChatPanel' AND input.viewport.width <= 640)
         OR (input.component == 'Footer' AND input.viewport.width <= 640)
         OR (input.component == 'NeuralLanding' AND input.viewport.width <= 640)
END FUNCTION
```

### Examples

**Performance Degradation:**
- User on iPhone 13 (viewport 390px) loads landing page → 5 Aurora blobs animate at 20fps with janky scrolling (Expected: 2 blobs at 60fps)
- User on iPad (viewport 768px, touch) moves finger across hero section → mousemove handlers fire causing lag (Expected: handlers disabled on touch)
- User on Android (viewport 412px) views glass cards → backdrop-blur-xl (24px) causes GPU overdraw (Expected: blur(8px) for optimal performance)

**Mobile Zoom Lock:**
- User on iPhone 14 Pro pinches landing page → no zoom occurs due to touch-action: manipulation (Expected: pinch-zoom enabled via touch-action: pan-x pan-y pinch-zoom)
- User on Samsung Galaxy S23 tries to pan-and-zoom → overscroll-behavior: none blocks gesture (Expected: overscroll-behavior only on desktop)

**Footer Horizontal Overflow:**
- User on iPhone SE (viewport 375px) views footer → heading "GANAPATHI AI" with whitespace-nowrap + clamp(3rem,15vw,12rem) overflows horizontally (Expected: break-words with clamp(2.5rem,10vw,8rem))
- User on notched iPhone views footer → content cut off at bottom (Expected: pb-safe with env(safe-area-inset-bottom))

**Chatbot Space Wastage:**
- User on mobile (viewport 390px) opens chatbot → fixed w-[400px] forces full width, h-full obscures all content (Expected: side="bottom" drawer with h-[65vh])
- User taps chatbot trigger on iPhone → button renders without safe-area spacing (Expected: mb-safe applied)

**Non-Responsive Sections:**
- User views bento grid on mobile → cards clipped at 240px despite longer content (Expected: auto-rows-auto with min-h-[200px])
- User on tablet (viewport 640px, touch) moves finger on hero → 3D spring calculations execute wastefully (Expected: disabled via isMobile check)
- User scrolls sections on mobile → min-h-screen forces awkward full-viewport sections (Expected: max-sm:min-h-0 override)

**Custom Cursor on Touch:**
- User taps links on iPad → cursor: none !important hides native pointer causing confusion (Expected: CustomCursor returns null on touch, cursor: auto applied)

## Expected Behavior

### Bug Condition Requirements (When C(X) holds)

**Performance Optimizations (Mobile Devices):**

When viewport ≤ 640px:
- Aurora blob count SHALL be reduced from 5 to 2 (conditional rendering in JSX)
- Aurora blob blur SHALL be reduced from blur(80-100px) to blur(40px)
- 3D mouse tracking SHALL be disabled (isMobile flag skips spring value updates)
- MarqueeRow animations SHALL pause (paused prop set based on isMobile)
- Backdrop-blur SHALL be reduced: blur-xl → blur(8px) for glass-card, blur(10px) for glass
- CSS containment SHALL apply via contain: layout style on section elements

When pointer: fine (desktop):
- overscroll-behavior: none SHALL apply to body
- cursor: none !important SHALL apply to body and interactive elements
- will-change: transform and backface-visibility: hidden SHALL persist

When @media (prefers-reduced-motion: reduce):
- will-change: auto SHALL override all animations

**Mobile Zoom Enablement:**

When pointer: coarse (touch devices):
- touch-action: pan-x pan-y pinch-zoom SHALL replace touch-action: manipulation
- cursor: auto SHALL replace cursor: none
- overscroll-behavior SHALL NOT apply (allow native scroll bounce)

In app/layout.tsx viewport config:
- maximumScale: 5 SHALL allow up to 5x zoom
- viewportFit: 'cover' SHALL ensure proper rendering on notched devices

**Footer Mobile Layout:**

When viewport ≤ 640px in Footer.tsx:
- Giant heading clamp SHALL change from clamp(3rem,15vw,12rem) to clamp(2.5rem,10vw,8rem)
- whitespace-nowrap SHALL change to break-words
- overflow: hidden SHALL be added to prevent horizontal scroll
- Padding SHALL reduce from pt-32 pb-20 to pt-16 sm:pt-32 pb-10 sm:pb-20
- pb-safe class SHALL apply for env(safe-area-inset-bottom)

**Chatbot Mobile Optimization:**

When isMobile returns true in ChatPanel.tsx:
- SheetContent side prop SHALL change from "right" to "bottom"
- Width SHALL be w-full (100%)
- Height SHALL be h-[65vh] max-h-[65vh] (65% of viewport)
- Border radius SHALL apply rounded-t-2xl
- Desktop styles SHALL remain: sm:w-[380px] sm:h-full side="right"

Message bubble mobile styles:
- Font size SHALL reduce via max-sm:text-xs
- Padding SHALL reduce via max-sm:p-2.5

Floating trigger button:
- mb-safe class SHALL apply for safe-area-inset-bottom
- Mobile positioning SHALL adjust: max-sm:bottom-4 max-sm:right-4

**Responsive Section Fixes:**

Bento Grid (SLIDE 4):
- auto-rows-[240px] SHALL change to auto-rows-auto
- min-h-[200px] SHALL be added to all grid items

Hero Section (SLIDE 1):
- isMobile check SHALL skip 3D mouse tracking setup
- Mobile height SHALL override: max-sm:h-auto max-sm:min-h-0 max-sm:py-16

All sections with snap-start:
- Mobile height override SHALL apply: max-sm:min-h-0

CLI snippet button:
- overflow-x: auto SHALL allow horizontal scrolling without layout break

**Custom Cursor Touch Device Fix:**

In CustomCursor.tsx:
- useEffect SHALL detect touch via window.matchMedia('(pointer: coarse)').matches
- If touch detected, component SHALL return null (early exit)

In globals.css:
- cursor: none !important SHALL only apply within @media (pointer: fine) block

### Preservation Requirements

**Unchanged Behaviors:**

Desktop Performance (viewport > 640px):
- All 5 Aurora blobs SHALL continue to render with full animation complexity
- Blur values SHALL remain blur(80-100px) on desktop
- 3D perspective mouse tracking SHALL continue to function with spring animations
- MarqueeRow animations SHALL continue to run
- backdrop-blur-xl (24px) SHALL continue to apply to glass effects

Desktop Cursor (pointer: fine):
- CustomCursor component SHALL continue to render both cursor dots
- cursor: none !important SHALL continue to apply to body and interactive elements
- Hover scale effects on CustomCursor SHALL continue to function

Desktop Layout:
- Footer giant heading SHALL continue to scale with clamp(2.5rem,10vw,8rem) upper bound on wide screens
- Chatbot SHALL continue to render as side="right" with w-[380px] and h-full on desktop
- Sections SHALL continue to use min-h-screen and snap-start on desktop

Core Functionality:
- All click/tap event handlers SHALL continue to function across devices
- Smooth scroll behavior SHALL continue to work
- Accordion expand/collapse animations SHALL continue to function
- CLI copy button clipboard functionality SHALL continue to work
- Authentication flows SHALL continue to function

Visual Design:
- Gradient blobs SHALL maintain color schemes and opacity values
- Card hover effects (lift, glow, border transitions) SHALL continue to function on desktop
- Typography font families, weights, and responsive clamp values SHALL continue to scale correctly

Accessibility:
- ARIA labels and semantic HTML SHALL continue to provide proper accessibility
- Keyboard navigation focus states SHALL continue to function
- @media (prefers-reduced-motion: reduce) SHALL continue to disable animations

**Scope:**

All inputs that do NOT involve mobile viewport (width > 640px) OR touch pointer (pointer: fine) should be completely unaffected by this fix. This includes:
- Desktop mouse interactions and hover effects
- Desktop layout dimensions and spacing
- Desktop animation complexity and spring configurations
- Desktop custom cursor rendering and behavior
- Desktop section snapping and full-height layouts

## Hypothesized Root Cause

Based on the bug description and code analysis, the most likely issues are:

1. **Performance Bottlenecks**: The NeuralLanding component renders 5 Aurora blobs with expensive Framer Motion animations and blur filters without mobile-specific optimizations. The 3D mouse tracking setup uses heavy spring calculations (damping: 12, stiffness: 40, mass: 3) that execute on every mousemove event without pointer-type detection. The globals.css applies backdrop-blur-xl (24px) universally without responsive overrides, causing GPU overdraw on mobile GPUs.

2. **Mobile Zoom Lock**: The globals.css file applies overscroll-behavior: none and touch-action: manipulation universally to all devices. The @media (pointer: fine) check only wraps cursor: none styles but not the scroll/touch restrictions. The touch-action: manipulation directive specifically blocks pinch-zoom gestures that require multi-touch input.

3. **Footer Layout Overflow**: The Footer.tsx component uses whitespace-nowrap on the giant heading combined with an oversized clamp(3rem,15vw,12rem) that exceeds mobile viewport width. The padding values pt-32 pb-20 waste vertical space on small screens. The footer lacks pb-safe class and env(safe-area-inset-bottom) for iPhone notch spacing.

4. **Chatbot Fixed Dimensions**: The ChatPanel.tsx component uses fixed width w-[400px] sm:w-[540px] that forces full mobile viewport width. The SheetContent always uses side="right" without mobile-specific side="bottom" drawer pattern. The component renders at h-full (100% viewport height) obscuring all underlying content. Message bubbles use desktop font sizes without max-sm: responsive classes.

5. **Non-Responsive Grid and Sections**: The bento grid uses fixed auto-rows-[240px] preventing cards from expanding to content naturally. The hero section and all other sections use min-h-screen without max-sm:min-h-0 override causing awkward full-viewport scrolling on mobile. The 3D mouse tracking setup in NeuralLanding doesn't check isMobile before attaching event listeners. The MarqueeRow component animates on mobile without paused state.

6. **Custom Cursor on Touch**: The CustomCursor component doesn't detect touch devices before rendering. The useEffect runs universally without checking window.matchMedia('(pointer: coarse)').matches. The globals.css applies cursor: none !important outside of @media (pointer: fine) block affecting touch devices.

7. **Missing Deployment Workflow**: Changes are being made locally but not committed and pushed to GitHub. Vercel's auto-deployment relies on GitHub pushes to trigger builds and deployments.

## Correctness Properties

Property 1: Bug Condition - Performance, Zoom, Layout, and UX Fixes on Mobile/Touch

_For any_ input where the viewport width is ≤ 640px OR the pointer type is coarse (touch device), the fixed application SHALL render with reduced animation complexity (2 Aurora blobs, paused marquee, disabled 3D tracking, reduced blur), enable pinch-zoom gestures (touch-action: pan-x pan-y pinch-zoom), display responsive layouts (wrapped footer text with safe-area-inset, bottom-drawer chatbot at 65vh, auto-sized bento grid), and show native cursor (CustomCursor returns null, cursor: auto), resulting in smooth 60fps performance, functional zoom controls, no horizontal overflow, appropriate component sizing, and visible touch feedback.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20, 2.21, 2.22, 2.23, 2.24**

Property 2: Preservation - Desktop Behavior and Visual Fidelity

_For any_ input where the viewport width is > 640px AND the pointer type is fine (mouse/trackpad), the fixed application SHALL produce exactly the same behavior as the original application, preserving all 5 Aurora blobs with full animation complexity, 3D mouse tracking with spring-based transformations, custom cursor rendering with cursor: none styling, full-width chatbot drawer (w-[380px]), min-h-screen section snapping, backdrop-blur-xl glass effects, hover interactions, gradient color schemes, and accessibility features.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16, 3.17, 3.18, 3.19, 3.20**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `neural-code-symbiosis/app/globals.css`

**Function**: Global styles and media queries

**Specific Changes**:
1. **Move touch-action and overscroll-behavior inside pointer-type media queries**:
   - Wrap `overscroll-behavior: none` and `cursor: none !important` inside existing `@media (pointer: fine)` block
   - Add new `@media (pointer: coarse)` block with `touch-action: pan-x pan-y pinch-zoom` and `cursor: auto`
   
2. **Add mobile-specific backdrop-blur overrides**:
   - Inside existing `@media (max-width: 640px)` block, add `.glass-card { backdrop-filter: blur(8px); }` and `.glass { backdrop-filter: blur(10px); }`

3. **Add CSS containment utility**:
   - Add `.contain-section { contain: layout style; }` to utilities layer

4. **Add safe-area-inset utility**:
   - Add `.mb-safe { margin-bottom: env(safe-area-inset-bottom, 0px); }` to utilities layer

**File**: `neural-code-symbiosis/app/layout.tsx`

**Function**: RootLayout viewport configuration

**Specific Changes**:
1. **Update viewport export**:
   - Ensure `maximumScale: 5` is set (already present)
   - Ensure `viewportFit: 'cover'` is set (already present)
   - These values are already correct in the current code

**File**: `neural-code-symbiosis/components/landing/NeuralLanding.tsx`

**Function**: Main landing page component with Aurora blobs, 3D tracking, bento grid

**Specific Changes**:
1. **Reduce Aurora blob count on mobile**:
   - Wrap the 3 desktop-only Aurora blobs (Rose/Pink, Teal, Blue core) inside `{!isMobile && (<>...</>)}` conditional
   - Keep only the top-left purple and top-right cyan blobs unconditionally rendered
   - Change desktop blob blur from `blur(80-100px)` to conditional: mobile uses `blur(40px)`, desktop uses `blur(80-100px)`

2. **Disable 3D mouse tracking on mobile**:
   - Modify the useEffect that sets up mousemove/mouseleave listeners to check `if (isMobile) return;` at the start
   - This prevents spring calculations and event listener attachment on mobile

3. **Pause MarqueeRow animations on mobile**:
   - Pass `paused={isMobile}` prop to all three MarqueeRow instances
   - MarqueeRow already has logic to handle paused state

4. **Add mobile height overrides to hero section**:
   - Change hero section className from `h-screen` to `h-screen max-sm:h-auto max-sm:min-h-0 max-sm:py-16`

5. **Add mobile height overrides to all snap sections**:
   - Add `max-sm:min-h-0` to all sections with `min-h-screen` class

6. **Fix bento grid auto-rows**:
   - Change `auto-rows-[240px]` to `auto-rows-auto` in SLIDE 4 bento grid
   - All grid items already have `min-h-[200px]` so no additional changes needed

7. **Fix CLI snippet button overflow**:
   - Add `overflow-x-auto` to the CLI copy button wrapper

8. **Add CSS containment**:
   - Add `contain-section` class to all major section elements

**File**: `neural-code-symbiosis/components/landing/Footer.tsx`

**Function**: Footer component with giant heading

**Specific Changes**:
1. **Make giant heading responsive**:
   - Change heading from `clamp(3rem,15vw,12rem)` to `clamp(2.5rem,10vw,8rem)`
   - Remove `whitespace-nowrap` class (currently in string: "text-[clamp(...)] font-black uppercase tracking-[-0.05em] text-white leading-none break-words")
   - Ensure `break-words` is present (it's already there)
   - Add `overflow-hidden` to heading wrapper div

2. **Reduce mobile padding**:
   - Change top section padding from `pt-16 sm:pt-32 pb-10 sm:pb-20` to `pt-16 sm:pt-32 pb-10 sm:pb-20` (already correct, just verify)
   - Add `pb-safe` class to footer root element

**File**: `neural-code-symbiosis/components/ChatPanel.tsx`

**Function**: Chatbot drawer/sheet component

**Specific Changes**:
1. **Make SheetContent responsive**:
   - Change SheetContent `side` prop from hardcoded `"right"` to conditional: `side={isMobile ? "bottom" : "right"}`
   - Change className from fixed `w-[400px] sm:w-[540px]` to responsive: `w-full sm:w-[380px]`
   - Add mobile height constraint: `h-[65vh] max-h-[65vh]` on mobile, `sm:h-full` on desktop
   - Add mobile border radius: `rounded-t-2xl` on mobile
   - Update className to: `cn("flex flex-col glass p-0 gap-0", isMobile ? "w-full h-[65vh] max-h-[65vh] rounded-t-2xl border-t border-border/50" : "w-full sm:w-[380px] sm:h-full border-l-theme")`

2. **Add mobile typography**:
   - Add `max-sm:text-xs` and `max-sm:p-2.5` to message bubble divs

3. **Add safe-area spacing to trigger button**:
   - Add `mb-safe` class to floating trigger button
   - Update button className to include `max-sm:bottom-4 max-sm:right-4`

**File**: `neural-code-symbiosis/components/landing/CustomCursor.tsx`

**Function**: Custom cursor component

**Specific Changes**:
1. **Add touch device detection**:
   - Modify the first useEffect to detect touch devices using `window.matchMedia('(pointer: coarse)').matches` and `window.matchMedia('(hover: none)').matches`
   - Set `isTouchDevice` state to `true` if either condition is true
   - Return early from component rendering: `if (isTouchDevice) return null;`

**File**: `neural-code-symbiosis/app/page.tsx`

**Function**: Home page wrapper

**Specific Changes**:
1. **Ensure overflow-x hidden**:
   - Verify that main element has `overflow-x-hidden` class (already present)

**File**: Git workflow

**Function**: Deployment to Vercel

**Specific Changes**:
1. **Commit and push changes**:
   - After all file changes are verified locally, stage all modified files
   - Create commit with message: "fix: performance and mobile responsiveness issues"
   - Push to GitHub main branch to trigger Vercel auto-deployment

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bugs on unfixed code, then verify the fixes work correctly and preserve existing desktop behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the performance, layout, and UX bugs BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Run the application locally on mobile viewport (390px) and desktop viewport (1920px), interact with each buggy component, and document observed failures. Use Chrome DevTools mobile emulation with touch simulation enabled. Measure performance via Performance tab to identify main-thread blocking. Run tests on UNFIXED code to observe failures and understand root cause.

**Test Cases**:
1. **Performance Lag Test**: Load landing page on mobile emulation (iPhone 13, 390px), scroll through sections while recording Performance profile → expect 5 Aurora blobs rendering with dropped frames, heavy scripting from mousemove handlers, GPU-bound rendering from backdrop-blur-xl (will fail on unfixed code)

2. **Zoom Lock Test**: On mobile emulation with touch enabled, attempt pinch-zoom gesture on landing page → expect zoom to be blocked due to touch-action: manipulation (will fail on unfixed code)

3. **Footer Overflow Test**: Resize viewport to 375px (iPhone SE), scroll to footer, observe giant heading → expect horizontal overflow scrollbar due to whitespace-nowrap + oversized clamp (will fail on unfixed code)

4. **Chatbot Width Test**: Open chatbot on 390px mobile viewport → expect fixed w-[400px] forcing full width, h-full obscuring content (will fail on unfixed code)

5. **Bento Grid Clipping Test**: View SLIDE 4 on mobile, observe "AI Learning Paths" card content → expect content clipped at 240px due to auto-rows-[240px] (will fail on unfixed code)

6. **Custom Cursor Touch Test**: Enable touch emulation in DevTools, move finger over links → expect cursor: none hiding native pointer (will fail on unfixed code)

7. **3D Tracking Mobile Test**: Open Performance profiler on mobile emulation, move mouse over hero section → expect heavy spring calculations executing wastefully (will fail on unfixed code)

**Expected Counterexamples**:
- Performance profile shows >50ms scripting time per frame on mobile due to 5 blob animations + 3D tracking
- Pinch-zoom gesture fails to trigger zoom due to touch-action policy
- Footer heading causes horizontal scrollbar on 375px viewport
- Chatbot obscures 100% of screen content on mobile
- Bento grid cards cut off long text at 240px height
- Native cursor hidden on touch devices causing UX confusion
- Mousemove handlers fire on mobile despite touch input

Possible root causes confirmed: mobile-specific optimizations missing, touch-action directive too restrictive, fixed dimensions preventing responsive layout, pointer-type detection absent

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (mobile viewport ≤ 640px OR touch device), the fixed application produces the expected behavior.

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := fixedApplication(input)
  ASSERT expectedBehavior(result)
END FOR
```

**Expected Behavior:**
- Aurora blob count == 2 on mobile, blur == 40px
- 3D mouse tracking disabled (no spring calculations) on mobile
- MarqueeRow paused on mobile
- Backdrop-blur reduced to 8-10px on mobile
- Pinch-zoom gesture works on touch devices (touch-action: pan-x pan-y pinch-zoom)
- Footer heading wraps correctly without horizontal overflow
- Footer applies safe-area-inset-bottom on iPhone
- Chatbot renders as bottom drawer (h-[65vh]) on mobile
- Chatbot renders as right sidebar (w-[380px] h-full) on desktop
- Bento grid cards expand to content (auto-rows-auto)
- Sections use min-h-0 override on mobile
- CustomCursor returns null on touch devices
- Native cursor visible (cursor: auto) on touch devices
- Performance profile shows <16ms per frame on mobile (60fps)

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (desktop viewport > 640px AND pointer: fine), the fixed application produces the same result as the original application.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT originalApplication(input) = fixedApplication(input)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain (different desktop viewport widths: 1024px, 1440px, 1920px, 2560px)
- It catches edge cases that manual unit tests might miss (viewport exactly 641px, pointer: fine with touch screen hybrid)
- It provides strong guarantees that behavior is unchanged for all non-buggy inputs

**Test Plan**: Observe behavior on UNFIXED code first for desktop interactions (mouse hover effects, full blob animations, custom cursor, chatbot sidebar), then write property-based tests capturing that behavior. Run tests on FIXED code to ensure preservation.

**Test Cases**:
1. **Desktop Aurora Blob Preservation**: On desktop viewport (1920px), verify 5 Aurora blobs render with full blur (80-100px) and animation complexity → behavior unchanged
2. **3D Mouse Tracking Preservation**: On desktop with mouse, move cursor over hero section, verify spring-based rotateX/rotateY/translateX/translateY apply → behavior unchanged
3. **Custom Cursor Preservation**: On desktop (pointer: fine), verify CustomCursor renders both dots, cursor: none applies, hover scale effects work → behavior unchanged
4. **Chatbot Desktop Preservation**: On desktop viewport (1440px), open chatbot, verify side="right" with w-[380px] h-full renders → behavior unchanged
5. **Section Snapping Preservation**: On desktop, scroll through sections, verify min-h-screen and snap-start create full-page snapping → behavior unchanged
6. **Glass Effect Preservation**: On desktop, verify backdrop-blur-xl (24px) applies to all glass elements → behavior unchanged
7. **Hover Effect Preservation**: On desktop, hover over cards, verify lift/glow/border transitions animate → behavior unchanged

**Expected Results:**
- All desktop visual effects remain identical
- All desktop animations execute with same complexity
- All desktop hover interactions function identically
- All desktop layout dimensions match original
- All core functionality (auth, clipboard, accordion) works identically

### Unit Tests

- Test isMobile hook returns true for viewport ≤ 640px, false for > 640px
- Test CustomCursor detects touch devices correctly using matchMedia
- Test MarqueeRow paused prop stops animation
- Test SheetContent side prop switches based on isMobile
- Test Footer heading clamp calculation at various viewport widths
- Test globals.css media query application for pointer: fine vs pointer: coarse
- Test safe-area-inset-bottom calculation on notched device simulation

### Property-Based Tests

- Generate random viewport widths (200px - 3000px) and verify mobile/desktop thresholds trigger correct behavior
- Generate random pointer types (fine, coarse, none) and verify cursor/touch-action policies apply correctly
- Generate random content lengths for bento grid cards and verify auto-rows-auto allows natural expansion
- Generate random device configurations (iPhone, iPad, desktop) and verify responsive layouts adapt appropriately

### Integration Tests

- Full user flow: Load landing page on mobile (390px touch) → verify smooth 60fps scroll → attempt pinch-zoom → verify zoom works → open chatbot → verify bottom drawer at 65vh → navigate to footer → verify no horizontal overflow and safe-area spacing
- Full user flow: Load landing page on desktop (1920px mouse) → verify 5 blobs animate → move mouse over hero → verify 3D tracking works → hover cards → verify custom cursor scales → open chatbot → verify right sidebar at 380px
- Cross-device flow: Start on mobile → verify mobile optimizations → resize to desktop → verify desktop behavior restored → resize back to mobile → verify mobile optimizations re-apply
- Touch-to-mouse flow: Load on touch device → verify cursor: auto and CustomCursor null → switch to mouse input → verify behavior persists (no dynamic switching within session)
