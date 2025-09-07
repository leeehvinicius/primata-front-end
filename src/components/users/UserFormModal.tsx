"use client"
import React from "react"
import Modal from "@/components/ui/Modal"

type Props = {
    open: boolean
    onClose: () => void
    title: string
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    register: (name: string) => {
        name: string
        ref: (element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null) => void
        onChange: (
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
        ) => void
        onBlur: (
            event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
        ) => void
    }
    errors: Record<string, { message?: string }>
    saving?: boolean
    profiles: { id: string; name: string }[]
    isEdit?: boolean
}

export default function UserFormModal({ open, onClose, title, onSubmit, register, errors, saving, profiles, isEdit }: Props) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <button className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" disabled={!!saving}>
                        {saving ? "Salvando…" : isEdit ? "Salvar alterações" : "Salvar usuário"}
                    </button>
                </>
            }
            className="max-w-2xl"
        >
            <form className="grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={onSubmit}>
                <div className="md:col-span-2">
                    <label className="text-sm text-gray-700">Nome*</label>
                    <input className="input mt-1" {...register("name")} />
                    {errors?.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="text-sm text-gray-700">E-mail*</label>
                    <input className="input mt-1" type="email" {...register("email")} />
                    {errors?.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
                </div>
                <div>
                    <label className="text-sm text-gray-700">Telefone</label>
                    <input className="input mt-1" {...register("phone")} />
                </div>
                <div>
                    <label className="text-sm text-gray-700">Senha (mock)</label>
                    <input className="input mt-1" type="password" {...register("password")} />
                </div>
                <div>
                    <label className="text-sm text-gray-700">Perfil*</label>
                    <div className="relative mt-1">
                        <select className="input appearance-none pr-10" {...register("profileId")}>
                            {profiles.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                        </svg>
                    </div>
                    {errors?.profileId && <p className="text-red-600 text-sm mt-1">{errors.profileId.message}</p>}
                </div>
                <label className="flex items-center gap-2 md:col-span-4">
                    <input type="checkbox" className="accent-blue-500" {...register("active")} />
                    <span className="text-gray-800">Ativo</span>
                </label>
            </form>
        </Modal>
    )
}
