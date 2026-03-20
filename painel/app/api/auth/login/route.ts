import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword, createToken } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    const token = await createToken(user.id, user.email);

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, name: user.name },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
