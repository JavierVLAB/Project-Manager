
# Week Numbering Mismatch Fix

## Issue Summary
The week dropdown in the AddEditAssignmentDialog was selecting the wrong day for the first day of the week. For example, it was showing week 6 as Feb 8 - Feb 14 instead of Feb 9 - Feb 15, which caused inconsistencies with the weekly grid display.

## Root Causes
1. **Different Week Numbering Logics**: The weekly grid uses the ISO week numbering system that starts on Monday, while the AddEditAssignmentDialog was using a custom week numbering logic that didn't properly align.

2. **Date String Handling**: The `assignmentsOverlap` and `splitAssignmentIntoWeeks` functions in the calendar store didn't handle date strings properly, causing TypeError when trying to call `.getTime()` on string values.

## Solution Implemented

### 1. Fixed Week Generation Logic
Updated the week generation logic in `AddEditAssignmentDialog.tsx` to properly:
- Use the same ISO week numbering system as the weekly grid
- Find the correct week 1 Monday by checking dates around January 1
- Verify that the calculated week number matches the actual ISO week number

### 2. Improved Date Handling
Updated the helper functions in `calendarStore.ts` to handle date strings properly:
- `assignmentsOverlap`: Added proper type checking to convert string dates to Date objects
- `splitAssignmentIntoWeeks`: Added the same date string handling to ensure consistency

### 3. Exported Missing Function
Added `export` to `getISOWeekNumber` in `calendarUtils.ts` so it can be imported and used in other components.

## Files Modified
1. `src/utils/calendarUtils.ts` - Added export to getISOWeekNumber
2. `src/components/AddEditAssignmentDialog.tsx` - Fixed week generation logic
3. `src/stores/calendarStore.ts` - Improved date string handling in helper functions

## Verification
After making these changes, the week dropdown now correctly shows:
- Week 7: Feb 9, 2026 - Feb 15, 2026
- Week 8: Feb 16, 2026 - Feb 22, 2026
- etc.

This matches what's displayed in the weekly grid, ensuring consistency across the application.
