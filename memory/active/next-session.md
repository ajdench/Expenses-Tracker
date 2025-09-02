# Next Session Focus - Double-Click Behavior Fix

## CRITICAL ISSUE TO SOLVE
**User Report**: "Trip cards don't handle this correctly" - Double-click behavior broken on BOTH trip and expense cards

## Current Broken Behavior
- Unselected cards: Double-click opens edit/details (WRONG - should only select)
- Selected cards: Double-click works correctly (opens edit/details)

## Required Pattern
- Unselected card + single-click → Select only
- Unselected card + double-click → Select only (no edit/details)
- Selected card + single-click → Stay selected
- Selected card + double-click → Open edit/details

## Current Code State
- Trip cards: `/ui.js` lines ~748-778 (uses `e.detail >= 2`)
- Expense cards: `/ui.js` lines ~1792-1829 (multiple failed attempts)

## Root Problem
Both card types suffer from same issue: First click of double-click selects the card, second click finds card selected and triggers edit/details.

## Approach for Next Session
1. Remove current double-click logic from both card types
2. Implement proper two-stage selection pattern
3. Test thoroughly with cache-busting URLs
4. Verify both trip and expense cards behave identically

## Test URLs
- Use format: `http://localhost:3000/index.html?v=YYYYMMDD-NN&nosw`
- Current working colors/sizing at: `?v=20250830-11&nosw`