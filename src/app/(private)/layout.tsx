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
            <div className="min-h-screen grid place-items-center bg-gradient-to-br from-green-50 to-emerald-50">
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
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Topbar />
                <main className="flex-1 p-3 lg:p-4 overflow-y-auto overflow-x-hidden">
                    {children}
                </main>
            </div>
        </div>
    );
}