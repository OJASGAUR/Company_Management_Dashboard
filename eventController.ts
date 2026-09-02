// Next.js App Router format (src/app/api/events/route.ts)
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  return NextResponse.json({ message: "Success" });
}
