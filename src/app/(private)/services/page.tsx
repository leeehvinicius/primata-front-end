"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useServices } from "@/lib/useServices"
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
    Clock, 
    DollarSign, 
    Package,
    AlertTriangle
} from "lucide-react"
import { ServiceCategory, categoryConfig, ServiceListItem, Service } from "@/types/services"

// ===== Schemas de Validação =====
const createServiceSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    description: z.string().optional(),
    category: z.nativeEnum(ServiceCategory, { message: "Selecione uma categoria" }),
    duration: z.coerce.number().min(1, "Duração deve ser pelo menos 1 minuto"),
    basePrice: z.coerce.number().min(0, "Preço base deve ser maior ou igual a 0"),
    currentPrice: z.coerce.number().min(0, "Preço atual deve ser maior ou igual a 0"),
    requiresProfessional: z.boolean().default(true),
    maxConcurrentClients: z.coerce.number().min(1, "Máximo de clientes deve ser pelo menos 1"),
    preparationTime: z.coerce.number().min(0, "Tempo de preparação deve ser maior ou igual a 0"),
    recoveryTime: z.coerce.number().min(0, "Tempo de recuperação deve ser maior ou igual a 0"),
    contraindications: z.string().optional(),
    benefits: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().default(true)
})

const editServiceSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    description: z.string().optional(),
    category: z.nativeEnum(ServiceCategory, { message: "Selecione uma categoria" }),
    duration: z.coerce.number().min(1, "Duração deve ser pelo menos 1 minuto"),
    basePrice: z.coerce.number().min(0, "Preço base deve ser maior ou igual a 0"),
    currentPrice: z.coerce.number().min(0, "Preço atual deve ser maior ou igual a 0"),
    requiresProfessional: z.boolean().default(true),
    maxConcurrentClients: z.coerce.number().min(1, "Máximo de clientes deve ser pelo menos 1"),
    preparationTime: z.coerce.number().min(0, "Tempo de preparação deve ser maior ou igual a 0"),
    recoveryTime: z.coerce.number().min(0, "Tempo de recuperação deve ser maior ou igual a 0"),
    contraindications: z.string().optional(),
    benefits: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().default(true)
})

type CreateServiceFormData = z.infer<typeof createServiceSchema>
type EditServiceFormData = z.infer<typeof editServiceSchema>

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

function ServiceRow({ service, onEdit, onToggleStatus, onDelete }: {
    service: ServiceListItem
    onEdit: (service: ServiceListItem) => void
    onToggleStatus: (serviceId: string) => void
    onDelete: (serviceId: string) => void
}) {
    const category = service.category as ServiceCategory
    const config = categoryConfig[category] || categoryConfig[ServiceCategory.OTHER]

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
        }).format(price)
    }

    const formatDuration = (minutes: number) => {
        if (minutes < 60) return `${minutes}min`
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
    }

    return (
        <tr className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bg} ${config.border} border`}>
                        <span className="text-lg">{config.icon}</span>
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{service.name}</div>
                        <div className={`text-sm ${config.color}`}>{config.name}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 pr-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(service.duration)}</span>
                </div>
            </td>
            <td className="py-4 pr-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-medium">{formatPrice(service.currentPrice)}</span>
                </div>
            </td>

            <td className="py-4 pr-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                    service.isActive
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                    {service.isActive ? 'Ativo' : 'Inativo'}
                </div>
            </td>
            <td className="py-4 pr-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(service)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar serviço"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => onToggleStatus(service.id)}
                        className={`p-2 rounded-lg transition-colors ${
                            service.isActive
                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-100' 
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-100'
                        }`}
                        title={service.isActive ? 'Desativar serviço' : 'Ativar serviço'}
                    >
                        {service.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                    </button>
                    <button
                        onClick={() => onDelete(service.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir serviço"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    )
}

// Modal de formulário de serviço
function ServiceFormModal({ 
    open, 
    onClose, 
    service, 
    isEdit = false,
    onCreateService,
    onUpdateService
}: {
    open: boolean
    onClose: () => void
    service?: Service
    isEdit?: boolean
    onCreateService: (data: CreateServiceFormData) => Promise<void>
    onUpdateService: (serviceId: string, data: EditServiceFormData) => Promise<void>
}) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        watch
    } = useForm({
        resolver: zodResolver(isEdit ? editServiceSchema : createServiceSchema),
        defaultValues: {
            name: '',
            description: '',
            category: ServiceCategory.FACIAL_TREATMENT,
            duration: 60,
            basePrice: 100,
            currentPrice: 100,
            requiresProfessional: true,
            maxConcurrentClients: 1,
            preparationTime: 10,
            recoveryTime: 15,
            contraindications: '',
            benefits: '',
            notes: '',
            isActive: true
        }
    })

    const watchedBasePrice = watch('basePrice')

    // Preenche o formulário quando editar
    React.useEffect(() => {
        if (open && service && isEdit) {
            const formData = {
                name: service.name || '',
                description: service.description || '',
                category: service.category || ServiceCategory.FACIAL_TREATMENT,
                duration: service.duration || 60,
                basePrice: service.basePrice || 100,
                currentPrice: service.currentPrice || 100,
                requiresProfessional: service.requiresProfessional !== false,
                maxConcurrentClients: service.maxConcurrentClients || 1,
                preparationTime: service.preparationTime || 10,
                recoveryTime: service.recoveryTime || 15,
                contraindications: service.contraindications || '',
                benefits: service.benefits || '',
                notes: service.notes || '',
                isActive: service.isActive !== false
            }
            
            Object.entries(formData).forEach(([key, value]) => {
                setValue(key as keyof CreateServiceFormData, value)
            })
        } else if (open && !isEdit) {
            reset()
        }
    }, [open, service, isEdit, setValue, reset])

    // Sincroniza preço atual com preço base quando criar novo serviço
    React.useEffect(() => {
        if (!isEdit && watchedBasePrice) {
            setValue('currentPrice', watchedBasePrice)
        }
    }, [watchedBasePrice, isEdit, setValue])

    const onSubmit = async (data: CreateServiceFormData | EditServiceFormData) => {
        try {
            if (isEdit && service) {
                await onUpdateService(service.id, data)
                toast.success('Serviço atualizado com sucesso!')
                onClose()
                reset()
            } else {
                await onCreateService(data)
                toast.success('Serviço criado com sucesso!')
                onClose()
                reset()
            }
        } catch (error) {
            console.error('Form submission error:', error)
            toast.error('Erro ao salvar serviço')
        }
    }

    const categories = Object.entries(categoryConfig).map(([value, config]) => ({
        value,
        label: config.name
    }))

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? 'Editar Serviço' : 'Novo Serviço'}
            className="max-w-4xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Informações Básicas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Nome*</label>
                        <input 
                            className="input" 
                            {...register("name")}
                            placeholder="Nome do serviço"
                        />
                        {errors.name && (
                            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Categoria*</label>
                        <select className="input" {...register("category")}>
                            {categories.map((category) => (
                                <option key={category.value} value={category.value}>
                                    {category.label}
                                </option>
                            ))}
                        </select>
                        {errors.category && (
                            <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-700 mb-2">Descrição</label>
                    <textarea 
                        className="input min-h-[80px]" 
                        {...register("description")}
                        placeholder="Descrição detalhada do serviço"
                    />
                </div>

                {/* Duração e Preços */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Duração (minutos)*</label>
                        <input 
                            className="input" 
                            type="number"
                            {...register("duration")}
                            placeholder="60"
                        />
                        {errors.duration && (
                            <p className="text-red-400 text-sm mt-1">{errors.duration.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Preço Base (R$)*</label>
                        <input 
                            className="input" 
                            type="number"
                            step="0.01"
                            {...register("basePrice")}
                            placeholder="100.00"
                        />
                        {errors.basePrice && (
                            <p className="text-red-400 text-sm mt-1">{errors.basePrice.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Preço Atual (R$)*</label>
                        <input 
                            className="input" 
                            type="number"
                            step="0.01"
                            {...register("currentPrice")}
                            placeholder="100.00"
                        />
                        {errors.currentPrice && (
                            <p className="text-red-400 text-sm mt-1">{errors.currentPrice.message}</p>
                        )}
                    </div>
                </div>

                {/* Configurações Operacionais */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Tempo de Preparação (min)</label>
                        <input 
                            className="input" 
                            type="number"
                            {...register("preparationTime")}
                            placeholder="10"
                        />
                        {errors.preparationTime && (
                            <p className="text-red-400 text-sm mt-1">{errors.preparationTime.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Tempo de Recuperação (min)</label>
                        <input 
                            className="input" 
                            type="number"
                            {...register("recoveryTime")}
                            placeholder="15"
                        />
                        {errors.recoveryTime && (
                            <p className="text-red-400 text-sm mt-1">{errors.recoveryTime.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Máx. Clientes Simultâneos*</label>
                        <input 
                            className="input" 
                            type="number"
                            {...register("maxConcurrentClients")}
                            placeholder="1"
                        />
                        {errors.maxConcurrentClients && (
                            <p className="text-red-400 text-sm mt-1">{errors.maxConcurrentClients.message}</p>
                        )}
                    </div>
                </div>

                {/* Informações Adicionais */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Contraindicações</label>
                        <textarea 
                            className="input min-h-[80px]" 
                            {...register("contraindications")}
                            placeholder="Contraindicações do serviço"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Benefícios</label>
                        <textarea 
                            className="input min-h-[80px]" 
                            {...register("benefits")}
                            placeholder="Benefícios do serviço"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm text-gray-700 mb-2">Observações</label>
                    <textarea 
                        className="input min-h-[80px]" 
                        {...register("notes")}
                        placeholder="Observações gerais"
                    />
                </div>

                {/* Checkboxes */}
                <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            className="accent-blue-500"
                            {...register("requiresProfessional")}
                        />
                        <span className="text-sm text-gray-700">Requer profissional</span>
                    </label>

                    <label className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            className="accent-blue-500"
                            {...register("isActive")}
                        />
                        <span className="text-sm text-gray-700">Serviço ativo</span>
                    </label>
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
                        {isSubmitting ? 'Salvando...' : (isEdit ? 'Salvar alterações' : 'Criar serviço')}
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
    serviceName 
}: {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    serviceName: string
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
                    <h4 className="text-gray-900 font-medium mb-2">Excluir serviço</h4>
                    <p className="text-gray-600 text-sm mb-4">
                        Tem certeza que deseja excluir o serviço <strong>{serviceName}</strong>? 
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

export default function ServicesPage() {
    const {
        services,
        loading,
        error,
        pagination,
        stats,
        searchServices,
        filterByCategory,
        filterByStatus,
        filterByPriceRange,
        toggleServiceStatus,
        deleteService,
        createService,
        updateService,

    } = useServices()

    // Debug: Log stats to understand the structure
    React.useEffect(() => {
        if (stats) {
            console.log('Services stats:', stats)
            console.log('Stats type:', typeof stats)
            console.log('Average price type:', typeof stats.averagePrice)
            console.log('Average price value:', stats.averagePrice)
        }
    }, [stats])

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string>("")
    const [selectedStatus, setSelectedStatus] = useState<string>("")
    const [showFilters, setShowFilters] = useState(false)
    const [minPrice, setMinPrice] = useState<string>("")
    const [maxPrice, setMaxPrice] = useState<string>("")
    
    // Estados dos modais
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedService, setSelectedService] = useState<Service | null>(null)
    const [serviceToDelete, setServiceToDelete] = useState<ServiceListItem | null>(null)

    // ===== Handlers =====
    const handleSearch = () => {
        searchServices(searchTerm)
    }

    const handleCategoryFilter = (category: string) => {
        setSelectedCategory(category)
        filterByCategory(category as ServiceCategory)
    }

    const handleStatusFilter = (status: string) => {
        setSelectedStatus(status)
        filterByStatus(status === "active")
    }

    const handlePriceRangeFilter = () => {
        const min = minPrice ? parseFloat(minPrice) : undefined
        const max = maxPrice ? parseFloat(maxPrice) : undefined
        filterByPriceRange(min, max)
    }

    const handleToggleStatus = async (serviceId: string) => {
        try {
            const result = await toggleServiceStatus(serviceId)
            
            if (result) {
                toast.success('Status do serviço atualizado!')
            } else {
                toast.error('Erro ao atualizar status')
            }
        } catch (error) {
            console.error('handleToggleStatus error:', error)
            toast.error('Erro ao atualizar status')
        }
    }

    const handleDeleteService = (serviceId: string) => {
        const service = services.find(s => s.id === serviceId)
        if (service) {
            setServiceToDelete(service)
            setShowDeleteModal(true)
        } else {
            console.error('Service not found for ID:', serviceId)
            toast.error('Serviço não encontrado')
        }
    }

    const handleConfirmDelete = async () => {
        if (serviceToDelete) {
            try {
                const success = await deleteService(serviceToDelete.id)
                if (success) {
                    toast.success('Serviço excluído com sucesso!')
                    setShowDeleteModal(false)
                    setServiceToDelete(null)
                } else {
                    toast.error('Não foi possível excluir o serviço')
                }
            } catch (error) {
                console.error('Delete service error:', error)
                toast.error('Erro inesperado ao excluir serviço')
            }
        }
    }

    const handleEditService = (service: ServiceListItem) => {
        // Para edição, precisamos buscar o serviço completo
        // Por enquanto, vamos usar o serviço da lista como base
        setSelectedService(service as Service)
        setShowEditModal(true)
    }

    const handleCreateService = () => {
        setSelectedService(null)
        setShowCreateModal(true)
    }

    const handleCreateServiceSubmit = async (data: CreateServiceFormData) => {
        try {
            await createService(data)
            setShowCreateModal(false)
        } catch (error) {
            throw error
        }
    }

    const handleUpdateServiceSubmit = async (serviceId: string, data: EditServiceFormData) => {
        try {
            const result = await updateService(serviceId, data)
            
            if (result) {
                setShowEditModal(false)
            } else {
                console.error('Update failed - no result returned')
                toast.error('Falha ao atualizar serviço')
            }
        } catch (error) {
            console.error('Update service error in handleUpdateServiceSubmit:', error)
            toast.error('Erro ao atualizar serviço')
            throw error
        }
    }

    // ===== UI =====
    if (loading && services.length === 0) {
        return (
            <div className="min-h-screen grid place-items-center">
                <LoadingSpinner size="lg" text="Carregando serviços..." />
            </div>
        )
    }

    const safePagination = pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
    const categories = Object.entries(categoryConfig).map(([value, config]) => ({
        value,
        label: config.name
    }))

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Serviços</h1>
                    <p className="text-gray-600 mt-1">Gerencie todos os serviços estéticos</p>
                </div>
                <button 
                    className="btn btn-primary flex items-center gap-2"
                    onClick={handleCreateService}
                >
                    <Plus size={20} />
                    Novo Serviço
                </button>
            </div>

            {/* Stats Cards */}
            {stats && typeof stats === 'object' ? (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total de Serviços"
                        value={Number(stats.total) || 0}
                        icon={Package}
                        color="bg-blue-100 text-blue-600"
                    />
                    <StatCard
                        title="Serviços Ativos"
                        value={Number(stats.active) || 0}
                        icon={CheckCircle}
                        color="bg-green-100 text-green-600"
                    />
                    <StatCard
                        title="Preço Médio"
                        value={`R$ ${(() => {
                            const price = Number(stats.averagePrice)
                            return isNaN(price) ? '0.00' : price.toFixed(2)
                        })()}`}
                        icon={DollarSign}
                        color="bg-amber-100 text-amber-600"
                    />
                    <StatCard
                        title="Duração Média"
                        value={`${(() => {
                            const duration = Number(stats.averageDuration)
                            return isNaN(duration) ? 0 : duration
                        })()}min`}
                        icon={Clock}
                        color="bg-purple-100 text-purple-600"
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total de Serviços"
                        value="0"
                        icon={Package}
                        color="bg-gray-100 text-gray-600"
                    />
                    <StatCard
                        title="Serviços Ativos"
                        value="0"
                        icon={CheckCircle}
                        color="bg-gray-100 text-gray-600"
                    />
                    <StatCard
                        title="Preço Médio"
                        value="R$ 0.00"
                        icon={DollarSign}
                        color="bg-gray-100 text-gray-600"
                    />
                    <StatCard
                        title="Duração Média"
                        value="0min"
                        icon={Clock}
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
                            placeholder="Buscar serviços por nome, descrição..."
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
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-gray-100">
                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Categoria</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => handleCategoryFilter(e.target.value)}
                                className="input"
                            >
                                <option value="">Todas as categorias</option>
                                {categories.map((category) => (
                                    <option key={category.value} value={category.value}>
                                        {category.label}
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

                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Preço Mínimo (R$)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                                className="input"
                                placeholder="0.00"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Preço Máximo (R$)</label>
                <div className="flex gap-2">
                    <input
                                    type="number"
                                    step="0.01"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(e.target.value)}
                                    className="input"
                                    placeholder="1000.00"
                                />
                                <button
                                    onClick={handlePriceRangeFilter}
                                    className="btn btn-primary px-3"
                                >
                                    Filtrar
                    </button>
                </div>
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

            {/* Services Table */}
            <div className="card p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-gray-700">
                            <tr>
                                <th className="py-3 pr-4 font-medium">Serviço</th>
                                <th className="py-3 pr-4 font-medium">Duração</th>
                                <th className="py-3 pr-4 font-medium">Preço</th>

                                <th className="py-3 pr-4 font-medium">Status</th>
                                <th className="py-3 pr-0 font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.map((service) => (
                                service && service.id && (
                                    <ServiceRow
                                        key={service.id}
                                        service={service}
                                        onEdit={handleEditService}
                                        onToggleStatus={handleToggleStatus}
                                        onDelete={handleDeleteService}
                                    />
                                )
                            ))}
                            {!services.length && !loading && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Package className="text-gray-400" size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum serviço encontrado</h3>
                                                <p className="text-gray-600">Tente ajustar os filtros ou criar um novo serviço.</p>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {safePagination.totalPages > 1 && (
                <div className="flex items-center justify-center">
                    <div className="card px-6 py-4">
                        <div className="text-sm text-gray-600">
                            Mostrando {((safePagination.page - 1) * safePagination.limit) + 1} a {Math.min(safePagination.page * safePagination.limit, safePagination.total)} de {safePagination.total} serviços
                            </div>
                                </div>
                            </div>
            )}

            {/* Modais */}
            
            {/* Modal de Criação */}
            <ServiceFormModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                service={undefined}
                isEdit={false}
                onCreateService={handleCreateServiceSubmit}
                onUpdateService={handleUpdateServiceSubmit}
            />

            {/* Modal de Edição */}
            <ServiceFormModal
                open={showEditModal}
                onClose={() => setShowEditModal(false)}
                service={selectedService || undefined}
                isEdit={true}
                onCreateService={handleCreateServiceSubmit}
                onUpdateService={handleUpdateServiceSubmit}
            />

            {/* Modal de Confirmação de Exclusão */}
            <DeleteConfirmationModal
                open={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setServiceToDelete(null)
                }}
                onConfirm={handleConfirmDelete}
                serviceName={serviceToDelete?.name || 'Serviço'}
            />
        </div>
    )
}
