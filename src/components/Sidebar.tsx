'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthOnce } from '@/lib/useAuthOnce'
import { LayoutDashboard, Users2, CreditCard, Scissors, LogOut, Menu, X, Building2 } from 'lucide-react'
import { useState } from 'react'

const items = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Visão geral' },
    { href: '/users', label: 'Usuários', icon: Users2, description: 'Gerenciar' },
    { href: '/billing', label: 'Financeiro', icon: CreditCard, description: 'Controle' },
    { href: '/services', label: 'Serviços', icon: Scissors, description: 'Catálogo' },
    { href: '/partners', label: 'Parceiros', icon: Building2, description: 'Convênios' },
]



export default function Sidebar() {
    const pathname = usePathname()
    const { logout } = useAuthOnce()
    const router = useRouter()
    const [isCollapsed, setIsCollapsed] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)

    const handleLogout = async () => {
        await logout()
        router.replace('/login')
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
                className="fixed top-4 left-4 z-50 lg:hidden bg-white p-2 rounded-lg shadow-lg border border-gray-200"
            >
                {isMobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                transform transition-transform duration-300 ease-in-out
                ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                ${isCollapsed ? 'w-16' : 'w-64'}
                h-screen bg-gradient-to-b from-white to-gray-50 
                border-r border-gray-200 shadow-xl
                flex flex-col flex-shrink-0
            `}>
                {/* Header - Fixo no topo */}
                <div className="p-4 border-b border-gray-200 bg-white flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className={`flex items-center gap-2 transition-all duration-300 ${isCollapsed ? 'justify-center w-full' : ''}`}>
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-sm">P</span>
                            </div>
                            {!isCollapsed && (
                                <div className="flex flex-col">
                                    <div className="text-sm font-bold text-gray-900 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                        Primata
                                    </div>
                                    <div className="text-xs text-gray-500">Sistema</div>
                                </div>
                            )}
                        </div>
                        
                        {/* Desktop Collapse Button */}
                        <button
                            onClick={toggleCollapse}
                            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                            title={isCollapsed ? 'Expandir' : 'Recolher'}
                        >
                            <div className={`w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Navigation - Com scroll se necessário */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
                    {/* Main Navigation */}
                    <div className="space-y-1">
                        <div className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 transition-all duration-300 ${isCollapsed ? 'text-center' : 'px-2'}`}>
                            {!isCollapsed && 'Principal'}
                        </div>
                        {items.map(({ href, label, icon: Icon, description }) => {
                            const active = pathname === href
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    onClick={closeMobile}
                                    className={`
                                        group flex items-center gap-2 px-2 py-2 rounded-lg transition-all duration-300
                                        ${active 
                                            ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg transform scale-105' 
                                            : 'text-gray-700 hover:bg-green-50 hover:text-green-700 hover:shadow-md'
                                        }
                                        ${isCollapsed ? 'justify-center' : ''}
                                    `}
                                >
                                    <div className={`
                                        p-1.5 rounded-lg transition-all duration-300
                                        ${active 
                                            ? 'bg-white/20 text-white' 
                                            : 'bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600'
                                        }
                                    `}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    {!isCollapsed && (
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium">{label}</div>
                                            <div className={`text-xs transition-all duration-300 ${active ? 'text-white/80' : 'text-gray-500'}`}>
                                                {description}
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            )
                        })}
                    </div>


                </nav>

                {/* Footer - Fixo na parte inferior */}
                <div className="p-3 border-t border-gray-200 bg-white flex-shrink-0">
                    <button
                        onClick={handleLogout}
                        className={`
                            w-full group flex items-center gap-2 px-2 py-2 rounded-lg
                            bg-gradient-to-r from-red-500 to-pink-600 text-white font-medium
                            hover:from-red-600 hover:to-pink-700 transform hover:scale-105
                            transition-all duration-300 shadow-lg hover:shadow-xl
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                    >
                        <div className="p-1.5 rounded-lg bg-white/20">
                            <LogOut className="h-4 w-4" />
                        </div>
                        {!isCollapsed && (
                            <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">
                                Sair
                            </span>
                        )}
                    </button>
                </div>
            </aside>
        </>
    )
}