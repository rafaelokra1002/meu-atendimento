import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/products
export async function GET() {
  const products = await prisma.product.findMany();
  return NextResponse.json(products);
}

// POST /api/products
export async function POST(request: Request) {
  const body = await request.json();
  const { name, price, description, image } = body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }
  if (price == null || isNaN(Number(price)) || Number(price) < 0) {
    return NextResponse.json({ error: 'Preço inválido' }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name: name.trim(),
      price: Number(price),
      description: description?.trim() || null,
      image: image?.trim() || null,
    },
  });

  return NextResponse.json(product);
}

// PUT /api/products
export async function PUT(request: Request) {
  const body = await request.json();
  const { id, name, price, description, image } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 });
  }
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    return NextResponse.json({ error: 'Nome é obrigatório' }, { status: 400 });
  }
  if (price == null || isNaN(Number(price)) || Number(price) < 0) {
    return NextResponse.json({ error: 'Preço inválido' }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: name.trim(),
      price: Number(price),
      description: description?.trim() || null,
      image: image?.trim() || null,
    },
  });

  return NextResponse.json(product);
}
