"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

// ===== Tipos =====
type Service = {
    id: string
    name: string
    category?: string
    price: number
    description?: string
    active: boolean
    createdAt?: string
}

// ===== Mock inicial =====
const initialServices: Service[] = [
    { id: "s1", name: "Câmara Hiperbárica", category: "Procedimentos", price: 180, description: "Sessão individual", active: true, createdAt: "2025-08-20" },
    { id: "s2", name: "Drenagem Pós-Cirurgia", category: "Estética", price: 120, description: "Pós operatório", active: true, createdAt: "2025-08-19" },
    { id: "s3", name: "Hingetáveis", category: "Procedimentos", price: 250, description: "Aplicação", active: false, createdAt: "2025-08-18" },
    { id: "s4", name: "Nutricionista", category: "Nutrição", price: 150, description: "Consulta", active: true, createdAt: "2025-08-17" },
]

// ===== Form schema =====
const schema = z.object({
    name: z.string().min(2, "Informe o nome"),
    category: z.string().optional(),
    price: z.coerce.number().min(0, "Preço inválido"),
    description: z.string().optional(),
    active: z.boolean().default(true),
})
type FormData = z.infer<typeof schema>

// ===== Helpers =====
const genId = () => `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" })

export default function ServicesPage() {
    const [list, setList] = useState<Service[]>(initialServices)
    const [q, setQ] = useState("")
    const [open, setOpen] = useState(false)

    // Busca simples (nome/categoria)
    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase()
        if (!term) return list
        return list.filter(s =>
            s.name.toLowerCase().includes(term) ||
            (s.category ?? "").toLowerCase().includes(term)
        )
    }, [q, list])

    const {
        register,
        handleSubmit,
        reset,
        formState: { isSubmitting, errors },
    } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: { price: 150, active: true },
    })

    async function onSubmit(values: FormData) {
        const novo: Service = {
            id: genId(),
            name: values.name,
            category: values.category || undefined,
            price: values.price,
            description: values.description || undefined,
            active: !!values.active,
            createdAt: new Date().toISOString().slice(0, 10),
        }
        setList(prev => [novo, ...prev])
        toast.success("Serviço cadastrado!")
        reset({ price: 150, active: true })
        setOpen(false)
        setQ("")
    }

    function onToggle(id: string, active: boolean) {
        setList(prev => prev.map(s => (s.id === id ? { ...s, active } : s)))
    }

    // ===== UI =====
    return (
        <div className="grid gap-6">
            {/* Header + abrir modal */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Serviços</h1>
                <div className="flex gap-2">
                    <input
                        className="input w-72"
                        placeholder="Buscar serviço..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={() => setOpen(true)}>
                        Novo serviço
                    </button>
                </div>
            </div>

            {/* Lista */}
            <div className="card p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-white/70">
                            <tr>
                                <th className="py-2 pr-4">Nome</th>
                                <th className="py-2 pr-4">Categoria</th>
                                <th className="py-2 pr-4">Preço</th>
                                <th className="py-2 pr-4">Status</th>
                                <th className="py-2 pr-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((s) => (
                                <tr key={s.id} className="border-t border-white/5">
                                    <td className="py-3 pr-4">{s.name}</td>
                                    <td className="py-3 pr-4">{s.category || "-"}</td>
                                    <td className="py-3 pr-4">{BRL.format(Number(s.price))}</td>
                                    <td className="py-3 pr-4">{s.active ? "Ativo" : "Inativo"}</td>
                                    <td className="py-3 pr-0">
                                        <button className="btn" onClick={() => onToggle(s.id, !s.active)}>
                                            {s.active ? "Desativar" : "Ativar"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!filtered.length && (
                                <tr>
                                    <td colSpan={5} className="py-6 text-white/50">Nenhum serviço.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de cadastro (mock) */}
            {open && (
                <div
                    className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
                    onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
                >
                    <div className="card w-full max-w-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Novo serviço</h3>
                            <button className="btn" onClick={() => setOpen(false)}>Fechar</button>
                        </div>

                        <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={handleSubmit(onSubmit)}>
                            <div className="md:col-span-2">
                                <label className="text-sm text-white/70">Nome*</label>
                                <input className="input mt-1" {...register("name")} />
                                {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>}
                            </div>

                            {/* Select de Categoria */}
                            <div>
                                <label className="text-sm text-white/70">Categoria</label>
                                <div className="relative mt-1">
                                    <select className="input appearance-none pr-10" {...register("category")}>
                                        <option value="">Selecione...</option>
                                        <option value="Estética">Estética</option>
                                        <option value="Facial">Facial</option>
                                        <option value="Nutrição">Nutrição</option>
                                        <option value="Procedimentos">Procedimentos</option>
                                    </select>
                                    <svg
                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60"
                                        viewBox="0 0 20 20" fill="currentColor"
                                    >
                                        <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                                    </svg>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm text-white/70">Preço (R$)</label>
                                <input className="input mt-1" type="number" step="0.01" {...register("price")} />
                                {errors.price && <p className="text-red-400 text-sm mt-1">{String(errors.price.message || "Preço inválido")}</p>}
                            </div>

                            <div className="md:col-span-4">
                                <label className="text-sm text-white/70">Descrição</label>
                                <input className="input mt-1" {...register("description")} />
                            </div>

                            <label className="flex items-center gap-2 md:col-span-4">
                                <input type="checkbox" className="accent-brand-500" {...register("active")} />
                                <span className="text-white/80">Ativo</span>
                            </label>

                            <div className="md:col-span-4 flex justify-end gap-2">
                                <button type="button" className="btn" onClick={() => setOpen(false)}>Cancelar</button>
                                <button className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? "Salvando…" : "Salvar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
