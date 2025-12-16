import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
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

// Matcher chuẩn – exclude _next, api, static files (favicon, images...)
export const config = {
  matcher: [
    '/',
    '/login',
    '/pricing',
    '/register',
    '/dashboard/:path*',
    '/affiliate/:path*',
    // Thêm các page chính khác nếu cần, hoặc dùng pattern rộng:
    '/((?!_next/static|_next/image|api|favicon\\.ico|robots\\.txt).*)',
  ],
};