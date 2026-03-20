import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/settings - Busca configurações
export async function GET() {
  const settings = await prisma.settings.findFirst();
  return NextResponse.json(settings);
}

// POST /api/settings - Cria ou atualiza configurações
export async function POST(request: Request) {
  const body = await request.json();
  const { businessName, welcomeMsg, promotion, whatsappNumber } = body;

  if (!welcomeMsg || typeof welcomeMsg !== 'string') {
    return NextResponse.json(
      { error: 'welcomeMsg é obrigatório' },
      { status: 400 }
    );
  }

  const existing = await prisma.settings.findFirst();

  const data = {
    businessName: businessName?.trim() || 'Bot Bruna',
    welcomeMsg,
    promotion: promotion || null,
    whatsappNumber: whatsappNumber?.replace(/\D/g, '') || '',
  };

  let settings;
  if (existing) {
    settings = await prisma.settings.update({
      where: { id: existing.id },
      data,
    });
  } else {
    settings = await prisma.settings.create({ data });
  }

  return NextResponse.json(settings);
}
