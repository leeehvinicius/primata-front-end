'use client'
import { useEffect, useState } from 'react'
import { useAuth } from './auth'

// Hook para usar autenticação apenas uma vez, evitando loops
export function useAuthOnce() {
    const auth = useAuth()
    const [hasInitialized, setHasInitialized] = useState(false)

    // Inicializa apenas uma vez quando o componente monta
    useEffect(() => {
        if (!hasInitialized) {
            setHasInitialized(true)
            // Executa restore imediatamente na inicialização
            auth.restore()
        }
    }, [hasInitialized, auth])

    return {
        ...auth,
        hasInitialized
    }
}
