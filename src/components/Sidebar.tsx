'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthOnce } from '@/lib/useAuthOnce'
import { AuthService } from '@/lib/authService'
import { LayoutDashboard, Users2, CreditCard, Scissors, LogOut, Menu, X, Building2, Clock, CalendarDays, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import Image from 'next/image'

const items = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/users', label: 'Usuários', icon: Users2 },
    { href: '/billing', label: 'Financeiro', icon: CreditCard },
    { href: '/services', label: 'Serviços', icon: Scissors },
    { href: '/partners', label: 'Parceiros', icon: Building2 },
    { href: '/stock/categories', label: 'Categorias', icon: Scissors },
    { href: '/appointments', label: 'Agendamentos', icon: CalendarDays },
    { href: '/time-tracking', label: 'Ponto', icon: Clock },
    { href: '/whatsapp', label: 'WhatsApp', icon: MessageSquare },
]

export default function Sidebar() {
    const pathname = usePathname()
    const { logout } = useAuthOnce()
    const router = useRouter()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    // Fecha mobile quando redimensiona para desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsMobileOpen(false)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const handleLogout = async () => {
        try {
            await logout()
        } finally {
            AuthService.clearLocalData()
            try { router.replace('/login') } catch {}
            if (typeof window !== 'undefined') {
                window.location.href = '/login'
            }
        }
    }

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed)
    }

    const toggleMobile = () => {
        setIsMobileOpen(!isMobileOpen)
    }

    const closeMobile = () => {
        setIsMobileOpen(false)
    }

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={closeMobile}
                />
            )}

            {/* Mobile Menu Button */}
            <button
                onClick={toggleMobile}
                className="fixed top-3 left-3 z-50 lg:hidden bg-white p-2 rounded-lg shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                aria-label="Toggle menu"
            >
                {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                transform transition-all duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${isCollapsed ? 'w-16' : 'w-56'}
                h-screen bg-white border-r border-gray-200 shadow-sm
                flex flex-col flex-shrink-0
            `}>
                {/* Header */}
                <div className="h-16 px-3 border-b border-gray-200 bg-white flex-shrink-0 relative flex items-center justify-center">
                    <div className={`relative ${isCollapsed ? 'w-12 h-12' : 'w-16 h-16'} flex-shrink-0 transition-all duration-300`}>
                        <Image
                            src="/LOGO_REVITTAH_CARE_SEM_FUNDO.png"
                            alt="Revittah Care"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    
                    {/* Desktop Collapse/Expand Button */}
                    {!isCollapsed && (
                        <button
                            onClick={toggleCollapse}
                            className="hidden lg:flex absolute top-1/2 -translate-y-1/2 right-2 p-1 rounded-md hover:bg-gray-100 transition-colors duration-200 text-gray-500 hover:text-gray-700 z-10"
                            title="Recolher"
                        >
                            <ChevronLeft size={16} />
                        </button>
                    )}
                    
                    {/* Botão para expandir quando colapsado */}
                    {isCollapsed && (
                        <button
                            onClick={toggleCollapse}
                            className="hidden lg:flex absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 p-1.5 rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50 transition-colors duration-200 text-gray-500 hover:text-gray-700 z-10"
                            title="Expandir"
                        >
                            <ChevronRight size={14} />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-2 space-y-1 overflow-y-auto min-h-0">
                    {items.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href || pathname.startsWith(href + '/')
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={closeMobile}
                                className={`
                                    group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                    ${active 
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' 
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }
                                    ${isCollapsed ? 'justify-center' : ''}
                                `}
                                title={isCollapsed ? label : undefined}
                            >
                                <Icon className={`flex-shrink-0 ${isCollapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
                                {!isCollapsed && (
                                    <span className="text-sm font-medium truncate">{label}</span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer */}
                <div className="p-2 border-t border-gray-200 bg-white flex-shrink-0">
                    <button
                        onClick={handleLogout}
                        className={`
                            w-full group flex items-center gap-3 px-3 py-2.5 rounded-lg
                            bg-red-50 text-red-600 font-medium
                            hover:bg-red-100 transition-all duration-200
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                        title={isCollapsed ? "Sair" : undefined}
                    >
                        <LogOut className={`flex-shrink-0 ${isCollapsed ? 'h-5 w-5' : 'h-4 w-4'}`} />
                        {!isCollapsed && (
                            <span className="text-sm">Sair</span>
                        )}
                    </button>
                </div>
            </aside>
        </>
    )
}