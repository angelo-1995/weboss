# Requirements Document

## Introduction

The Network Sermons feature enables network pastors (PASTOR_RED) to publish sermons to all registered members within their network. Sermons contain multimedia content (video, files, images) and are distributed via in-site and email notifications. The system supports scheduled publishing, sermon archives, view tracking, and an administrative panel for sermon management.

## Glossary

- **Sermon_Service**: The backend module responsible for creating, storing, scheduling, and distributing sermons within a network.
- **Sermon_Admin_Panel**: The frontend administrative interface used by network pastors to manage sermons (create, edit, schedule, delete, view analytics).
- **Notification_Service**: The system component responsible for dispatching in-site notifications and email notifications to network members when a sermon is published.
- **Network_Pastor**: A user with the ministerial role PASTOR_RED who leads a network and has permission to publish sermons to that network.
- **Network_Member**: A user whose `networkId` field associates them with a specific network, making them a recipient of sermons published to that network.
- **Sermon**: A content entity containing a title, description, date, optional cover image, optional video or external link, and optional attached files.
- **View_Receipt**: A record confirming that a specific network member opened or viewed a specific sermon.
- **Scheduled_Sermon**: A sermon with a future `publishAt` timestamp that the system publishes automatically when the scheduled time arrives.

## Requirements

### Requirement 1: Sermon Creation

**User Story:** As a Network Pastor, I want to create a sermon with rich content fields, so that I can share teachings with my network members.

#### Acceptance Criteria

1. WHEN a Network_Pastor submits a valid sermon payload, THE Sermon_Service SHALL create a new Sermon entity associated with the pastor's network.
2. THE Sermon_Service SHALL require a title (1–200 characters) and a date for every sermon.
3. THE Sermon_Service SHALL accept an optional description (up to 5000 characters), an optional cover image URL, an optional video URL or external link, and zero or more attached files.
4. IF a user without the PASTOR_RED ministerial role or without NetworkLeader association attempts to create a sermon, THEN THE Sermon_Service SHALL reject the request with a 403 Forbidden response.
5. WHEN a sermon is created, THE Sermon_Service SHALL emit a `sermon.created` audit event containing the sermon ID, network ID, and creator user ID.

### Requirement 2: Sermon Editing and Deletion

**User Story:** As a Network Pastor, I want to edit or delete sermons I have published, so that I can correct mistakes or remove outdated content.

#### Acceptance Criteria

1. WHEN a Network_Pastor submits an update to an existing sermon, THE Sermon_Service SHALL apply the changes and emit a `sermon.updated` audit event.
2. WHEN a Network_Pastor requests deletion of a sermon, THE Sermon_Service SHALL perform a soft delete (set `deletedAt` timestamp) and emit a `sermon.deleted` audit event.
3. IF a user attempts to edit or delete a sermon belonging to a different network, THEN THE Sermon_Service SHALL reject the request with a 403 Forbidden response.
4. THE Sermon_Service SHALL preserve the original sermon data in the audit log before applying updates.

### Requirement 3: Scheduled Publishing

**User Story:** As a Network Pastor, I want to schedule sermons for future publication, so that I can prepare content in advance and have it delivered at the right time.

#### Acceptance Criteria

1. WHEN a Network_Pastor provides a `publishAt` timestamp in the future during sermon creation, THE Sermon_Service SHALL store the sermon in DRAFT status without notifying members.
2. WHEN the current time reaches or exceeds a Scheduled_Sermon's `publishAt` timestamp, THE Sermon_Service SHALL transition the sermon status to PUBLISHED and trigger the notification flow.
3. THE Sermon_Service SHALL check for pending scheduled sermons at intervals no greater than 60 seconds.
4. IF a Network_Pastor updates the `publishAt` timestamp of a DRAFT sermon to a past time, THEN THE Sermon_Service SHALL publish the sermon immediately and trigger notifications.
5. WHEN a Network_Pastor creates a sermon without a `publishAt` timestamp, THE Sermon_Service SHALL publish the sermon immediately.

### Requirement 4: Sermon Distribution via Notifications

**User Story:** As a Network Member, I want to receive notifications when a new sermon is published in my network, so that I can access the content promptly.

#### Acceptance Criteria

1. WHEN a sermon transitions to PUBLISHED status, THE Notification_Service SHALL create an in-site notification for each active Network_Member in the sermon's network.
2. WHEN a sermon transitions to PUBLISHED status, THE Notification_Service SHALL enqueue an email notification job for each active Network_Member who has a valid email address.
3. THE Notification_Service SHALL process email notifications asynchronously via a BullMQ queue to avoid blocking the publishing flow.
4. THE Notification_Service SHALL include the sermon title, a brief excerpt of the description (up to 150 characters), and a direct link to the sermon in both in-site and email notifications.
5. IF email delivery fails for a specific member, THEN THE Notification_Service SHALL log the failure and retry up to 3 times with exponential backoff.

### Requirement 5: Sermon Archive and History

**User Story:** As a Network Member, I want to browse past sermons in my network, so that I can revisit teachings at any time.

#### Acceptance Criteria

1. THE Sermon_Service SHALL provide a paginated list of published sermons for a given network, ordered by sermon date descending.
2. WHEN a Network_Member requests the sermon archive, THE Sermon_Service SHALL return only sermons belonging to the member's network that have PUBLISHED status and are not soft-deleted.
3. THE Sermon_Service SHALL support filtering sermons by date range and text search on title and description.
4. THE Sermon_Service SHALL use cursor-based pagination consistent with the existing pagination pattern in the platform.

### Requirement 6: View Tracking and Confirmation

**User Story:** As a Network Pastor, I want to see which members have viewed each sermon, so that I can follow up with those who have not engaged.

#### Acceptance Criteria

1. WHEN a Network_Member opens a sermon detail page, THE Sermon_Service SHALL record a View_Receipt containing the member's user ID, the sermon ID, and the timestamp.
2. THE Sermon_Service SHALL record at most one View_Receipt per member per sermon (subsequent views update the timestamp but do not create duplicates).
3. WHEN a Network_Pastor requests view analytics for a sermon, THE Sermon_Service SHALL return the total view count, the list of members who viewed, and the list of members who have not viewed.
4. IF a user without PASTOR_RED role or NetworkLeader association requests view analytics, THEN THE Sermon_Service SHALL reject the request with a 403 Forbidden response.

### Requirement 7: Administrative Panel

**User Story:** As a Network Pastor, I want a dedicated admin panel for managing sermons, so that I can efficiently create, schedule, and monitor sermon engagement.

#### Acceptance Criteria

1. THE Sermon_Admin_Panel SHALL display a dashboard showing total sermons published, total views, and pending scheduled sermons for the pastor's network.
2. THE Sermon_Admin_Panel SHALL provide a form for creating and editing sermons with fields for title, description, date, cover image upload, video URL or external link, file attachments, and optional scheduled publish date.
3. THE Sermon_Admin_Panel SHALL display a table of all sermons (published, draft, scheduled) with columns for title, date, status, view count, and actions (edit, delete, view analytics).
4. THE Sermon_Admin_Panel SHALL provide a detail view for each sermon showing full content and a breakdown of which members viewed or did not view the sermon.
5. WHEN a Network_Pastor is not associated with any network as a leader, THE Sermon_Admin_Panel SHALL display a message indicating no network is assigned.

### Requirement 8: File and Media Upload

**User Story:** As a Network Pastor, I want to upload cover images and file attachments for sermons, so that I can enrich the sermon content with visual and supplementary materials.

#### Acceptance Criteria

1. THE Sermon_Service SHALL accept cover image uploads in JPEG, PNG, or WebP format with a maximum file size of 5 MB.
2. THE Sermon_Service SHALL accept file attachments in PDF, DOCX, or TXT format with a maximum individual file size of 20 MB.
3. THE Sermon_Service SHALL allow up to 10 file attachments per sermon.
4. IF an uploaded file exceeds the maximum size or is in an unsupported format, THEN THE Sermon_Service SHALL reject the upload with a descriptive error message indicating the constraint violated.
5. THE Sermon_Service SHALL store uploaded files in a persistent storage location and associate the file URLs with the sermon entity.

### Requirement 9: Access Control and Hierarchy

**User Story:** As a system administrator, I want sermon management to respect the existing network hierarchy, so that pastors can only manage sermons within their own network.

#### Acceptance Criteria

1. THE Sermon_Service SHALL restrict sermon creation, editing, and deletion to users who are registered as NetworkLeader for the target network with a PASTOR role.
2. THE Sermon_Service SHALL restrict sermon viewing to active members whose `networkId` matches the sermon's network.
3. WHILE a user has the SUPER_ADMIN or ADMIN role, THE Sermon_Service SHALL grant read access to sermons across all networks for oversight purposes.
4. IF a Network_Member's status is not ACTIVE, THEN THE Notification_Service SHALL exclude that member from sermon notifications.
5. THE Sermon_Service SHALL validate network ownership on every mutation request, independent of frontend access controls.

### Requirement 10: Sermon Listing for Members

**User Story:** As a Network Member, I want to see new sermons in my feed and access them easily, so that I stay connected with my network's teachings.

#### Acceptance Criteria

1. THE Sermon_Service SHALL provide an endpoint returning the latest published sermons for the authenticated member's network.
2. WHEN a Network_Member has unread sermons (no View_Receipt exists), THE Sermon_Service SHALL indicate the unread status in the sermon list response.
3. THE Sermon_Service SHALL include a badge count of unread sermons accessible via the notification system for display in the navigation.
