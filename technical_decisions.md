# Technical Decisions - Weekly Resource Calendar MVP

## Framework Choice: Next.js 14+

**Decision**: Use Next.js 14+ with the App Router for this project.

**Rationale**:
- Modern React framework with excellent TypeScript support
- App Router provides better performance and developer experience
- Built-in optimization features (code splitting, image optimization)
- Strong ecosystem and community support
- Future-proof with the latest React features

**Alternatives Considered**:
- Create React App: Less modern, no built-in routing
- Vite + React: Good alternative, but Next.js provides more out-of-the-box features

## Architecture: Modular Structure with SOLID Principles

**Decision**: Implement a modular architecture following SOLID principles.

**Rationale**:
- **Single Responsibility**: Each component has one clear purpose
  - `WeeklyGrid`: Handles calendar grid layout
  - `PersonRow`: Displays person information and assignments
  - `AssignmentBar`: Visualizes individual assignments
- **Open/Closed**: Components are designed for extension (new assignment types, additional data)
- **Dependency Inversion**: Uses Zustand for state management, allowing easy testing and mocking

**Benefits**:
- Easier maintenance and testing
- Better code reusability
- Clear separation of concerns

## State Management: Zustand

**Decision**: Use Zustand for state management instead of Context API or Redux.

**Rationale**:
- Lightweight and simple API
- No boilerplate code required
- Excellent TypeScript support
- Perfect for small to medium applications
- Easy to test and mock

**Alternatives Considered**:
- Redux: Too heavy for this MVP
- Context API: Would require more boilerplate for complex state

## Styling: Tailwind CSS

**Decision**: Use Tailwind CSS for styling.

**Rationale**:
- Utility-first approach allows rapid prototyping
- Consistent design system
- Small bundle size with purging
- Excellent responsive design support
- Integrates well with Next.js

## TypeScript: Strict Type Safety

**Decision**: Use TypeScript with strict configuration.

**Rationale**:
- Catches errors at compile time
- Better IDE support and autocomplete
- Self-documenting code with types
- Essential for maintainable large-scale applications

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── stores/           # Zustand state stores
├── utils/            # Utility functions
└── types/            # TypeScript type definitions
```

**Rationale**:
- Clear separation of concerns
- Easy to navigate and maintain
- Follows Next.js 13+ App Router conventions
- Scalable for future features

## Data Management: Static Data with Future API Integration

**Decision**: Use static data in Zustand store with structure ready for API integration.

**Rationale**:
- Allows immediate development without backend
- Store structure supports async data loading
- Easy to replace with API calls later
- Maintains separation between data and UI layers

## Component Design: Functional Components with Hooks

**Decision**: Use functional components with React hooks.

**Rationale**:
- Modern React patterns
- Better performance with React 18
- Easier testing with hooks
- Consistent with Next.js recommendations

## Calendar Logic: Utility Functions

**Decision**: Extract calendar calculations into utility functions.

**Rationale**:
- Pure functions are easy to test
- Reusable across components
- Separates business logic from UI
- Follows functional programming principles

## Iteration 2: CRUD Operations and Manual Assignments

**Decision**: Implement CRUD operations for people and projects, and manual assignment creation.

**Rationale**:
- Extends the static MVP to dynamic data management
- Maintains SOLID principles with new dialog components having single responsibilities
- Zustand store enhanced with actions for add/update operations
- Form validations ensure data integrity
- Modal dialogs provide clean UX for CRUD operations

**New Components**:
- `AddEditPersonDialog`: Handles person creation/editing with validation
- `AddEditProjectDialog`: Handles project creation/editing with color picker
- `AddEditAssignmentDialog`: Handles manual assignment creation with dropdowns and date inputs

**State Management Updates**:
- Added actions to Zustand store: `addPerson`, `updatePerson`, `addProject`, `updateProject`, `addAssignment`
- Store remains lightweight and testable

**Type Updates**:
- Changed `Assignment.hours` to `Assignment.percentage` to match percentage-based allocation

## Iteration 5: Week Navigation and 4-Week View

**Decision**: Implement week navigation with 4-week calendar view.

**Rationale**:
- Extends the calendar to show 4 weeks starting from selected week
- Adds navigation controls for previous/next weeks and jump to today
- Maintains modularity by updating store with selectedWeek state and actions
- WeeklyGrid component made configurable with selectedWeek and weeks props
- Capacity calculation updated to consider 4-week range
- Follows SOLID principles with single-responsibility updates

**New Features**:
- Selected week state in Zustand store with persistence
- Navigation actions: `goToPreviousWeek`, `goToNextWeek`, `goToToday`
- Updated `getWeekDays` utility to support multiple weeks
- WeeklyGrid accepts `selectedWeek` and `weeks` props for flexibility
- Dynamic grid layout using CSS Grid for variable columns
- Updated drag-and-drop calculations for wider grid

**State Management Updates**:
- Added `selectedWeek` to store state with default current week
- New actions for week navigation
- Updated `getPersonCapacity` to use 4-week range
- Persistence includes selectedWeek

**Component Updates**:
- WeeklyGrid: Added props for selectedWeek and weeks, dynamic grid columns
- Page: Added navigation buttons and week range display

## Iteration 6: Percentage-Based Bar Widths and Overlapping Assignment Handling

**Decision**: Implement percentage-based bar widths and vertical stacking for overlapping assignments.

**Rationale**:
- Bar widths now calculated as `width = (percentage / 100) * date_based_width`, making visual representation proportional to allocation
- Multiple assignments in the same time period are stacked vertically to avoid visual overlap
- Maintains drag-and-drop and resize functionality with weekly snap behavior
- Follows SOLID principles with updated AssignmentBar component accepting stack positioning props
- PersonRow calculates overlapping assignment groups and assigns vertical positions dynamically

**New Features**:
- Percentage-proportional bar widths: bars visually represent the actual percentage allocation within their date range
- Vertical stacking: overlapping assignments are positioned vertically within the same time slot
- Dynamic positioning: stack index and count calculated per assignment based on date overlaps
- Maintained functionality: drag/resize operations continue to work with weekly snap constraints

**Component Updates**:
- AssignmentBar: Added stackIndex and stackCount props, updated width calculation and vertical positioning
- PersonRow: Added overlap detection and stack position calculation using assignmentsOverlap utility
- Maintained backward compatibility with existing drag-and-drop and resize handlers

## Iteration 7: Project Legend Sidebar

**Decision**: Add a ProjectLegend component displaying all projects with their colors in a sidebar.

**Rationale**:
- Provides visual reference for project colors used in assignment bars
- Dynamically updates when projects are added or modified through the store
- Positioned to the right of the weekly grid using flexbox layout
- Follows SOLID principles with single responsibility for legend display
- Enhances user experience by making color associations clear

**New Features**:
- ProjectLegend component: Lists all projects with color squares and names
- Reactive to store changes: Automatically updates when projects are added/edited
- Sidebar layout: Integrated into main page with flexbox for responsive positioning
- Clean UI: White background with shadow, matching application design

**Component Updates**:
- ProjectLegend: New component consuming projects from Zustand store
- Page: Updated layout to use flex container with WeeklyGrid and ProjectLegend
- Maintained responsive design with flex-1 for grid and fixed width for legend

## Future Extensions Considered

The architecture supports future enhancements:
- Edit/delete operations for assignments
- Drag-and-drop assignment editing
- Real-time data updates
- User authentication
- Advanced filtering and search
- Export functionality
- Mobile responsive design improvements