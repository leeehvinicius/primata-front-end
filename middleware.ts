// middleware.ts (NA RAIZ)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    const auth = req.cookies.get("auth")?.value;
    if (auth === "1") return NextResponse.next();

    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(url);
}

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/users/:path*",
        "/services/:path*",
        "/billing/:path*",
        "/(private)/:path*", // acessar grupo diretamente
    ],
};