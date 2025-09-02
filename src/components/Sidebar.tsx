'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthOnce } from '@/lib/useAuthOnce'
import { LayoutDashboard, Users2, CreditCard, Scissors, LogOut } from 'lucide-react'

const items = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/users', label: 'Usuários', icon: Users2 },
    { href: '/billing', label: 'Financeiro', icon: CreditCard },
    { href: '/services', label: 'Serviços', icon: Scissors },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { logout, user } = useAuthOnce()
    const router = useRouter()

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
    }

    return (
        <aside className="h-full bg-[#0d1726] border-r border-white/10 p-4 flex flex-col">
            <div className="px-2 py-3 mb-4">
                <div className="text-lg font-bold">primata_estetica</div>
                <div className="text-white/50 text-xs">Clínica & Estética</div>
            </div>

            {/* Informações do usuário */}
            {user && (
                <div className="px-2 py-3 mb-4 border-t border-white/10">
                    <div className="text-sm text-white/80 font-medium">{user.profile.name}</div>
                    <div className="text-xs text-white/50">{user.email}</div>
                    <div className="text-xs text-blue-400 mt-1">{user.profile.role}</div>
                </div>
            )}

            <nav className="space-y-1 flex-1">
                {items.map(({ href, label, icon: Icon }) => {
                    const active = pathname === href
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl transition 
                ${active ? 'bg-white/10 text-white' : 'text-white/75 hover:bg-white/5'}`}
                        >
                            <Icon className="h-5 w-5" />
                            <span>{label}</span>
                        </Link>
                    )
                })}
            </nav>

            <button
                className="btn w-full mt-2"
                onClick={handleLogout}
            >
                <LogOut className="h-5 w-5" /> Sair
            </button>
        </aside>
    )
}