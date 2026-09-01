import { Request, Response, NextFunction } from 'express';
import { pool } from '../db/pool';
import { googleCalendarService } from '../services/googleCalendarService';
import { outlookCalendarService } from '../services/outlookCalendarService';
import { eventService } from '../services/eventService';
import { CalendarProvider, CalendarIntegration } from '../types/calendar.types';

function providerService(provider: CalendarProvider) {
  return provider === CalendarProvider.GOOGLE ? googleCalendarService : outlookCalendarService;
}

export const integrationController = {
  connect(req: Request, res: Response) {
    const provider = req.params.provider as CalendarProvider;
    const userId = req.query.userId as string; 
    const url = providerService(provider).getAuthUrl(userId);
    res.redirect(url);
  },

 
  async callback(req: Request, res: Response, next: NextFunction) {
    try {
      const provider = req.params.provider as CalendarProvider;
      const userId = req.query.state as string;
      const code = req.query.code as string;

      const tokens = await providerService(provider).exchangeCodeForToken(code);

      await pool.query(
        `INSERT INTO calendar_integrations (user_id, provider, access_token, refresh_token, token_expires_at)
         VALUES ($1,$2,$3,$4,$5)
         ON CONFLICT (user_id, provider)
         DO UPDATE SET access_token = EXCLUDED.access_token,
                        refresh_token = EXCLUDED.refresh_token,
                        token_expires_at = EXCLUDED.token_expires_at`,
        [userId, provider, tokens.accessToken, tokens.refreshToken ?? null, tokens.expiresAt ?? null],
      );

      res.json({ status: 'connected', provider });
    } catch (err) {
      next(err);
    }
  },

  // Pull events from the external calendar into our events table
  async sync(req: Request, res: Response, next: NextFunction) {
    try {
      const provider = req.params.provider as CalendarProvider;
      const userId = req.query.userId as string;

      const { rows } = await pool.query(
        'SELECT * FROM calendar_integrations WHERE user_id = $1 AND provider = $2',
        [userId, provider],
      );
      if (!rows[0]) return res.status(404).json({ error: 'Integration not connected' });

      const integration: CalendarIntegration = {
        id: rows[0].id,
        userId: rows[0].user_id,
        provider: rows[0].provider,
        accessToken: rows[0].access_token,
        refreshToken: rows[0].refresh_token,
        tokenExpiresAt: rows[0].token_expires_at,
        externalCalendarId: rows[0].external_calendar_id,
        connectedAt: rows[0].connected_at,
      };

      const incoming = await providerService(provider).pullEvents(integration);

      const saved = await Promise.all(
        incoming.map((evt) =>
          eventService.upsertFromExternal(
            provider,
            (evt.metadata as any)?.googleEventId ?? (evt.metadata as any)?.outlookEventId,
            evt,
          ),
        ),
      );

      res.json({ imported: saved.length, events: saved });
    } catch (err) {
      next(err);
    }
  },
};
