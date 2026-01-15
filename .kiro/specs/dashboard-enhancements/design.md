# Design Document: Dashboard Enhancements

## Overview

This design enhances the Personal Goal Tracker dashboard with improved UI organization and motivational features. The enhancements include a persistent daily goals counter, tabbed navigation for goal types, proper text overflow handling, and a year progress indicator. The implementation will modify the existing Dashboard component and add new reusable components.

## Architecture

The enhancement follows the existing React component architecture:

- **Dashboard.jsx**: Modified to include tabs, counter, and year progress bar
- **GoalTabs.jsx**: New component for tabbed goal type navigation
- **YearProgressBar.jsx**: New component for displaying year completion percentage
- **GoalList.jsx**: Modified to handle text overflow properly

The data flow remains unchanged - goals and check-ins are fetched from Supabase, and the UI updates reactively based on state changes.

## Components and Interfaces

### Modified: Dashboard Component

**Purpose**: Main container for all dashboard features including the new enhancements

**State**:
```javascript
{
  goals: Array<Goal>,           // All active goals
  completedGoalIds: Set<string>, // IDs of completed goals
  journalEntry: string,          // Today's journal text
  activeTab: string,             // Current tab: 'daily', 'weekly', or 'monthly'
  loading: boolean               // Loading state
}
```

**New Methods**:
- `setActiveTab(tab: string)`: Updates the active tab state
- `getRemainingDailyGoals()`: Returns count of incomplete daily goals
- `getFilteredGoals()`: Returns goals filtered by active tab

**Props**: None (top-level page component)

### New: GoalTabs Component

**Purpose**: Provides tabbed navigation for switching between goal types

**Props**:
```javascript
{
  activeTab: string,              // Current active tab
  onTabChange: (tab: string) => void, // Callback when tab is clicked
  dailyCount: number,             // Count for daily goals badge
  weeklyCount: number,            // Count for weekly goals badge
  monthlyCount: number            // Count for monthly goals badge
}
```

**Rendering**:
- Three clickable tabs: Daily, Weekly, Monthly
- Active tab highlighted with different background color
- Optional count badges showing number of goals per type

### New: YearProgressBar Component

**Purpose**: Displays visual progress bar showing percentage of year completed

**Props**:
```javascript
{
  year: number  // The year to track (default: 2026)
}
```

**State**:
```javascript
{
  percentage: number  // Calculated percentage of year elapsed
}
```

**Methods**:
- `calculateYearProgress(year: number)`: Calculates percentage based on current date
  - Formula: `(dayOfYear / totalDaysInYear) × 100`
  - Handles leap years correctly
  - Returns value rounded to 2 decimal places

**Rendering**:
- Container div with background color
- Inner div with width set to percentage (visual bar)
- Text overlay showing percentage value

### Modified: GoalList Component

**Purpose**: Enhanced to prevent text overflow and maintain proper layout

**CSS Changes**:
- Add `word-wrap: break-word` to goal text containers
- Add `overflow-wrap: break-word` for better browser support
- Set `white-space: normal` to allow wrapping
- Use flexbox with proper alignment for checkbox + text + badge layout

## Data Models

No changes to existing data models. The enhancements work with existing:
- `goals` table
- `check_ins` table
- Goal type enum: 'daily', 'weekly', 'monthly'

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Daily Goals Counter Accuracy

*For any* set of daily goals and completion states, the displayed remaining count should equal the number of daily goals where `completed === false`.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Tab Filtering Consistency

*For any* active tab selection, all displayed goals should have a `type` field matching the active tab value.

**Validates: Requirements 2.3**

### Property 3: Tab State Preservation

*For any* sequence of tab switches and goal completions, switching back to a previously viewed tab should show the same completion states as when it was last viewed.

**Validates: Requirements 2.6**

### Property 4: Year Progress Calculation Accuracy

*For any* valid date in 2026, the year progress percentage should equal `(dayOfYear / totalDaysInYear) × 100` rounded to 2 decimal places.

**Validates: Requirements 4.2, 4.7**

### Property 5: Text Wrapping Prevents Overlap

*For any* goal text of any length, the rendered text should not overlap with adjacent UI elements (checkboxes, badges, other goals).

**Validates: Requirements 3.1, 3.2**

### Property 6: Default Tab Selection

*For any* initial Dashboard load, the active tab should be set to 'daily'.

**Validates: Requirements 2.5**

## Error Handling

### Invalid Tab Selection
- If an invalid tab name is provided, default to 'daily'
- Log warning to console for debugging

### Year Progress Calculation Errors
- If date calculation fails, display 0% progress
- Log error to console
- Component should not crash

### Empty Goal Lists
- Display appropriate "No goals" message for each tab
- Counter should show "0 remaining" for daily goals
- Year progress bar should still display correctly

### Text Overflow Edge Cases
- Very long words (>50 characters) should break mid-word if necessary
- URLs and long strings should wrap properly
- Maintain minimum height for goal items to prevent layout shift

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

1. **Daily Goals Counter**
   - Test with 0 daily goals
   - Test with all goals completed
   - Test with mixed completion states
   - Test counter updates after toggling goals

2. **Tab Navigation**
   - Test default tab is 'daily'
   - Test switching between all three tabs
   - Test filtered goals match active tab
   - Test invalid tab name handling

3. **Year Progress Calculation**
   - Test January 1st (should be ~0%)
   - Test December 31st (should be ~100%)
   - Test leap year handling
   - Test mid-year dates

4. **Text Overflow**
   - Test short text (no wrapping needed)
   - Test long text (requires wrapping)
   - Test very long single word
   - Test text with special characters

### Property-Based Tests

Property tests will verify universal properties across many generated inputs using a JavaScript property-based testing library (fast-check):

1. **Property 1: Daily Goals Counter Accuracy**
   - Generate random arrays of goals with random completion states
   - Verify counter always equals count of incomplete daily goals
   - Run 100+ iterations with different goal configurations

2. **Property 2: Tab Filtering Consistency**
   - Generate random goal arrays with mixed types
   - For each tab, verify all displayed goals match that type
   - Run 100+ iterations

3. **Property 3: Tab State Preservation**
   - Generate random sequences of tab switches and goal toggles
   - Verify completion states persist across tab switches
   - Run 100+ iterations

4. **Property 4: Year Progress Calculation Accuracy**
   - Generate random dates throughout 2026
   - Verify formula: (dayOfYear / totalDaysInYear) × 100
   - Run 100+ iterations

5. **Property 5: Text Wrapping Prevents Overlap**
   - Generate random text strings of varying lengths
   - Verify rendered elements don't overlap (check bounding boxes)
   - Run 100+ iterations

Each property test will be tagged with:
```javascript
// Feature: dashboard-enhancements, Property N: [property description]
```

### Integration Tests

- Test complete user flow: load dashboard → switch tabs → toggle goals → verify counter updates
- Test year progress bar updates when date changes (mock date)
- Test responsive behavior at different viewport sizes
