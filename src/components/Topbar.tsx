'use client'
import { useEffect } from 'react'
import { useAuth } from '@/lib/auth'

export default function Topbar() {
    const user = useAuth(s => s.user)
    const restore = useAuth(s => s.restore)

    useEffect(() => { restore() }, [restore])

    return (
        <header className="h-16 border-b border-white/10 px-6 flex items-center justify-between">
            <div className="text-white/70">Primata Estética</div>
            <div className="text-white/90">{user?.name ?? '—'}</div>
        </header>
    )
}