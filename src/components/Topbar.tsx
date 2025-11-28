'use client'
import { useAuthOnce } from '@/lib/useAuthOnce'
import { User } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'

export default function Topbar() {
    const { user, hasInitialized } = useAuthOnce()
    const [showUserMenu, setShowUserMenu] = useState(false)
    const userMenuRef = useRef<HTMLDivElement>(null)

    // Fecha dropdown ao clicar fora
    useEffect(() => {
        if (!showUserMenu) return

        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node
            
            // Verifica se o clique foi fora do container do menu do usuário
            if (showUserMenu && userMenuRef.current) {
                const isClickInside = userMenuRef.current.contains(target)
                if (!isClickInside) {
                    setShowUserMenu(false)
                }
            }
        }

        // Usa setTimeout para garantir que o evento seja adicionado após o render
        const timeoutId = setTimeout(() => {
            window.addEventListener('mousedown', handleClickOutside)
        }, 0)

        return () => {
            clearTimeout(timeoutId)
            window.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showUserMenu])

    if (!hasInitialized || !user) {
        return (
            <header className="h-16 border-b border-gray-200 px-3 lg:px-4 flex items-center justify-between bg-white flex-shrink-0">
                <div className="flex-1"></div>
            </header>
        )
    }

    return (
        <header className="h-16 border-b border-gray-200 px-3 lg:px-4 flex items-center justify-end bg-white flex-shrink-0">
            {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        type="button"
                        onClick={() => {
                            setShowUserMenu(prev => !prev)
                        }}
                        className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Menu do usuário"
                    >
                        <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                        </div>
                        <div className="hidden lg:block text-left">
                            <div className="text-xs font-medium text-gray-900 truncate max-w-[120px]">
                                {user?.name ?? '—'}
                            </div>
                            <div className="text-xs text-gray-500 truncate max-w-[120px]">
                                {user?.profile?.role ?? '—'}
                            </div>
                        </div>
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                            <div className="p-3 border-b border-gray-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                        {user?.name?.charAt(0).toUpperCase() ?? 'U'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 text-sm truncate">
                                            {user?.name ?? '—'}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {user?.email ?? '—'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-1">
                                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                    Meu Perfil
                                </button>
                                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                                    Configurações
                                </button>
                            </div>
                        </div>
                    )}
                </div>
        </header>
    )
}