import { Injectable } from '@nestjs/common';

/**
 * Report Period Locking Service
 *
 * Business Rules (from PRD):
 * - Normal Submission: Sunday (day of meeting)
 * - Late Submission: Monday - Wednesday
 * - Closed: Thursday onwards
 *
 * Timezone: America/Panama (UTC-5) — read from campus.timezone
 */

export type PeriodStatus = 'NORMAL' | 'LATE' | 'CLOSED';

@Injectable()
export class ReportPeriodService {
  /**
   * Determine the period status for a report submission.
   *
   * @param meetingDate - The date the cell meeting was held
   * @param submissionDate - The date/time the report is being submitted (defaults to now)
   * @param timezone - Campus timezone (default: America/Panama)
   * @returns PeriodStatus: NORMAL (Sunday), LATE (Mon-Wed), CLOSED (Thu+)
   */
  getPeriodStatus(
    meetingDate: Date,
    submissionDate: Date = new Date(),
    timezone = 'America/Panama',
  ): PeriodStatus {
    // Get the Monday of the meeting week
    const weekStart = this.getWeekStart(meetingDate);

    // Calculate days since meeting's Monday
    const daysSinceMonday = Math.floor(
      (submissionDate.getTime() - weekStart.getTime()) / (24 * 60 * 60 * 1000),
    );

    // Sunday = day 6 (Monday=0, ..., Sunday=6)
    // Report window:
    //   Day 6 (Sunday) = NORMAL
    //   Day 7 (Monday next week) through Day 9 (Wednesday) = LATE
    //   Day 10+ (Thursday onwards) = CLOSED

    if (daysSinceMonday <= 6) {
      // Still in the meeting week (Sunday or before)
      return 'NORMAL';
    } else if (daysSinceMonday <= 9) {
      // Monday through Wednesday of next week
      return 'LATE';
    } else {
      // Thursday onwards
      return 'CLOSED';
    }
  }

  /**
   * Check if a report can be submitted or edited.
   * Returns true if the period allows submission.
   */
  canSubmit(meetingDate: Date, submissionDate: Date = new Date()): boolean {
    const status = this.getPeriodStatus(meetingDate, submissionDate);
    return status !== 'CLOSED';
  }

  /**
   * Get Monday 00:00:00 for a given date's week.
   */
  getWeekStart(date: Date): Date {
    const d = new Date(date);
    const dayOfWeek = d.getDay(); // 0=Sun, 1=Mon, ...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    return monday;
  }

  /**
   * Get the week boundaries for display purposes.
   */
  getWeekBoundaries(date: Date): { weekStart: Date; weekEnd: Date; deadlineDate: Date } {
    const weekStart = this.getWeekStart(date);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    // Deadline: Wednesday 23:59:59 of next week
    const deadlineDate = new Date(weekStart);
    deadlineDate.setDate(weekStart.getDate() + 9);
    deadlineDate.setHours(23, 59, 59, 999);

    return { weekStart, weekEnd, deadlineDate };
  }
}
