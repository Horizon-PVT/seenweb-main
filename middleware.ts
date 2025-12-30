import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

const protectedPaths = ['/dashboard', '/admin', '/affiliate'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;

  // 1. Logic bảo mật: Kiểm tra auth cho các protected paths
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (isProtected) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const url = new URL('/login', request.url);
      url.searchParams.set('callbackUrl', encodeURI(request.url));
      return NextResponse.redirect(url);
    }
  }

  // 2. Logic Affiliate: Lưu cookie nếu có ref code
  const refCode = request.nextUrl.searchParams.get('ref');

  if (refCode) {
    response.cookies.set('aff_ref', refCode.toUpperCase(), {
      path: '/',
      maxAge: 60 * 24 * 60 * 60, // 60 ngày
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Chạy middleware trên tất cả các path, ngoại trừ static assets và api
    '/((?!_next/static|_next/image|api|favicon\\.ico|robots\\.txt).*)',
  ],
};