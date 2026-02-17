import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/register", "/crearcontrasena"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Dejar pasar todo lo que no sea una página
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const token =
    request.cookies.get("token")?.value ||
    request.cookies.get("artdent_token")?.value;

  // Sin token → solo redirigir si NO es ya una ruta pública
  if (!isPublic && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    // Evitar redirect loop: si ya vamos a /login, pasar
    if (pathname === "/login") return NextResponse.next();
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
