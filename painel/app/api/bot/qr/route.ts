import { NextResponse } from 'next/server';

const BOT_API = process.env.BOT_API_URL || 'http://localhost:3001';

export async function GET() {
  try {
    const res = await fetch(`${BOT_API}/bot/qr`, { cache: 'no-store' });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ qr: null, message: 'Bot API indisponível.' });
  }
}
