// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const isProtected = req.nextUrl.pathname.startsWith("/dashboard")
        || req.nextUrl.pathname.startsWith("/usuarios")
        || req.nextUrl.pathname.startsWith("/servicos")
        || req.nextUrl.pathname.startsWith("/financeiro")
        || req.nextUrl.pathname.startsWith("/(protected)");

    if (!isProtected) return NextResponse.next();

    const auth = req.cookies.get("auth")?.value;
    if (auth !== "1") {
        const url = new URL("/login", req.url);
        url.searchParams.set("from", req.nextUrl.pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!_next|api|favicon.ico|assets).*)"],
};
