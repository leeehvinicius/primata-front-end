"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const router = useRouter();
    const params = useSearchParams();
    const { login, isLoading } = useAuth();

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        
        if (isLoading) return;

        try {
            const success = await login({ email, password });
            
            if (success) {
                toast.success("Login realizado com sucesso! 👌");
                const from = params.get("from") || "/dashboard";
                router.replace(from);
            } else {
                toast.error("Falha na autenticação");
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error("Erro ao fazer login. Verifique suas credenciais.");
        }
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
                        style={{ height: 'auto' }}
                    />
                    <h1 className="text-2xl font-bold">Entrar</h1>
                    <p className="text-white/60">Acesse o sistema da clínica</p>
                </div>

                <form className="space-y-4" onSubmit={onSubmit}>
                    <div>
                        <label className="text-sm text-white/70">E-mail</label>
                        <input
                            className="input mt-1 w-full"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@primata.com"
                            disabled={isLoading}
                        />
                    </div>

                    <div>
                        <label className="text-sm text-white/70">Senha</label>
                        <div className="relative mt-1">
                            <input
                                className="input w-full pr-10"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="admin123"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-white/70 hover:text-white disabled:opacity-50"
                                disabled={isLoading}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button 
                        className="btn btn-primary w-full h-11" 
                        disabled={isLoading}
                        type="submit"
                    >
                        {isLoading ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <div className="mt-4 text-right">
                    <a className="link text-sm" href="#">
                        Esqueci minha senha
                    </a>
                </div>

                {/* Informações de teste */}
                <div className="mt-6 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-300 mb-2">Credenciais de Teste:</h3>
                    <div className="text-xs text-blue-200 space-y-1">
                        <div><strong>E-mail:</strong> admin@primata.com</div>
                        <div><strong>Senha:</strong> admin123</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
