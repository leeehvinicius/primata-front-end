// app/(private)/layout.tsx
"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthOnce } from "@/lib/useAuthOnce";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, isLoading, hasInitialized } = useAuthOnce();

    // Redireciona para login se não estiver autenticado
    useEffect(() => {
        if (hasInitialized && !isLoading && !user) {
            router.replace("/login");
        }
    }, [user, isLoading, hasInitialized, router]);

    // Mostra loading enquanto verifica autenticação
    if (isLoading || !hasInitialized) {
        return (
            <div className="min-h-screen grid place-items-center bg-[#0b1220]">
                <LoadingSpinner 
                    size="lg" 
                    text="Verificando autenticação..." 
                />
            </div>
        );
    }

    // Se não há usuário, não renderiza o layout
    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen grid grid-cols-[260px_1fr]">
            <Sidebar />
            <div className="flex flex-col">
                <Topbar />
                <main className="p-6">{children}</main>
            </div>
        </div>
    );
}