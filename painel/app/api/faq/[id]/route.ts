import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// PUT /api/faq/:id - Atualiza uma pergunta frequente
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await request.json();
  const { question, answer } = body;

  if (
    !question || typeof question !== 'string' || question.trim().length === 0 ||
    !answer || typeof answer !== 'string' || answer.trim().length === 0
  ) {
    return NextResponse.json(
      { error: 'Pergunta e resposta são obrigatórios' },
      { status: 400 }
    );
  }

  try {
    const faq = await prisma.faq.update({
      where: { id },
      data: {
        question: question.trim(),
        answer: answer.trim(),
      },
    });
    return NextResponse.json(faq);
  } catch {
    return NextResponse.json(
      { error: 'FAQ não encontrada' },
      { status: 404 }
    );
  }
}

// DELETE /api/faq/:id - Remove uma pergunta frequente
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await prisma.faq.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: 'FAQ não encontrada' },
      { status: 404 }
    );
  }
}
