'use client'
import { create } from 'zustand'

type User = { name: string; email: string }
type AuthState = {
    user: User | null
    login: (email: string, password: string) => Promise<boolean>
    logout: () => void
    restore: () => void
}

export const useAuth = create<AuthState>((set) => ({
    user: null,
    async login(email, password) {
        await new Promise(r => setTimeout(r, 400))
        const ok = email.length > 3 && password.length > 3
        if (ok) {
            const user = { name: 'Recepção', email }
            localStorage.setItem('primata_token', 'mock-token')
            localStorage.setItem('primata_user', JSON.stringify(user))
            set({ user })
        }
        return ok
    },
    logout() {
        localStorage.removeItem('primata_token')
        localStorage.removeItem('primata_user')
        set({ user: null })
    },
    restore() {
        const raw = localStorage.getItem('primata_user')
        if (raw) set({ user: JSON.parse(raw) })
    },
}))
