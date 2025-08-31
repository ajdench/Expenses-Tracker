# 2025-08-31-border-color-swipe-bug.md

## Status: OPEN - Critical UX Bug

## Problem: Border color changes on card swipe not visible to user

User requested: "for all cards everywhere, when you initiate a swipe action, the border of the card should immediately change to the colour being revealed."

Implementation completed but user reports "Nothing seen" after testing from Private Windows in macOS with confirmed cache deletion.

## Implementation Details:
✅ **Completed Changes:**
- Trip cards: `borderColor = dx > 0 ? leftColor : rightColor`
- Expense cards: `borderColor = dx > 0 ? COLORS.PURPLE : COLORS.RED`
- Archive expense cards: `borderColor = dx > 0 ? COLORS.GREEN : COLORS.RED`
- Regular expense cards: `borderColor = dx > 0 ? COLORS.GREEN : COLORS.GREY`
- Added `borderWidth = '3px'` for visibility
- All 5 swipe handlers updated (lines ~725, ~784, ~1649, ~1729, ~2153)

## Cause: UNKNOWN - Requires investigation

**Possible causes:**
1. **CSS Conflicts:** Some CSS rule overriding inline styles
2. **DOM Timing:** Border change happening after background change masks it
3. **CSS Specificity:** Bootstrap/existing styles have higher specificity
4. **Element Selection:** Wrong element being targeted
5. **Event Timing:** Changes being reset too quickly

## Investigation Required:
1. Add console.log to verify `card.style.borderColor` is actually being set
2. Check if `card.style` changes persist or get overridden
3. Verify the correct DOM element is being targeted
4. Test with `!important` in inline styles
5. Check if swipe handlers are actually being called

## Files Modified:
- `/ui.js` - Lines around 725, 784, 1649, 1729, 2153
- All swipe implementations in `buildTripCard` and `buildExpenseCard` functions

## Test Commands:
```
http://localhost:3000?v=20250831-VISIBLE-BORDER
```

## Prevention: 
Add debugging/logging to verify DOM manipulation is working as expected before declaring implementation complete.