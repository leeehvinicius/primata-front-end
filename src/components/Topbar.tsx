'use client'
import { useAuthOnce } from '@/lib/useAuthOnce'

export default function Topbar() {
    const { user, hasInitialized } = useAuthOnce()

    if (!hasInitialized || !user) {
        return (
            <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between">
                <div className="text-white/70">Primata Estética</div>
                <div className="text-white/90">—</div>
            </header>
        )
    }

    return (
        <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between">
            <div className="text-white/70">Primata Estética</div>
            <div className="flex items-center gap-3">
                <div className="text-right">
                    <div className="text-white/90 text-sm font-medium">{user?.profile?.name ?? '—'}</div>
                    <div className="text-white/50 text-xs">{user?.profile?.role ?? '—'}</div>
                </div>
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {user?.profile?.name?.charAt(0) ?? 'U'}
                </div>
            </div>
        </header>
    )
}