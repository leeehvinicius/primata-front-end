"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const router = useRouter();
    const params = useSearchParams();

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        setLoading(true);

        setTimeout(() => {
            const ok = email === "admin@primata.com" && password === "admin123";

            if (ok) {
                document.cookie = `auth=1; path=/; max-age=${60 * 60 * 24}`;
                localStorage.setItem("fakeToken", "primata-simulado");

                toast.success("Login simulado com sucesso! 👌");
                const from = params.get("from") || "/dashboard";
                router.replace(from);
            } else {
                toast.error("Credenciais inválidas");
            }

            setLoading(false);
        }, 800);
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
                        <input
                            className="input mt-1 w-full"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="admin@primata.com"
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
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute inset-y-0 right-3 flex items-center text-white/70 hover:text-white"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    <button className="btn btn-primary w-full h-11" disabled={loading}>
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                </form>

                <div className="mt-4 text-right">
                    <a className="link text-sm" href="#">
                        Esqueci minha senha
                    </a>
                </div>
            </div>
        </div>
    );
}
