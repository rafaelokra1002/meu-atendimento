import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'meu-atendimento-secret-key-2026'
);

const COOKIE_NAME = 'auth_token';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createToken(userId: string, email: string): Promise<string> {
  return new SignJWT({ userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { userId: string; email: string };
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function getTokenFromCookies(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.split(';').find(c => c.trim().startsWith(`${COOKIE_NAME}=`));
  return match ? match.split('=')[1]?.trim() || null : null;
}
