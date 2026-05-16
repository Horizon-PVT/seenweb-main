import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedPaths = ["/dashboard", "/admin", "/affiliate/dashboard"];
const maintenanceMode = process.env.NODE_ENV === "production";
const staffEmails = (process.env.STAFF_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);

async function isStaffEmail(email: string | null | undefined): Promise<boolean> {
  if (!email || staffEmails.length === 0) return false;
  return staffEmails.includes(email.toLowerCase());
}

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const hostname =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host") ||
    request.nextUrl.hostname ||
    "";

  const cleanHostname = hostname.split(":")[0];
  const { pathname } = url;

  // Maintenance mode: redirect all except /maintenance and /login, unless user is staff
  const maintenanceBypassPaths = ["/maintenance", "/login"];
  if (maintenanceMode && !maintenanceBypassPaths.includes(pathname)) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const isStaff = await isStaffEmail(token?.email);

    if (!isStaff) {
      return NextResponse.rewrite(new URL("/maintenance", request.url));
    }
    // Staff bypass: continue to requested page
  }

  const isAppDomain = cleanHostname === "app.seenyt.net" || cleanHostname === "app.localhost";
  const isAcademyDomain = cleanHostname === "academy.seenyt.net" || cleanHostname === "academy.localhost";
  const isLocal = cleanHostname.includes("localhost");
  const mainDomain = isLocal ? "http://localhost:3000" : "https://seenyt.net";

  let targetPathname = pathname;

  if (isAppDomain && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isAcademyDomain && !pathname.startsWith("/academy")) {
    targetPathname = `/academy${pathname === "/" ? "" : pathname}`;
  }

  const isProtected = protectedPaths.some((path) => targetPathname.startsWith(path));

  if (isProtected) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      if (isLocal) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", encodeURI(request.url));
        return NextResponse.redirect(loginUrl);
      }

      const loginUrl = new URL(mainDomain);
      loginUrl.searchParams.set("login", "true");
      loginUrl.searchParams.set("callbackUrl", encodeURI(request.url));
      return NextResponse.redirect(loginUrl);
    }
  }

  let response = NextResponse.next();

  if (targetPathname !== pathname) {
    response = NextResponse.rewrite(new URL(targetPathname, request.url));
  }

  const refCode = url.searchParams.get("ref");

  if (refCode && /^[A-Za-z0-9]{1,20}$/.test(refCode)) {
    response.cookies.set("aff_ref", refCode.toUpperCase(), {
      path: "/",
      maxAge: 60 * 24 * 60 * 60,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      domain: process.env.NODE_ENV === "production" ? ".seenyt.net" : undefined,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon\\.ico|robots\\.txt|sitemap.*\\.xml|images).*)"],
};
