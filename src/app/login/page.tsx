"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthOnce } from "@/lib/useAuthOnce"
import { Eye, EyeOff, Lock, Mail } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { login } = useAuthOnce()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isLoading) return

        setIsLoading(true)
        try {
            const success = await login({ email, password })
            if (success) {
                router.replace("/dashboard")
            }
        } catch (error) {
            console.error("Login error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen grid place-items-center bg-gradient-to-br from-green-50 via-emerald-50 to-blue-50">
            <div className="card w-full max-w-md p-8 animate-fade-in">
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
                        <span className="text-white font-bold text-3xl">P</span>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        Primata Estética
                    </h1>
                    <p className="text-gray-600 mt-2">Sistema de Gestão Clínica</p>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label className="text-sm text-gray-700 font-medium mb-2 block">E-mail</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                className="input pl-10"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-sm text-gray-700 font-medium mb-2 block">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                className="input pl-10 pr-12"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 disabled:opacity-50 transition-colors duration-200"
                                disabled={isLoading}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary w-full py-3 text-lg font-semibold"
                    >
                        {isLoading ? "Entrando..." : "Entrar no Sistema"}
                    </button>
                </form>
            </div>
        </div>
    )
}
