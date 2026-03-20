import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE /api/products/:id
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 });
  }
}
