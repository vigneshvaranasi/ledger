import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isDemo = process.env.IS_DEMO === "true";
  if (
    isDemo &&
    (pathname === "/" || pathname === "/docs" || pathname.startsWith("/docs/") || pathname.startsWith("/videos/"))
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const authed = await verifySessionToken(token);
  if (authed) return NextResponse.next();

  if (pathname.startsWith("/api/")) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const login = req.nextUrl.clone();
  login.pathname = "/login";
  login.search = "";
  if (pathname !== "/") login.searchParams.set("from", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/((?!login|api/login|api/logout|api/log|api/options|_next/static|_next/image|favicon.ico).*)",
  ],
};
