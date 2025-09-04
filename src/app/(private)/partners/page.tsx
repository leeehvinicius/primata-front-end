"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { api } from "@/lib/api"
import Modal from "@/components/ui/Modal"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { Plus, Edit, Trash2 } from "lucide-react"

const schema = z.object({
    name: z.string().min(1, "Nome do Parceiro é obrigatório"),
    documentType: z.enum(["CPF", "CNPJ"]),
    document: z.string().min(1, "Documento é obrigatório"),
    partnerDiscount: z.number().min(0, "Mínimo 0").max(100, "Máximo 100"),
    clientDiscount: z.number().min(0, "Mínimo 0").max(100, "Máximo 100"),
    notes: z.string().optional(),
    isActive: z.boolean()
})

type FormData = z.infer<typeof schema>

type HealthPlanRow = {
    id: string
    name: string
    planType: "individual" | "familiar" | "empresarial"
    operatorCode: string
    isActive: boolean
}

export default function PartnersPage() {
    const router = useRouter()
    const [partners, setPartners] = useState<HealthPlanRow[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [modalOpen, setModalOpen] = useState<boolean>(false)
    const [editing, setEditing] = useState<HealthPlanRow | null>(null)
    const [partnerToDelete, setPartnerToDelete] = useState<HealthPlanRow | null>(null)

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: "",
            documentType: "CPF",
            document: "",
            partnerDiscount: 0,
            clientDiscount: 0,
            notes: "",
            isActive: true
        }
    })

    async function loadPartners() {
        try {
            setLoading(true)
            const response = await api.get<any>("/agreements/health-plans")
            const list: HealthPlanRow[] = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : []
            setPartners(list)
        } catch (error: any) {
            toast.error(error?.message || "Erro ao carregar parceiros")
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

    function openEditModal(item: HealthPlanRow) {
        setEditing(item)
        reset({
            name: item.name,
            documentType: "CPF",
            document: item.operatorCode || "",
            partnerDiscount: 0,
            clientDiscount: 0,
            notes: "",
            isActive: item.isActive
        })
        setModalOpen(true)
    }

    async function onSubmit(data: FormData) {
        try {
            if (editing) {
                await api.put(`/agreements/health-plans/${editing.id}`, {
                    name: data.name,
                    planType: "individual",
                    operatorCode: data.document,
                    isActive: data.isActive
                })
                toast.success("Parceiro atualizado com sucesso")
            } else {
                await api.post("/agreements/health-plans", {
                    name: data.name,
                    planType: "individual",
                    operatorCode: data.document,
                    isActive: data.isActive
                })
                toast.success("Parceiro criado com sucesso")
            }
            setModalOpen(false)
            await loadPartners()
        } catch (error: any) {
            toast.error(error?.message || "Erro ao salvar parceiro")
        }
    }

    async function onDelete(id: string) {
        try {
            await api.delete(`/agreements/health-plans/${id}`)
            toast.success("Parceiro excluído")
            await loadPartners()
        } catch (error: any) {
            toast.error(error?.message || "Erro ao excluir parceiro")
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
                                {partners.map(p => (
                                    <tr key={p.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-4 pr-4">
                                            <div className="font-medium text-gray-900">{p.name}</div>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <div className="text-gray-900">{p.operatorCode}</div>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <div className="text-sm text-gray-700">Parceiro: <span className="font-medium">0.00%</span></div>
                                            <div className="text-sm text-gray-700">Cliente: <span className="font-medium">0.00%</span></div>
                                        </td>
                                        <td className="py-4 pr-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${p.isActive ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                                {p.isActive ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="py-4 pr-0">
                                            <div className="flex items-center gap-2 justify-end">
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
                                ))}
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
                        <label className="block text-sm text-gray-700 mb-2">Nome do Parceiro *</label>
                        <input
                            type="text"
                            placeholder="Digite o nome do parceiro"
                            className="input"
                            {...register("name")}
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                    </div>
                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Tipo de Documento *</label>
                        <div className="flex gap-4">
                            <label className="inline-flex items-center gap-2">
                                <input type="radio" value="CPF" {...register("documentType")} />
                                <span>CPF</span>
                            </label>
                            <label className="inline-flex items-center gap-2">
                                <input type="radio" value="CNPJ" {...register("documentType")} />
                                <span>CNPJ</span>
                            </label>
                        </div>
                        {errors.documentType && <p className="mt-1 text-sm text-red-600">{errors.documentType.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Documento *</label>
                        <input
                            type="text"
                            placeholder="Digite o CPF ou CNPJ"
                            className="input"
                            {...register("document")}
                        />
                        {errors.document && <p className="mt-1 text-sm text-red-600">{errors.document.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Desconto para o Parceiro (%) *</label>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                max={100}
                                placeholder="0.00"
                                className="input"
                                {...register("partnerDiscount", { valueAsNumber: true })}
                            />
                            {errors.partnerDiscount && <p className="mt-1 text-sm text-red-600">{errors.partnerDiscount.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Desconto para o Cliente (%) *</label>
                            <input
                                type="number"
                                step="0.01"
                                min={0}
                                max={100}
                                placeholder="0.00"
                                className="input"
                                {...register("clientDiscount", { valueAsNumber: true })}
                            />
                            {errors.clientDiscount && <p className="mt-1 text-sm text-red-600">{errors.clientDiscount.message}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Observações</label>
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
                            className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
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


