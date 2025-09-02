# 2025-08-29-drag-drop-breakdown.md

## Problem: Complete breakdown of drag-and-drop and selection system

## Root Cause: 
Attempted incremental fixes without understanding the full UX requirements led to conflicting implementations

## Specific Issues:
1. **Expense Save Bug**: Save without changes duplicates card + archive zone (blur behavior works correctly)
2. **Double-click Edit Broken**: Desktop double-click editing stopped working 
3. **Drag System**: Broken - unselected cards can drag, selected don't reliably work
4. **Trip Drag**: Stopped working after expense drag implementation attempts
5. **Selection Logic**: Not properly enforced - multi-select happening, unselected actions allowed

## Required Fix: Complete rewrite following AGENTS.md UX patterns
- Click to select → blue border
- Only selected cards can swipe/drag
- Single-click selected = swipe, Long-click selected = drag
- Ghost disappears in archive zones, background → light grey
- Swipe disabled during drag

## Prevention: 
Always implement UX as complete system, not piecemeal. Test selection → swipe → drag as integrated flow.

## Current State: 
Desktop mouse swipes partially work but integrated poorly with drag system. Mobile touch swipes work better but still have issues.