# Bug Condition Exploration Test Results

## Summary

Bug condition exploration tests have been written for Task 1 of the performance-mobile-fixes bugfix spec. These tests are designed to **FAIL on the UNFIXED code**, which confirms that the bugs exist. Once the fixes are implemented in later tasks, these same tests will pass, validating that the expected behavior has been achieved.

## Test Framework

- **Testing Framework**: Playwright with fast-check (property-based testing)
- **Test File**: `tests/bug-condition-exploration.spec.ts`
- **Configuration**: `playwright.config.ts`

## Tests Written

### 1. Performance: Aurora Blob Count Test
- **Purpose**: Verify that 2 Aurora blobs render on mobile (≤640px) with blur(40px)
- **Current Behavior (Unfixed)**: 5 Aurora blobs render with blur(80-100px)
- **Expected Behavior (After Fix)**: 2 Aurora blobs with blur(40px)
- **Validates**: Requirements 2.1, 2.2

### 2. Zoom Lock Test
- **Purpose**: Verify touch-action allows pinch-zoom on touch devices
- **Current Behavior (Unfixed)**: touch-action is 'manipulation' or 'none', blocking zoom
- **Expected Behavior (After Fix)**: touch-action contains 'pan-x pan-y pinch-zoom'
- **Validates**: Requirements 2.3, 2.6, 2.7, 2.8

### 3. Footer Overflow Test
- **Purpose**: Verify footer heading wraps with clamp(2.5rem,10vw,8rem) and break-words
- **Current Behavior (Unfixed)**: whitespace-nowrap with oversized clamp causes horizontal overflow
- **Expected Behavior (After Fix)**: Heading wraps with smaller clamp, no horizontal overflow
- **Validates**: Requirements 2.9, 2.10, 2.11, 2.12

### 4. Chatbot Width Test
- **Purpose**: Verify chatbot renders as side="bottom" with h-[65vh] on mobile
- **Current Behavior (Unfixed)**: Chatbot renders at full width and h-full (100vh)
- **Expected Behavior (After Fix)**: Bottom drawer at 65vh height
- **Validates**: Requirements 2.13, 2.14, 2.15, 2.16, 2.17

### 5. Bento Grid Clipping Test
- **Purpose**: Verify bento grid uses auto-rows-auto for content expansion
- **Current Behavior (Unfixed)**: auto-rows-[240px] clips content
- **Expected Behavior (After Fix)**: auto-rows-auto allows natural expansion
- **Validates**: Requirements 2.18, 2.22

### 6. Custom Cursor Touch Test
- **Purpose**: Verify CustomCursor returns null on touch devices
- **Current Behavior (Unfixed)**: 2 cursor elements render, cursor style is 'none'
- **Expected Behavior (After Fix)**: 0 cursor elements, cursor style is 'auto'
- **Validates**: Requirements 2.23, 2.24

### 7. 3D Tracking Mobile Test
- **Purpose**: Verify 3D mouse tracking is disabled on mobile (isMobile flag)
- **Current Behavior (Unfixed)**: Transform values change on mouse movement
- **Expected Behavior (After Fix)**: Transform remains unchanged (tracking disabled)
- **Validates**: Requirements 2.19, 2.20, 2.21

### 8. Property-Based: Mobile Viewport Variations Test
- **Purpose**: Verify 2 Aurora blobs render across all mobile viewport widths (320-640px)
- **Current Behavior (Unfixed)**: 5 blobs render for all viewports
- **Expected Behavior (After Fix)**: 2 blobs for all mobile viewports
- **Test Runs**: 5 random viewport widths
- **Validates**: Requirements 2.1, 2.2

## Expected Counterexamples (Documented)

The tests document the following expected failures on unfixed code:

1. **Performance**:
   - Counterexample: 5 Aurora blobs instead of 2
   - Counterexample: blur(80px) or blur(100px) instead of blur(40px)
   - Root cause: No mobile-specific conditional rendering

2. **Zoom Lock**:
   - Counterexample: touch-action is 'manipulation' or 'none'
   - Root cause: Incorrect touch-action directive blocks pinch-zoom

3. **Footer Overflow**:
   - Counterexample: whiteSpace is 'nowrap'
   - Counterexample: wordBreak is not 'break-word'
   - Root cause: whitespace-nowrap + oversized clamp causes horizontal overflow

4. **Chatbot Width**:
   - Counterexample: Chatbot height is ~844px (100vh) instead of ~549px (65vh)
   - Root cause: Fixed dimensions without mobile-specific overrides

5. **Bento Grid Clipping**:
   - Counterexample: gridAutoRows is '240px' instead of 'auto'
   - Root cause: Fixed row height prevents content expansion

6. **Custom Cursor Touch**:
   - Counterexample: 2 cursor elements exist (should be 0)
   - Counterexample: body cursor is 'none' instead of 'auto'
   - Root cause: CustomCursor renders on touch devices without detection

7. **3D Tracking Mobile**:
   - Counterexample: Transform values change on mouse movement
   - Root cause: 3D mouse tracking executes on mobile without isMobile check

8. **Property-Based**:
   - Counterexample: All mobile viewport widths (320-640px) render 5 blobs
   - Root cause: No viewport-based conditional rendering

## Running the Tests

### Run all bug exploration tests:
```bash
npm run test:bug-exploration
```

### Run on specific device:
```bash
npm run test:bug-exploration -- --project="Mobile Chrome"
npm run test:bug-exploration -- --project="Mobile Safari"
```

### Run with UI mode:
```bash
npm run test:ui
```

## Test Execution Notes

- These tests are **expected to FAIL** on the current unfixed codebase
- Test failures confirm that the bugs exist as described in the bug condition specification
- After implementing fixes in Task 3, re-run these tests to verify they pass
- The same tests will be used in Task 3.7 to verify bug fixes

## Next Steps

1. ✅ Task 1 Complete: Bug condition exploration tests written and ready
2. ⏭️ Task 2: Write preservation property tests (before implementing fixes)
3. ⏭️ Task 3: Implement performance and mobile responsiveness fixes
4. ⏭️ Task 3.7: Re-run these tests to verify fixes work correctly

## Task Completion Status

✅ **Task 1 Complete**: Bug condition exploration tests have been:
- Written according to the bug condition specification
- Designed to fail on unfixed code (confirming bugs exist)
- Scoped to specific deterministic failing cases for reproducibility
- Documented with expected counterexamples
- Ready to validate fixes when implemented in Task 3

The tests encode the expected behavior properties from the design document and will serve as the validation mechanism to confirm bugs are fixed in later tasks.
