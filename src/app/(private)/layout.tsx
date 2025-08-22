'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import Topbar from '@/components/Topbar'
import { useAuth } from '@/lib/auth'

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const pathname = usePathname()
    const { restore } = useAuth()
    const [ready, setReady] = useState(false)

    useEffect(() => {
        restore()
        const token = typeof window !== 'undefined' && localStorage.getItem('primata_token')
        if (!token) router.replace('/login')
        else setReady(true)
    }, [restore, router, pathname])

    if (!ready) return null

    return (
        <div className="h-screen grid grid-cols-[260px_1fr] bg-[#0b1220] text-white">
            <Sidebar />
            <div className="flex flex-col">
                <Topbar />
                <main className="p-6 overflow-auto">{children}</main>
            </div>
        </div>
    )
}