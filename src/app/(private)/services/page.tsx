"use client"

import React, { useState } from "react"
import { useForm, Resolver, SubmitHandler } from "react-hook-form"
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
import { ServiceListItem, Service } from "@/types/services"
import { ServiceService } from "@/lib/serviceService"
import { StockService } from "@/lib/stockService"

// ===== Schemas de Validação =====
const createServiceSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    description: z.string().optional(),
    serviceCategoryId: z.string().min(1, "Selecione uma categoria"),
    duration: z.coerce.number().min(1, "Duração deve ser pelo menos 1 minuto"),
    currentPrice: z.coerce.number().min(0, "Preço deve ser maior ou igual a 0"),
    color: z.string().min(1, "Selecione uma cor"),
    isActive: z.boolean().default(true)
})

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const editServiceSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    description: z.string().optional(),
    serviceCategoryId: z.string().min(1, "Selecione uma categoria"),
    duration: z.coerce.number().min(1, "Duração deve ser pelo menos 1 minuto"),
    currentPrice: z.coerce.number().min(0, "Preço deve ser maior ou igual a 0"),
    color: z.string().min(1, "Selecione uma cor"),
    isActive: z.boolean().default(true)
})

type CreateServiceFormData = z.infer<typeof createServiceSchema>
type EditServiceFormData = z.infer<typeof editServiceSchema>

type ServiceFormValues = z.infer<typeof createServiceSchema>

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
    const categoryName = service.serviceCategory?.name || 'Categoria'

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
                    <div className={`p-2 rounded-lg bg-slate-100 border border-slate-200`}>
                        <span className="text-lg">📦</span>
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{service.name}</div>
                        <div className={`text-sm text-slate-600`}>{categoryName}</div>
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
    onUpdateService,
    categories,
    categoriesLoading
}: {
    open: boolean
    onClose: () => void
    service?: Service
    isEdit?: boolean
    onCreateService: (data: CreateServiceFormData) => Promise<void>
    onUpdateService: (serviceId: string, data: EditServiceFormData) => Promise<void>
    categories: { id: string; name: string }[]
    categoriesLoading: boolean
}) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue,
        watch
    } = useForm<ServiceFormValues>({
        resolver: zodResolver(createServiceSchema) as unknown as Resolver<ServiceFormValues>,
        defaultValues: {
            name: '',
            description: '',
            serviceCategoryId: '',
            duration: 60,
            currentPrice: 0,
            color: '#3B82F6',
            isActive: true
        }
    })

    // Preenche o formulário quando editar
    React.useEffect(() => {
        if (open && service && isEdit) {
            const formData = {
                name: service.name || '',
                description: service.description || '',
                serviceCategoryId: service.serviceCategoryId || '',
                duration: service.duration || 60,
                currentPrice: service.currentPrice || 0,
                color: service.color || '#3B82F6',
                isActive: service.isActive !== false
            }
            
            Object.entries(formData).forEach(([key, value]) => {
                setValue(key as keyof CreateServiceFormData, value)
            })
        } else if (open && !isEdit) {
            reset()
        }
    }, [open, service, isEdit, setValue, reset])

    const onSubmit: SubmitHandler<ServiceFormValues> = async (data) => {
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


    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? 'Editar Serviço' : 'Novo Serviço'}
            className="max-w-4xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Nome do Serviço */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do Serviço *
                    </label>
                    <input 
                        className="input" 
                        {...register("name")}
                        placeholder="Ex: Limpeza de Pele Profunda"
                    />
                    {errors.name && (
                        <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                {/* Categoria */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoria *
                    </label>
                    <select 
                        className="input" 
                        {...register("serviceCategoryId")}
                        disabled={categoriesLoading}
                    >
                        <option value="">
                            {categoriesLoading ? 'Carregando categorias...' : 'Selecione uma categoria'}
                        </option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                    {errors.serviceCategoryId?.message && (
                        <p className="text-red-400 text-sm mt-1">{errors.serviceCategoryId.message}</p>
                    )}
                </div>

                {/* Duração e Preço */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Duração (minutos) *
                        </label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preço (R$) *
                        </label>
                        <input 
                            className="input" 
                            type="number"
                            step="0.01"
                            {...register("currentPrice")}
                            placeholder="0,00"
                        />
                        {errors.currentPrice && (
                            <p className="text-red-400 text-sm mt-1">{errors.currentPrice.message}</p>
                        )}
                    </div>
                </div>

                {/* Cor do Serviço */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cor do Serviço *
                    </label>
                    <div className="flex items-center gap-3">
                        <input 
                            type="color"
                            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                            value={watch("color") || "#3B82F6"}
                            onChange={(e) => setValue("color", e.target.value)}
                        />
                        <input 
                            type="text"
                            className="input flex-1"
                            {...register("color")}
                            placeholder="#3B82F6"
                        />
                    </div>
                    {errors.color && (
                        <p className="text-red-400 text-sm mt-1">{errors.color.message}</p>
                    )}
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                    </label>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                value="true"
                                className="accent-blue-500"
                                checked={watch("isActive") === true}
                                onChange={() => setValue("isActive", true)}
                            />
                            <span className="text-sm text-gray-700">Ativo</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="radio" 
                                value="false"
                                className="accent-blue-500"
                                checked={watch("isActive") === false}
                                onChange={() => setValue("isActive", false)}
                            />
                            <span className="text-sm text-gray-700">Inativo</span>
                        </label>
                    </div>
                </div>

                {/* Descrição */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descrição
                    </label>
                    <textarea 
                        className="input min-h-[100px]" 
                        {...register("description")}
                        placeholder="Descreva o serviço, procedimentos incluídos, contraindicações..."
                    />
                </div>

                {/* Botões */}
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
                        {isSubmitting ? 'Salvando...' : (isEdit ? 'Salvar alterações' : 'Criar Serviço')}
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
    const [categoryOptions, setCategoryOptions] = useState<{ id: string; name: string }[]>([])
    const [categoryOptionsLoading, setCategoryOptionsLoading] = useState(false)
    
    React.useEffect(() => {
        const fetchCategoryOptions = async () => {
            setCategoryOptionsLoading(true)
            try {
                // Tentar primeiro o endpoint de categorias de serviços
                try {
                    const res = await ServiceService.listServiceCategories({ isActive: true, limit: 100 })
                    setCategoryOptions((res.categories || []).map(c => ({ id: c.id, name: c.name })))
                } catch {
                    console.log('Endpoint de categorias de serviços não encontrado, usando categorias de estoque')
                    // Fallback para categorias de estoque
                    const res = await StockService.listCategories({ isActive: true, limit: 100 })
                    setCategoryOptions((res.categories || []).map(c => ({ id: c.id, name: c.name })))
                }
            } catch (error) {
                console.error('Erro ao carregar categorias:', error)
                setCategoryOptions([])
            } finally {
                setCategoryOptionsLoading(false)
            }
        }
        
        fetchCategoryOptions()
    }, [])
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

    const handleCategoryFilter = (serviceCategoryId: string) => {
        setSelectedCategory(serviceCategoryId)
        filterByCategory(serviceCategoryId)
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
            // Transformar dados do formulário para o formato esperado pela API
            const serviceData = {
                ...data,
                basePrice: data.currentPrice
            }
            await createService(serviceData)
            setShowCreateModal(false)
        } catch (error) {
            throw error
        }
    }

    const handleUpdateServiceSubmit = async (serviceId: string, data: EditServiceFormData) => {
        try {
            // Transformar dados do formulário para o formato esperado pela API
            const serviceData = {
                ...data,
                basePrice: data.currentPrice
            }
            const result = await updateService(serviceId, serviceData)
            
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

    const safePagination = pagination || { page: 1, limit: 500, total: 0, totalPages: 0 }

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
                                disabled={categoryOptionsLoading}
                            >
                                <option value="">
                                    {categoryOptionsLoading ? 'Carregando categorias...' : 'Todas as categorias'}
                                </option>
                                {categoryOptions.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
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
                categories={categoryOptions}
                categoriesLoading={categoryOptionsLoading}
            />

            {/* Modal de Edição */}
            <ServiceFormModal
                open={showEditModal}
                onClose={() => setShowEditModal(false)}
                service={selectedService || undefined}
                isEdit={true}
                onCreateService={handleCreateServiceSubmit}
                onUpdateService={handleUpdateServiceSubmit}
                categories={categoryOptions}
                categoriesLoading={categoryOptionsLoading}
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
