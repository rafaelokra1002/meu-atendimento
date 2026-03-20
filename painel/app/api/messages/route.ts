import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/messages - Lista mensagens com paginação e filtro
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
  const search = searchParams.get('search') || '';

  const where = search
    ? {
        OR: [
          { body: { contains: search } },
          { from: { contains: search } },
          { name: { contains: search } },
        ],
      }
    : {};

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.message.count({ where }),
  ]);

  return NextResponse.json({
    messages,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

// DELETE /api/messages - Limpa todas as mensagens
export async function DELETE() {
  await prisma.message.deleteMany();
  return NextResponse.json({ success: true });
}
