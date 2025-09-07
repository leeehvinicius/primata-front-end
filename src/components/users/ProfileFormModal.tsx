"use client"
import React from "react"
import Modal from "@/components/ui/Modal"

type ProfileRow = { id: string; name: string; description?: string }

type Props = {
    open: boolean
    onClose: () => void
    title: string
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
    register: (name: string) => {
        name: string
        ref: (element: HTMLInputElement | HTMLTextAreaElement | null) => void
        onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
        onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    }
    errors: Record<string, { message?: string }>
    saving?: boolean
    /** NOVO: lista dentro da modal */
    profiles?: ProfileRow[]
    onEdit?: (p: ProfileRow) => void
    /** Opcional: para o botão do footer enviar o form */
    formId?: string
}

const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
        <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    </svg>
)

export default function ProfileFormModal({
    open, onClose, title, onSubmit, register, errors, saving,
    profiles, onEdit, formId = "profile-form",
}: Props) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={title}
            footer={
                <>
                    <button className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" form={formId} type="submit" disabled={!!saving}>
                        {saving ? "Salvando…" : "Salvar"}
                    </button>
                </>
            }
        >
            {/* Formulário */}
            <form id={formId} className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
                <div className="md:col-span-2">
                    <label className="text-sm text-gray-700">Nome do perfil*</label>
                    <input className="input mt-1" {...register("name")} />
                    {errors?.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                </div>
                <div className="md:col-span-2">
                    <label className="text-sm text-gray-700">Descrição</label>
                    <textarea className="input mt-1 h-24" {...register("description")} />
                </div>
            </form>

            {/* Lista dentro da modal (opcional) */}
            {profiles && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="font-medium mb-3 text-gray-900">Perfis cadastrados</h4>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-gray-600">
                                <tr>
                                    <th className="py-2 pr-4">Nome</th>
                                    <th className="py-2 pr-4">Descrição</th>
                                    <th className="py-2 pr-4 w-24">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {profiles.map(p => (
                                    <tr key={p.id} className="border-t border-gray-100">
                                        <td className="py-3 pr-4 text-gray-900">{p.name}</td>
                                        <td className="py-3 pr-4 text-gray-700">{p.description || "—"}</td>
                                        <td className="py-3 pr-0">
                                            <button
                                                className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                                                type="button"
                                                onClick={() => onEdit?.(p)}
                                                title="Editar perfil"
                                            >
                                                <PencilIcon className="w-4 h-4 mr-1" /> Editar
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {!profiles.length && (
                                    <tr><td colSpan={3} className="py-6 text-gray-500">Nenhum perfil cadastrado.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </Modal>
    )
}
