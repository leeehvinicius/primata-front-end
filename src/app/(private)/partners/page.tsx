"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { usePartners } from "@/lib/usePartners"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import Modal from "@/components/ui/Modal"
import { 
    Search, 
    Filter, 
    Plus, 
    Edit, 
    Trash2, 
    CheckCircle, 
    XCircle, 
    Building2, 
    DollarSign, 
    Users,
    AlertTriangle,
    Shield,
    CreditCard,
    FileText,
    User,
    Calendar,
    Eye,
    Percent,
    TrendingUp,
    AlertCircle,
    Settings,
    BarChart3,
    Calculator,
    SearchCheck,
    Activity,
    Zap,
    Download,
    RefreshCw
} from "lucide-react"
import { 
    PlanType, 
    planTypeConfig, 
    HealthPlan, 
    Agreement, 
    Payment, 
    CreateAgreementData,
    AgreementDiscount,
    CoverageLimit,
    CoverageAlert,
    OperatorIntegration,
    LimitType,
    limitTypeConfig,
    AlertType,
    alertTypeConfig,
    IntegrationType,
    PaymentMethod,
    PaymentStatus
} from "@/types/partners"

// ===== Schemas de Validação =====
const createHealthPlanSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    planType: z.nativeEnum(PlanType, { message: "Selecione um tipo de plano" }),
    operatorCode: z.string().min(2, "Código da operadora deve ter pelo menos 2 caracteres"),
    isActive: z.boolean().default(true)
})

const editHealthPlanSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    planType: z.nativeEnum(PlanType, { message: "Selecione um tipo de plano" }),
    operatorCode: z.string().min(2, "Código da operadora deve ter pelo menos 2 caracteres"),
    isActive: z.boolean().default(true)
})

const createAgreementSchema = z.object({
    healthPlanId: z.string().min(1, "Selecione um plano de saúde"),
    clientId: z.string().min(1, "Selecione um cliente"),
    agreementNumber: z.string().min(2, "Número do convênio deve ter pelo menos 2 caracteres"),
    cardNumber: z.string().optional(),
    isActive: z.boolean().default(true)
})

const editAgreementSchema = z.object({
    cardNumber: z.string().optional(),
    isActive: z.boolean().default(true)
})

const createDiscountSchema = z.object({
    agreementId: z.string().min(1, "Selecione um convênio"),
    serviceId: z.string().optional(),
    packageId: z.string().optional(),
    discountPercentage: z.number().min(0, "Desconto deve ser maior ou igual a 0").max(100, "Desconto deve ser menor ou igual a 100"),
    isActive: z.boolean().default(true)
})

const createCoverageLimitSchema = z.object({
    healthPlanId: z.string().min(1, "Selecione um plano de saúde"),
    serviceId: z.string().optional(),
    packageId: z.string().optional(),
    limitAmount: z.number().min(0, "Valor limite deve ser maior ou igual a 0"),
    limitType: z.nativeEnum(LimitType, { message: "Selecione um tipo de limite" }),
    isActive: z.boolean().default(true)
})

const createPaymentSchema = z.object({
    clientId: z.string().min(1, "Selecione um cliente"),
    serviceId: z.string().min(1, "Selecione um serviço"),
    amount: z.number().min(0, "Valor deve ser maior ou igual a 0"),
    partnerDiscount: z.number().min(0, "Desconto do parceiro deve ser maior ou igual a 0").max(100, "Desconto do parceiro deve ser menor ou igual a 100"),
    clientDiscount: z.number().min(0, "Desconto do cliente deve ser maior ou igual a 0").max(100, "Desconto do cliente deve ser menor ou igual a 100"),
    paymentMethod: z.nativeEnum(PaymentMethod, { message: "Selecione um método de pagamento" }),
    paymentStatus: z.nativeEnum(PaymentStatus).optional(),
    dueDate: z.string().optional(),
    notes: z.string().optional()
})

const createIntegrationSchema = z.object({
    healthPlanId: z.string().min(1, "Selecione um plano de saúde"),
    integrationType: z.nativeEnum(IntegrationType, { message: "Selecione um tipo de integração" }),
    endpoint: z.string().optional(),
    credentials: z.record(z.any()).optional(),
    settings: z.record(z.any()).optional(),
    isActive: z.boolean().default(true)
})

const calculateDiscountSchema = z.object({
    agreementId: z.string().min(1, "Selecione um convênio"),
    serviceId: z.string().min(1, "Selecione um serviço"),
    amount: z.number().min(0, "Valor deve ser maior ou igual a 0")
})

const checkCoverageSchema = z.object({
    agreementId: z.string().min(1, "Selecione um convênio"),
    serviceId: z.string().min(1, "Selecione um serviço"),
    amount: z.number().min(0, "Valor deve ser maior ou igual a 0")
})

type CreateHealthPlanFormData = z.infer<typeof createHealthPlanSchema>
type EditHealthPlanFormData = z.infer<typeof editHealthPlanSchema>
type CreateAgreementFormData = z.infer<typeof createAgreementSchema>
type EditAgreementFormData = z.infer<typeof editAgreementSchema>
type CreateDiscountFormData = z.infer<typeof createDiscountSchema>
type CreateCoverageLimitFormData = z.infer<typeof createCoverageLimitSchema>
type CreatePaymentFormData = z.infer<typeof createPaymentSchema>
type CreateIntegrationFormData = z.infer<typeof createIntegrationSchema>
type CalculateDiscountFormData = z.infer<typeof calculateDiscountSchema>
type CheckCoverageFormData = z.infer<typeof checkCoverageSchema>

// ===== Componentes UI =====
function StatCard({ title, value, icon: Icon, color, trend, subtitle }: {
    title: string
    value: string | number
    icon: React.ComponentType<{ className?: string }>
    color: string
    trend?: { value: number; isPositive: boolean }
    subtitle?: string
}) {
    return (
        <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${color}`}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {trend.isPositive ? '+' : ''}{trend.value}%
                    </div>
                )}
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
            <div className="text-gray-600 text-sm">{title}</div>
            {subtitle && <div className="text-gray-500 text-xs mt-1">{subtitle}</div>}
        </div>
    )
}

function HealthPlanRow({ healthPlan, onEdit, onToggleStatus, onDelete }: {
    healthPlan: HealthPlan
    onEdit: (healthPlan: HealthPlan) => void
    onToggleStatus: (healthPlanId: string) => void
    onDelete: (healthPlanId: string) => void
}) {
    const config = planTypeConfig[healthPlan.planType]

    return (
        <tr className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bg} ${config.border} border`}>
                        <span className="text-lg">{config.icon}</span>
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{healthPlan.name}</div>
                        <div className={`text-sm ${config.color}`}>{config.name}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 pr-4">
                <div className="text-gray-600 font-mono text-sm">
                    {healthPlan.operatorCode}
                </div>
            </td>
            <td className="py-4 pr-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                    healthPlan.isActive
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                    {healthPlan.isActive ? 'Ativo' : 'Inativo'}
                </div>
            </td>
            <td className="py-4 pr-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(healthPlan)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar plano de saúde"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => onToggleStatus(healthPlan.id)}
                        className={`p-2 rounded-lg transition-colors ${
                            healthPlan.isActive
                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-100' 
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-100'
                        }`}
                        title={healthPlan.isActive ? 'Desativar plano' : 'Ativar plano'}
                    >
                        {healthPlan.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                    <button
                        onClick={() => onDelete(healthPlan.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir plano de saúde"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    )
}

function PartnerRow({ partner, onEdit, onToggleStatus, onDelete, onView }: {
    partner: any
    onEdit: (partner: any) => void
    onToggleStatus: (partnerId: string) => void
    onDelete: (partnerId: string) => void
    onView: (partner: any) => void
}) {
    return (
        <tr className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">
                        <Building2 className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{partner.name}</div>
                        <div className="text-sm text-gray-600">{partner.cnpj}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 pr-4">
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                        <div className="font-medium text-gray-900">{partner.contactPerson}</div>
                        <div className="text-sm text-gray-600">{partner.email}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 pr-4">
                <div className="text-gray-600 text-sm">
                    {partner.phone}
                </div>
            </td>
            <td className="py-4 pr-4">
                <div className="text-gray-600 text-sm">
                    {partner.planCount} planos
                </div>
            </td>
            <td className="py-4 pr-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                    partner.isActive
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                    {partner.isActive ? 'Ativo' : 'Inativo'}
                </div>
            </td>
            <td className="py-4 pr-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onView(partner)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Ver detalhes do parceiro"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(partner)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar parceiro"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => onToggleStatus(partner.id)}
                        className={`p-2 rounded-lg transition-colors ${
                            partner.isActive
                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-100' 
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-100'
                        }`}
                        title={partner.isActive ? 'Desativar parceiro' : 'Ativar parceiro'}
                    >
                        {partner.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                    <button
                        onClick={() => onDelete(partner.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir parceiro"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    )
}

function AgreementRow({ agreement, onEdit, onToggleStatus, onDelete, onView }: {
    agreement: Agreement
    onEdit: (agreement: Agreement) => void
    onToggleStatus: (agreementId: string) => void
    onDelete: (agreementId: string) => void
    onView: (agreement: Agreement) => void
}) {
    return (
        <tr className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 border border-blue-200">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{agreement.agreementNumber}</div>
                        <div className="text-sm text-gray-600">{agreement.healthPlan?.name || 'Plano não encontrado'}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 pr-4">
                <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                        <div className="font-medium text-gray-900">{agreement.client?.name || 'Cliente não encontrado'}</div>
                        <div className="text-sm text-gray-600">{agreement.client?.email || ''}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 pr-4">
                <div className="text-gray-600 font-mono text-sm">
                    {agreement.cardNumber || 'Não informado'}
                </div>
            </td>
            <td className="py-4 pr-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                    agreement.isActive
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                    {agreement.isActive ? 'Ativo' : 'Inativo'}
                </div>
            </td>
            <td className="py-4 pr-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onView(agreement)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Ver detalhes do convênio"
                    >
                        <Eye size={16} />
                    </button>
                    <button
                        onClick={() => onEdit(agreement)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar convênio"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => onToggleStatus(agreement.id)}
                        className={`p-2 rounded-lg transition-colors ${
                            agreement.isActive
                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-100' 
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-100'
                        }`}
                        title={agreement.isActive ? 'Desativar convênio' : 'Ativar convênio'}
                    >
                        {agreement.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                    <button
                        onClick={() => onDelete(agreement.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir convênio"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    )
}

// Modal de formulário de plano de saúde
function HealthPlanFormModal({ 
    open, 
    onClose, 
    healthPlan, 
    isEdit = false,
    onCreateHealthPlan,
    onUpdateHealthPlan
}: {
    open: boolean
    onClose: () => void
    healthPlan?: HealthPlan
    isEdit?: boolean
    onCreateHealthPlan: (data: CreateHealthPlanFormData) => Promise<void>
    onUpdateHealthPlan: (healthPlanId: string, data: EditHealthPlanFormData) => Promise<void>
}) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue
    } = useForm({
        resolver: zodResolver(isEdit ? editHealthPlanSchema : createHealthPlanSchema),
        defaultValues: {
            name: '',
            planType: PlanType.INDIVIDUAL,
            operatorCode: '',
            isActive: true
        }
    })

    // Preenche o formulário quando editar
    React.useEffect(() => {
        if (open && healthPlan && isEdit) {
            const formData = {
                name: healthPlan.name || '',
                planType: healthPlan.planType || PlanType.INDIVIDUAL,
                operatorCode: healthPlan.operatorCode || '',
                isActive: healthPlan.isActive !== false
            }
            
            Object.entries(formData).forEach(([key, value]) => {
                setValue(key as keyof CreateHealthPlanFormData, value)
            })
        } else if (open && !isEdit) {
            reset()
        }
    }, [open, healthPlan, isEdit, setValue, reset])

    const onSubmit = async (data: CreateHealthPlanFormData | EditHealthPlanFormData) => {
        try {
            if (isEdit && healthPlan) {
                await onUpdateHealthPlan(healthPlan.id, data)
                toast.success('Plano de saúde atualizado com sucesso!')
                onClose()
                reset()
            } else {
                await onCreateHealthPlan(data)
                toast.success('Plano de saúde criado com sucesso!')
                onClose()
                reset()
            }
        } catch (error) {
            console.error('Form submission error:', error)
            toast.error('Erro ao salvar plano de saúde')
        }
    }

    const planTypes = Object.entries(planTypeConfig).map(([value, config]) => ({
        value,
        label: config.name
    }))

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? 'Editar Plano de Saúde' : 'Novo Plano de Saúde'}
            className="max-w-2xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Nome da Operadora*</label>
                        <input 
                            className="input" 
                            {...register("name")}
                            placeholder="Ex: Unimed, Amil, Bradesco Saúde"
                        />
                        {errors.name && (
                            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Tipo de Plano*</label>
                        <select className="input" {...register("planType")}>
                            {planTypes.map((planType) => (
                                <option key={planType.value} value={planType.value}>
                                    {planType.label}
                                </option>
                            ))}
                        </select>
                        {errors.planType && (
                            <p className="text-red-400 text-sm mt-1">{errors.planType.message}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-700 mb-2">Código da Operadora*</label>
                    <input 
                        className="input" 
                        {...register("operatorCode")}
                        placeholder="Ex: UNI001, AMIL001"
                    />
                    {errors.operatorCode && (
                        <p className="text-red-400 text-sm mt-1">{errors.operatorCode.message}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        className="accent-blue-500"
                        {...register("isActive")}
                    />
                    <span className="text-sm text-gray-700">Plano ativo</span>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                        type="button" 
                        className="btn" 
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Salvando...' : (isEdit ? 'Salvar alterações' : 'Criar plano')}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

// Modal de formulário de convênio
function AgreementFormModal({ 
    open, 
    onClose, 
    agreement, 
    isEdit = false,
    healthPlans = [],
    clients = [],
    onCreateAgreement,
    onUpdateAgreement
}: {
    open: boolean
    onClose: () => void
    agreement?: Agreement
    isEdit?: boolean
    healthPlans?: HealthPlan[]
    clients?: any[]
    onCreateAgreement: (data: CreateAgreementFormData) => Promise<void>
    onUpdateAgreement: (agreementId: string, data: EditAgreementFormData) => Promise<void>
}) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue
    } = useForm({
        resolver: zodResolver(isEdit ? editAgreementSchema : createAgreementSchema),
        defaultValues: {
            healthPlanId: '',
            clientId: '',
            agreementNumber: '',
            cardNumber: '',
            isActive: true
        }
    })

    // Preenche o formulário quando editar
    React.useEffect(() => {
        if (open && agreement && isEdit) {
            const formData = {
                cardNumber: agreement.cardNumber || '',
                isActive: agreement.isActive !== false
            }
            
            Object.entries(formData).forEach(([key, value]) => {
                setValue(key as keyof EditAgreementFormData, value)
            })
        } else if (open && !isEdit) {
            reset()
        }
    }, [open, agreement, isEdit, setValue, reset])

    const onSubmit = async (data: CreateAgreementFormData | EditAgreementFormData) => {
        try {
            if (isEdit && agreement) {
                await onUpdateAgreement(agreement.id, data)
                toast.success('Convênio atualizado com sucesso!')
                onClose()
                reset()
            } else {
                await onCreateAgreement(data as CreateAgreementFormData)
                toast.success('Convênio criado com sucesso!')
                onClose()
                reset()
            }
        } catch (error) {
            console.error('Form submission error:', error)
            toast.error('Erro ao salvar convênio')
        }
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? 'Editar Convênio' : 'Novo Convênio'}
            className="max-w-2xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {!isEdit && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-700 mb-2">Plano de Saúde*</label>
                                <select className="input" {...register("healthPlanId")}>
                                    <option value="">Selecione um plano</option>
                                    {healthPlans.map((plan) => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name} - {plan.operatorCode}
                                        </option>
                                    ))}
                                </select>
                                {errors.healthPlanId && (
                                    <p className="text-red-400 text-sm mt-1">{errors.healthPlanId.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm text-gray-700 mb-2">Cliente*</label>
                                <select className="input" {...register("clientId")}>
                                    <option value="">Selecione um cliente</option>
                                    {clients.map((client) => (
                                        <option key={client.id} value={client.id}>
                                            {client.name} - {client.email}
                                        </option>
                                    ))}
                                </select>
                                {errors.clientId && (
                                    <p className="text-red-400 text-sm mt-1">{errors.clientId.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Número do Convênio*</label>
                            <input 
                                className="input" 
                                {...register("agreementNumber")}
                                placeholder="Ex: CONV001, UNI123456"
                            />
                            {errors.agreementNumber && (
                                <p className="text-red-400 text-sm mt-1">{errors.agreementNumber.message}</p>
                            )}
                        </div>
                    </>
                )}

                <div>
                    <label className="block text-sm text-gray-700 mb-2">Número do Cartão</label>
                    <input 
                        className="input" 
                        {...register("cardNumber")}
                        placeholder="Ex: 1234567890123456"
                    />
                    {errors.cardNumber && (
                        <p className="text-red-400 text-sm mt-1">{errors.cardNumber.message}</p>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        className="accent-blue-500"
                        {...register("isActive")}
                    />
                    <span className="text-sm text-gray-700">Convênio ativo</span>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                        type="button" 
                        className="btn" 
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Salvando...' : (isEdit ? 'Salvar alterações' : 'Criar convênio')}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

// Modal de confirmação de exclusão
function DeleteConfirmationModal({ 
    open, 
    onClose, 
    onConfirm, 
    healthPlanName 
}: {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    healthPlanName: string
}) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Confirmar exclusão"
            className="max-w-md"
        >
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-red-100 border border-red-200">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                    <h4 className="text-gray-900 font-medium mb-2">Excluir plano de saúde</h4>
                    <p className="text-gray-600 text-sm mb-4">
                        Tem certeza que deseja excluir o plano <strong>{healthPlanName}</strong>? 
                        Esta ação não pode ser desfeita.
                    </p>
                    <div className="flex gap-3">
                        <button 
                            className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 flex-1" 
                            onClick={onClose}
                        >
                            Cancelar
                        </button>
                        <button 
                            className="btn bg-red-600 hover:bg-red-700 text-white flex-1" 
                            onClick={onConfirm}
                        >
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

// ===== Configuração das Abas =====
const TABS = [
    {
        id: 'partners',
        name: 'Parceiros',
        icon: Building2,
        color: 'slate',
        description: 'Gerencie parceiros e operadoras'
    },
    {
        id: 'health-plans',
        name: 'Planos de Saúde',
        icon: Shield,
        color: 'blue',
        description: 'Gerencie operadoras e planos de saúde'
    },
    {
        id: 'agreements',
        name: 'Convênios',
        icon: CreditCard,
        color: 'green',
        description: 'Gerencie convênios dos clientes'
    },
    {
        id: 'discounts',
        name: 'Descontos',
        icon: Percent,
        color: 'purple',
        description: 'Configure descontos por convênio'
    },
    {
        id: 'coverage-limits',
        name: 'Limites de Cobertura',
        icon: TrendingUp,
        color: 'amber',
        description: 'Defina limites de cobertura'
    },
    {
        id: 'payments',
        name: 'Pagamentos',
        icon: DollarSign,
        color: 'emerald',
        description: 'Gerencie pagamentos com convênios'
    },
    {
        id: 'alerts',
        name: 'Alertas',
        icon: AlertCircle,
        color: 'red',
        description: 'Monitore alertas de cobertura'
    },
    {
        id: 'integrations',
        name: 'Integrações',
        icon: Settings,
        color: 'indigo',
        description: 'Configure integrações com operadoras'
    },
    {
        id: 'reports',
        name: 'Relatórios',
        icon: BarChart3,
        color: 'teal',
        description: 'Visualize relatórios e estatísticas'
    },
    {
        id: 'utilities',
        name: 'Utilitários',
        icon: Calculator,
        color: 'orange',
        description: 'Ferramentas de cálculo e verificação'
    }
] as const

type TabId = typeof TABS[number]['id']

export default function PartnersPage() {
    const {
        healthPlans,
        agreements,
        payments,
        alerts,
        loading,
        error,
        pagination,
        stats,
        searchHealthPlans,
        filterByPlanType,
        filterByStatus,
        createHealthPlan,
        updateHealthPlan,
        deleteHealthPlan,
        loadAgreements,
        createAgreement,
        updateAgreement,
        deleteAgreement,
        loadPayments,
        createPayment,
        updatePayment,
        loadAlerts,
        resolveAlert,
        applyDiscount,
        checkCoverage,
        calculateDiscount
    } = usePartners()

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedPlanType, setSelectedPlanType] = useState<string>("")
    const [selectedStatus, setSelectedStatus] = useState<string>("")
    const [showFilters, setShowFilters] = useState(false)
    const [activeTab, setActiveTab] = useState<TabId>('partners')
    
    // Estados dos modais - Parceiros
    const [showCreatePartnerModal, setShowCreatePartnerModal] = useState(false)
    const [showEditPartnerModal, setShowEditPartnerModal] = useState(false)
    const [showDeletePartnerModal, setShowDeletePartnerModal] = useState(false)
    const [selectedPartner, setSelectedPartner] = useState<any>(null)
    const [partnerToDelete, setPartnerToDelete] = useState<any>(null)
    
    // Estados dos modais - Planos de Saúde
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedHealthPlan, setSelectedHealthPlan] = useState<HealthPlan | null>(null)
    const [healthPlanToDelete, setHealthPlanToDelete] = useState<HealthPlan | null>(null)
    
    // Estados dos modais - Convênios
    const [showCreateAgreementModal, setShowCreateAgreementModal] = useState(false)
    const [showEditAgreementModal, setShowEditAgreementModal] = useState(false)
    const [showDeleteAgreementModal, setShowDeleteAgreementModal] = useState(false)
    const [selectedAgreement, setSelectedAgreement] = useState<Agreement | null>(null)
    const [agreementToDelete, setAgreementToDelete] = useState<Agreement | null>(null)
    
    // Estados dos modais - Descontos
    const [showCreateDiscountModal, setShowCreateDiscountModal] = useState(false)
    const [showEditDiscountModal, setShowEditDiscountModal] = useState(false)
    const [showDeleteDiscountModal, setShowDeleteDiscountModal] = useState(false)
    const [selectedDiscount, setSelectedDiscount] = useState<AgreementDiscount | null>(null)
    const [discountToDelete, setDiscountToDelete] = useState<AgreementDiscount | null>(null)
    
    // Estados dos modais - Limites de Cobertura
    const [showCreateCoverageLimitModal, setShowCreateCoverageLimitModal] = useState(false)
    const [showEditCoverageLimitModal, setShowEditCoverageLimitModal] = useState(false)
    const [showDeleteCoverageLimitModal, setShowDeleteCoverageLimitModal] = useState(false)
    const [selectedCoverageLimit, setSelectedCoverageLimit] = useState<CoverageLimit | null>(null)
    const [coverageLimitToDelete, setCoverageLimitToDelete] = useState<CoverageLimit | null>(null)
    
    // Estados dos modais - Pagamentos
    const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false)
    const [showEditPaymentModal, setShowEditPaymentModal] = useState(false)
    const [showDeletePaymentModal, setShowDeletePaymentModal] = useState(false)
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
    const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null)
    
    // Estados dos modais - Integrações
    const [showCreateIntegrationModal, setShowCreateIntegrationModal] = useState(false)
    const [showEditIntegrationModal, setShowEditIntegrationModal] = useState(false)
    const [showDeleteIntegrationModal, setShowDeleteIntegrationModal] = useState(false)
    const [selectedIntegration, setSelectedIntegration] = useState<OperatorIntegration | null>(null)
    const [integrationToDelete, setIntegrationToDelete] = useState<OperatorIntegration | null>(null)
    
    // Estados dos modais - Utilitários
    const [showCalculateDiscountModal, setShowCalculateDiscountModal] = useState(false)
    const [showCheckCoverageModal, setShowCheckCoverageModal] = useState(false)
    const [showApplyDiscountModal, setShowApplyDiscountModal] = useState(false)
    
    // Estados para dados auxiliares
    const [partners, setPartners] = useState<any[]>([])
    const [clients, setClients] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([])
    const [packages, setPackages] = useState<any[]>([])
    const [discounts, setDiscounts] = useState<AgreementDiscount[]>([])
    const [coverageLimits, setCoverageLimits] = useState<CoverageLimit[]>([])
    const [integrations, setIntegrations] = useState<OperatorIntegration[]>([])

    // Carregar dados iniciais
    React.useEffect(() => {
        loadAgreements()
        loadPayments()
        loadAlerts()
        
        // Simular carregamento de dados (você pode integrar com seus serviços)
        setPartners([
            { 
                id: '1', 
                name: 'Unimed', 
                cnpj: '12.345.678/0001-90',
                email: 'contato@unimed.com.br',
                phone: '(11) 3003-3030',
                website: 'https://www.unimed.com.br',
                address: 'Av. Paulista, 1000 - São Paulo/SP',
                contactPerson: 'João Silva',
                isActive: true,
                createdAt: '2024-01-15',
                planCount: 3
            },
            { 
                id: '2', 
                name: 'Amil', 
                cnpj: '98.765.432/0001-10',
                email: 'contato@amil.com.br',
                phone: '(11) 3003-4040',
                website: 'https://www.amil.com.br',
                address: 'Rua Augusta, 2000 - São Paulo/SP',
                contactPerson: 'Maria Santos',
                isActive: true,
                createdAt: '2024-01-20',
                planCount: 2
            },
            { 
                id: '3', 
                name: 'Bradesco Saúde', 
                cnpj: '11.222.333/0001-44',
                email: 'contato@bradescosaude.com.br',
                phone: '(11) 3003-5050',
                website: 'https://www.bradescosaude.com.br',
                address: 'Av. Faria Lima, 3000 - São Paulo/SP',
                contactPerson: 'Pedro Costa',
                isActive: false,
                createdAt: '2024-02-01',
                planCount: 1
            }
        ])
        
        setClients([
            { id: '1', name: 'João Silva', email: 'joao@email.com' },
            { id: '2', name: 'Maria Santos', email: 'maria@email.com' },
            { id: '3', name: 'Pedro Costa', email: 'pedro@email.com' }
        ])
        
        setServices([
            { id: '1', name: 'Consulta Dermatológica' },
            { id: '2', name: 'Procedimento Estético' },
            { id: '3', name: 'Tratamento Facial' }
        ])
        
        setPackages([
            { id: '1', name: 'Pacote Facial Completo' },
            { id: '2', name: 'Pacote Corporal' },
            { id: '3', name: 'Pacote Anti-idade' }
        ])
    }, [loadAgreements, loadPayments, loadAlerts])

    // ===== Handlers para Parceiros =====
    const handleCreatePartner = () => {
        setSelectedPartner(null)
        setShowCreatePartnerModal(true)
    }

    const handleEditPartner = (partner: any) => {
        setSelectedPartner(partner)
        setShowEditPartnerModal(true)
    }

    const handleViewPartner = (partner: any) => {
        console.log('View partner:', partner)
        toast.info('Funcionalidade de visualização será implementada em breve')
    }

    const handleTogglePartnerStatus = async (partnerId: string) => {
        try {
            const partner = partners?.find(p => p.id === partnerId)
            if (partner) {
                // Simular atualização
                setPartners(prev => prev.map(p => 
                    p.id === partnerId ? { ...p, isActive: !p.isActive } : p
                ))
                toast.success('Status do parceiro atualizado!')
            }
        } catch (error) {
            console.error('handleTogglePartnerStatus error:', error)
            toast.error('Erro ao atualizar status')
        }
    }

    const handleDeletePartner = (partnerId: string) => {
        const partner = partners?.find(p => p.id === partnerId)
        if (partner) {
            setPartnerToDelete(partner)
            setShowDeletePartnerModal(true)
        } else {
            console.error('Partner not found for ID:', partnerId)
            toast.error('Parceiro não encontrado')
        }
    }

    const handleConfirmDeletePartner = async () => {
        if (partnerToDelete) {
            try {
                // Simular exclusão
                setPartners(prev => prev.filter(p => p.id !== partnerToDelete.id))
                toast.success('Parceiro excluído com sucesso!')
                setShowDeletePartnerModal(false)
                setPartnerToDelete(null)
            } catch (error) {
                console.error('Delete partner error:', error)
                toast.error('Erro inesperado ao excluir parceiro')
            }
        }
    }

    // ===== Handlers =====
    const handleSearch = () => {
        searchHealthPlans(searchTerm)
    }

    const handlePlanTypeFilter = (planType: string) => {
        setSelectedPlanType(planType)
        filterByPlanType(planType)
    }

    const handleStatusFilter = (status: string) => {
        setSelectedStatus(status)
        filterByStatus(status === "active")
    }

    const handleToggleStatus = async (healthPlanId: string) => {
        try {
            const healthPlan = healthPlans?.find(hp => hp.id === healthPlanId)
            if (healthPlan) {
                const result = await updateHealthPlan(healthPlanId, { isActive: !healthPlan.isActive })
                
                if (result) {
                    toast.success('Status do plano atualizado!')
                } else {
                    toast.error('Erro ao atualizar status')
                }
            }
        } catch (error) {
            console.error('handleToggleStatus error:', error)
            toast.error('Erro ao atualizar status')
        }
    }

    const handleDeleteHealthPlan = (healthPlanId: string) => {
        const healthPlan = healthPlans?.find(hp => hp.id === healthPlanId)
        if (healthPlan) {
            setHealthPlanToDelete(healthPlan)
            setShowDeleteModal(true)
        } else {
            console.error('Health plan not found for ID:', healthPlanId)
            toast.error('Plano de saúde não encontrado')
        }
    }

    const handleConfirmDelete = async () => {
        if (healthPlanToDelete) {
            try {
                const success = await deleteHealthPlan(healthPlanToDelete.id)
                if (success) {
                    toast.success('Plano de saúde excluído com sucesso!')
                    setShowDeleteModal(false)
                    setHealthPlanToDelete(null)
                } else {
                    toast.error('Não foi possível excluir o plano de saúde')
                }
            } catch (error) {
                console.error('Delete health plan error:', error)
                toast.error('Erro inesperado ao excluir plano de saúde')
            }
        }
    }

    const handleEditHealthPlan = (healthPlan: HealthPlan) => {
        setSelectedHealthPlan(healthPlan)
        setShowEditModal(true)
    }

    const handleCreateHealthPlan = () => {
        setSelectedHealthPlan(null)
        setShowCreateModal(true)
    }

    const handleCreateHealthPlanSubmit = async (data: CreateHealthPlanFormData) => {
        try {
            await createHealthPlan(data)
            setShowCreateModal(false)
        } catch (error) {
            throw error
        }
    }

    const handleUpdateHealthPlanSubmit = async (healthPlanId: string, data: EditHealthPlanFormData) => {
        try {
            const result = await updateHealthPlan(healthPlanId, data)
            
            if (result) {
                setShowEditModal(false)
            } else {
                console.error('Update failed - no result returned')
                toast.error('Falha ao atualizar plano de saúde')
            }
        } catch (error) {
            console.error('Update health plan error in handleUpdateHealthPlanSubmit:', error)
            toast.error('Erro ao atualizar plano de saúde')
            throw error
        }
    }

    // ===== Handlers para Convênios =====
    const handleCreateAgreement = () => {
        setSelectedAgreement(null)
        setShowCreateAgreementModal(true)
    }

    const handleEditAgreement = (agreement: Agreement) => {
        setSelectedAgreement(agreement)
        setShowEditAgreementModal(true)
    }

    const handleViewAgreement = (agreement: Agreement) => {
        // Implementar visualização de detalhes do convênio
        console.log('View agreement:', agreement)
        toast.info('Funcionalidade de visualização será implementada em breve')
    }

    const handleToggleAgreementStatus = async (agreementId: string) => {
        try {
            const agreement = agreements?.find(ag => ag.id === agreementId)
            if (agreement) {
                const result = await updateAgreement(agreementId, { isActive: !agreement.isActive })
                
                if (result) {
                    toast.success('Status do convênio atualizado!')
                } else {
                    toast.error('Erro ao atualizar status')
                }
            }
        } catch (error) {
            console.error('handleToggleAgreementStatus error:', error)
            toast.error('Erro ao atualizar status')
        }
    }

    const handleDeleteAgreement = (agreementId: string) => {
        const agreement = agreements?.find(ag => ag.id === agreementId)
        if (agreement) {
            setAgreementToDelete(agreement)
            setShowDeleteAgreementModal(true)
        } else {
            console.error('Agreement not found for ID:', agreementId)
            toast.error('Convênio não encontrado')
        }
    }

    const handleConfirmDeleteAgreement = async () => {
        if (agreementToDelete) {
            try {
                const success = await deleteAgreement(agreementToDelete.id)
                if (success) {
                    toast.success('Convênio excluído com sucesso!')
                    setShowDeleteAgreementModal(false)
                    setAgreementToDelete(null)
                } else {
                    toast.error('Não foi possível excluir o convênio')
                }
            } catch (error) {
                console.error('Delete agreement error:', error)
                toast.error('Erro inesperado ao excluir convênio')
            }
        }
    }

    const handleCreateAgreementSubmit = async (data: CreateAgreementFormData) => {
        try {
            await createAgreement(data)
            setShowCreateAgreementModal(false)
        } catch (error) {
            throw error
        }
    }

    const handleUpdateAgreementSubmit = async (agreementId: string, data: EditAgreementFormData) => {
        try {
            const result = await updateAgreement(agreementId, data)
            
            if (result) {
                setShowEditAgreementModal(false)
            } else {
                console.error('Update failed - no result returned')
                toast.error('Falha ao atualizar convênio')
            }
        } catch (error) {
            console.error('Update agreement error in handleUpdateAgreementSubmit:', error)
            toast.error('Erro ao atualizar convênio')
            throw error
        }
    }

    // ===== Função para obter botão de ação baseado na aba ativa =====
    const getActionButton = () => {
        const currentTab = TABS.find(tab => tab.id === activeTab)
        if (!currentTab) return null

        const getButtonText = () => {
            switch (activeTab) {
                case 'partners': return 'Novo Parceiro'
                case 'health-plans': return 'Novo Plano de Saúde'
                case 'agreements': return 'Novo Convênio'
                case 'discounts': return 'Novo Desconto'
                case 'coverage-limits': return 'Novo Limite'
                case 'payments': return 'Novo Pagamento'
                case 'integrations': return 'Nova Integração'
                default: return 'Nova Ação'
            }
        }

        const getButtonAction = () => {
            switch (activeTab) {
                case 'partners': return () => setShowCreatePartnerModal(true)
                case 'health-plans': return handleCreateHealthPlan
                case 'agreements': return handleCreateAgreement
                case 'discounts': return () => setShowCreateDiscountModal(true)
                case 'coverage-limits': return () => setShowCreateCoverageLimitModal(true)
                case 'payments': return () => setShowCreatePaymentModal(true)
                case 'integrations': return () => setShowCreateIntegrationModal(true)
                default: return () => {}
            }
        }

        return (
            <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={getButtonAction()}
            >
                <Plus size={20} />
                {getButtonText()}
            </button>
        )
    }

    // ===== UI =====
    if (loading && (!healthPlans || healthPlans.length === 0)) {
        return (
            <div className="min-h-screen grid place-items-center">
                <LoadingSpinner size="lg" text="Carregando parceiros..." />
            </div>
        )
    }

    const safePagination = pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
    const planTypes = Object.entries(planTypeConfig).map(([value, config]) => ({
        value,
        label: config.name
    }))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Parceiros & Convênios</h1>
                    <p className="text-gray-600 mt-1">Sistema completo de gestão de parceiros e convênios</p>
                </div>
                {getActionButton()}
            </div>

            {/* Tabs Modernas e Elegantes */}
            <div className="card p-1 bg-gradient-to-r from-gray-50 to-gray-100">
                <div className="flex flex-wrap gap-1">
                    {TABS.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        
                        const getColorClasses = () => {
                            const colors = {
                                slate: {
                                    active: 'bg-slate-600 text-white shadow-lg shadow-slate-200',
                                    inactive: 'text-slate-600 hover:bg-slate-100 hover:text-slate-800',
                                    indicator: 'bg-slate-600'
                                },
                                blue: {
                                    active: 'bg-blue-600 text-white shadow-lg shadow-blue-200',
                                    inactive: 'text-blue-600 hover:bg-blue-100 hover:text-blue-800',
                                    indicator: 'bg-blue-600'
                                },
                                green: {
                                    active: 'bg-green-600 text-white shadow-lg shadow-green-200',
                                    inactive: 'text-green-600 hover:bg-green-100 hover:text-green-800',
                                    indicator: 'bg-green-600'
                                },
                                purple: {
                                    active: 'bg-purple-600 text-white shadow-lg shadow-purple-200',
                                    inactive: 'text-purple-600 hover:bg-purple-100 hover:text-purple-800',
                                    indicator: 'bg-purple-600'
                                },
                                amber: {
                                    active: 'bg-amber-600 text-white shadow-lg shadow-amber-200',
                                    inactive: 'text-amber-600 hover:bg-amber-100 hover:text-amber-800',
                                    indicator: 'bg-amber-600'
                                },
                                emerald: {
                                    active: 'bg-emerald-600 text-white shadow-lg shadow-emerald-200',
                                    inactive: 'text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800',
                                    indicator: 'bg-emerald-600'
                                },
                                red: {
                                    active: 'bg-red-600 text-white shadow-lg shadow-red-200',
                                    inactive: 'text-red-600 hover:bg-red-100 hover:text-red-800',
                                    indicator: 'bg-red-600'
                                },
                                indigo: {
                                    active: 'bg-indigo-600 text-white shadow-lg shadow-indigo-200',
                                    inactive: 'text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800',
                                    indicator: 'bg-indigo-600'
                                },
                                teal: {
                                    active: 'bg-teal-600 text-white shadow-lg shadow-teal-200',
                                    inactive: 'text-teal-600 hover:bg-teal-100 hover:text-teal-800',
                                    indicator: 'bg-teal-600'
                                },
                                orange: {
                                    active: 'bg-orange-600 text-white shadow-lg shadow-orange-200',
                                    inactive: 'text-orange-600 hover:bg-orange-100 hover:text-orange-800',
                                    indicator: 'bg-orange-600'
                                }
                            }
                            return colors[tab.color as keyof typeof colors] || colors.slate
                        }
                        
                        const colorClasses = getColorClasses()
                        
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`group relative flex-1 min-w-[120px] p-4 rounded-xl text-center transition-all duration-300 transform hover:scale-105 ${
                                    isActive
                                        ? `${colorClasses.active} scale-105`
                                        : `bg-white ${colorClasses.inactive} hover:shadow-md`
                                }`}
                                title={tab.description}
                            >
                                <div className="flex flex-col items-center gap-2">
                                    <div className={`p-2 rounded-lg transition-colors ${
                                        isActive 
                                            ? 'bg-white/20' 
                                            : `bg-${tab.color}-100`
                                    }`}>
                                        <Icon size={20} className={isActive ? 'text-white' : `text-${tab.color}-600`} />
                                    </div>
                                    <span className="text-xs font-semibold leading-tight">
                                        {tab.name}
                                    </span>
                                </div>
                                
                                {/* Indicador de aba ativa */}
                                {isActive && (
                                    <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-1 ${colorClasses.indicator} rounded-full shadow-sm`} />
                                )}
                                
                                {/* Efeito de brilho na aba ativa */}
                                {isActive && (
                                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/10 to-transparent pointer-events-none" />
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Stats Cards */}
            {stats && typeof stats === 'object' ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total de Planos"
                        value={Number(stats.totalHealthPlans) || 0}
                        icon={Shield}
                        color="bg-blue-100 text-blue-600"
                    />
                    <StatCard
                        title="Planos Ativos"
                        value={Number(stats.activeHealthPlans) || 0}
                        icon={CheckCircle}
                        color="bg-green-100 text-green-600"
                    />
                    <StatCard
                        title="Total de Convênios"
                        value={Number(stats.totalAgreements) || 0}
                        icon={CreditCard}
                        color="bg-amber-100 text-amber-600"
                    />
                    <StatCard
                        title="Total de Pagamentos"
                        value={Number(stats.totalPayments) || 0}
                        icon={DollarSign}
                        color="bg-purple-100 text-purple-600"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total de Planos"
                        value="0"
                        icon={Shield}
                        color="bg-gray-100 text-gray-600"
                    />
                    <StatCard
                        title="Planos Ativos"
                        value="0"
                        icon={CheckCircle}
                        color="bg-gray-100 text-gray-600"
                    />
                    <StatCard
                        title="Total de Convênios"
                        value="0"
                        icon={CreditCard}
                        color="bg-gray-100 text-gray-600"
                    />
                    <StatCard
                        title="Total de Pagamentos"
                        value="0"
                        icon={DollarSign}
                        color="bg-gray-100 text-gray-600"
                    />
                </div>
            )}

            {/* Search and Filters */}
            <div className="card p-6">
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                        <input
                            type="text"
                            placeholder="Buscar planos de saúde por nome, código..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="input pl-10"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`btn flex items-center gap-2 ${
                            showFilters 
                                ? 'btn-primary' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        <Filter size={20} />
                        Filtros
                    </button>
                </div>

                {/* Filter Panel */}
                {showFilters && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Tipo de Plano</label>
                            <select
                                value={selectedPlanType}
                                onChange={(e) => handlePlanTypeFilter(e.target.value)}
                                className="input"
                            >
                                <option value="">Todos os tipos</option>
                                {planTypes.map((planType) => (
                                    <option key={planType.value} value={planType.value}>
                                        {planType.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Status</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => handleStatusFilter(e.target.value)}
                                className="input"
                            >
                                <option value="">Todos os status</option>
                                <option value="active">Ativos</option>
                                <option value="inactive">Inativos</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <div className="card p-4 border-red-500/20 bg-red-500/10">
                    <div className="text-red-400">{error}</div>
                </div>
            )}

            {/* Conteúdo das Abas */}
            {activeTab === 'partners' && (
                <div className="card p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-gray-700">
                                <tr>
                                    <th className="py-3 pr-4 font-medium">Parceiro</th>
                                    <th className="py-3 pr-4 font-medium">Contato</th>
                                    <th className="py-3 pr-4 font-medium">Telefone</th>
                                    <th className="py-3 pr-4 font-medium">Planos</th>
                                    <th className="py-3 pr-4 font-medium">Status</th>
                                    <th className="py-3 pr-0 font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {partners && partners.map((partner) => (
                                    partner && partner.id && (
                                        <PartnerRow
                                            key={partner.id}
                                            partner={partner}
                                            onEdit={handleEditPartner}
                                            onToggleStatus={handleTogglePartnerStatus}
                                            onDelete={handleDeletePartner}
                                            onView={handleViewPartner}
                                        />
                                    )
                                ))}
                                {(!partners || !partners.length) && !loading && (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Building2 className="text-gray-400" size={32} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum parceiro encontrado</h3>
                                                    <p className="text-gray-600">Crie um novo parceiro para começar a gerenciar operadoras e planos de saúde.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'health-plans' && (
                <div className="card p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-gray-700">
                                <tr>
                                    <th className="py-3 pr-4 font-medium">Plano de Saúde</th>
                                    <th className="py-3 pr-4 font-medium">Código</th>
                                    <th className="py-3 pr-4 font-medium">Status</th>
                                    <th className="py-3 pr-0 font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {healthPlans && healthPlans.map((healthPlan) => (
                                    healthPlan && healthPlan.id && (
                                        <HealthPlanRow
                                            key={healthPlan.id}
                                            healthPlan={healthPlan}
                                            onEdit={handleEditHealthPlan}
                                            onToggleStatus={handleToggleStatus}
                                            onDelete={handleDeleteHealthPlan}
                                        />
                                    )
                                ))}
                                {(!healthPlans || !healthPlans.length) && !loading && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <Shield className="text-gray-400" size={32} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum plano de saúde encontrado</h3>
                                                    <p className="text-gray-600">Tente ajustar os filtros ou criar um novo plano de saúde.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'agreements' && (
                <div className="card p-6">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-gray-700">
                                <tr>
                                    <th className="py-3 pr-4 font-medium">Convênio</th>
                                    <th className="py-3 pr-4 font-medium">Cliente</th>
                                    <th className="py-3 pr-4 font-medium">Cartão</th>
                                    <th className="py-3 pr-4 font-medium">Status</th>
                                    <th className="py-3 pr-0 font-medium">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {agreements && agreements.map((agreement) => (
                                    agreement && agreement.id && (
                                        <AgreementRow
                                            key={agreement.id}
                                            agreement={agreement}
                                            onEdit={handleEditAgreement}
                                            onToggleStatus={handleToggleAgreementStatus}
                                            onDelete={handleDeleteAgreement}
                                            onView={handleViewAgreement}
                                        />
                                    )
                                ))}
                                {(!agreements || !agreements.length) && !loading && (
                                    <tr>
                                        <td colSpan={5} className="py-12 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <CreditCard className="text-gray-400" size={32} />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum convênio encontrado</h3>
                                                    <p className="text-gray-600">Crie um novo convênio para começar a gerenciar os planos dos clientes.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'discounts' && (
                <div className="space-y-6">
                    {/* Header da aba de descontos */}
                    <div className="card p-6 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-600 rounded-xl">
                                <Percent className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Gestão de Descontos</h2>
                                <p className="text-gray-600">Configure descontos específicos por convênio, serviço ou pacote</p>
                            </div>
                        </div>
                    </div>

                    {/* Filtros e busca */}
                    <div className="card p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Buscar descontos por convênio, serviço..."
                                        className="input pl-10 w-full"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <select className="input">
                                    <option value="">Todos os convênios</option>
                                    {agreements?.map(agreement => (
                                        <option key={agreement.id} value={agreement.id}>
                                            {agreement.agreementNumber}
                                        </option>
                                    ))}
                                </select>
                                <button className="btn bg-purple-600 hover:bg-purple-700 text-white">
                                    <Filter size={20} />
                                    Filtrar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabela de descontos */}
                    <div className="card p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-gray-700 border-b border-gray-200">
                                    <tr>
                                        <th className="py-4 pr-4 font-semibold">Convênio</th>
                                        <th className="py-4 pr-4 font-semibold">Serviço/Pacote</th>
                                        <th className="py-4 pr-4 font-semibold">Desconto</th>
                                        <th className="py-4 pr-4 font-semibold">Status</th>
                                        <th className="py-4 pr-4 font-semibold">Criado em</th>
                                        <th className="py-4 pr-0 font-semibold">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Dados simulados de descontos */}
                                    {[
                                        {
                                            id: '1',
                                            agreementNumber: 'CONV001/2024',
                                            serviceName: 'Consulta Dermatológica',
                                            discountPercentage: 20,
                                            isActive: true,
                                            createdAt: '2024-01-15'
                                        },
                                        {
                                            id: '2',
                                            agreementNumber: 'CONV002/2024',
                                            serviceName: 'Pacote Facial Completo',
                                            discountPercentage: 15,
                                            isActive: true,
                                            createdAt: '2024-01-20'
                                        },
                                        {
                                            id: '3',
                                            agreementNumber: 'CONV003/2024',
                                            serviceName: 'Procedimento Estético',
                                            discountPercentage: 25,
                                            isActive: false,
                                            createdAt: '2024-02-01'
                                        }
                                    ].map((discount) => (
                                        <tr key={discount.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-purple-100 border border-purple-200">
                                                        <CreditCard className="w-4 h-4 text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{discount.agreementNumber}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className="text-gray-900 font-medium">{discount.serviceName}</div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
                                                        {discount.discountPercentage}%
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                                                    discount.isActive
                                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                                        : 'bg-red-100 text-red-700 border border-red-200'
                                                }`}>
                                                    {discount.isActive ? 'Ativo' : 'Inativo'}
                                                </div>
                                            </td>
                                            <td className="py-4 pr-4">
                                                <div className="text-gray-600 text-sm">
                                                    {new Date(discount.createdAt).toLocaleDateString('pt-BR')}
                                                </div>
                                            </td>
                                            <td className="py-4 pr-0">
                                                <div className="flex items-center gap-2">
                                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Editar desconto">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button className={`p-2 rounded-lg transition-colors ${
                                                        discount.isActive
                                                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-100' 
                                                            : 'text-gray-400 hover:text-green-600 hover:bg-green-100'
                                                    }`} title={discount.isActive ? 'Desativar desconto' : 'Ativar desconto'}>
                                                        {discount.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Excluir desconto">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'coverage-limits' && (
                <div className="space-y-6">
                    {/* Header da aba de limites */}
                    <div className="card p-6 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-600 rounded-xl">
                                <TrendingUp className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Limites de Cobertura</h2>
                                <p className="text-gray-600">Defina limites de cobertura por sessão, mensal, anual ou vitalício</p>
                            </div>
                        </div>
                    </div>

                    {/* Cards de estatísticas */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="card p-4 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber-600 rounded-lg">
                                    <TrendingUp className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">12</div>
                                    <div className="text-sm text-gray-600">Limites Ativos</div>
                                </div>
                            </div>
                        </div>
                        <div className="card p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-600 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">8</div>
                                    <div className="text-sm text-gray-600">Dentro do Limite</div>
                                </div>
                            </div>
                        </div>
                        <div className="card p-4 bg-gradient-to-r from-red-50 to-red-100 border border-red-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-600 rounded-lg">
                                    <AlertTriangle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">3</div>
                                    <div className="text-sm text-gray-600">Limite Excedido</div>
                                </div>
                            </div>
                        </div>
                        <div className="card p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">5</div>
                                    <div className="text-sm text-gray-600">Expirando em 30 dias</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="card p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Buscar limites por plano, serviço..."
                                        className="input pl-10 w-full"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <select className="input">
                                    <option value="">Todos os tipos</option>
                                    <option value="PER_SESSION">Por Sessão</option>
                                    <option value="MONTHLY">Mensal</option>
                                    <option value="ANNUAL">Anual</option>
                                    <option value="LIFETIME">Vitalício</option>
                                </select>
                                <select className="input">
                                    <option value="">Todos os planos</option>
                                    {healthPlans?.map(plan => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name}
                                        </option>
                                    ))}
                                </select>
                                <button className="btn bg-amber-600 hover:bg-amber-700 text-white">
                                    <Filter size={20} />
                                    Filtrar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabela de limites */}
                    <div className="card p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-gray-700 border-b border-gray-200">
                                    <tr>
                                        <th className="py-4 pr-4 font-semibold">Plano de Saúde</th>
                                        <th className="py-4 pr-4 font-semibold">Serviço/Pacote</th>
                                        <th className="py-4 pr-4 font-semibold">Tipo de Limite</th>
                                        <th className="py-4 pr-4 font-semibold">Valor Limite</th>
                                        <th className="py-4 pr-4 font-semibold">Status</th>
                                        <th className="py-4 pr-0 font-semibold">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Dados simulados de limites */}
                                    {[
                                        {
                                            id: '1',
                                            healthPlanName: 'Unimed',
                                            serviceName: 'Consulta Dermatológica',
                                            limitType: 'MONTHLY',
                                            limitAmount: 1000,
                                            isActive: true
                                        },
                                        {
                                            id: '2',
                                            healthPlanName: 'Amil',
                                            serviceName: 'Pacote Facial Completo',
                                            limitType: 'ANNUAL',
                                            limitAmount: 5000,
                                            isActive: true
                                        },
                                        {
                                            id: '3',
                                            healthPlanName: 'Bradesco Saúde',
                                            serviceName: 'Procedimento Estético',
                                            limitType: 'PER_SESSION',
                                            limitAmount: 500,
                                            isActive: false
                                        }
                                    ].map((limit) => {
                                        const limitConfig = limitTypeConfig[limit.limitType as keyof typeof limitTypeConfig]
                                        
                                        return (
                                            <tr key={limit.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-4 pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-amber-100 border border-amber-200">
                                                            <Shield className="w-4 h-4 text-amber-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{limit.healthPlanName}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className="text-gray-900 font-medium">{limit.serviceName}</div>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${limitConfig.bg} ${limitConfig.color} border ${limitConfig.border}`}>
                                                            {limitConfig.icon} {limitConfig.name}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className="text-gray-900 font-semibold">
                                                        R$ {limit.limitAmount.toLocaleString('pt-BR')}
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                                                        limit.isActive
                                                            ? 'bg-green-100 text-green-700 border border-green-200' 
                                                            : 'bg-red-100 text-red-700 border border-red-200'
                                                    }`}>
                                                        {limit.isActive ? 'Ativo' : 'Inativo'}
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-0">
                                                    <div className="flex items-center gap-2">
                                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Editar limite">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button className={`p-2 rounded-lg transition-colors ${
                                                            limit.isActive
                                                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-100' 
                                                                : 'text-gray-400 hover:text-green-600 hover:bg-green-100'
                                                        }`} title={limit.isActive ? 'Desativar limite' : 'Ativar limite'}>
                                                            {limit.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                                        </button>
                                                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors" title="Excluir limite">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'payments' && (
                <div className="space-y-6">
                    {/* Header da aba de pagamentos */}
                    <div className="card p-6 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-600 rounded-xl">
                                <DollarSign className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Pagamentos com Convênios</h2>
                                <p className="text-gray-600">Gerencie pagamentos processados através de convênios</p>
                            </div>
                        </div>
                    </div>

                    {/* Cards de resumo financeiro */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="card p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-600 rounded-lg">
                                    <DollarSign className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">R$ 45.230</div>
                                    <div className="text-sm text-gray-600">Total Processado</div>
                                </div>
                            </div>
                        </div>
                        <div className="card p-4 bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-600 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">R$ 38.450</div>
                                    <div className="text-sm text-gray-600">Coberto pelo Convênio</div>
                                </div>
                            </div>
                        </div>
                        <div className="card p-4 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600 rounded-lg">
                                    <User className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">R$ 6.780</div>
                                    <div className="text-sm text-gray-600">Pago pelo Cliente</div>
                                </div>
                            </div>
                        </div>
                        <div className="card p-4 bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-600 rounded-lg">
                                    <Percent className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-gray-900">R$ 2.340</div>
                                    <div className="text-sm text-gray-600">Desconto Aplicado</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filtros */}
                    <div className="card p-6">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Buscar pagamentos por convênio, cliente..."
                                        className="input pl-10 w-full"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <select className="input">
                                    <option value="">Todos os status</option>
                                    <option value="PENDING">Pendente</option>
                                    <option value="COMPLETED">Concluído</option>
                                    <option value="FAILED">Falhou</option>
                                    <option value="REFUNDED">Reembolsado</option>
                                </select>
                                <input
                                    type="date"
                                    className="input"
                                    placeholder="Data inicial"
                                />
                                <input
                                    type="date"
                                    className="input"
                                    placeholder="Data final"
                                />
                                <button className="btn bg-emerald-600 hover:bg-emerald-700 text-white">
                                    <Filter size={20} />
                                    Filtrar
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabela de pagamentos */}
                    <div className="card p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-gray-700 border-b border-gray-200">
                                    <tr>
                                        <th className="py-4 pr-4 font-semibold">Convênio</th>
                                        <th className="py-4 pr-4 font-semibold">Cliente</th>
                                        <th className="py-4 pr-4 font-semibold">Valor Total</th>
                                        <th className="py-4 pr-4 font-semibold">Coberto</th>
                                        <th className="py-4 pr-4 font-semibold">Cliente</th>
                                        <th className="py-4 pr-4 font-semibold">Status</th>
                                        <th className="py-4 pr-4 font-semibold">Data</th>
                                        <th className="py-4 pr-0 font-semibold">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Dados simulados de pagamentos */}
                                    {[
                                        {
                                            id: '1',
                                            agreementNumber: 'CONV001/2024',
                                            clientName: 'João Silva',
                                            totalAmount: 200,
                                            amountCovered: 160,
                                            amountClient: 40,
                                            status: 'COMPLETED',
                                            paymentDate: '2024-01-15'
                                        },
                                        {
                                            id: '2',
                                            agreementNumber: 'CONV002/2024',
                                            clientName: 'Maria Santos',
                                            totalAmount: 350,
                                            amountCovered: 280,
                                            amountClient: 70,
                                            status: 'PENDING',
                                            paymentDate: '2024-01-20'
                                        },
                                        {
                                            id: '3',
                                            agreementNumber: 'CONV003/2024',
                                            clientName: 'Pedro Costa',
                                            totalAmount: 150,
                                            amountCovered: 120,
                                            amountClient: 30,
                                            status: 'FAILED',
                                            paymentDate: '2024-02-01'
                                        }
                                    ].map((payment) => {
                                        const getStatusConfig = (status: string) => {
                                            const configs = {
                                                COMPLETED: { bg: 'bg-green-100', color: 'text-green-700', border: 'border-green-200', text: 'Concluído' },
                                                PENDING: { bg: 'bg-yellow-100', color: 'text-yellow-700', border: 'border-yellow-200', text: 'Pendente' },
                                                FAILED: { bg: 'bg-red-100', color: 'text-red-700', border: 'border-red-200', text: 'Falhou' },
                                                REFUNDED: { bg: 'bg-blue-100', color: 'text-blue-700', border: 'border-blue-200', text: 'Reembolsado' }
                                            }
                                            return configs[status as keyof typeof configs] || configs.PENDING
                                        }
                                        
                                        const statusConfig = getStatusConfig(payment.status)
                                        
                                        return (
                                            <tr key={payment.id} className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-4 pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 rounded-lg bg-emerald-100 border border-emerald-200">
                                                            <CreditCard className="w-4 h-4 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <div className="font-medium text-gray-900">{payment.agreementNumber}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className="text-gray-900 font-medium">{payment.clientName}</div>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className="text-gray-900 font-semibold">
                                                        R$ {payment.totalAmount.toLocaleString('pt-BR')}
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className="text-green-600 font-semibold">
                                                        R$ {payment.amountCovered.toLocaleString('pt-BR')}
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className="text-blue-600 font-semibold">
                                                        R$ {payment.amountClient.toLocaleString('pt-BR')}
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${statusConfig.bg} ${statusConfig.color} border ${statusConfig.border}`}>
                                                        {statusConfig.text}
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-4">
                                                    <div className="text-gray-600 text-sm">
                                                        {new Date(payment.paymentDate).toLocaleDateString('pt-BR')}
                                                    </div>
                                                </td>
                                                <td className="py-4 pr-0">
                                                    <div className="flex items-center gap-2">
                                                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Ver detalhes">
                                                            <Eye size={16} />
                                                        </button>
                                                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors" title="Editar pagamento">
                                                            <Edit size={16} />
                                                        </button>
                                                        {payment.status === 'PENDING' && (
                                                            <button className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-100 rounded-lg transition-colors" title="Processar pagamento">
                                                                <Zap size={16} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'alerts' && (
                <div className="card p-6">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-red-600" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Alertas de Cobertura</h3>
                        <p className="text-gray-600 mb-6">Monitore alertas de limites excedidos, convênios expirando e coberturas negadas.</p>
                        <div className="flex gap-3 justify-center">
                            <button 
                                className="btn bg-gray-100 text-gray-700"
                                onClick={() => loadAlerts()}
                            >
                                <RefreshCw size={20} />
                                Atualizar Alertas
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'integrations' && (
                <div className="card p-6">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Settings className="text-indigo-600" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Integrações com Operadoras</h3>
                        <p className="text-gray-600 mb-6">Configure integrações via API, Webhook, Email, FTP ou SFTP.</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => setShowCreateIntegrationModal(true)}
                        >
                            <Plus size={20} />
                            Nova Integração
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'reports' && (
                <div className="card p-6">
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BarChart3 className="text-teal-600" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Relatórios e Estatísticas</h3>
                        <p className="text-gray-600 mb-6">Visualize relatórios por plano de saúde, cliente e período.</p>
                        <div className="flex gap-3 justify-center">
                            <button className="btn bg-gray-100 text-gray-700">
                                <Download size={20} />
                                Relatório por Plano
                            </button>
                            <button className="btn bg-gray-100 text-gray-700">
                                <Download size={20} />
                                Relatório por Cliente
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'utilities' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Calculator className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Calcular Desconto</h3>
                        </div>
                        <p className="text-gray-600 mb-4">Calcule o desconto aplicável para um serviço específico.</p>
                        <button 
                            className="btn btn-primary w-full"
                            onClick={() => setShowCalculateDiscountModal(true)}
                        >
                            <Calculator size={20} />
                            Calcular Desconto
                        </button>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <SearchCheck className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Verificar Cobertura</h3>
                        </div>
                        <p className="text-gray-600 mb-4">Verifique se um serviço está coberto pelo convênio.</p>
                        <button 
                            className="btn btn-primary w-full"
                            onClick={() => setShowCheckCoverageModal(true)}
                        >
                            <SearchCheck size={20} />
                            Verificar Cobertura
                        </button>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Zap className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Aplicar Desconto</h3>
                        </div>
                        <p className="text-gray-600 mb-4">Aplique desconto automático baseado no convênio do cliente.</p>
                        <button 
                            className="btn btn-primary w-full"
                            onClick={() => setShowApplyDiscountModal(true)}
                        >
                            <Zap size={20} />
                            Aplicar Desconto
                        </button>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <Activity className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900">Status do Sistema</h3>
                        </div>
                        <p className="text-gray-600 mb-4">Verifique o status das integrações e serviços.</p>
                        <button className="btn bg-gray-100 text-gray-700 w-full">
                            <Activity size={20} />
                            Verificar Status
                        </button>
                    </div>
                </div>
            )}

            {/* Pagination */}
            {safePagination.totalPages > 1 && (
                <div className="flex items-center justify-center">
                    <div className="card px-6 py-4">
                        <div className="text-sm text-gray-600">
                            Mostrando {((safePagination.page - 1) * safePagination.limit) + 1} a {Math.min(safePagination.page * safePagination.limit, safePagination.total)} de {safePagination.total} planos de saúde
                        </div>
                    </div>
                </div>
            )}

            {/* Modais */}
            
            {/* Modal de Criação */}
            <HealthPlanFormModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                healthPlan={undefined}
                isEdit={false}
                onCreateHealthPlan={handleCreateHealthPlanSubmit}
                onUpdateHealthPlan={handleUpdateHealthPlanSubmit}
            />

            {/* Modal de Edição */}
            <HealthPlanFormModal
                open={showEditModal}
                onClose={() => setShowEditModal(false)}
                healthPlan={selectedHealthPlan || undefined}
                isEdit={true}
                onCreateHealthPlan={handleCreateHealthPlanSubmit}
                onUpdateHealthPlan={handleUpdateHealthPlanSubmit}
            />

            {/* Modal de Confirmação de Exclusão */}
            <DeleteConfirmationModal
                open={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setHealthPlanToDelete(null)
                }}
                onConfirm={handleConfirmDelete}
                healthPlanName={healthPlanToDelete?.name || 'Plano de Saúde'}
            />

            {/* Modais de Parceiros */}
            
            {/* Modal de Criação de Parceiro */}
            <Modal
                open={showCreatePartnerModal}
                onClose={() => setShowCreatePartnerModal(false)}
                title="Novo Parceiro"
                className="max-w-2xl"
            >
                <div className="p-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building2 className="text-slate-600" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Formulário de Parceiro</h3>
                        <p className="text-gray-600 mb-6">Formulário será implementado em breve.</p>
                        <button 
                            className="btn bg-gray-100 text-gray-700"
                            onClick={() => setShowCreatePartnerModal(false)}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal de Edição de Parceiro */}
            <Modal
                open={showEditPartnerModal}
                onClose={() => setShowEditPartnerModal(false)}
                title="Editar Parceiro"
                className="max-w-2xl"
            >
                <div className="p-6">
                    <div className="text-center py-8">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Building2 className="text-slate-600" size={32} />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Editar Parceiro</h3>
                        <p className="text-gray-600 mb-6">Formulário será implementado em breve.</p>
                        <button 
                            className="btn bg-gray-100 text-gray-700"
                            onClick={() => setShowEditPartnerModal(false)}
                        >
                            Fechar
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Modal de Confirmação de Exclusão de Parceiro */}
            <DeleteConfirmationModal
                open={showDeletePartnerModal}
                onClose={() => {
                    setShowDeletePartnerModal(false)
                    setPartnerToDelete(null)
                }}
                onConfirm={handleConfirmDeletePartner}
                healthPlanName={partnerToDelete?.name || 'Parceiro'}
            />

            {/* Modais de Convênios */}
            
            {/* Modal de Criação de Convênio */}
            <AgreementFormModal
                open={showCreateAgreementModal}
                onClose={() => setShowCreateAgreementModal(false)}
                agreement={undefined}
                isEdit={false}
                healthPlans={healthPlans || []}
                clients={clients}
                onCreateAgreement={handleCreateAgreementSubmit}
                onUpdateAgreement={handleUpdateAgreementSubmit}
            />

            {/* Modal de Edição de Convênio */}
            <AgreementFormModal
                open={showEditAgreementModal}
                onClose={() => setShowEditAgreementModal(false)}
                agreement={selectedAgreement || undefined}
                isEdit={true}
                healthPlans={healthPlans || []}
                clients={clients}
                onCreateAgreement={handleCreateAgreementSubmit}
                onUpdateAgreement={handleUpdateAgreementSubmit}
            />

            {/* Modal de Confirmação de Exclusão de Convênio */}
            <DeleteConfirmationModal
                open={showDeleteAgreementModal}
                onClose={() => {
                    setShowDeleteAgreementModal(false)
                    setAgreementToDelete(null)
                }}
                onConfirm={handleConfirmDeleteAgreement}
                healthPlanName={agreementToDelete?.agreementNumber || 'Convênio'}
            />
        </div>
    )
}
