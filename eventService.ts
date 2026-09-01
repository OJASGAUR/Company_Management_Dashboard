import { pool } from '../db/pool';
import {
  CalendarEvent,
  CreateEventInput,
  UpdateEventInput,
  EventFilters,
} from '../types/calendar.types';

// Maps a snake_case DB row to our camelCase domain type.
function mapRow(row: any): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    startTime: row.start_time,
    endTime: row.end_time,
    allDay: row.all_day,
    location: row.location,
    isRecurring: row.is_recurring,
    recurrenceRule: row.recurrence_rule,
    metadata: row.metadata ?? {},
    createdBy: row.created_by,
    externalProvider: row.external_provider,
    externalEventId: row.external_event_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const eventService = {
  async create(input: CreateEventInput): Promise<CalendarEvent> {
    const { rows } = await pool.query(
      `INSERT INTO events
         (title, description, category, start_time, end_time, all_day,
          location, is_recurring, recurrence_rule, metadata, created_by)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       RETURNING *`,
      [
        input.title,
        input.description ?? null,
        input.category,
        input.startTime,
        input.endTime ?? null,
        input.allDay ?? false,
        input.location ?? null,
        input.isRecurring ?? false,
        input.recurrenceRule ?? null,
        JSON.stringify(input.metadata ?? {}),
        input.createdBy ?? null,
      ],
    );
    return mapRow(rows[0]);
  },

  async getById(id: string): Promise<CalendarEvent | null> {
    const { rows } = await pool.query('SELECT * FROM events WHERE id = $1', [id]);
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async list(filters: EventFilters = {}): Promise<CalendarEvent[]> {
    const clauses: string[] = [];
    const values: unknown[] = [];

    if (filters.category) {
      values.push(filters.category);
      clauses.push(`category = $${values.length}`);
    }
    if (filters.from) {
      values.push(filters.from);
      clauses.push(`start_time >= $${values.length}`);
    }
    if (filters.to) {
      values.push(filters.to);
      clauses.push(`start_time <= $${values.length}`);
    }
    if (filters.createdBy) {
      values.push(filters.createdBy);
      clauses.push(`created_by = $${values.length}`);
    }

    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await pool.query(
      `SELECT * FROM events ${where} ORDER BY start_time ASC`,
      values,
    );
    return rows.map(mapRow);
  },

  async update(id: string, input: UpdateEventInput): Promise<CalendarEvent | null> {
    const fieldMap: Record<string, unknown> = {
      title: input.title,
      description: input.description,
      category: input.category,
      start_time: input.startTime,
      end_time: input.endTime,
      all_day: input.allDay,
      location: input.location,
      is_recurring: input.isRecurring,
      recurrence_rule: input.recurrenceRule,
      metadata: input.metadata !== undefined ? JSON.stringify(input.metadata) : undefined,
    };

    const setClauses: string[] = [];
    const values: unknown[] = [];
    for (const [column, value] of Object.entries(fieldMap)) {
      if (value === undefined) continue;
      values.push(value);
      setClauses.push(`${column} = $${values.length}`);
    }

    if (setClauses.length === 0) {
      return this.getById(id);
    }

    values.push(id);
    const { rows } = await pool.query(
      `UPDATE events SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values,
    );
    return rows[0] ? mapRow(rows[0]) : null;
  },

  async remove(id: string): Promise<boolean> {
    const result = await pool.query('DELETE FROM events WHERE id = $1', [id]);
    return (result.rowCount ?? 0) > 0;
  },

  /** Upsert used by the Google/Outlook sync jobs to avoid duplicate imports. */
  async upsertFromExternal(
    provider: 'google' | 'outlook',
    externalId: string,
    input: CreateEventInput,
  ): Promise<CalendarEvent> {
    const { rows } = await pool.query(
      `INSERT INTO events
         (title, description, category, start_time, end_time, all_day,
          location, metadata, external_provider, external_event_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       ON CONFLICT (external_provider, external_event_id)
       DO UPDATE SET
         title = EXCLUDED.title,
         description = EXCLUDED.description,
         start_time = EXCLUDED.start_time,
         end_time = EXCLUDED.end_time,
         all_day = EXCLUDED.all_day,
         location = EXCLUDED.location,
         metadata = EXCLUDED.metadata
       RETURNING *`,
      [
        input.title,
        input.description ?? null,
        input.category,
        input.startTime,
        input.endTime ?? null,
        input.allDay ?? false,
        input.location ?? null,
        JSON.stringify(input.metadata ?? {}),
        provider,
        externalId,
      ],
    );
    return mapRow(rows[0]);
  },
};
