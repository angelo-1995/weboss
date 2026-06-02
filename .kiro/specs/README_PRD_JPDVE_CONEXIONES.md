# J-PDVE CONEXIONES

## Product Requirements Document (PRD)

Version: 1.0

Status: Approved for Development

---

# PROJECT OVERVIEW

J-PDVE Conexiones is a web-based ministry management platform designed for Ministerio Palabras de Vida Eterna.

The platform aims to replace manual paper-based reporting processes and provide a centralized ecosystem for leadership management, cell groups, discipleship tracking, academy management, pastoral analytics and ministry growth.

This platform must be designed as a modular system capable of growing into a multi-church solution in the future.

---

# PRODUCT VISION

## Current Vision

Provide a centralized platform for:

* Leadership management
* Cell reports
* Pastoral dashboards
* Resource distribution
* Member tracking

## Long-Term Vision

Become a complete ministry operating system for churches and ministries.

Future modules:

* Events
* QR attendance
* Academy
* Discipleship
* Multi-church support
* SaaS platform

---

# ORGANIZATIONAL STRUCTURE

The ministry follows a hierarchical structure.

Example:

Pastor General
└── Pastor de Red
└── Cobertura
└── Equipo Ministerial
└── Personas

---

# MINISTERIAL CODES

Every leadership position has a hierarchical code.

Examples:

E
E4
E4.1
E4.1.1
E4.1.1.1

Codes are assigned manually by leadership.

The code hierarchy represents ministry structure.

---

# CORE ENTITY: MINISTRY TEAM

The primary organizational unit is NOT an individual.

The primary unit is a Ministry Team.

Example:

Team:
Luis & Oris

Code:
E5

Members:

* Luis
* Oris

Characteristics:

* Multiple users
* Shared permissions
* Shared reports
* Shared ownership

---

# USER ROLES

## Pastor General

Full access.

Permissions:

* View all data
* Manage all networks
* Manage all users
* View analytics
* View reports

---

## Pastor de Red

Permissions:

* Manage network
* Create coverages
* Create ministry teams
* Upload resources
* View network reports

---

## Cobertura

Permissions:

* Create ministry teams
* Manage assigned teams
* Review reports
* Comment reports

---

## Ministry Team

Permissions:

* Submit reports
* View resources
* Manage assigned people
* View personal statistics

---

# PERSON MANAGEMENT

Persons and Users are separate entities.

A person may exist without having system access.

Example:

Carlos Gomez

Status:
Visitor

Assigned Team:
E4.1

No login required.

---

# PASTORAL PIPELINE

Every person moves through ministry stages.

Visitor
↓
Consolidated
↓
Discipleship
↓
Academy Level 1
↓
Academy Level 2
↓
Academy Level 3
↓
Volunteer
↓
Potential Leader
↓
Leader
↓
Coverage

Pipeline stages must be configurable.

---

# PERSON OWNERSHIP

Each person belongs to a Ministry Team.

Example:

Carlos Gomez

Assigned Team:
Juan & Maria (E4.1)

NOT assigned directly to:

* Pastor
* Coverage
* Church

This simplifies transfers and multiplication.

---

# CELL REPORT MODULE

## Fields

* Report Date
* Ministry Team
* Ministry Code
* Address
* Start Time
* End Time
* Men Attendance
* Women Attendance
* Children Attendance
* Visitors
* Consolidated
* Offering Amount
* Topic
* Notes
* Evidence Photo

---

# REPORT RULES

Normal Submission:
Sunday

Late Submission:
Monday - Wednesday

Closed:
Thursday onwards

Editable by:

* Ministry Team
* Coverage

---

# RESOURCE CENTER

Purpose:

Distribute ministry content.

Initial resources:

* Sermon PDFs
* Training material
* Manuals

Future resources:

* Videos
* Audio
* Academy content

---

# DASHBOARD

## Executive Dashboard

Metrics:

* Weekly attendance
* Weekly offerings
* Visitors
* Consolidated
* Active teams
* Missing reports

---

## Advanced Dashboard

Top 10 Teams

Top 10 Coverages

Top 10 Networks

Growth trends

Attendance trends

Offering trends

---

# PASTORAL ALERT CENTER

System-generated alerts.

Examples:

* Teams not reporting
* Attendance decline
* No follow-up on consolidated members
* Stagnant growth

---

# GEOLOCATION

Store GPS coordinates.

Purpose:

* Cell map
* Growth map
* Expansion analysis

Fields:

* Latitude
* Longitude

---

# AUDIT SYSTEM

Track every critical change.

Store:

* User
* Action
* Date
* Previous Value
* New Value

Audit required for:

* Reports
* Offerings
* Hierarchy
* User changes

---

# NOTIFICATIONS

In-app notifications.

Examples:

* New resource available
* Report pending
* Report approved
* Report commented

---

# CHURCH STRUCTURE

Current:

Ministerio Palabras de Vida Eterna

Future:

Main Church
└── Daughter Churches

Architecture must support this from day one.

---

# ACADEMY MODULE (PHASE 2)

Levels:

* Level 1
* Level 2
* Level 3

Track:

* Attendance
* Progress
* Graduation

---

# EVENTS MODULE (PHASE 3)

Features:

* Event registration
* QR generation
* QR check-in
* Attendance tracking
* Event statistics

QR ownership:

One QR per person.

---

# FUTURE MODULES

## Communications

Announcements

Leadership notices

Ministry updates

---

## Goals

Monthly goals

Network goals

Coverage goals

Growth tracking

---

## Recognition System

Examples:

* First Consolidated
* First Multiplication
* 12 Consecutive Reports
* Leadership Milestones

---

# BRANDING

Product Name:

J-PDVE Conexiones

---

## Visual Style

* Modern
* Cinematic
* Premium
* Youth-Oriented
* Dark Theme

---

## Colors

Primary Blue:
#1565FF

Gold:
#FFB400

Black:
#050505

White:
#F5F7FA

---

## Typography

Headings:
Anton

Body:
Montserrat

---

# DEVELOPMENT PRIORITY

## MVP

* Authentication
* Organization Structure
* Ministry Teams
* Person Management
* Cell Reports
* Resource Center
* Dashboard
* Notifications
* Audit System

---

## Phase 2

* Academy
* Discipleship
* Announcements
* Advanced Analytics

---

## Phase 3

* Events
* QR
* Check-In
* Church Expansion

---

## Phase 4

* Multi-Church
* SaaS
* Enterprise Administration

---

# NON-NEGOTIABLE BUSINESS RULES

1. Ministry Team is the primary organizational unit.
2. Persons and Users are separate entities.
3. Every person belongs to a Ministry Team.
4. Ministry Codes are manually assigned.
5. Reports become locked after Wednesday.
6. Audit logging is mandatory.
7. GPS support must exist.
8. Future church expansion must be supported.
9. System must be mobile-first.
10. Architecture must be modular.
