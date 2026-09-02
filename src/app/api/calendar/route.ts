import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/calendar - Retrieve calendar events
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const events = await prisma.calendarEvent.findMany({
      where: {
        ...(start && end
          ? {
              startTime: { gte: new Date(start) },
              endTime: { lte: new Date(end) },
            }
          : {}),
      },
      orderBy: { startTime: 'asc' },
    });

    return NextResponse.json({ success: true, data: events });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch calendar events' },
      { status: 500 }
    );
  }
}

// POST /api/calendar - Create new calendar event
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, category, startTime, endTime, allDay } = body;

    const newEvent = await prisma.calendarEvent.create({
      data: {
        title,
        description,
        category: category || "team_meeting",
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        allDay: Boolean(allDay),
      },
    });

    return NextResponse.json({ success: true, data: newEvent }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create calendar event' },
      { status: 400 }
    );
  }
}
