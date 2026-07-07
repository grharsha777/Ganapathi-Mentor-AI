/**
 * Bug Condition Exploration Tests for Performance & Mobile Fixes
 * 
 * **CRITICAL**: These tests MUST FAIL on unfixed code - failure confirms the bugs exist
 * **DO NOT attempt to fix the tests or the code when they fail**
 * **NOTE**: These tests encode the expected behavior - they will validate the fixes when they pass after implementation
 * **GOAL**: Surface counterexamples that demonstrate the performance degradation, zoom lock, layout overflow, and UX issues
 * 
 * **Validates: Requirements 2.1-2.24**
 */

import { test, expect, type Page } from '@playwright/test';
import * as fc from 'fast-check';

/**
 * Property 1: Bug Condition - Performance, Zoom, Layout, and UX Issues on Mobile/Touch
 * 
 * For any input where the viewport width is ≤ 640px OR the pointer type is coarse (touch device),
 * the UNFIXED application SHALL exhibit performance degradation, zoom lock, layout overflow, and UX breakage.
 * 
 * After fixes are implemented, these same tests will pass, confirming the expected behavior is satisfied.
 */

test.describe('Bug Condition Exploration - Performance & Mobile Issues (EXPECTED TO FAIL)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to landing page with increased timeout
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 });
    // Wait for the hero section to be visible
    await page.locator('section').first().waitFor({ timeout: 30000 });
  });

  test('Performance: Aurora blob count should be 2 on mobile with blur(40px) - EXPECTS FAILURE', async ({ page }) => {
    // Set mobile viewport (390px - iPhone 13)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(1000); // Allow animations to settle

    // Count Aurora blobs (motion.div elements with radial-gradient background)
    const auroraBlobs = await page.locator('[class*="absolute"][class*="rounded-full"]').filter({
      has: page.locator('[style*="radial-gradient"]')
    }).count();

    // On unfixed code: expects 5 blobs (will fail)
    // On fixed code: expects 2 blobs (will pass)
    expect(auroraBlobs).toBe(2);

    // Check blur filter value on mobile
    const firstBlob = page.locator('[class*="absolute"][class*="rounded-full"]').filter({
      has: page.locator('[style*="radial-gradient"]')
    }).first();
    
    const blurFilter = await firstBlob.evaluate((el: HTMLElement) => {
      const style = window.getComputedStyle(el);
      return style.filter || (el.style as any).filter || '';
    });

    // On unfixed code: expects blur(80px) or blur(100px) (will fail)
    // On fixed code: expects blur(40px) (will pass)
    expect(blurFilter).toContain('blur(40px)');
  });

  test('Zoom Lock: Pinch-zoom should work via touch-action - EXPECTS FAILURE', async ({ page }) => {
    // Enable touch emulation
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Check touch-action CSS property on body
    const touchAction = await page.evaluate(() => {
      const bodyStyle = window.getComputedStyle(document.body);
      return bodyStyle.touchAction;
    });

    // On unfixed code: expects 'manipulation' or 'none' (will fail)
    // On fixed code: expects 'pan-x pan-y pinch-zoom' or similar (will pass)
    expect(touchAction).toMatch(/pan-x|pan-y|pinch-zoom/);
  });

  test('Footer Overflow: Heading should wrap with clamp(2.5rem,10vw,8rem) and break-words - EXPECTS FAILURE', async ({ page }) => {
    // Set small mobile viewport (375px - iPhone SE)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);

    // Scroll to footer
    await page.evaluate(() => {
      const footer = document.querySelector('footer');
      if (footer) footer.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(1000);

    // Find footer heading
    const footerHeading = page.locator('footer h1');
    await expect(footerHeading).toBeVisible();

    // Check font-size clamp
    const fontSize = await footerHeading.evaluate((el: HTMLElement) => {
      return window.getComputedStyle(el).fontSize;
    });

    // On unfixed code: fontSize will be too large causing overflow (will fail)
    // On fixed code: fontSize should be within reasonable mobile range (will pass)
    const fontSizeValue = parseFloat(fontSize);
    expect(fontSizeValue).toBeLessThanOrEqual(128); // 8rem = 128px at 16px base

    // Check for whitespace-nowrap (should NOT be present on fixed code)
    const whiteSpace = await footerHeading.evaluate((el: HTMLElement) => {
      return window.getComputedStyle(el).whiteSpace;
    });

    // On unfixed code: expects 'nowrap' (will fail)
    // On fixed code: expects 'normal' or not 'nowrap' (will pass)
    expect(whiteSpace).not.toBe('nowrap');

    // Check word-break for break-words
    const wordBreak = await footerHeading.evaluate((el: HTMLElement) => {
      return window.getComputedStyle(el).wordBreak;
    });

    // On unfixed code: wordBreak may not be 'break-word' (will fail)
    // On fixed code: expects 'break-word' (will pass)
    expect(wordBreak).toBe('break-word');
  });

  test('Chatbot Width: Should render as side="bottom" with h-[65vh] on mobile - EXPECTS FAILURE', async ({ page }) => {
    // Set mobile viewport (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    // Open chatbot (find and click the trigger button)
    const chatTrigger = page.locator('button').filter({ hasText: /sparkles|assistant|chat/i }).or(
      page.locator('button[class*="fixed"][class*="bottom"]')
    );
    
    if (await chatTrigger.count() > 0) {
      await chatTrigger.first().click();
      await page.waitForTimeout(500);

      // Check SheetContent dimensions
      const sheetContent = page.locator('[role="dialog"], [data-state="open"]').first();
      
      if (await sheetContent.count() > 0) {
        const dimensions = await sheetContent.boundingBox();
        
        if (dimensions) {
          // On unfixed code: width will be ~400px (forced full width) and height will be 100vh (will fail)
          // On fixed code: height should be ~65% of viewport (549px for 844px viewport) (will pass)
          const expectedHeight = 844 * 0.65; // 549px
          
          expect(dimensions.height).toBeGreaterThanOrEqual(expectedHeight - 50);
          expect(dimensions.height).toBeLessThanOrEqual(expectedHeight + 50);
        }
      }
    }
  });

  test('Bento Grid Clipping: Cards should use auto-rows-auto allowing content expansion - EXPECTS FAILURE', async ({ page }) => {
    // Set mobile viewport (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    
    // Scroll to SLIDE 4 (Career & Mastery Bento)
    await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll('section'));
      const slide4 = sections[3]; // SLIDE 4 is the 4th section
      if (slide4) slide4.scrollIntoView({ behavior: 'smooth' });
    });
    await page.waitForTimeout(1500);

    // Find bento grid
    const bentoGrid = page.locator('section').nth(3).locator('div.grid');
    await expect(bentoGrid).toBeVisible();

    // Check grid-auto-rows CSS property
    const gridAutoRows = await bentoGrid.evaluate((el: HTMLElement) => {
      return window.getComputedStyle(el).gridAutoRows;
    });

    // On unfixed code: expects '240px' (will fail)
    // On fixed code: expects 'auto' (will pass)
    expect(gridAutoRows).toBe('auto');
  });

  test('Custom Cursor Touch: Should return null on touch devices - EXPECTS FAILURE', async ({ page }) => {
    // Set mobile viewport with touch enabled
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    // Check if custom cursor elements exist
    const customCursorElements = page.locator('[class*="fixed"][class*="rounded-full"][class*="pointer-events-none"]').filter({
      has: page.locator('[class*="bg-"][class*="blue"], [class*="border-"][class*="blue"]')
    });

    const cursorCount = await customCursorElements.count();

    // On unfixed code: expects 2 cursor elements (will fail)
    // On fixed code: expects 0 cursor elements (CustomCursor returns null) (will pass)
    expect(cursorCount).toBe(0);

    // Check body cursor style
    const bodyCursor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).cursor;
    });

    // On unfixed code: expects 'none' (will fail)
    // On fixed code: expects 'auto' (will pass)
    expect(bodyCursor).toBe('auto');
  });

  test('3D Tracking Mobile: Should be disabled on mobile (isMobile flag) - EXPECTS FAILURE', async ({ page }) => {
    // Set mobile viewport (390px)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(500);

    // Navigate to hero section
    const heroSection = page.locator('section').first();
    await expect(heroSection).toBeVisible();

    // Get initial transform values
    const initialTransform = await page.evaluate(() => {
      const heroTitle = document.querySelector('section h1');
      if (heroTitle) {
        const parent = heroTitle.closest('[style*="rotateX"], [style*="rotateY"]') || heroTitle.parentElement;
        if (parent) {
          return window.getComputedStyle(parent as HTMLElement).transform;
        }
      }
      return 'none';
    });

    // Simulate mouse movement (should not trigger 3D tracking on mobile)
    await page.mouse.move(200, 400);
    await page.waitForTimeout(500);

    const afterTransform = await page.evaluate(() => {
      const heroTitle = document.querySelector('section h1');
      if (heroTitle) {
        const parent = heroTitle.closest('[style*="rotateX"], [style*="rotateY"]') || heroTitle.parentElement;
        if (parent) {
          return window.getComputedStyle(parent as HTMLElement).transform;
        }
      }
      return 'none';
    });

    // On unfixed code: transform will change (spring calculations execute) (will fail)
    // On fixed code: transform should remain 'none' or unchanged (3D tracking disabled) (will pass)
    expect(afterTransform).toBe(initialTransform);
  });

  test('Property-Based: Mobile viewport variations should all have 2 blobs - EXPECTS FAILURE', async ({ page }) => {
    // Property-based test: Generate random mobile viewport widths
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 320, max: 640 }), // Mobile viewport range
        async (viewportWidth) => {
          await page.setViewportSize({ width: viewportWidth, height: 844 });
          await page.waitForTimeout(500);

          // Count Aurora blobs
          const auroraBlobs = await page.locator('[class*="absolute"][class*="rounded-full"]').filter({
            has: page.locator('[style*="radial-gradient"]')
          }).count();

          // On unfixed code: will be 5 for all viewports (will fail)
          // On fixed code: should be 2 for viewports ≤ 640px (will pass)
          expect(auroraBlobs).toBe(2);
        }
      ),
      { numRuns: 5 } // Run 5 random viewport tests
    );
  });
});

/**
 * COUNTEREXAMPLES DOCUMENTATION
 * 
 * Expected failures on UNFIXED code:
 * 
 * 1. Performance Test:
 *    - Counterexample: 5 Aurora blobs render instead of 2
 *    - Counterexample: blur(80px) or blur(100px) instead of blur(40px)
 *    - Root cause: No mobile-specific conditional rendering
 * 
 * 2. Zoom Lock Test:
 *    - Counterexample: touch-action is 'manipulation' or 'none'
 *    - Root cause: Incorrect touch-action directive blocks pinch-zoom
 * 
 * 3. Footer Overflow Test:
 *    - Counterexample: whiteSpace is 'nowrap'
 *    - Counterexample: wordBreak is not 'break-word'
 *    - Root cause: whitespace-nowrap + oversized clamp causes horizontal overflow
 * 
 * 4. Chatbot Width Test:
 *    - Counterexample: Chatbot height is ~844px (100vh) instead of ~549px (65vh)
 *    - Root cause: Fixed dimensions without mobile-specific overrides
 * 
 * 5. Bento Grid Clipping Test:
 *    - Counterexample: gridAutoRows is '240px' instead of 'auto'
 *    - Root cause: Fixed row height prevents content expansion
 * 
 * 6. Custom Cursor Touch Test:
 *    - Counterexample: 2 cursor elements exist (should be 0)
 *    - Counterexample: body cursor is 'none' instead of 'auto'
 *    - Root cause: CustomCursor renders on touch devices without detection
 * 
 * 7. 3D Tracking Mobile Test:
 *    - Counterexample: Transform values change on mouse movement
 *    - Root cause: 3D mouse tracking executes on mobile without isMobile check
 * 
 * 8. Property-Based Test:
 *    - Counterexample: All mobile viewport widths (320-640px) render 5 blobs
 *    - Root cause: No viewport-based conditional rendering
 */
