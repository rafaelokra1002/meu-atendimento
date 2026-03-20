import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'meu-atendimento-secret-key-2026'
);

const PUBLIC_PATHS = ['/login', '/loja', '/api/auth/login'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permitir assets estáticos e rotas públicas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname.includes('.') ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
