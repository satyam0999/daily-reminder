# Requirements Document

## Introduction

This document specifies requirements for enhancing the Personal Goal Tracker dashboard with improved UI organization and a year progress indicator. The enhancements focus on better visual hierarchy, preventing text overlap, and adding motivational year progress tracking.

## Glossary

- **Dashboard**: The main page displaying daily, weekly, and monthly goals along with journal entry
- **Goal_Counter**: A display component showing the count of remaining daily goals
- **Tab_Interface**: A UI component allowing users to switch between different goal type views
- **Year_Progress_Bar**: A visual indicator showing the percentage of the current year that has elapsed
- **Goal_Text**: The description text associated with each goal item
- **Text_Overflow**: A condition where text content extends beyond its container boundaries

## Requirements

### Requirement 1: Daily Goals Counter Display

**User Story:** As a user, I want to see how many daily goals I have remaining at all times, so that I can quickly understand my progress without counting manually.

#### Acceptance Criteria

1. THE Dashboard SHALL display a counter showing the number of remaining daily goals
2. WHEN a daily goal is marked complete, THE Goal_Counter SHALL update immediately to reflect the new count
3. WHEN a daily goal is marked incomplete, THE Goal_Counter SHALL update immediately to reflect the new count
4. THE Goal_Counter SHALL be visible at all times while viewing the Dashboard
5. THE Goal_Counter SHALL display in the format "X remaining" where X is the count of incomplete daily goals

### Requirement 2: Tabbed Goal Interface

**User Story:** As a user, I want weekly and monthly goals displayed in separate tabs, so that I can focus on one goal type at a time without visual clutter.

#### Acceptance Criteria

1. THE Dashboard SHALL provide a Tab_Interface for switching between goal type views
2. THE Tab_Interface SHALL include tabs for "Daily", "Weekly", and "Monthly" goal types
3. WHEN a user clicks a tab, THE Dashboard SHALL display only goals of that type
4. WHEN a tab is selected, THE Dashboard SHALL visually indicate which tab is active
5. THE Dashboard SHALL default to showing the "Daily" tab on initial load
6. WHEN switching tabs, THE Dashboard SHALL preserve the completion state of all goals

### Requirement 3: Text Overflow Prevention

**User Story:** As a user, I want goal text to display properly regardless of length, so that I can read all my goals without text overlapping or being cut off.

#### Acceptance Criteria

1. WHEN Goal_Text exceeds its container width, THE Dashboard SHALL wrap the text to multiple lines
2. WHEN Goal_Text is displayed, THE Dashboard SHALL ensure no text overlaps with other UI elements
3. THE Dashboard SHALL allocate sufficient vertical space for multi-line Goal_Text
4. WHEN Goal_Text wraps to multiple lines, THE Dashboard SHALL maintain proper alignment with checkboxes and badges
5. THE Dashboard SHALL apply consistent text wrapping behavior across all goal types

### Requirement 4: Year Progress Indicator

**User Story:** As a user, I want to see how much of 2026 has passed, so that I can stay motivated and aware of time passing throughout the year.

#### Acceptance Criteria

1. THE Dashboard SHALL display a Year_Progress_Bar showing the percentage of 2026 that has elapsed
2. THE Year_Progress_Bar SHALL calculate progress based on the current date relative to the full year
3. THE Year_Progress_Bar SHALL display the percentage value as text alongside the visual bar
4. WHEN the current date changes, THE Year_Progress_Bar SHALL update to reflect the new percentage
5. THE Year_Progress_Bar SHALL be visible on the Dashboard without requiring scrolling
6. THE Year_Progress_Bar SHALL use a visual progress bar (loading bar) representation
7. THE Year_Progress_Bar SHALL calculate percentage as: (days elapsed / total days in year) × 100

### Requirement 5: Responsive Layout

**User Story:** As a user, I want the enhanced dashboard to work well on different screen sizes, so that I can use the application on various devices.

#### Acceptance Criteria

1. THE Dashboard SHALL maintain readable text sizes across different screen widths
2. THE Tab_Interface SHALL remain functional on mobile and desktop screen sizes
3. THE Year_Progress_Bar SHALL scale appropriately for different screen widths
4. WHEN viewed on mobile devices, THE Dashboard SHALL stack elements vertically as needed
5. THE Goal_Counter SHALL remain visible and readable on all screen sizes
