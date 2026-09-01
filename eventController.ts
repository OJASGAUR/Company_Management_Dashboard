import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { eventService } from '../services/eventService';
import { EventCategory } from '../types/calendar.types';

const createEventSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.nativeEnum(EventCategory),
  startTime: z.coerce.date(),
  endTime: z.coerce.date().optional(),
  allDay: z.boolean().optional(),
  location: z.string().max(255).optional(),
  isRecurring: z.boolean().optional(),
  recurrenceRule: z.string().max(255).optional(),
  metadata: z.record(z.unknown()).optional(),
  createdBy: z.string().uuid().optional(),
});

const updateEventSchema = createEventSchema.partial();

export const eventController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createEventSchema.parse(req.body);
      const event = await eventService.create(input);
      res.status(201).json(event);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await eventService.getById(req.params.id);
      if (!event) return res.status(404).json({ error: 'Event not found' });
      res.json(event);
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { category, from, to, createdBy } = req.query;
      const events = await eventService.list({
        category: category as EventCategory | undefined,
        from: from ? new Date(from as string) : undefined,
        to: to ? new Date(to as string) : undefined,
        createdBy: createdBy as string | undefined,
      });
      res.json(events);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const input = updateEventSchema.parse(req.body);
      const event = await eventService.update(req.params.id, input);
      if (!event) return res.status(404).json({ error: 'Event not found' });
      res.json(event);
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await eventService.remove(req.params.id);
      if (!deleted) return res.status(404).json({ error: 'Event not found' });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
