import { NextResponse } from 'next/server';

const BOT_API = process.env.BOT_API_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const res = await fetch(`${BOT_API}/bot/status`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ status: 'offline', hasQR: false });
  }
}
