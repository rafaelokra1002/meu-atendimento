import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File | null;

  if (!file) {
    return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF.' }, { status: 400 });
  }

  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5MB.' }, { status: 400 });
  }

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg';
  const fileName = `${crypto.randomUUID()}.${safeExt}`;

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir, { recursive: true });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(path.join(uploadsDir, fileName), buffer);

  return NextResponse.json({ url: `/uploads/${fileName}` });
}
