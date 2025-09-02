'use client'
import { useEffect, useState } from 'react'
import { useAuth } from './auth'

// Hook para usar autenticação apenas uma vez, evitando loops
export function useAuthOnce() {
    const auth = useAuth()
    const [hasInitialized, setHasInitialized] = useState(false)

    useEffect(() => {
        if (!hasInitialized) {
            setHasInitialized(true)
        }
    }, [hasInitialized])

    // Só executa restore se ainda não foi inicializado
    useEffect(() => {
        if (hasInitialized && !auth.user && !auth.isLoading) {
            auth.restore()
        }
    }, [hasInitialized, auth.user, auth.isLoading, auth.restore])

    return {
        ...auth,
        hasInitialized
    }
}
