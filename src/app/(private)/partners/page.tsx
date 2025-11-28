"use client"

import React, { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { api } from "@/lib/api"
import Modal from "@/components/ui/Modal"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { Plus, Edit, Trash2 } from "lucide-react"

const schema = z.object({
    name: z.string().min(1, "Nome do Parceiro é obrigatório"),
    documentType: z.enum(["CPF", "CNPJ"]),
    document: z.string().min(1, "Documento é obrigatório"),
    partnerDiscount: z.number().min(0, "Mínimo 0"),
    clientDiscount: z.number().min(0, "Mínimo 0"),
    fixedDiscount: z.number().min(0, "Mínimo 0").optional(),
    notes: z.string().optional(),
    isActive: z.boolean()
})

type FormData = z.infer<typeof schema>

type PartnerRow = {
    id: string
    name: string
    documentType: "CPF" | "CNPJ"
    document: string
    partnerDiscount: number
    clientDiscount: number
    fixedDiscount?: number
    notes?: string
    isActive: boolean
}

export default function PartnersPage() {
    // Removido: router não utilizado
    const [partners, setPartners] = useState<PartnerRow[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [editing, setEditing] = useState<PartnerRow | null>(null)
    const [partnerToDelete, setPartnerToDelete] = useState<PartnerRow | null>(null)

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            documentType: "CPF",
            document: "",
            partnerDiscount: 0,
            clientDiscount: 0,
            fixedDiscount: 0,
            notes: "",
            isActive: true
        }
    })

    async function loadPartners() {
        try {
            setLoading(true)
            const response = await api.get<unknown>("/partners")
            let list: unknown[] = []
            if (Array.isArray(response)) {
                list = response
            } else if (response && typeof response === 'object') {
                const obj = response as { partners?: unknown[]; data?: unknown[] }
                if (Array.isArray(obj.partners)) list = obj.partners
                else if (Array.isArray(obj.data)) list = obj.data
            }
            setPartners((list as PartnerRow[]) || [])
        } catch (error: unknown) {
            toast.error((error as Error)?.message || "Erro ao carregar parceiros")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadPartners()
    }, [])

    function openCreateModal() {
        setEditing(null)
        reset({
            name: "",
            documentType: "CPF",
            document: "",
            partnerDiscount: 0,
            clientDiscount: 0,
            notes: "",
            isActive: true
        })
        setModalOpen(true)
    }

    function openEditModal(item: PartnerRow) {
        setEditing(item)
        reset({
            name: item.name,
            documentType: item.documentType,
            document: item.document,
            partnerDiscount: item.partnerDiscount,
            clientDiscount: item.clientDiscount,
            fixedDiscount: item.fixedDiscount || 0,
            notes: item.notes || "",
            isActive: item.isActive
        })
        setModalOpen(true)
    }

    async function onSubmit(data: FormData) {
        try {
            if (editing) {
                await api.put(`/partners/${editing.id}`, {
                    name: data.name,
                    documentType: data.documentType,
                    document: data.document,
                    partnerDiscount: data.partnerDiscount,
                    clientDiscount: data.clientDiscount,
                    fixedDiscount: data.fixedDiscount ?? 0,
                    notes: data.notes || undefined,
                    isActive: data.isActive
                })
                toast.success("Parceiro atualizado com sucesso")
            } else {
                await api.post("/partners", {
                    name: data.name,
                    documentType: data.documentType,
                    document: data.document,
                    partnerDiscount: data.partnerDiscount,
                    clientDiscount: data.clientDiscount,
                    fixedDiscount: data.fixedDiscount ?? 0,
                    notes: data.notes || undefined,
                    isActive: data.isActive
                })
                toast.success("Parceiro criado com sucesso")
            }
            setModalOpen(false)
            await loadPartners()
        } catch (error: unknown) {
            toast.error((error as Error)?.message || "Erro ao salvar parceiro")
        }
    }

    async function onDelete(id: string) {
        try {
            await api.delete(`/partners/${id}`)
            toast.success("Parceiro excluído")
            await loadPartners()
        } catch (error: unknown) {
            toast.error((error as Error)?.message || "Erro ao excluir parceiro")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Parceiros</h1>
                    <p className="text-gray-600 mt-1">Gerencie os parceiros e seus descontos</p>
                </div>
                <button
                    onClick={openCreateModal}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    Novo Parceiro
                </button>
            </div>

            {/* Card de Estatísticas */}
            <div className="card p-6">
                <div className="flex items-center gap-4">
                    <div className="text-4xl">🤝</div>
                    <div>
                        <div className="text-2xl font-bold text-gray-900">{partners.length}</div>
                        <div className="text-gray-600">Parceiros</div>
                    </div>
                </div>
            </div>

            <div className="card p-6">
                {loading ? (
                    <LoadingSpinner size="lg" text="Carregando parceiros..." />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-gray-700">
                                <tr>
                                    <th className="py-3 pr-4 font-medium">Nome</th>
                                    <th className="py-3 pr-4 font-medium">Documento</th>
                                    <th className="py-3 pr-4 font-medium">Descontos</th>
                                    <th className="py-3 pr-4 font-medium">Status</th>
                                    <th className="py-3 pr-0 font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {partners.map(p => {
                                    const initial = p.name.charAt(0).toUpperCase()
                                    const formatCurrency = (value: number) => {
                                        return new Intl.NumberFormat('pt-BR', {
                                            style: 'currency',
                                            currency: 'BRL'
                                        }).format(value)
                                    }
                                    return (
                                        <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-semibold text-gray-700">
                                                        {initial}
                                                    </div>
                                                    <div className="font-medium text-gray-900">{p.name}</div>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className="text-gray-900">{p.documentType}</div>
                                                <div className="text-sm text-gray-600">{p.document}</div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className="text-sm text-gray-700">
                                                    Parceiro: <span className="font-medium">{Number(p.partnerDiscount).toFixed(2)}%</span>
                                                </div>
                                                <div className="text-sm text-gray-700">
                                                    Cliente: <span className="font-medium">{Number(p.clientDiscount).toFixed(2)}%</span>
                                                </div>
                                                <div className="text-sm text-gray-700">
                                                    Valor fixo: <span className="font-medium">
                                                        {p.fixedDiscount && p.fixedDiscount > 0 
                                                            ? formatCurrency(p.fixedDiscount) 
                                                            : '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${p.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                                    {p.isActive ? 'Ativo' : 'Inativo'}
                                                </span>
                                            </td>
                                            <td className="py-4 pr-0">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => openEditModal(p)}
                                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                                        title="Editar parceiro"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => setPartnerToDelete(p)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                                        title="Excluir parceiro"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {partners.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum parceiro encontrado</h3>
                                                    <p className="text-gray-600">Crie um parceiro para começar.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? "Editar Parceiro" : "Novo Parceiro"}
            >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Nome do Parceiro *</label>
                        <input
                            type="text"
                            placeholder="Digite o nome do parceiro"
                            className="input"
                            {...register("name")}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Documento *</label>
                        <select
                            className="input"
                            {...register("documentType")}
                        >
                            <option value="CPF">CPF</option>
                            <option value="CNPJ">CNPJ</option>
                        </select>
                        {errors.documentType && <p className="mt-1 text-sm text-red-600">{errors.documentType.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Documento *</label>
                        <input
                            type="text"
                            placeholder="Digite o CPF ou CNPJ"
                            className="input"
                            {...register("document")}
                        />
                        {errors.document && <p className="mt-1 text-sm text-red-600">{errors.document.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Desconto para o Parceiro (%) *</label>
                        <input
                            type="number"
                            step="0.01"
                            min={0}
                            placeholder="0.00"
                            className="input"
                            {...register("partnerDiscount", { valueAsNumber: true })}
                        />
                        {errors.partnerDiscount && <p className="mt-1 text-sm text-red-600">{errors.partnerDiscount.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Desconto para o Cliente (%) *</label>
                        <input
                            type="number"
                            step="0.01"
                            min={0}
                            placeholder="0.00"
                            className="input"
                            {...register("clientDiscount", { valueAsNumber: true })}
                        />
                        {errors.clientDiscount && <p className="mt-1 text-sm text-red-600">{errors.clientDiscount.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Desconto (valor fixo)</label>
                        <input
                            type="number"
                            step="0.01"
                            min={0}
                            placeholder="0.00"
                            className="input"
                            {...register("fixedDiscount", { valueAsNumber: true })}
                        />
                        {errors.fixedDiscount && <p className="mt-1 text-sm text-red-600">{errors.fixedDiscount.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Observações</label>
                        <textarea
                            placeholder="Digite observações sobre o parceiro"
                            rows={4}
                            className="input"
                            {...register("notes")}
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input id="isActive" type="checkbox" {...register("isActive")}/>
                        <label htmlFor="isActive" className="text-sm text-gray-700">Parceiro ativo</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => setModalOpen(false)}
                            className="btn"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary"
                        >
                            {isSubmitting ? (editing ? "Salvando..." : "Criando...") : (editing ? "Salvar alterações" : "Criar Parceiro")}
                        </button>
                    </div>
                </form>
            </Modal>
            <DeleteConfirmationModal
                open={Boolean(partnerToDelete)}
                onClose={() => setPartnerToDelete(null)}
                onConfirm={async () => {
                    if (partnerToDelete) {
                        await onDelete(partnerToDelete.id)
                        setPartnerToDelete(null)
                    }
                }}
                partnerName={partnerToDelete?.name || 'Parceiro'}
            />
        </div>
    )
}

function DeleteConfirmationModal({
    open,
    onClose,
    onConfirm,
    partnerName
}: {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    partnerName: string
}) {
    return (
        <Modal open={open} onClose={onClose} title="Confirmar exclusão" className="max-w-md">
            <div>
                <p className="text-gray-700 mb-4">Tem certeza que deseja excluir o parceiro <strong>{partnerName}</strong>? Esta ação não pode ser desfeita.</p>
                <div className="flex gap-3">
                    <button className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 flex-1" onClick={onClose}>Cancelar</button>
                    <button className="btn bg-red-600 hover:bg-red-700 text-white flex-1" onClick={onConfirm}>Excluir</button>
                </div>
            </div>
        </Modal>
    )
}


