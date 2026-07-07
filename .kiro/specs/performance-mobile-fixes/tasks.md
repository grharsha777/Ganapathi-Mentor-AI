# Implementation Plan

## Task Overview

This task list implements comprehensive performance and mobile responsiveness fixes for the Ganapathi Mentor AI application. The fixes target seven key areas: (1) Performance optimization through animation reduction and blur throttling, (2) Mobile zoom enablement via touch-action policy, (3) Footer responsive layout, (4) Chatbot mobile optimization via bottom drawer pattern, (5) Section responsiveness via auto-rows and mobile overrides, (6) Custom cursor touch detection, and (7) GitHub deployment workflow.

## Tasks

- [x] 1. Write bug condition exploration tests (BEFORE implementing fix)
  - **Property 1: Bug Condition** - Performance, Zoom, Layout, and UX Issues on Mobile/Touch
  - **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
  - **DO NOT attempt to fix the tests or the code when they fail**
  - **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
  - **GOAL**: Surface counterexamples that demonstrate the performance degradation, zoom lock, layout overflow, and UX issues
  - **Scoped PBT Approach**: For deterministic bugs, scope properties to concrete failing cases to ensure reproducibility
  - Test implementation details from Bug Condition specification:
    - Performance test: Load landing page on mobile viewport (390px), verify 5 Aurora blobs cause dropped frames (expect <60fps on unfixed code)
    - Zoom lock test: On mobile emulation with touch enabled, attempt pinch-zoom gesture, verify it's blocked by touch-action: manipulation
    - Footer overflow test: Resize viewport to 375px, observe footer heading with whitespace-nowrap, verify horizontal scrollbar appears
    - Chatbot width test: Open chatbot on 390px viewport, verify fixed w-[400px] forces full width and h-full obscures content
    - Bento grid clipping test: View SLIDE 4 on mobile, verify cards clipped at 240px due to auto-rows-[240px]
    - Custom cursor touch test: Enable touch emulation, verify cursor: none hides native pointer
    - 3D tracking mobile test: Open Performance profiler on mobile, move mouse over hero, verify heavy spring calculations execute
  - The test assertions should match the Expected Behavior Properties from design:
    - Aurora blob count should be 2 on mobile with blur(40px)
    - Pinch-zoom should work via touch-action: pan-x pan-y pinch-zoom
    - Footer heading should wrap with clamp(2.5rem,10vw,8rem) and break-words
    - Chatbot should render as side="bottom" with h-[65vh] on mobile
    - Bento grid should use auto-rows-auto allowing content expansion
    - CustomCursor should return null on touch devices
    - 3D tracking should be disabled on mobile (isMobile flag)
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests FAIL (this is correct - it proves the bugs exist)
  - Document counterexamples found to understand root cause:
    - Performance profile shows >50ms scripting time per frame
    - Pinch-zoom gesture fails to trigger zoom
    - Footer heading causes horizontal scrollbar
    - Chatbot obscures 100% of screen content
    - Bento grid cards cut off long text at 240px
    - Native cursor hidden on touch devices
    - Mousemove handlers fire on mobile despite touch input
  - Mark task complete when tests are written, run, and failures are documented
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20, 2.21, 2.22, 2.23, 2.24_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Desktop Behavior and Visual Fidelity
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for desktop interactions (viewport > 640px, pointer: fine):
    - All 5 Aurora blobs render with full blur (80-100px) and animation complexity
    - 3D perspective mouse tracking functions with spring-based rotateX/rotateY/translateX/translateY
    - CustomCursor renders both cursor dots with cursor: none styling
    - Chatbot renders as side="right" with w-[380px] and h-full
    - Sections use min-h-screen and snap-start for full-page snapping
    - backdrop-blur-xl (24px) applies to glass effects
    - Card hover effects (lift, glow, border transitions) animate
    - Gradient blobs maintain color schemes and opacity values
    - Typography scales correctly with responsive clamp values
    - All click/tap handlers function across devices
    - Smooth scroll behavior works
    - Accordion expand/collapse animations function
    - CLI copy button clipboard functionality works
    - Authentication flows function
    - ARIA labels and semantic HTML provide accessibility
    - Keyboard navigation focus states function
    - @media (prefers-reduced-motion: reduce) disables animations
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements:
    - For all desktop viewport widths (> 640px), verify 5 Aurora blobs render with full animation
    - For all pointer: fine devices, verify CustomCursor renders and cursor: none applies
    - For all desktop viewports, verify chatbot renders as side="right" with correct dimensions
    - For all desktop interactions, verify 3D mouse tracking applies spring transformations
    - For all desktop glass elements, verify backdrop-blur-xl (24px) applies
    - For all desktop hover interactions, verify card effects animate
    - For all devices, verify core functionality (auth, clipboard, accordion) works identically
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16, 3.17, 3.18, 3.19, 3.20_

- [ ] 3. Implement performance and mobile responsiveness fixes

  - [x] 3.1 Update global styles (app/globals.css)
    - Move `overscroll-behavior: none` and `cursor: none !important` inside existing `@media (pointer: fine)` block
    - Add new `@media (pointer: coarse)` block with `touch-action: pan-x pan-y pinch-zoom` and `cursor: auto`
    - Inside existing `@media (max-width: 640px)` block, add mobile-specific backdrop-blur overrides:
      - `.glass-card { backdrop-filter: blur(8px); }`
      - `.glass { backdrop-filter: blur(10px); }`
    - Add CSS containment utility: `.contain-section { contain: layout style; }`
    - Add safe-area-inset utility: `.mb-safe { margin-bottom: env(safe-area-inset-bottom, 0px); }` and `.pb-safe { padding-bottom: env(safe-area-inset-bottom, 0px); }`
    - _Bug_Condition: (input.pointerType == 'coarse') OR (input.viewport.width <= 640)_
    - _Expected_Behavior: When pointer: coarse, touch-action: pan-x pan-y pinch-zoom enables zoom. When viewport <= 640px, backdrop-blur reduces to 8-10px_
    - _Preservation: Desktop (pointer: fine) maintains cursor: none and overscroll-behavior: none. Desktop (viewport > 640px) maintains backdrop-blur-xl (24px)_
    - _Requirements: 2.3, 2.6, 2.7, 2.8, 2.24, 3.1, 3.3, 3.14_

  - [x] 3.2 Optimize NeuralLanding component (components/landing/NeuralLanding.tsx)
    - Reduce Aurora blob count on mobile: Wrap 3 desktop-only blobs (Rose/Pink, Teal, Blue core) inside `{!isMobile && (<>...</>)}` conditional
    - Keep only top-left purple and top-right cyan blobs unconditionally rendered
    - Change desktop blob blur from `blur(80-100px)` to conditional: mobile uses `blur(40px)`, desktop uses `blur(80-100px)`
    - Disable 3D mouse tracking on mobile: Modify useEffect that sets up mousemove/mouseleave listeners to check `if (isMobile) return;` at the start
    - Pause MarqueeRow animations on mobile: Pass `paused={isMobile}` prop to all three MarqueeRow instances
    - Add mobile height overrides to hero section: Change `h-screen` to `h-screen max-sm:h-auto max-sm:min-h-0 max-sm:py-16`
    - Add mobile height overrides to all snap sections: Add `max-sm:min-h-0` to all sections with `min-h-screen` class
    - Fix bento grid auto-rows: Change `auto-rows-[240px]` to `auto-rows-auto` in SLIDE 4 bento grid
    - Fix CLI snippet button overflow: Add `overflow-x-auto` to the CLI copy button wrapper
    - Add CSS containment: Add `contain-section` class to all major section elements
    - _Bug_Condition: (input.viewport.width <= 640) AND (input.component == 'NeuralLanding')_
    - _Expected_Behavior: When viewport <= 640px, Aurora blob count == 2 with blur(40px), 3D tracking disabled, MarqueeRow paused, sections use min-h-0, bento grid uses auto-rows-auto_
    - _Preservation: Desktop (viewport > 640px) maintains 5 Aurora blobs with blur(80-100px), 3D tracking with spring animations, min-h-screen sections, auto-rows-[240px] bento grid_
    - _Requirements: 2.1, 2.2, 2.5, 2.18, 2.19, 2.20, 2.21, 2.22, 3.1, 3.2, 3.8_

  - [x] 3.3 Make Footer responsive (components/landing/Footer.tsx)
    - Change giant heading clamp from `clamp(3rem,15vw,12rem)` to `clamp(2.5rem,10vw,8rem)`
    - Remove `whitespace-nowrap` class from heading, ensure `break-words` is present
    - Add `overflow-hidden` to heading wrapper div
    - Verify padding is `pt-16 sm:pt-32 pb-10 sm:pb-20` (already correct)
    - Add `pb-safe` class to footer root element for env(safe-area-inset-bottom)
    - _Bug_Condition: (input.viewport.width <= 640) AND (input.component == 'Footer')_
    - _Expected_Behavior: When viewport <= 640px, heading wraps with clamp(2.5rem,10vw,8rem) and break-words, no horizontal overflow, safe-area-inset-bottom applies_
    - _Preservation: Desktop (viewport > 640px) maintains heading scale with clamp upper bound on wide screens_
    - _Requirements: 2.9, 2.10, 2.11, 2.12, 3.6_

  - [x] 3.4 Optimize ChatPanel for mobile (components/ChatPanel.tsx)
    - Change SheetContent `side` prop from hardcoded `"right"` to conditional: `side={isMobile ? "bottom" : "right"}`
    - Change className from fixed `w-[400px] sm:w-[540px]` to responsive: `cn("flex flex-col glass p-0 gap-0", isMobile ? "w-full h-[65vh] max-h-[65vh] rounded-t-2xl border-t border-border/50" : "w-full sm:w-[380px] sm:h-full border-l-theme")`
    - Add mobile typography: Add `max-sm:text-xs` and `max-sm:p-2.5` to message bubble divs
    - Add safe-area spacing to trigger button: Add `mb-safe` class and `max-sm:bottom-4 max-sm:right-4` to floating trigger button className
    - _Bug_Condition: (input.viewport.width <= 640) AND (input.component == 'ChatPanel')_
    - _Expected_Behavior: When viewport <= 640px (isMobile), chatbot renders as side="bottom" with w-full, h-[65vh], rounded-t-2xl, message bubbles use max-sm:text-xs, trigger button uses mb-safe_
    - _Preservation: Desktop maintains side="right" with w-[380px] and h-full_
    - _Requirements: 2.13, 2.14, 2.15, 2.16, 2.17, 3.7_

  - [ ] 3.5 Fix CustomCursor for touch devices (components/landing/CustomCursor.tsx)
    - Modify the first useEffect to detect touch devices using `window.matchMedia('(pointer: coarse)').matches` and `window.matchMedia('(hover: none)').matches`
    - Set `isTouchDevice` state to `true` if either condition is true
    - Return early from component rendering: `if (isTouchDevice) return null;`
    - _Bug_Condition: (input.pointerType == 'coarse') AND (input.component == 'CustomCursor')_
    - _Expected_Behavior: When pointer: coarse (touch device), CustomCursor returns null (does not render), native cursor visible via cursor: auto from globals.css_
    - _Preservation: Desktop (pointer: fine) CustomCursor continues to render both cursor dots with cursor: none styling, hover scale effects function_
    - _Requirements: 2.23, 2.24, 3.4, 3.5_

  - [~] 3.6 Verify home page overflow handling (app/page.tsx)
    - Verify that main element has `overflow-x-hidden` class (already present - no changes needed)
    - _Bug_Condition: N/A (verification only)_
    - _Expected_Behavior: Main element prevents horizontal scroll_
    - _Preservation: Desktop behavior unchanged_
    - _Requirements: 2.12_

  - [~] 3.7 Verify bug condition exploration tests now pass
    - **Property 1: Expected Behavior** - Performance, Zoom, Layout, and UX Fixes Validated
    - **IMPORTANT**: Re-run the SAME tests from task 1 - do NOT write new tests
    - The tests from task 1 encode the expected behavior
    - When these tests pass, it confirms the expected behavior is satisfied
    - Run bug condition exploration tests from step 1 on FIXED code:
      - Performance test: Verify 2 Aurora blobs render at 60fps on mobile (390px viewport)
      - Zoom test: Verify pinch-zoom gesture works on touch emulation
      - Footer test: Verify heading wraps without horizontal overflow at 375px
      - Chatbot test: Verify bottom drawer renders at h-[65vh] on mobile
      - Bento grid test: Verify cards expand to content with auto-rows-auto
      - Custom cursor test: Verify native cursor visible on touch devices
      - 3D tracking test: Verify no spring calculations execute on mobile
    - **EXPECTED OUTCOME**: Tests PASS (confirms bugs are fixed)
    - If any test fails, investigate and fix before proceeding
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 2.9, 2.10, 2.11, 2.12, 2.13, 2.14, 2.15, 2.16, 2.17, 2.18, 2.19, 2.20, 2.21, 2.22, 2.23, 2.24_

  - [~] 3.8 Verify preservation tests still pass
    - **Property 2: Preservation** - Desktop Behavior Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2 on FIXED code:
      - Desktop Aurora blob test: Verify 5 blobs render with full blur (80-100px) on desktop (1920px)
      - 3D mouse tracking test: Verify spring-based transformations apply on desktop with mouse
      - Custom cursor test: Verify CustomCursor renders both dots with cursor: none on desktop (pointer: fine)
      - Chatbot desktop test: Verify side="right" with w-[380px] h-full renders on desktop (1440px)
      - Section snapping test: Verify min-h-screen and snap-start create full-page snapping on desktop
      - Glass effect test: Verify backdrop-blur-xl (24px) applies to all glass elements on desktop
      - Hover effect test: Verify card lift/glow/border transitions animate on desktop
      - Core functionality test: Verify auth, clipboard, accordion function identically
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - If any test fails, investigate regression and fix before proceeding
    - Confirm all tests still pass after fix (no regressions)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12, 3.13, 3.14, 3.15, 3.16, 3.17, 3.18, 3.19, 3.20_

- [ ] 4. Deploy to Vercel via GitHub workflow

  - [~] 4.1 Commit all changes
    - Stage all modified files: `git add app/globals.css app/layout.tsx components/landing/NeuralLanding.tsx components/landing/Footer.tsx components/ChatPanel.tsx components/landing/CustomCursor.tsx app/page.tsx`
    - Create commit with descriptive message: `git commit -m "fix: performance and mobile responsiveness issues

- Reduce Aurora blob count from 5 to 2 on mobile with blur optimization
- Enable pinch-zoom on touch devices via touch-action policy
- Fix footer horizontal overflow with responsive heading clamp
- Implement bottom drawer chatbot pattern for mobile (65vh)
- Fix bento grid with auto-rows-auto for content expansion
- Disable 3D mouse tracking and MarqueeRow on mobile
- Hide CustomCursor on touch devices
- Add safe-area-inset for iPhone notch spacing
- Add CSS containment for performance isolation
- Apply mobile-specific backdrop-blur reduction (8-10px)
- Add mobile height overrides for sections (max-sm:min-h-0)

Validates: Requirements 2.1-2.24 (Bug Condition), 3.1-3.20 (Preservation)"`
    - _Bug_Condition: N/A (deployment workflow)_
    - _Expected_Behavior: Changes staged and committed with descriptive message_
    - _Preservation: No code changes in this step_
    - _Requirements: 2.25_

  - [~] 4.2 Push to GitHub
    - Push to main branch: `git push origin main`
    - Verify push succeeds without errors
    - _Bug_Condition: N/A (deployment workflow)_
    - _Expected_Behavior: Changes pushed to GitHub main branch_
    - _Preservation: No code changes in this step_
    - _Requirements: 2.25_

  - [~] 4.3 Verify Vercel deployment
    - Navigate to Vercel dashboard and monitor deployment status
    - Wait for auto-deployment to complete (triggered by GitHub push)
    - Verify deployment succeeds without build errors
    - Visit deployed URL: https://ganapathi-mentor-ai.vercel.app/
    - Perform smoke tests:
      - Load landing page on mobile emulation (390px touch) - verify smooth scroll and 2 Aurora blobs
      - Attempt pinch-zoom - verify zoom works
      - Open chatbot on mobile - verify bottom drawer at 65vh
      - Scroll to footer on mobile - verify no horizontal overflow
      - View bento grid on mobile - verify cards expand to content
      - Test on desktop (1920px) - verify 5 blobs, 3D tracking, custom cursor, chatbot sidebar all work
    - _Bug_Condition: (input.viewport.width <= 640) OR (input.pointerType == 'coarse')_
    - _Expected_Behavior: Deployed application exhibits all mobile optimizations and preserves desktop behavior_
    - _Preservation: Desktop functionality remains identical to pre-fix behavior_
    - _Requirements: 2.1-2.24, 3.1-3.20, 2.25_

- [ ] 5. Checkpoint - Ensure all tests pass and deployment is live
  - Run complete test suite (exploration tests + preservation tests) against deployed application
  - Verify all bug condition tests pass (mobile optimizations working)
  - Verify all preservation tests pass (desktop behavior unchanged)
  - Confirm deployment is live at https://ganapathi-mentor-ai.vercel.app/
  - Document any issues or questions that arise for user review
  - If all tests pass and deployment is live, mark specification as complete
  - If any issues arise, ask user for guidance before proceeding

## Notes

- The exploration tests (task 1) MUST be written and run BEFORE implementing fixes (tasks 3.1-3.6)
- The preservation tests (task 2) MUST be written and run on UNFIXED code BEFORE implementing fixes
- Test failures in task 1 are EXPECTED and CORRECT - they confirm the bugs exist
- Test passes in task 2 are EXPECTED and CORRECT - they confirm baseline behavior to preserve
- After implementation, re-run the SAME tests from tasks 1 and 2 (don't write new tests) in tasks 3.7 and 3.8
- The isMobile hook must be imported/used in NeuralLanding.tsx and ChatPanel.tsx
- All responsive classes use Tailwind's max-sm: prefix for mobile-first design
- Safe-area-inset utilities (mb-safe, pb-safe) handle iPhone notch spacing
- CSS containment (contain-section) improves paint performance on large sections
- The GitHub workflow (task 4) should only be executed after all local testing is complete
