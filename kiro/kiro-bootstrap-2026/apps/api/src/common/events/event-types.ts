/**
 * Domain event type definitions for the ECOS platform.
 * These events are emitted via BullMQ for async processing.
 */

export const DOMAIN_EVENTS = {
  USER_CREATED: 'UserCreated',
  INVITATION_SENT: 'InvitationSent',
  REPORT_SUBMITTED: 'ReportSubmitted',
  MEMBERSHIP_ADDED: 'MembershipAdded',
  ANALYTICS_UPDATED: 'AnalyticsUpdated',
  NOTIFICATION_TRIGGERED: 'NotificationTriggered',
} as const;

export type DomainEventName = (typeof DOMAIN_EVENTS)[keyof typeof DOMAIN_EVENTS];

export interface UserCreatedEvent {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  createdBy?: string;
  timestamp: string;
}

export interface InvitationSentEvent {
  invitationId: string;
  email: string;
  invitedBy: string;
  groupId?: string;
  groupName?: string;
  timestamp: string;
}

export interface ReportSubmittedEvent {
  reportType: string;
  groupId?: string;
  requestedBy: string;
  params: Record<string, unknown>;
  timestamp: string;
}

export interface MembershipAddedEvent {
  membershipId: string;
  userId: string;
  groupId: string;
  role: string;
  addedBy?: string;
  timestamp: string;
}

export interface AnalyticsUpdatedEvent {
  metric: string;
  entityType: string;
  entityId: string;
  value: number;
  timestamp: string;
}

export interface NotificationTriggeredEvent {
  type: string;
  recipientId: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  timestamp: string;
}

export type DomainEventPayload =
  | UserCreatedEvent
  | InvitationSentEvent
  | ReportSubmittedEvent
  | MembershipAddedEvent
  | AnalyticsUpdatedEvent
  | NotificationTriggeredEvent;
