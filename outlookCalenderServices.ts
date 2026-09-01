import { Client } from '@microsoft/microsoft-graph-client';
import {
  CalendarIntegration,
  CalendarEvent,
  CalendarSyncProvider,
  CreateEventInput,
  EventCategory,
} from '../types/calendar.types';

function graphClientFor(integration: CalendarIntegration) {
  return Client.init({
    authProvider: (done) => done(null, integration.accessToken),
  });
}

const TENANT = process.env.MS_TENANT_ID ?? 'common';
const AUTH_BASE = `https://login.microsoftonline.com/${TENANT}/oauth2/v2.0`;
const SCOPES = ['Calendars.ReadWrite', 'offline_access'];

export const outlookCalendarService: CalendarSyncProvider = {
  getAuthUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: process.env.MS_CLIENT_ID ?? '',
      response_type: 'code',
      redirect_uri: process.env.MS_REDIRECT_URI ?? '',
      response_mode: 'query',
      scope: SCOPES.join(' '),
      state,
    });
    return `${AUTH_BASE}/authorize?${params.toString()}`;
  },

  async exchangeCodeForToken(code: string) {
    const params = new URLSearchParams({
      client_id: process.env.MS_CLIENT_ID ?? '',
      client_secret: process.env.MS_CLIENT_SECRET ?? '',
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.MS_REDIRECT_URI ?? '',
      scope: SCOPES.join(' '),
    });

    const res = await fetch(`${AUTH_BASE}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });
    const json = await res.json();

    return {
      accessToken: json.access_token as string,
      refreshToken: json.refresh_token as string | undefined,
      expiresAt: json.expires_in ? new Date(Date.now() + json.expires_in * 1000) : undefined,
    };
  },

  async pullEvents(integration: CalendarIntegration, sinceISO?: string): Promise<CreateEventInput[]> {
    const client = graphClientFor(integration);
    const filter = sinceISO ? `start/dateTime ge '${sinceISO}'` : undefined;

    const response = await client
      .api('/me/events')
      .filter(filter ?? '')
      .top(250)
      .orderby('start/dateTime')
      .get();

    return (response.value ?? []).map((item: any) => ({
      title: item.subject ?? '(untitled event)',
      description: item.bodyPreview ?? undefined,
      category: EventCategory.TEAM_MEETING, // caller can re-categorize after import
      startTime: new Date(item.start.dateTime + 'Z'),
      endTime: new Date(item.end.dateTime + 'Z'),
      allDay: Boolean(item.isAllDay),
      location: item.location?.displayName ?? undefined,
      metadata: { outlookEventId: item.id },
    }));
  },

  async pushEvent(integration: CalendarIntegration, event: CalendarEvent): Promise<string> {
    const client = graphClientFor(integration);
    const created = await client.api('/me/events').post({
      subject: event.title,
      body: { contentType: 'text', content: event.description ?? '' },
      location: event.location ? { displayName: event.location } : undefined,
      isAllDay: event.allDay,
      start: { dateTime: event.startTime.toISOString(), timeZone: 'UTC' },
      end: { dateTime: (event.endTime ?? event.startTime).toISOString(), timeZone: 'UTC' },
    });
    return created.id as string;
  },
};
