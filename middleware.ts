// middleware.ts (NA RAIZ)
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
    // Permite todas as rotas - a autenticação é gerenciada no cliente
    // O layout privado (PrivateLayout) é responsável por verificar autenticação
    // e redirecionar para login se necessário
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Remove o matcher para não interceptar nenhuma rota
        // A autenticação será gerenciada apenas no lado do cliente
    ],
};