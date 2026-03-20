import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/services/:id - Remove um serviço
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await prisma.service.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'Serviço não encontrado' },
      { status: 404 }
    );
  }
}
