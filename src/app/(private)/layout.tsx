// app/(private)/layout.tsx
"use client";

import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    // Guard no client (extra ao middleware)
    useEffect(() => {
        const hasAuth = document.cookie.split("; ").some((c) => c.startsWith("auth=1"));
        if (!hasAuth) router.replace("/login");
    }, [router]);

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