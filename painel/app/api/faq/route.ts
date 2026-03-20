import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/faq - Lista todas as perguntas frequentes
export async function GET() {
  const faqs = await prisma.faq.findMany();
  return NextResponse.json(faqs);
}

// POST /api/faq - Cria uma nova pergunta/resposta
export async function POST(request: Request) {
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

  const faq = await prisma.faq.create({
    data: {
      question: question.trim(),
      answer: answer.trim(),
    },
  });

  return NextResponse.json(faq);
}
