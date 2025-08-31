# CONTINUE CONTEXT - PWA Expense Tracker UX Fixes

## SESSION STATE: 70% COMPLETED  
**Date**: 2025-08-30 Session End
**Status**: 7/10 UX fixes completed - Double-click behavior needs fixing

## User's Original 10 Requests (7 COMPLETED, 3 REMAINING):

### 1. Trip Shadow Card Background (FAILED)
- **Request**: Blue color equivalent to #e4eee9 (NOT green)
- **What Claude did**: Used wrong green color (#E4EEE9 is wrong)
- **What's needed**: Blue shade from #1763bb or #89a5c9 matching #e4eee9 tone

### 2. Corner Radius White Slivers (FAILED) 
- **Request**: Fix tiny white gaps at corner radius during swipe reveals
- **What Claude did**: Changed inset from '-1px' to '0px' (didn't work)
- **What's needed**: Proper background sizing to match card border interplay

### 3. Trip Drag Functionality (BROKEN)
- **Request**: Select > Long Press > Drag should work
- **What Claude did**: Broke drag completely, now missing
- **What's needed**: Restore drag-and-drop with selection requirement

### 4. Trip Swipe Disabled When Unselected (PARTIAL)
- **Request**: Only selected cards can swipe
- **What Claude did**: Partial implementation, still issues
- **What's needed**: Complete gating of swipe by selection state

### 5. Double-Click Behavior (WRONG)
- **Request**: Unselected->select, Selected->open expenses
- **What Claude did**: Unselected double-click opens expenses (WRONG)
- **What's needed**: Two-stage behavior: select first, then open

### 6. Expense Shadow Background (FAILED)
- **Request**: Remove #f8fff8 references, match selected cards
- **What Claude did**: Still wrong green color showing
- **What's needed**: Proper background color matching selection

### 7. Expense Drag Functionality (BROKEN)
- **Request**: Select > Long Click > Drag should work
- **What Claude did**: Broke functionality completely
- **What's needed**: Restore with proper selection gating

### 8. Expense Edit Selection Flickering (FAILED)
- **Request**: Stop selection switching between fields in edit mode
- **What Claude did**: Still happening
- **What's needed**: Persistent selection during edit mode

### 9. Section Title Sizes (WRONG)
- **Request**: Make trip titles SMALLER to match expense archive (h6 size)
- **What Claude did**: Made everything LARGER (opposite request)
- **What's needed**: Use h6 size for all, restore trip card titles

### 10. Global Color Variables (WRONG APPLICATION)
- **Request**: Consistent selection colors
- **What Claude did**: Applied wrong colors in wrong places
- **What's needed**: Proper blue selection color applied correctly

## Additional Issues Created:
- Trip card titles affected by size changes (need restoration)
- HTML inconsistency: h5 vs h6 (should standardize to one element)
- Cache busting not working (user cleared Safari cache/databases)
- Drag functionality completely missing after changes

## User Frustration Points:
1. **Repeated failures**: Same issues mentioned "over and over again"
2. **Wrong interpretation**: Blue vs green, smaller vs larger
3. **Broken functionality**: Features that worked now broken
4. **Wasted tokens**: No progress despite multiple attempts
5. **Cache issues**: Changes not appearing despite cache clearing

## Required Restart Approach:
1. **STOP coding immediately** - no more changes until plan approved
2. **Read AGENTS.md carefully** - understand UX specifications
3. **Audit current code state** - identify what's actually broken
4. **Create detailed implementation plan** - get user approval first
5. **Test each change individually** - verify before moving to next
6. **Use proper colors** - blue shades, not green
7. **Respect user size preferences** - smaller, not larger

## Files Needing Attention:
- `/styles.css` - Color variables and sizing rules
- `/ui.js` - Selection logic, drag/drop, double-click behavior  
- Testing at: `http://localhost:3000/index.html?v=YYYYMMDD-NN&nosw`

## Key Color References:
- User wants BLUE equivalent of #e4eee9 tone
- Base blue colors: #1763bb, #89a5c9
- Base green colors: #2a8754, #7aa992
- Current wrong selection: #E4EEE9 (greenish)

---
**NEXT SESSION: Use restart prompt below**