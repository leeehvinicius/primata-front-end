"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthOnce } from "@/lib/useAuthOnce"
import LoadingSpinner from "@/components/ui/LoadingSpinner"

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading, hasInitialized } = useAuthOnce()

  useEffect(() => {
    // Aguarda a inicialização da autenticação
    if (!hasInitialized || isLoading) return

    // Se o usuário estiver autenticado, redireciona para o dashboard
    if (user) {
      router.replace("/dashboard")
    } else {
      // Se não estiver autenticado, redireciona para o login
      router.replace("/login")
    }
  }, [user, isLoading, hasInitialized, router])

  // Mostra um loading enquanto verifica a autenticação
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50 flex items-center justify-center">
      <LoadingSpinner />
    </div>
  )
}