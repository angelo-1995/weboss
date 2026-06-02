# Requirements Document

## Introduction

Platform UX Modernization is a comprehensive initiative to transform Community OS from a functionally correct but UX-limited church management platform into a modern, mobile-first, analytics-driven, premium SaaS experience. The initiative covers 10 areas: cell report form modernization, user onboarding wizard, groups management, discipleship management, leadership hierarchy visualization, membership assignment, reporting dashboards, organizational analytics, mobile reporting UX, and permission scopes UI.

The platform currently uses NestJS 10 + Next.js 15 + Prisma + PostgreSQL with shadcn/ui, TanStack Query, React Hook Form, Zustand, Recharts, and ReactFlow. All existing business logic remains unchanged; this initiative focuses exclusively on UX, mobile-first design, analytics visualization, and admin tooling improvements.

## Glossary

- **Wizard**: A multi-step form interface that guides the user through sequential stages with validation per step
- **Cell_Report_Form**: The frontend component that allows cell leaders to submit weekly attendance and growth reports for their group
- **Stepper_Control**: A large touch-friendly numeric input control with increment/decrement buttons optimized for mobile interaction
- **Autosave_Engine**: A client-side mechanism that persists form state to localStorage and optionally to the server as a draft
- **Sparkline**: A small inline chart (typically a line or bar) embedded within a card or table row to show trends
- **Bottom_Sheet**: A mobile UI pattern where a modal slides up from the bottom of the screen instead of appearing centered
- **Funnel_Chart**: A visualization showing progressive conversion through sequential stages (e.g., GANADO → CONSOLIDADO → DISCIPULADO → ENVIADO)
- **Heatmap**: A data visualization using color intensity to represent values across two dimensions (e.g., activity by day/hour)
- **Permission_Scope**: A contextual boundary that limits permission applicability (global, network, discipleship, group, leadership)
- **KPI_Card**: A dashboard component displaying a key performance indicator with value, trend, and comparison data
- **Drill_Down**: An interactive analytics pattern where clicking a summary metric reveals detailed underlying data
- **Quick_Report_Mode**: A mobile reporting shortcut that pre-fills the cell report form with data from the previous week
- **Offline_Sync_Engine**: A service worker-based mechanism that queues mutations locally and synchronizes when connectivity is restored
- **Visual_State_Machine**: A UI component that displays entity status transitions as an interactive flowchart
- **Cohort_Analysis**: An analytics technique that groups users by their join date and tracks behavior over time
- **Network**: An organizational hierarchy unit in the church structure (Pastor General → Pastor Red → Cobertura → Líder → Estaca → Miembro)
- **Spiritual_Stage**: The progression stages of a church member: GANADO → CONSOLIDADO → DISCIPULADO → ENVIADO
- **Coverage_Leader (Cobertura)**: A leader who supervises other cell leaders within the ministerial hierarchy
- **ReactFlow_Graph**: The existing graph visualization library used for organigrama and hierarchy displays
- **Group_Card**: A visual card component displaying group summary information (name, leader, attendance trend, member count)

## Requirements

### Requirement 1: Multi-Step Cell Report Wizard

**User Story:** As a cell leader, I want to submit my weekly cell report through a guided multi-step wizard, so that the process is less overwhelming and I can complete it efficiently on my mobile device.

#### Acceptance Criteria

1. WHEN the cell leader opens the report form, THE Cell_Report_Form SHALL display a 5-step wizard with steps: Identificación (groupId, cellCode, meetingDate, coverageName, leaderName, coLeaderName, contactPhone), Asistencia (menCount, womenCount, youthMaleCount, youthFemaleCount, childrenCount, visitorsCount, convertsCount, reconciledCount), Crecimiento (messageTopic, wasSupervised), Reunión (startTime, endTime, offeringAmount, district, neighborhood, sector, street, houseNumber, observations), and Resumen (read-only review)
2. THE Cell_Report_Form SHALL display a progress indicator showing the current step number (1 through 5), step name, and completion percentage calculated as (current step index / total steps) × 100
3. WHEN the user completes a step and taps "Siguiente", THE Cell_Report_Form SHALL validate only the fields belonging to the current step before advancing to the next step
4. IF validation fails on the current step, THEN THE Cell_Report_Form SHALL display inline error messages adjacent to each invalid field and prevent advancement to the next step
5. WHEN the user is on any step after the first, THE Cell_Report_Form SHALL allow navigation back to previous steps while retaining all previously entered data in memory for the duration of the wizard session
6. WHEN the user reaches the Resumen step, THE Cell_Report_Form SHALL display a read-only summary of all entered data organized by section (Identificación, Asistencia, Crecimiento, Reunión)
7. WHEN the user taps "Enviar" from the Resumen step, THE Cell_Report_Form SHALL disable the submit button, display a loading indicator, and send the complete report to the backend API
8. IF the report submission fails due to a network error or server error, THEN THE Cell_Report_Form SHALL re-enable the submit button, display an error message indicating the submission failed, and preserve all entered data so the user can retry without re-entering information

### Requirement 2: Cell Report Autosave and Draft Support

**User Story:** As a cell leader, I want my in-progress report to be automatically saved, so that I do not lose data if I accidentally close the browser or navigate away.

#### Acceptance Criteria

1. WHILE the user is filling out the Cell_Report_Form, THE Autosave_Engine SHALL persist the current form state to localStorage every 30 seconds, using a storage key that uniquely identifies the draft by user ID and group ID
2. WHEN the user navigates away from the Cell_Report_Form or the browser fires a beforeunload event, THE Autosave_Engine SHALL immediately persist the current form state to localStorage
3. WHEN the user returns to the Cell_Report_Form with a saved draft in localStorage that is less than 7 days old, THE Autosave_Engine SHALL restore the form state and display a notification indicating draft restoration that auto-dismisses after 5 seconds
4. IF a saved draft in localStorage is 7 or more days old, THEN THE Autosave_Engine SHALL discard the draft and display a notification indicating the draft expired
5. WHEN the user successfully submits a report, THE Autosave_Engine SHALL clear the corresponding draft from localStorage
6. WHILE the user has an active internet connection, THE Autosave_Engine SHALL persist the draft to the server within 10 seconds of each local autosave, and if the server request fails, THE Autosave_Engine SHALL continue operating with localStorage only without blocking the user
7. WHEN the user explicitly discards a draft, THE Autosave_Engine SHALL remove the draft from localStorage and attempt removal from the server; if server removal fails, THE Autosave_Engine SHALL still confirm local discard to the user
8. IF localStorage write fails due to quota exceeded or unavailability, THEN THE Autosave_Engine SHALL display a warning notification indicating that autosave is unavailable and the user should submit the form before navigating away

### Requirement 3: Duplicate Report Prevention UX

**User Story:** As a cell leader, I want to be warned before submitting a duplicate report for the same week, so that I avoid accidental duplicate submissions.

#### Acceptance Criteria

1. WHEN the user selects a group and meeting date in the Cell_Report_Form, THE Cell_Report_Form SHALL query the backend within 3 seconds for an existing report matching that group and the calendar week (Monday through Sunday) containing the selected date
2. IF a report already exists for the selected group and week, THEN THE Cell_Report_Form SHALL display a warning banner showing the existing report's submission date and a link to view the submitted report
3. WHILE a duplicate warning is active, THE Cell_Report_Form SHALL disable the submit button and display a message explaining that only one report per group per calendar week is allowed
4. WHEN the user changes the group or meeting date after a duplicate warning is displayed, THE Cell_Report_Form SHALL dismiss the current warning and re-check the backend for the newly selected group and week combination
5. IF the duplicate check request fails due to a network error or timeout, THEN THE Cell_Report_Form SHALL allow the user to proceed with submission and display an informational notice that duplicate verification was unavailable

### Requirement 4: Cell Report Mobile-First Controls

**User Story:** As a cell leader using a mobile device, I want large touch-friendly controls for numeric inputs, so that I can quickly and accurately enter attendance numbers.

#### Acceptance Criteria

1. THE Cell_Report_Form SHALL render all numeric attendance fields (men, women, youth male, youth female, children) using Stepper_Control components with minimum touch target size of 44x44 pixels
2. THE Stepper_Control SHALL display increment and decrement buttons flanking the numeric value, with each attendance field accepting values in the range 0 to 999
3. WHEN the user taps the increment button and the current value is below 999, THE Stepper_Control SHALL increase the value by 1
4. WHEN the user taps the decrement button, THE Stepper_Control SHALL decrease the value by 1 with a minimum of 0
5. WHEN the user long-presses an increment or decrement button for more than 500 milliseconds, THE Stepper_Control SHALL continuously change the value at a rate of 5 per second until the user releases the button or the value reaches its bound (0 or 999)
6. WHEN the user taps the numeric value display of a Stepper_Control, THE Stepper_Control SHALL open a numeric keyboard input allowing direct entry of a value between 0 and 999
7. THE Cell_Report_Form SHALL support swipe-left and swipe-right gestures to navigate between wizard steps on touch devices, requiring a minimum horizontal swipe distance of 50 pixels to trigger navigation
8. IF the user taps increment when the value is 999 or taps decrement when the value is 0, THEN THE Stepper_Control SHALL keep the value unchanged and provide a brief visual indication that the bound has been reached

### Requirement 5: Cell Report Post-Submission Experience

**User Story:** As a cell leader, I want to see a celebration animation and trend summary after submitting my report, so that I feel acknowledged and can quickly assess my group's progress.

#### Acceptance Criteria

1. WHEN a report is successfully submitted, THE Cell_Report_Form SHALL display a success animation with confetti or checkmark celebration lasting between 2 and 4 seconds
2. WHEN the success animation completes, THE Cell_Report_Form SHALL display a trend summary showing the current report's total attendance, the previous week's total attendance, the numeric difference, and a directional arrow indicator (up, down, or unchanged)
3. WHEN the success animation completes, THE Cell_Report_Form SHALL display micro analytics cards showing: attendance trend (last 4 weeks Sparkline), growth rate (visitors + converts as a percentage of total attendance from the current report), and reporting streak (consecutive weeks reported as a numeric count)
4. IF the group has no previous report history, THEN THE Cell_Report_Form SHALL display the micro analytics cards with a message indicating insufficient data in place of the trend summary and Sparkline
5. WHEN the user taps a visible "Cerrar" or "Ver Historial" button on the post-submission view, THE Cell_Report_Form SHALL navigate to the reporting history page

### Requirement 6: Cell Report History and Trends

**User Story:** As a cell leader, I want to view my reporting history with visual trends, so that I can track my group's progress over time.

#### Acceptance Criteria

1. WHEN the user opens the Cell_Report_Form to begin a new report, THE Cell_Report_Form SHALL display a Sparkline showing the last 4 weeks of total attendance data for the selected group above the form
2. IF the selected group has fewer than 4 weeks of submitted reports, THEN THE Cell_Report_Form SHALL display the Sparkline with only the available data points and a label indicating the number of weeks shown
3. WHEN the user navigates to the reporting history page, THE Reporting_Dashboard SHALL display a paginated list of submitted reports sorted by date descending, showing date, total attendance, visitors, and converts for each entry, with a maximum of 10 entries per page
4. IF the user leads multiple groups, THEN THE Reporting_Dashboard SHALL display a group selector allowing the user to choose which group's history and charts to view
5. THE Reporting_Dashboard SHALL display a 12-week rolling line chart of total attendance for the selected group, plotting available data points when fewer than 12 weeks of reports exist
6. THE Reporting_Dashboard SHALL highlight weeks with no submitted report on the 12-week line chart using a distinct visual indicator differentiated from data points (gap in the line or warning icon at the expected position)

### Requirement 7: Structured Observations in Cell Report

**User Story:** As a cell leader, I want to categorize my observations into specific types, so that leadership can filter and act on specific categories of feedback.

#### Acceptance Criteria

1. THE Cell_Report_Form SHALL replace the single observations textarea with four separate textarea fields labeled: "Testimonios", "Necesidades", "Oración", and "Notas"
2. WHEN the user enters text in any observation category, THE Cell_Report_Form SHALL store each category as a separate string field in the report payload using the keys: testimonios, necesidades, oracion, and notas
3. THE Cell_Report_Form SHALL allow each observation category to be empty (all categories are optional), treating whitespace-only input as empty
4. THE Cell_Report_Form SHALL enforce a maximum length of 2000 characters per observation category field and display a validation error if exceeded
5. WHEN leadership requests reports filtered by a specific observation category, THE System SHALL return only reports where the specified category field contains non-empty text

### Requirement 8: Cell Report New Fields

**User Story:** As a cell leader, I want to record additional meeting details (meeting type, photos, spiritual health, prayer requests, next event), so that leadership has richer data for decision-making.

#### Acceptance Criteria

1. THE Cell_Report_Form SHALL include a meeting type selector with options: Presencial, Virtual, and Híbrida
2. WHEN the user uploads a photo, THE Cell_Report_Form SHALL accept up to 3 images in JPEG or PNG format with a maximum file size of 5 MB each and a minimum resolution of 200×200 pixels
3. IF the user attempts to upload a file that exceeds 5 MB, is not JPEG or PNG, or is below 200×200 pixels, THEN THE Cell_Report_Form SHALL reject the file and display an error message indicating the specific validation failure without removing previously uploaded valid images
4. THE Cell_Report_Form SHALL include a spiritual health indicator as a 1-to-5 scale selector with the following labels: 1 = Crítico, 2 = Bajo, 3 = Estable, 4 = Bueno, 5 = Excelente
5. THE Cell_Report_Form SHALL include an optional prayer requests text field that accepts a maximum of 500 characters for recording specific prayer needs
6. THE Cell_Report_Form SHALL include an optional next event date picker that only allows selecting dates from the current date up to 90 days in the future
7. THE Cell_Report_Form SHALL include an optional structured notes section with predefined categories: Testimonio, Necesidad Pastoral, Seguimiento a Visitante, and Logística, where each category contains a text field accepting a maximum of 300 characters

### Requirement 9: User Onboarding Multi-Step Wizard

**User Story:** As an administrator, I want to register new members through a guided multi-step wizard, so that I can capture complete profile information including ministry interests and relationships.

#### Acceptance Criteria

1. WHEN the administrator initiates new member creation, THE Onboarding_Wizard SHALL display a 4-step wizard with steps: Datos Básicos, Perfil Ministerial, Relaciones, and Confirmación
2. WHEN the administrator attempts to advance to the next step, THE Onboarding_Wizard SHALL validate required fields in the current step and prevent advancement if any required field is empty or invalid, displaying inline error messages on each invalid field
3. THE Onboarding_Wizard SHALL include an avatar upload field in the Datos Básicos step that accepts JPEG or PNG images with a maximum file size of 5MB and provides crop functionality before upload
4. THE Onboarding_Wizard SHALL include ministry gifts, interests, and availability selectors in the Perfil Ministerial step, where availability is represented as day-of-week and time-of-day selections
5. THE Onboarding_Wizard SHALL include network assignment with a visual network tree selector in the Relaciones step that displays the hierarchical network structure
6. THE Onboarding_Wizard SHALL include discipleship relationship assignment (mentor selection) in the Relaciones step with a searchable list of existing members filtered by ministerial role
7. THE Onboarding_Wizard SHALL include family/spouse relationship linking in the Relaciones step with a searchable member selector
8. WHEN the user reaches the Confirmación step, THE Onboarding_Wizard SHALL display a read-only summary of all entered data organized by step, with an edit button per section that navigates back to the corresponding step without losing data from other steps
9. WHEN the administrator submits the wizard from the Confirmación step, THE Onboarding_Wizard SHALL create the member record via the backend API and display a success confirmation with the new member's name
10. IF the avatar upload or member creation request fails, THEN THE Onboarding_Wizard SHALL display an error message indicating the failure reason and preserve all entered form data for retry
11. THE Onboarding_Wizard SHALL render all interactive elements with a minimum touch target of 44x44 pixels on viewports narrower than 768 pixels and support step navigation without data loss

### Requirement 10: Groups Visual Card Management

**User Story:** As a leader, I want to view and manage my groups as visual cards with attendance trends, so that I can quickly assess group health and take actions without navigating to detail pages.

#### Acceptance Criteria

1. THE Groups_Page SHALL provide a toggle between grid view (visual cards) and list view (table), with grid view as the default active view
2. WHILE grid view is active, THE Groups_Page SHALL display each group as a Group_Card containing: group name, code, leader avatar and name, member count, and a 4-week attendance Sparkline
3. IF a group has fewer than 2 weeks of attendance data, THEN THE Group_Card SHALL display a placeholder message instead of the Sparkline indicating insufficient data
4. THE Group_Card SHALL display quick action buttons for: submit report, add member, and view details
5. THE Groups_Page SHALL include a search input with a maximum length of 100 characters and 300ms debounce for filtering groups by name or code
6. IF the search filter returns no matching groups, THEN THE Groups_Page SHALL display an empty state message indicating no groups match the search criteria
7. WHEN the user clicks "add member" on a Group_Card, THE Groups_Page SHALL display a search-and-add interface containing a member search input, a results list with member name and avatar, and a confirm button for assigning the selected member to the group
8. IF the member assignment fails, THEN THE Groups_Page SHALL display an error message indicating the reason for failure and preserve the search-and-add interface state
9. THE Groups_Page SHALL display the meeting day and time for each group in localized day name and 12-hour time format (e.g., "Martes 7:00 PM")

### Requirement 11: Discipleship Hierarchy Visualization

**User Story:** As a pastor or coverage leader, I want to visualize the mentor-disciple relationships as an interactive graph, so that I can understand the leadership structure and identify gaps.

#### Acceptance Criteria

1. THE Discipleship_Graph SHALL render mentor-disciple relationships as a directed tree using ReactFlow_Graph with dagre layout, displaying up to 500 nodes with a minimum rendering performance of 30 frames per second
2. WHEN the user clicks a node in the Discipleship_Graph, THE Discipleship_Graph SHALL display a detail panel with the person's name, ministerial role, spiritual stage, disciple count, and a scrollable list of direct disciples (up to 50 entries)
3. WHEN the user double-clicks a node in the Discipleship_Graph, THE Discipleship_Graph SHALL re-center the viewport on that person's sub-tree with a smooth transition lasting between 300 and 500 milliseconds
4. WHEN the user types at least 2 characters in the search input, THE Discipleship_Graph SHALL filter matching persons by name within 300 milliseconds debounce and highlight the first matching node by centering the viewport on it and applying a visual distinction
5. WHEN the user selects a filter value for network, spiritual stage, or ministerial role, THE Discipleship_Graph SHALL hide nodes that do not match the selected filter criteria and collapse their connecting edges, preserving the tree structure of remaining visible nodes
6. WHEN the user selects a relationship edge between a mentor and disciple, THE Discipleship_Graph SHALL display a timeline panel listing milestones (title and date) and check-ins (date and notes) for that relationship in chronological order, showing up to 50 entries
7. IF the Discipleship_Graph has no mentor-disciple relationships to display, THEN THE Discipleship_Graph SHALL render an empty state with an informational message indicating no discipleship relationships exist
8. IF the API request to load discipleship data fails, THEN THE Discipleship_Graph SHALL display an error message and a retry button

### Requirement 12: Leadership Hierarchy Enhanced Visualization

**User Story:** As a pastor, I want an enhanced organigrama with rich node cards, navigation aids, and export capabilities, so that I can effectively manage and communicate the organizational structure.

#### Acceptance Criteria

1. THE Organigrama SHALL render each node as a card displaying: avatar image (or a fallback initial-based placeholder if no avatar is available), full name, ministerial role badge, network color indicator, and subordinate count
2. THE Organigrama SHALL display a mini-map navigation panel showing the full graph overview with a viewport indicator highlighting the currently visible area
3. WHEN the user enters at least 2 characters in the search input, THE Organigrama SHALL highlight and center the graph on nodes whose full name or ministerial role contains the search text (case-insensitive partial match) within 300 milliseconds of the last keystroke
4. WHEN the user selects a network filter, a ministerial role filter, or both, THE Organigrama SHALL hide nodes that do not match the selected filter criteria and re-layout the visible graph
5. WHEN the user triggers export, THE Organigrama SHALL generate the current visible graph (respecting active filters and zoom level) as a PNG image or a PDF document and initiate a file download
6. THE Organigrama SHALL include zoom controls (zoom in, zoom out, fit-to-screen) accessible via buttons and pinch gestures on touch devices, with a zoom range between 25% and 200% of the default scale
7. THE Organigrama SHALL maintain rendering performance of at least 30 frames per second with up to 500 visible nodes
8. WHEN the graph contains more than 200 nodes, THE Organigrama SHALL use virtualization to render only visible nodes within the viewport
9. IF the search input text does not match any node, THEN THE Organigrama SHALL display a "no results" message and retain the current graph view without changes

### Requirement 13: Membership Visual Management

**User Story:** As an administrator, I want to manage memberships through visual cards with status workflows and bulk operations, so that I can efficiently handle membership transitions and assignments.

#### Acceptance Criteria

1. THE Membership_Page SHALL display members as paginated visual cards (20 per page, maximum 100 per page) showing: avatar, name, current status, group, and spiritual stage
2. THE Membership_Page SHALL include a search input with 300ms debounce for filtering members by name, and dropdown filters for status (PENDING, ACTIVE, INACTIVE, SUSPENDED), group, and spiritual stage
3. THE Membership_Page SHALL include an interactive Visual_State_Machine showing the allowed status transitions: PENDING → ACTIVE, ACTIVE → INACTIVE, ACTIVE → SUSPENDED, SUSPENDED → ACTIVE, and INACTIVE → ACTIVE
4. WHEN the administrator selects up to 50 members and chooses a bulk action, THE Membership_Page SHALL enable bulk actions: assign to group, change status, and change spiritual stage, with a confirmation dialog showing the count of affected members before execution
5. IF a bulk status change includes members for whom the target status is not a valid transition, THEN THE Membership_Page SHALL skip those members, complete the valid transitions, and display a summary indicating how many succeeded and how many were skipped with the reason
6. WHEN the administrator clicks a member card, THE Membership_Page SHALL display a detail panel with a history timeline showing all status transitions with dates and the actor who performed each change
7. THE Membership_Page SHALL include a quick transfer interface that allows selecting a source group, one or more members, and a destination group to move members between groups
8. THE Membership_Page SHALL include a group membership matrix view showing which members belong to which groups, limited to 50 members and 20 groups per visible page with scroll navigation

### Requirement 14: Reporting Dashboards with Drill-Down

**User Story:** As a pastor or administrator, I want comprehensive reporting dashboards with drill-down capabilities, so that I can monitor organizational health and identify areas needing attention.

#### Acceptance Criteria

1. THE Reporting_Dashboard SHALL display KPI_Cards for: total attendance (sum of all group reports in the current calendar week, Monday through Sunday), active groups count (groups with at least one report in the last 4 weeks), conversion rate (percentage of members who advanced to the next Spiritual_Stage in the last 30 days relative to total active members), and reporting compliance percentage (number of reports submitted in the current week divided by the number of active groups, expressed as a percentage)
2. WHEN the user clicks a KPI_Card, THE Reporting_Dashboard SHALL navigate to a filtered list view showing the individual records that compose the KPI value, with columns for group name, leader, date, and the relevant metric value
3. THE Reporting_Dashboard SHALL display a 12-week rolling attendance trend line chart with a second data series showing the same calendar weeks from the previous year for comparison
4. THE Reporting_Dashboard SHALL display a Funnel_Chart showing spiritual stage conversion rates as the percentage of members who transitioned from each stage to the next (GANADO → CONSOLIDADO → DISCIPULADO → ENVIADO) within the selected date range
5. THE Reporting_Dashboard SHALL display an inactive cell detection panel listing groups without reports in 2 or more consecutive weeks, sorted by number of missed weeks descending
6. THE Reporting_Dashboard SHALL display a network comparison chart showing per network: total weekly attendance, week-over-week attendance change percentage, new members added in the period, and reporting compliance percentage
7. THE Reporting_Dashboard SHALL display leadership health indicators per leader: report consistency percentage (weeks with submitted report divided by total weeks in the selected range) and attendance stability score (coefficient of variation of weekly attendance over the selected range, displayed as a 1-to-5 scale where 1 indicates high variability above 40% and 5 indicates low variability below 10%)
8. THE Reporting_Dashboard SHALL include a date range filter defaulting to the last 12 weeks, and network/group scope filters that default to the user's hierarchy visibility scope, applied to all visualizations simultaneously
9. IF the selected date range or scope filters return no data for a visualization, THEN THE Reporting_Dashboard SHALL display an empty state message indicating no data is available for the selected filters
10. THE Reporting_Dashboard SHALL render all visualizations within 3 seconds of filter change, displaying skeleton loading placeholders while data is being fetched

### Requirement 15: Organizational Analytics

**User Story:** As a pastor, I want advanced organizational analytics including cohort analysis and predictive indicators, so that I can make data-driven decisions about growth strategy and resource allocation.

#### Acceptance Criteria

1. THE Analytics_Dashboard SHALL display a Cohort_Analysis chart grouping members by their join month and showing retention rates over the subsequent 12 months, where retention is defined as the member maintaining ACTIVE status in at least one group during that month
2. THE Analytics_Dashboard SHALL display a spiritual stage funnel showing conversion rates between each stage (GANADO → CONSOLIDADO → DISCIPULADO → ENVIADO) and average time spent in each stage displayed in days
3. THE Analytics_Dashboard SHALL display network comparison dashboards showing growth velocity (percentage change in active members over the selected time window), attendance trends (12-week rolling average), and conversion rates per network
4. THE Analytics_Dashboard SHALL display leadership effectiveness metrics per leader: report submission rate as a percentage of expected weekly reports over the last 12 weeks, attendance growth percentage under their leadership over the same period, and current disciple count
5. THE Analytics_Dashboard SHALL display a Heatmap of reporting activity aggregated over the last 12 weeks by day of week (7 columns) and hour of day (24 rows)
6. THE Analytics_Dashboard SHALL display comparative analytics for total attendance, active members, conversion rate, and new member count: current month vs previous month and current quarter vs previous quarter, showing absolute difference and percentage change
7. THE Analytics_Dashboard SHALL provide export functionality to PDF and Excel formats for all charts and data tables
8. THE Analytics_Dashboard SHALL display growth velocity indicators showing the percentage rate of change in total attendance, active members, new converts, and active groups over selectable time windows of 4, 8, or 12 weeks, defaulting to 4 weeks
9. IF the available data covers fewer than 4 weeks for any analytics view, THEN THE Analytics_Dashboard SHALL display an informational message indicating insufficient data and the minimum data period required instead of rendering the chart

### Requirement 16: Mobile Reporting UX

**User Story:** As a cell leader using a mobile phone, I want a touch-optimized reporting experience with offline support and quick-report shortcuts, so that I can submit reports immediately after my cell meeting regardless of connectivity.

#### Acceptance Criteria

1. WHILE the viewport width is less than 768 pixels, THE Cell_Report_Form SHALL render all interactive elements with a minimum touch target of 44x44 pixels
2. WHILE the viewport width is less than 768 pixels, THE Cell_Report_Form SHALL use Bottom_Sheet modals instead of centered dialog modals
3. THE Cell_Report_Form SHALL provide a Quick_Report_Mode that pre-fills the form with data from the most recent submitted report for the same group
4. WHEN the user activates Quick_Report_Mode, THE Cell_Report_Form SHALL pre-fill all fields except meeting date, attendance counts, visitors, converts, and observations
5. IF the user activates Quick_Report_Mode and no previous report exists for the selected group, THEN THE Cell_Report_Form SHALL display a message indicating no prior report is available and present the form with empty fields
6. WHEN the user submits a report and no internet connection is detected, THE Offline_Sync_Engine SHALL queue the report submission locally, persist it to survive application restarts, and display a confirmation indicating the report is saved for later sync
7. WHEN internet connectivity is restored, THE Offline_Sync_Engine SHALL automatically attempt to submit queued reports in chronological order, with a maximum of 3 retry attempts per report spaced 10 seconds apart, and display a sync status indicator showing the count of pending, synced, and failed reports
8. IF a queued report submission fails due to a 409 conflict, THEN THE Offline_Sync_Engine SHALL display an in-app notification identifying the conflicting report and preserve the report data for manual resolution
9. IF a queued report submission fails 3 consecutive times for reasons other than a 409 conflict, THEN THE Offline_Sync_Engine SHALL mark the report as failed, stop retrying, and notify the user to retry manually
10. THE Cell_Report_Form SHALL support swipe navigation between wizard steps, requiring a minimum horizontal swipe distance of 50 pixels, with an animated slide transition in the swipe direction

### Requirement 17: Permission Management UI

**User Story:** As a super administrator, I want a visual interface to manage roles and permissions, so that I can configure access control without modifying code.

#### Acceptance Criteria

1. THE Permission_UI SHALL display a role-permission matrix where rows represent the defined roles (SUPER_ADMIN, ADMIN, LEADER, MEMBER, GUEST), columns represent each resource-action combination (resources: users, groups, memberships, discipleship, reports, audit, permissions; actions: CREATE, READ, UPDATE, DELETE, MANAGE), and each cell indicates whether the permission is granted, denied, or inherited from role defaults
2. WHEN the administrator toggles a permission cell in the matrix, THE Permission_UI SHALL send the update to the backend API and reflect the confirmed new state within 2 seconds, disabling the toggled cell until the server response is received
3. IF the backend API returns an error when toggling a permission, THEN THE Permission_UI SHALL revert the cell to its previous state and display an error notification indicating the reason for failure
4. THE Permission_UI SHALL display permissions grouped by Permission_Scope tabs: global, network, discipleship, group, and leadership, filtering the matrix to show only resources relevant to the selected scope
5. THE Permission_UI SHALL allow configuration of scope-based visibility rules by presenting a hierarchy tree where the administrator can assign which organizational levels (Pastor General, Pastor Red, Cobertura, Líder, Estaca) each role can view data for
6. THE Permission_UI SHALL display a paginated permission audit trail (20 entries per page) showing all permission changes with timestamp, actor name, target user, resource, action, and before/after granted values
7. THE Permission_UI SHALL support temporary permission grants with a date picker that requires an expiry date between 1 day and 365 days from the current date
8. THE Permission_UI SHALL support delegation where a leader can grant only permissions that exist within their own effective permission set to users who are their direct or indirect subordinates in the organizational hierarchy
9. IF a permission grant would exceed the granting user's own effective permissions or target a user outside their subordinate hierarchy, THEN THE Permission_UI SHALL reject the operation, keep the matrix unchanged, and display an error notification indicating which constraint was violated

### Requirement 18: Global Mobile-First Design System

**User Story:** As a user on any device, I want all platform interfaces to be optimized for mobile-first interaction, so that I have a premium experience regardless of screen size.

#### Acceptance Criteria

1. THE Platform SHALL render all form inputs with a minimum height of 44 pixels on viewports narrower than 768 pixels
2. WHEN the viewport width is less than 768 pixels, THE Platform SHALL use Bottom_Sheet modals for all confirmation dialogs and selection interfaces
3. WHILE data is loading, THE Platform SHALL display contextual skeleton placeholders that replicate the dimensions and position of the expected content elements (text blocks, images, cards)
4. WHEN the user navigates between pages, THE Platform SHALL apply a Framer Motion fade-in transition with a duration between 200ms and 400ms
5. WHEN a create or submit operation completes successfully (report submission, member creation, group creation, or membership assignment), THE Platform SHALL display a success celebration animation (confetti or checkmark) lasting between 2 and 4 seconds
6. IF a data-fetching request takes longer than 10 seconds without a response, THEN THE Platform SHALL replace the skeleton placeholder with an error state indicating the request timed out and offering a retry action
7. THE Platform SHALL maintain all user-facing text, labels, and descriptions in Spanish language

### Requirement 19: Operational Intelligence Alerts

**User Story:** As a pastor, I want automated alerts for operational anomalies, so that I can proactively address issues before they become problems.

#### Acceptance Criteria

1. THE Reporting_Dashboard SHALL display an alerts panel showing up to 50 alerts, sorted by creation date descending, in the following categories: cells without reports for 2 or more consecutive weeks, leaders with declining attendance (3 or more consecutive weeks where each week's total attendance is lower than the previous week), and groups with zero visitors for 4 or more consecutive weeks
2. WHEN a new alert is generated, THE Platform SHALL create an in-app notification for the coverage leader responsible for the group or leader that triggered the alert
3. IF a KPI_Card metric deviates more than 20% above or below its 4-week moving average, THEN THE Reporting_Dashboard SHALL display a directional anomaly indicator on that KPI_Card showing whether the deviation is positive or negative
4. THE Reporting_Dashboard SHALL display a churn risk list showing members who have not attended in 3 or more consecutive weeks, categorized into risk levels: moderate (3-4 weeks absent), high (5-6 weeks absent), and critical (7 or more weeks absent), displaying up to 100 members sorted by risk level descending
5. WHEN the user clicks an alert in the alerts panel, THE Reporting_Dashboard SHALL navigate to the relevant group or leader detail view associated with that alert
6. WHEN the user dismisses an alert, THE Reporting_Dashboard SHALL mark the alert as acknowledged and move it to an acknowledged section that remains accessible via a toggle filter

### Requirement 20: Map Integration for Groups

**User Story:** As a pastor or administrator, I want to see groups plotted on a map, so that I can understand geographic distribution and identify areas without coverage.

#### Acceptance Criteria

1. THE Groups_Page SHALL include a map view toggle that displays all groups having non-null latitude and longitude values as markers on a map that supports pan, zoom, and click interactions
2. WHEN the user clicks a group marker on the map, THE Groups_Page SHALL display a popup with group name, leader name, member count, and a link to the group detail page
3. WHILE the map zoom level causes markers to be within 50 pixels of each other on screen, THE Groups_Page SHALL merge those markers into a cluster indicator displaying the count of grouped markers
4. WHEN the user clicks a cluster indicator, THE Groups_Page SHALL zoom the map to a level that expands the cluster into individual markers or smaller clusters
5. IF one or more groups do not have GPS coordinates, THEN THE Groups_Page SHALL display a count of groups without coordinates alongside the map and exclude them from the map markers
6. WHEN the map view is activated, THE Groups_Page SHALL set the initial viewport to fit all visible markers within the map bounds
7. THE Groups_Page SHALL highlight areas beyond a 2-kilometer radius from any group marker using a reduced-opacity overlay to indicate zones without group coverage
