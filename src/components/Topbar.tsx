'use client'
import { useAuthOnce } from '@/lib/useAuthOnce'
import { Bell, Settings, Search, User } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'

export default function Topbar() {
    const { user, hasInitialized } = useAuthOnce()
    const [showNotifications, setShowNotifications] = useState(false)
    const [showUserMenu, setShowUserMenu] = useState(false)

    if (!hasInitialized || !user) {
        return (
            <header className="h-14 border-b border-gray-200 px-4 flex items-center justify-between bg-white shadow-sm flex-shrink-0">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                        <Image
                            src="/LOGO_REVITTAH_CARE_SEM_FUNDO.png"
                            alt="Revittah Care"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
                <div className="text-gray-400">—</div>
            </header>
        )
    }

    return (
        <header className="h-14 border-b border-gray-200 px-4 flex items-center justify-between bg-white shadow-sm flex-shrink-0">
            {/* Left Section */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10">
                        <Image
                            src="/LOGO_REVITTAH_CARE_SEM_FUNDO.png"
                            alt="Revittah Care"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
                
                {/* Search Bar */}
                <div className="hidden md:flex relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="pl-8 pr-3 py-1.5 w-48 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                </div>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200 relative"
                    >
                        <Bell className="h-4 w-4 text-gray-600" />
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
                    </button>
                    
                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                            <div className="p-3 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900 text-sm">Notificações</h3>
                            </div>
                            <div className="max-h-56 overflow-y-auto">
                                <div className="p-3 hover:bg-gray-50 border-b border-gray-100">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Novo agendamento</p>
                                            <p className="text-xs text-gray-600">Cliente agendou para amanhã às 14h</p>
                                            <p className="text-xs text-gray-500 mt-1">há 5 minutos</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 hover:bg-gray-50 border-b border-gray-100">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Pagamento recebido</p>
                                            <p className="text-xs text-gray-600">PIX de R$ 150,00 confirmado</p>
                                            <p className="text-xs text-gray-500 mt-1">há 1 hora</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 hover:bg-gray-50">
                                    <div className="flex items-start gap-2">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Lembrete de estoque</p>
                                            <p className="text-xs text-gray-600">Produto X está com estoque baixo</p>
                                            <p className="text-xs text-gray-500 mt-1">há 2 horas</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-2 border-t border-gray-200">
                                <button className="w-full text-center text-sm text-green-600 hover:text-green-700 font-medium">
                                    Ver todas
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Settings */}
                <button className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <Settings className="h-4 w-4 text-gray-600" />
                </button>

                {/* User Menu */}
                <div className="relative">
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                        <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {user?.name?.charAt(0) ?? 'U'}
                        </div>
                        <div className="hidden md:block text-left">
                            <div className="text-xs font-medium text-gray-900">{user?.name ?? '—'}</div>
                            <div className="text-xs text-gray-500">{user?.profile?.role ?? '—'}</div>
                        </div>
                        <User className="h-3 w-3 text-gray-600" />
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                            <div className="p-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-semibold">
                                        {user?.name?.charAt(0) ?? 'U'}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 text-sm">{user?.name ?? '—'}</div>
                                        <div className="text-xs text-gray-500">{user?.email ?? '—'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Click outside to close dropdowns */}
            {(showNotifications || showUserMenu) && (
                <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => {
                        setShowNotifications(false)
                        setShowUserMenu(false)
                    }}
                />
            )}
        </header>
    )
}