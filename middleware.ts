import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Các đường dẫn cần bảo vệ auth
const protectedPaths = ['/dashboard', '/admin', '/affiliate/dashboard'];

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Vercel Edge proxies requests, so we must check x-forwarded-host first
  let hostname = request.headers.get("x-forwarded-host")
    || request.headers.get("host")
    || request.nextUrl.hostname
    || "";

  // Remove port for cleaner checking local environments (e.g., localhost:3000 -> localhost)
  let cleanHostname = hostname.split(':')[0];

  const { pathname } = url;

  // 1. Phân tích Sub-domain
  const isAppDomain = cleanHostname === "app.seenyt.net" || cleanHostname === "app.localhost";
  const isAcademyDomain = cleanHostname === "academy.seenyt.net" || cleanHostname === "academy.localhost";
  const isLocal = cleanHostname.includes("localhost");
  const mainDomain = isLocal ? "http://localhost:3000" : "https://seenyt.net";

  // Xác định đường dẫn đích thực sự sau khi Rewrite
  let targetPathname = pathname;

  if (isAppDomain && pathname === '/') {
    targetPathname = '/dashboard';
  } else if (isAcademyDomain && !pathname.startsWith('/academy')) {
    targetPathname = `/academy${pathname === '/' ? '' : pathname}`;
  }

  // 2. Kiểm tra Bảo mật (Auth Check) TRƯỚC KHI Rewrite
  const isProtected = protectedPaths.some((path) => targetPathname.startsWith(path));

  if (isProtected) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      if (isLocal) {
        // Local: Redirect to /login normally so NextAuth handles it, avoiding mainDomain port issues
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', encodeURI(request.url));
        return NextResponse.redirect(loginUrl);
      } else {
        // Production: Bắt buộc văng về Trang chủ (Main Domain) để bật Popup
        const loginUrl = new URL(mainDomain);
        loginUrl.searchParams.set('login', 'true');
        loginUrl.searchParams.set('callbackUrl', encodeURI(request.url));
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  // 3. Thực thi Sub-domain Rewrite (nếu có khác biệt)
  let response = NextResponse.next();
  if (targetPathname !== pathname) {
    response = NextResponse.rewrite(new URL(targetPathname, request.url));
  }

  // 4. Logic Affiliate: Lưu cookie nếu có ref code
  const refCode = url.searchParams.get('ref');
  if (refCode) {
    response.cookies.set('aff_ref', refCode.toUpperCase(), {
      path: '/',
      maxAge: 60 * 24 * 60 * 60, // 60 ngày
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.NODE_ENV === "production" ? ".seenyt.net" : undefined,
    });
  }

  return response;
}

export const config = {
  matcher: [
    // Chạy middleware trên tất cả các path, ngoại trừ static assets và api
    '/((?!_next/static|_next/image|api|favicon\\.ico|robots\\.txt|images).*)',
  ],
};