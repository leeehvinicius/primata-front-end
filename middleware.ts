// middleware.ts (NA RAIZ)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    // Verifica se é uma rota privada
    const isPrivateRoute = req.nextUrl.pathname.startsWith('/dashboard') ||
                          req.nextUrl.pathname.startsWith('/users') ||
                          req.nextUrl.pathname.startsWith('/services') ||
                          req.nextUrl.pathname.startsWith('/billing') ||
                          req.nextUrl.pathname.startsWith('/(private)');

    if (!isPrivateRoute) {
        return NextResponse.next();
    }

    // Verifica se é a página de login
    if (req.nextUrl.pathname === '/login') {
        return NextResponse.next();
    }

    // Para rotas privadas, redireciona para login
    // A autenticação real é feita no cliente via useAuth
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