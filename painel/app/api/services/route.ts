import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/services - Lista todos os serviços
export async function GET() {
  const services = await prisma.service.findMany();
  return NextResponse.json(services);
}

// POST /api/services - Cria um novo serviço
export async function POST(request: Request) {
  const body = await request.json();
  const { name, description } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json(
      { error: 'Nome do serviço é obrigatório' },
      { status: 400 }
    );
  }

  const service = await prisma.service.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
    },
  });

  return NextResponse.json(service);
}

// PUT /api/services - Atualiza um serviço existente
export async function PUT(request: Request) {
  const body = await request.json();
  const { id, name, description } = body;

  if (!id || !name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json(
      { error: 'ID e nome do serviço são obrigatórios' },
      { status: 400 }
    );
  }

  try {
    const service = await prisma.service.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
      },
    });
    return NextResponse.json(service);
  } catch {
    return NextResponse.json(
      { error: 'Serviço não encontrado' },
      { status: 404 }
    );
  }
}
