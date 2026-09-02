import { CalendarEvent, CalendarIntegration } from '@prisma/client';

export enum EventCategory {
  PUBLIC_HOLIDAY = 'public_holiday',
  EMPLOYEE_BIRTHDAY = 'employee_birthday',
  WORK_ANNIVERSARY = 'work_anniversary',
  CLIENT_MEETING = 'client_meeting',
  TEAM_MEETING = 'team_meeting',
  PROJECT_DEADLINE = 'project_deadline',
  LEAVE = 'leave',
  INTERVIEW = 'interview',
  COMPANY_EVENT = 'company_event',
}

export enum CalendarProvider {
  GOOGLE = 'google',
  OUTLOOK = 'outlook',
}

export type { CalendarEvent, CalendarIntegration };

export interface CreateEventInput {
  title: string;
  description?: string;
  category: EventCategory;
  startTime: Date;
  endTime?: Date;
  allDay?: boolean;
  location?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
  metadata?: Record<string, unknown>;
  createdBy?: string;
}

export type UpdateEventInput = Partial<CreateEventInput>;

export interface EventFilters {
  category?: EventCategory;
  from?: Date;
  to?: Date;
  createdBy?: string;
}



/**
 * Common contract both Google and Outlook sync services implement,
 * so the rest of the app doesn't care which provider it's talking to.
 */
export interface CalendarSyncProvider {
  getAuthUrl(state: string): string;
  exchangeCodeForToken(code: string): Promise<{
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
  }>;
  pullEvents(integration: CalendarIntegration, sinceISO?: string): Promise<CreateEventInput[]>;
  pushEvent(integration: CalendarIntegration, event: CalendarEvent): Promise<string>; // returns external event id
}
