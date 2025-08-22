"use client"
import { useState, FormEvent } from "react"
import Image from "next/image"
// import logo from "@/assets/LOGO_PRIMATA_BRANCA.png"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)

    async function onSubmit(e: FormEvent) {
        e.preventDefault()
        setLoading(true)
        setTimeout(() => {
            if (email === "admin@primata.com" && password === "admin123") {
                alert("✅ Login simulado com sucesso!")
                window.location.href = "/" // simulação de redirecionamento
            } else {
                alert("❌ Credenciais inválidas")
            }
            setLoading(false)
        }, 1000)
    }

    return (
        <div className="min-h-screen grid place-items-center bg-gradient-to-br from-[#081225] via-[#091a30] to-[#0b1220]">
            <div className="card w-full max-w-md p-8">
                <div className="flex flex-col items-center mb-6 text-center">
                    <Image
                        src="/primata-logo.png"
                        alt="Logo Primata"
                        width={120}
                        height={120}
                        priority
                    />
                    <h1 className="text-2xl font-bold">Entrar</h1>
                    <p className="text-white/60">Acesse o sistema da clínica</p>
                </div>
                <form className="space-y-4" onSubmit={onSubmit}>
                    <div>
                        <label className="text-sm text-white/70">E-mail</label>
                        <input className="input mt-1" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div>
                        <label className="text-sm text-white/70">Senha</label>
                        <input className="input mt-1" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>
                    <button className="btn btn-primary w-full h-11" disabled={loading}>
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>
                <div className="mt-4 text-right">
                    <a className="link text-sm" href="#">Esqueci minha senha</a>
                </div>
            </div>
        </div>
    )
}
