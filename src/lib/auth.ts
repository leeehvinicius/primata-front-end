'use client'
import { create } from 'zustand'
import { AuthService } from './authService'
import type { LoginCredentials, UserProfile, AuthState } from '../types/auth'

export const useAuth = create<AuthState>((set, get) => ({
    user: null,
    isLoading: false,

    async login(credentials: LoginCredentials) {
        set({ isLoading: true })
        try {
            // Faz login na API
            await AuthService.login(credentials)
            
            // Busca o perfil do usuário
            const profile = await AuthService.getProfile()
            
            set({ user: profile, isLoading: false })
            return true
        } catch (error) {
            console.error('Login failed:', error)
            set({ isLoading: false })
            return false
        }
    },

    async logout() {
        set({ isLoading: true })
        try {
            await AuthService.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            set({ user: null, isLoading: false })
        }
    },

    async restore() {
        set({ isLoading: true })
        try {
            // Primeiro, tenta obter dados do usuário do localStorage
            const userFromStorage = AuthService.getUserFromStorage()
            
            // Se há dados do usuário no localStorage, usa eles imediatamente
            if (userFromStorage) {
                set({ user: userFromStorage, isLoading: false })
            }
            
            // Verifica se há tokens válidos para tentar atualizar o perfil
            if (AuthService.isAuthenticated()) {
                try {
                    // Tenta obter o perfil atualizado da API
                    const profile = await AuthService.getProfile()
                    set({ user: profile, isLoading: false })
                } catch (apiError) {
                    console.warn('API indisponível, mantendo dados do localStorage:', apiError)
                    // Se a API falhar, mantém os dados do localStorage se existirem
                    if (!userFromStorage) {
                        // Se não há dados no localStorage e API falhou, limpa tudo
                        AuthService.clearLocalData()
                        set({ user: null, isLoading: false })
                    }
                }
            } else {
                // Se não há tokens, limpa dados inválidos
                if (!userFromStorage) {
                    AuthService.clearLocalData()
                    set({ user: null, isLoading: false })
                }
            }
        } catch (error) {
            console.error('Restore failed:', error)
            // Se falhar completamente, limpa o estado e tokens
            AuthService.clearLocalData()
            set({ user: null, isLoading: false })
        }
    },

    async refreshProfile() {
        try {
            // Só tenta atualizar se estiver autenticado
            if (AuthService.isAuthenticated() && get().user) {
                const profile = await AuthService.getProfile()
                set({ user: profile })
            }
        } catch (error) {
            console.error('Profile refresh failed:', error)
            // Se falhar ao buscar perfil, faz logout
            await get().logout()
        }
    }
}))
