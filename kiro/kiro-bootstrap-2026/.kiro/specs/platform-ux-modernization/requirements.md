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

1. WHEN the cell leader opens the report form, THE Cell_Report_Form SHALL display a 5-step wizard with steps: Identificación, Asistencia, Crecimiento, Reunión, and Resumen
2. THE Cell_Report_Form SHALL display a progress indicator showing the current step number, step name, and completion percentage
3. WHEN the user completes a step and taps "Siguiente", THE Cell_Report_Form SHALL validate only the fields in the current step before advancing
4. IF validation fails on the current step, THEN THE Cell_Report_Form SHALL display inline error messages on the invalid fields and prevent advancement to the next step
5. WHEN the user is on any step after the first, THE Cell_Report_Form SHALL allow navigation back to previous steps without losing entered data
6. WHEN the user reaches the Resumen step, THE Cell_Report_Form SHALL display a read-only summary of all entered data organized by section
7. WHEN the user submits from the Resumen step, THE Cell_Report_Form SHALL send the complete report to the backend API

### Requirement 2: Cell Report Autosave and Draft Support

**User Story:** As a cell leader, I want my in-progress report to be automatically saved, so that I do not lose data if I accidentally close the browser or navigate away.

#### Acceptance Criteria

1. WHILE the user is filling out the Cell_Report_Form, THE Autosave_Engine SHALL persist the current form state to localStorage every 30 seconds
2. WHEN the user returns to the Cell_Report_Form with a saved draft in localStorage, THE Autosave_Engine SHALL restore the form state and display a notification indicating draft restoration
3. WHEN the user successfully submits a report, THE Autosave_Engine SHALL clear the corresponding draft from localStorage
4. IF the user has an active internet connection, THEN THE Autosave_Engine SHALL optionally persist the draft to the server via a PATCH endpoint
5. WHEN the user explicitly discards a draft, THE Autosave_Engine SHALL remove the draft from both localStorage and the server

### Requirement 3: Duplicate Report Prevention UX

**User Story:** As a cell leader, I want to be warned before submitting a duplicate report for the same week, so that I avoid accidental duplicate submissions.

#### Acceptance Criteria

1. WHEN the user selects a group and meeting date in the Cell_Report_Form, THE Cell_Report_Form SHALL check the backend for an existing report for that group and calendar week
2. IF a report already exists for the selected group and week, THEN THE Cell_Report_Form SHALL display a warning banner with the existing report date and a link to view the submitted report
3. WHILE a duplicate warning is active, THE Cell_Report_Form SHALL disable the submit button and display a message explaining that only one report per group per calendar week is allowed

### Requirement 4: Cell Report Mobile-First Controls

**User Story:** As a cell leader using a mobile device, I want large touch-friendly controls for numeric inputs, so that I can quickly and accurately enter attendance numbers.

#### Acceptance Criteria

1. THE Cell_Report_Form SHALL render all numeric attendance fields (men, women, youth male, youth female, children) using Stepper_Control components with minimum touch target size of 44x44 pixels
2. THE Stepper_Control SHALL display increment and decrement buttons flanking the numeric value
3. WHEN the user taps the increment button, THE Stepper_Control SHALL increase the value by 1
4. WHEN the user taps the decrement button, THE Stepper_Control SHALL decrease the value by 1 with a minimum of 0
5. WHEN the user long-presses an increment or decrement button for more than 500 milliseconds, THE Stepper_Control SHALL continuously change the value at a rate of 5 per second
6. THE Cell_Report_Form SHALL support swipe-left and swipe-right gestures to navigate between wizard steps on touch devices

### Requirement 5: Cell Report Post-Submission Experience

**User Story:** As a cell leader, I want to see a celebration animation and trend summary after submitting my report, so that I feel acknowledged and can quickly assess my group's progress.

#### Acceptance Criteria

1. WHEN a report is successfully submitted, THE Cell_Report_Form SHALL display a success animation with confetti or checkmark celebration lasting between 2 and 4 seconds
2. WHEN the success animation completes, THE Cell_Report_Form SHALL display a trend summary comparing the current report's total attendance with the previous week's attendance
3. THE Cell_Report_Form SHALL display micro analytics cards showing: attendance trend (last 4 weeks sparkline), growth rate (visitors + converts as percentage of total), and reporting streak (consecutive weeks reported)
4. WHEN the user dismisses the post-submission view, THE Cell_Report_Form SHALL navigate to the reporting history page

### Requirement 6: Cell Report History and Trends

**User Story:** As a cell leader, I want to view my reporting history with visual trends, so that I can track my group's progress over time.

#### Acceptance Criteria

1. THE Cell_Report_Form SHALL display a mini-chart showing the last 4 weeks of attendance data before the user begins filling a new report
2. WHEN the user navigates to the reporting history page, THE Reporting_Dashboard SHALL display a list of submitted reports with date, total attendance, visitors, and converts for each entry
3. THE Reporting_Dashboard SHALL display a 12-week rolling line chart of total attendance for the selected group
4. THE Reporting_Dashboard SHALL highlight weeks with no submitted report using a visual indicator (gap or warning icon)

### Requirement 7: Structured Observations in Cell Report

**User Story:** As a cell leader, I want to categorize my observations into specific types, so that leadership can filter and act on specific categories of feedback.

#### Acceptance Criteria

1. THE Cell_Report_Form SHALL replace the single observations textarea with categorized input sections: Testimonios, Necesidades, Oración, and Notas
2. WHEN the user enters text in any observation category, THE Cell_Report_Form SHALL store each category as a separate field in the report payload
3. THE Cell_Report_Form SHALL allow each observation category to be empty (all categories are optional)

### Requirement 8: Cell Report New Fields

**User Story:** As a cell leader, I want to record additional meeting details (meeting type, photos, spiritual health, prayer requests, next event), so that leadership has richer data for decision-making.

#### Acceptance Criteria

1. THE Cell_Report_Form SHALL include a meeting type selector with options: Presencial, Virtual, and Híbrida
2. THE Cell_Report_Form SHALL include a photo upload field that accepts up to 3 images in JPEG or PNG format with a maximum size of 5MB each
3. THE Cell_Report_Form SHALL include a spiritual health indicator as a 1-to-5 scale selector with descriptive labels for each level
4. THE Cell_Report_Form SHALL include a prayer requests text field for recording specific prayer needs
5. THE Cell_Report_Form SHALL include a next event date picker for scheduling the next meeting or special event
6. THE Cell_Report_Form SHALL include a structured notes section with predefined categories

### Requirement 9: User Onboarding Multi-Step Wizard

**User Story:** As an administrator, I want to register new members through a guided multi-step wizard, so that I can capture complete profile information including ministry interests and relationships.

#### Acceptance Criteria

1. WHEN the administrator initiates new member creation, THE Onboarding_Wizard SHALL display a 4-step wizard with steps: Datos Básicos, Perfil Ministerial, Relaciones, and Confirmación
2. THE Onboarding_Wizard SHALL validate required fields per step before allowing advancement
3. THE Onboarding_Wizard SHALL include an avatar upload field with crop functionality in the Datos Básicos step
4. THE Onboarding_Wizard SHALL include ministry gifts, interests, and availability selectors in the Perfil Ministerial step
5. THE Onboarding_Wizard SHALL include network assignment with a visual network tree selector in the Relaciones step
6. THE Onboarding_Wizard SHALL include discipleship relationship assignment (mentor selection) in the Relaciones step
7. THE Onboarding_Wizard SHALL include family/spouse relationship linking in the Relaciones step
8. WHEN the user reaches the Confirmación step, THE Onboarding_Wizard SHALL display a complete summary of all entered data with an option to edit any section
9. THE Onboarding_Wizard SHALL be fully functional on mobile viewports with touch-optimized controls

### Requirement 10: Groups Visual Card Management

**User Story:** As a leader, I want to view and manage my groups as visual cards with attendance trends, so that I can quickly assess group health and take actions without navigating to detail pages.

#### Acceptance Criteria

1. THE Groups_Page SHALL provide a toggle between grid view (visual cards) and list view (table)
2. WHEN grid view is active, THE Groups_Page SHALL display each group as a Group_Card containing: group name, code, leader avatar and name, member count, and a 4-week attendance Sparkline
3. THE Group_Card SHALL display quick action buttons for: submit report, add member, and view details
4. THE Groups_Page SHALL include a search input with 300ms debounce for filtering groups by name or code
5. WHEN the user clicks "add member" on a Group_Card, THE Groups_Page SHALL display a search-and-add interface for assigning members to the group
6. THE Groups_Page SHALL display the meeting day and time for each group in a human-readable format

### Requirement 11: Discipleship Hierarchy Visualization

**User Story:** As a pastor or coverage leader, I want to visualize the mentor-disciple relationships as an interactive graph, so that I can understand the leadership structure and identify gaps.

#### Acceptance Criteria

1. THE Discipleship_Graph SHALL render mentor-disciple relationships as a directed tree using ReactFlow_Graph
2. WHEN the user clicks a node in the Discipleship_Graph, THE Discipleship_Graph SHALL display a detail panel with the person's name, role, spiritual stage, and list of direct disciples
3. THE Discipleship_Graph SHALL support drill-down navigation by double-clicking a node to re-center the graph on that person's sub-tree
4. THE Discipleship_Graph SHALL include search functionality to locate a specific person within the graph
5. THE Discipleship_Graph SHALL include filter controls for: network, spiritual stage, and ministerial role
6. THE Discipleship_Graph SHALL display a timeline view showing milestones and check-ins for a selected relationship

### Requirement 12: Leadership Hierarchy Enhanced Visualization

**User Story:** As a pastor, I want an enhanced organigrama with rich node cards, navigation aids, and export capabilities, so that I can effectively manage and communicate the organizational structure.

#### Acceptance Criteria

1. THE Organigrama SHALL render each node with: avatar image, full name, ministerial role badge, network color indicator, and subordinate count
2. THE Organigrama SHALL include a mini-map navigation panel for orientation within large graphs
3. THE Organigrama SHALL include a search input that highlights and centers the graph on matching nodes
4. THE Organigrama SHALL include filter controls for network and ministerial role
5. THE Organigrama SHALL provide export functionality to PNG image and PDF document formats
6. THE Organigrama SHALL include zoom controls (zoom in, zoom out, fit-to-screen) accessible via buttons and pinch gestures on touch devices
7. THE Organigrama SHALL maintain rendering performance of at least 30 frames per second with up to 500 visible nodes
8. WHEN the graph contains more than 200 nodes, THE Organigrama SHALL use virtualization to render only visible nodes within the viewport

### Requirement 13: Membership Visual Management

**User Story:** As an administrator, I want to manage memberships through visual cards with status workflows and bulk operations, so that I can efficiently handle membership transitions and assignments.

#### Acceptance Criteria

1. THE Membership_Page SHALL display members as visual cards showing: avatar, name, current status, group, and spiritual stage
2. THE Membership_Page SHALL include a Visual_State_Machine showing the allowed status transitions (PENDING → ACTIVE → INACTIVE/SUSPENDED)
3. WHEN the administrator selects multiple members, THE Membership_Page SHALL enable bulk actions: assign to group, change status, and change spiritual stage
4. THE Membership_Page SHALL display a history timeline for each member showing all status transitions with dates and actors
5. THE Membership_Page SHALL include a quick transfer interface for moving members between groups
6. THE Membership_Page SHALL include a group membership matrix view showing which members belong to which groups

### Requirement 14: Reporting Dashboards with Drill-Down

**User Story:** As a pastor or administrator, I want comprehensive reporting dashboards with drill-down capabilities, so that I can monitor organizational health and identify areas needing attention.

#### Acceptance Criteria

1. THE Reporting_Dashboard SHALL display KPI_Cards for: total attendance (current week), active groups count, conversion rate, and reporting compliance percentage
2. WHEN the user clicks a KPI_Card, THE Reporting_Dashboard SHALL navigate to a detailed view showing the underlying data with filters
3. THE Reporting_Dashboard SHALL display a 12-week rolling attendance trend line chart with comparison to the same period last year
4. THE Reporting_Dashboard SHALL display a Funnel_Chart showing spiritual stage conversion rates (GANADO → CONSOLIDADO → DISCIPULADO → ENVIADO)
5. THE Reporting_Dashboard SHALL display an inactive cell detection panel listing groups without reports in 2 or more consecutive weeks
6. THE Reporting_Dashboard SHALL display a network comparison chart showing attendance and growth metrics per network
7. THE Reporting_Dashboard SHALL display leadership health indicators: report consistency percentage and attendance stability score per leader
8. THE Reporting_Dashboard SHALL include date range filters and network/group scope filters for all visualizations

### Requirement 15: Organizational Analytics

**User Story:** As a pastor, I want advanced organizational analytics including cohort analysis and predictive indicators, so that I can make data-driven decisions about growth strategy and resource allocation.

#### Acceptance Criteria

1. THE Analytics_Dashboard SHALL display a Cohort_Analysis chart grouping members by their join month and showing retention rates over subsequent months
2. THE Analytics_Dashboard SHALL display a spiritual stage funnel with conversion rates between each stage and average time spent in each stage
3. THE Analytics_Dashboard SHALL display network comparison dashboards showing growth velocity, attendance trends, and conversion rates per network
4. THE Analytics_Dashboard SHALL display leadership effectiveness metrics: report submission rate, attendance growth under leadership, and disciple count per leader
5. THE Analytics_Dashboard SHALL display a Heatmap of reporting activity by day of week and hour of day
6. THE Analytics_Dashboard SHALL display comparative analytics: current month vs previous month, current quarter vs previous quarter
7. THE Analytics_Dashboard SHALL provide export functionality to PDF and Excel formats for all charts and data tables
8. THE Analytics_Dashboard SHALL display growth velocity indicators showing the rate of change in key metrics over configurable time windows

### Requirement 16: Mobile Reporting UX

**User Story:** As a cell leader using a mobile phone, I want a touch-optimized reporting experience with offline support and quick-report shortcuts, so that I can submit reports immediately after my cell meeting regardless of connectivity.

#### Acceptance Criteria

1. THE Cell_Report_Form SHALL render all interactive elements with a minimum touch target of 44x44 pixels on mobile viewports
2. WHEN the viewport width is less than 768 pixels, THE Cell_Report_Form SHALL use Bottom_Sheet modals instead of centered dialog modals
3. THE Cell_Report_Form SHALL provide a Quick_Report_Mode that pre-fills the form with data from the most recent submitted report for the same group
4. WHEN the user activates Quick_Report_Mode, THE Cell_Report_Form SHALL pre-fill all fields except meeting date, attendance counts, visitors, converts, and observations
5. THE Offline_Sync_Engine SHALL queue report submissions locally when no internet connection is detected
6. WHEN internet connectivity is restored, THE Offline_Sync_Engine SHALL automatically attempt to submit queued reports and display a sync status indicator
7. IF a queued report submission fails due to a 409 conflict, THEN THE Offline_Sync_Engine SHALL notify the user and preserve the report data for manual resolution
8. THE Cell_Report_Form SHALL support swipe navigation between wizard steps with visual feedback indicating swipe direction

### Requirement 17: Permission Management UI

**User Story:** As a super administrator, I want a visual interface to manage roles and permissions, so that I can configure access control without modifying code.

#### Acceptance Criteria

1. THE Permission_UI SHALL display a visual role editor showing all defined roles and their associated permissions in a matrix format (roles × resources × actions)
2. WHEN the administrator toggles a permission in the matrix, THE Permission_UI SHALL update the role's permissions via the backend API
3. THE Permission_UI SHALL display contextual Permission_Scopes: global, network, discipleship, group, and leadership
4. THE Permission_UI SHALL allow configuration of scope-based visibility rules (which data each role can see based on their position in the hierarchy)
5. THE Permission_UI SHALL display a permission audit trail showing all permission changes with timestamp, actor, and before/after values
6. THE Permission_UI SHALL support temporary permission grants with an expiry date picker
7. THE Permission_UI SHALL support delegation: a leader can grant sub-permissions from their own permission set to subordinates
8. IF a permission grant would exceed the granting user's own permissions, THEN THE Permission_UI SHALL reject the operation and display an error message

### Requirement 18: Global Mobile-First Design System

**User Story:** As a user on any device, I want all platform interfaces to be optimized for mobile-first interaction, so that I have a premium experience regardless of screen size.

#### Acceptance Criteria

1. THE Platform SHALL render all form inputs with a minimum height of 44 pixels on viewports narrower than 768 pixels
2. THE Platform SHALL use Bottom_Sheet modals for all confirmation dialogs and selection interfaces on mobile viewports
3. THE Platform SHALL implement skeleton loading states for all data-fetching views
4. THE Platform SHALL implement page transition animations using Framer Motion (fade-in with duration between 200ms and 400ms)
5. THE Platform SHALL display a success celebration animation (confetti or checkmark) after all major create/submit operations
6. WHILE data is loading, THE Platform SHALL display contextual skeleton placeholders matching the expected content layout
7. THE Platform SHALL maintain all user-facing text, labels, and descriptions in Spanish language

### Requirement 19: Operational Intelligence Alerts

**User Story:** As a pastor, I want automated alerts for operational anomalies, so that I can proactively address issues before they become problems.

#### Acceptance Criteria

1. THE Reporting_Dashboard SHALL display an alerts panel showing: cells without reports for 2+ weeks, leaders with declining attendance trends (3+ consecutive weeks of decrease), and groups with zero visitors for 4+ weeks
2. WHEN a new alert is generated, THE Platform SHALL create a notification for the responsible coverage leader
3. THE Reporting_Dashboard SHALL display anomaly indicators on KPI_Cards when a metric deviates more than 20% from its 4-week moving average
4. THE Reporting_Dashboard SHALL provide a predictive churn risk indicator for members who have not attended in 3+ weeks

### Requirement 20: Map Integration for Groups

**User Story:** As a pastor or administrator, I want to see groups plotted on a map, so that I can understand geographic distribution and identify areas without coverage.

#### Acceptance Criteria

1. THE Groups_Page SHALL include a map view toggle that displays all groups with GPS coordinates as markers on an interactive map
2. WHEN the user clicks a group marker on the map, THE Groups_Page SHALL display a popup with group name, leader, member count, and a link to the group detail page
3. THE Groups_Page SHALL cluster nearby markers when the zoom level shows overlapping groups
4. THE Groups_Page SHALL highlight areas without group coverage using a visual indicator (e.g., lighter shading or boundary outline)
