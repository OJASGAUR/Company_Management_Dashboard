import { google } from 'googleapis';
import {
  CalendarIntegration,
  CalendarEvent,
  CalendarSyncProvider,
  CreateEventInput,
  EventCategory,
} from '../types/calendar.types';

const oauthClient = () =>
  new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );

export const googleCalendarService: CalendarSyncProvider = {
  getAuthUrl(state: string): string {
    const client = oauthClient();
    return client.generateAuthUrl({
      access_type: 'offline', // needed to get a refresh_token back
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      state,
    });
  },

  async exchangeCodeForToken(code: string) {
    const client = oauthClient();
    const { tokens } = await client.getToken(code);
    return {
      accessToken: tokens.access_token as string,
      refreshToken: tokens.refresh_token ?? undefined,
      expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
    };
  },

  async pullEvents(integration: CalendarIntegration, sinceISO?: string): Promise<CreateEventInput[]> {
    const client = oauthClient();
    client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken ?? undefined,
    });

    const calendar = google.calendar({ version: 'v3', auth: client });
    const { data } = await calendar.events.list({
      calendarId: integration.externalCalendarId || 'primary',
      timeMin: sinceISO ?? new Date().toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 250,
    });

    return (data.items ?? []).map((item) => ({
      title: item.summary ?? '(untitled event)',
      description: item.description ?? undefined,
      category: EventCategory.TEAM_MEETING, // caller can re-categorize after import
      startTime: new Date(item.start?.dateTime ?? item.start?.date ?? Date.now()),
      endTime: item.end?.dateTime || item.end?.date
        ? new Date(item.end.dateTime ?? item.end.date!)
        : undefined,
      allDay: Boolean(item.start?.date && !item.start?.dateTime),
      location: item.location ?? undefined,
      metadata: { googleEventId: item.id },
    }));
  },

  async pushEvent(integration: CalendarIntegration, event: CalendarEvent): Promise<string> {
    const client = oauthClient();
    client.setCredentials({
      access_token: integration.accessToken,
      refresh_token: integration.refreshToken ?? undefined,
    });

    const calendar = google.calendar({ version: 'v3', auth: client });
    const { data } = await calendar.events.insert({
      calendarId: integration.externalCalendarId || 'primary',
      requestBody: {
        summary: event.title,
        description: event.description ?? undefined,
        location: event.location ?? undefined,
        start: event.allDay
          ? { date: event.startTime.toISOString().slice(0, 10) }
          : { dateTime: event.startTime.toISOString() },
        end: event.allDay
          ? { date: (event.endTime ?? event.startTime).toISOString().slice(0, 10) }
          : { dateTime: (event.endTime ?? event.startTime).toISOString() },
      },
    });

    return data.id as string;
  },
};
