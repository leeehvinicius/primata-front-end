"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useUsers } from "@/lib/useUsers"
import { User, CreateUserRequest, UpdateUserRequest } from "@/types/users"
import { UserService } from "@/lib/userService"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import Modal from "@/components/ui/Modal"
import { 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    UserCheck, 
    UserX, 
    Phone, 
    Users, 
    UserPlus,
    Mail,
    Crown,
    Stethoscope,
    Headphones,
    Wrench,
    AlertTriangle,
    Key
} from "lucide-react"

// ===== Schemas de Validação =====
const createUserSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    role: z.string().min(1, "Selecione um perfil"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
    isActive: z.boolean()
})

const editUserSchema = z.object({
    name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
    email: z.string().email("Email inválido"),
    phone: z.string().optional(),
    role: z.string().min(1, "Selecione um perfil"),
    isActive: z.boolean()
})

// Removido: tipos não utilizados

// ===== Tipos e Utils =====
type UserRole = 'ADMINISTRADOR' | 'MEDICO' | 'RECEPCIONISTA' | 'SERVICOS_GERAIS'

type UserFormValues = {
    name: string
    email: string
    phone?: string
    role: string
    isActive: boolean
    password?: string
}

const roleConfig = {
    'ADMINISTRADOR': {
        icon: Crown,
        name: 'Administrador',
        color: 'text-purple-600',
        bg: 'bg-purple-100',
        border: 'border-purple-200'
    },
    'MEDICO': {
        icon: Stethoscope,
        name: 'Médico',
        color: 'text-blue-600',
        bg: 'bg-blue-100',
        border: 'border-blue-200'
    },
    'RECEPCIONISTA': {
        icon: Headphones,
        name: 'Recepcionista',
        color: 'text-emerald-600',
        bg: 'bg-emerald-100',
        border: 'border-emerald-200'
    },
    'SERVICOS_GERAIS': {
        icon: Wrench,
        name: 'Serviços Gerais',
        color: 'text-amber-600',
        bg: 'bg-amber-100',
        border: 'border-amber-200'
    }
}

// ===== Componentes UI =====
function StatCard({ title, value, icon: Icon, color, trend }: {
    title: string
    value: number
    icon: React.ComponentType<{ className?: string }>
    color: string
    trend?: { value: number; isPositive: boolean }
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
        </div>
    )
}

function UserRow({ user, onEdit, onToggleStatus, onDelete, onResetPassword }: {
    user: User
    onEdit: (user: User) => void
    onToggleStatus: (userId: string) => void
    onDelete: (userId: string) => void
    onResetPassword: (userId: string) => void
}) {
    const userRole = user.profile?.role || 'SERVICOS_GERAIS'
    const config = roleConfig[userRole as UserRole] || roleConfig['SERVICOS_GERAIS']
    const Icon = config.icon

    return (
        <tr className="border-t border-gray-100 hover:bg-gray-50 transition-colors">
            <td className="py-4 pr-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${config.bg} ${config.border} border`}>
                        <Icon className={`w-4 h-4 ${config.color}`} />
                    </div>
                    <div>
                        <div className="font-medium text-gray-900">{user.name || 'Nome não informado'}</div>
                        <div className={`text-sm ${config.color}`}>{config.name}</div>
                    </div>
                </div>
            </td>
            <td className="py-4 pr-4">
                <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{user.email || 'Email não informado'}</span>
                </div>
            </td>
            <td className="py-4 pr-4">
                {user.profile?.phone ? (
                    <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{user.profile.phone}</span>
                    </div>
                ) : (
                    <span className="text-gray-400">-</span>
                )}
            </td>
            <td className="py-4 pr-4">
                <div className={`px-3 py-1 rounded-full text-xs font-medium inline-block ${
                    user.profile?.isActive === true
                        ? 'bg-green-100 text-green-700 border border-green-200' 
                        : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                    {user.profile?.isActive === true ? 'Ativo' : 'Inativo'}
                </div>
            </td>
            <td className="py-4 pr-4 text-gray-500 text-sm">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('pt-BR') : 'Data não disponível'}
            </td>
            <td className="py-4 pr-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(user)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Editar usuário"
                    >
                        <Edit size={16} />
                    </button>
                    <button
                        onClick={() => onResetPassword(user.id)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                        title="Resetar senha"
                    >
                        <Key size={16} />
                    </button>
                    <button
                        onClick={() => onToggleStatus(user.id)}
                        className={`p-2 rounded-lg transition-colors ${
                            user.profile?.isActive === true
                                ? 'text-gray-400 hover:text-red-600 hover:bg-red-100' 
                                : 'text-gray-400 hover:text-green-600 hover:bg-green-100'
                        }`}
                        title={user.profile?.isActive === true ? 'Desativar usuário' : 'Ativar usuário'}
                    >
                        {user.profile?.isActive === true ? <UserX size={16} /> : <UserCheck size={16} />}
                    </button>
                    <button
                        onClick={() => onDelete(user.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                        title="Excluir usuário"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </td>
        </tr>
    )
}

// Modal de formulário de usuário
function UserFormModal({ 
    open, 
    onClose, 
    user, 
    isEdit = false,
    onCreateUser,
    onUpdateUser
}: {
    open: boolean
    onClose: () => void
    user?: User
    isEdit?: boolean
    onCreateUser: (data: CreateUserRequest) => Promise<void>
    onUpdateUser: (userId: string, data: UpdateUserRequest) => Promise<void>
}) {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        setValue
    } = useForm<UserFormValues>({
        resolver: zodResolver(isEdit ? editUserSchema : createUserSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
            role: '',
            password: '',
            isActive: true
        }
    })

    // Preenche o formulário quando editar
    React.useEffect(() => {
        if (open && user && isEdit) {
            const formData = {
                name: user.name || '',
                email: user.email || '',
                phone: user.profile?.phone || '',
                role: user.profile?.role || '',
                isActive: user.profile?.isActive !== false
            }
            
            setValue('name', formData.name)
            setValue('email', formData.email)
            setValue('phone', formData.phone)
            setValue('role', formData.role)
            setValue('isActive', formData.isActive)
        } else if (open && !isEdit) {
            reset()
        }
    }, [open, user, isEdit, setValue, reset])

    const onSubmit = async (data: Record<string, unknown>) => {
        try {
            if (isEdit && user) {
                try {
                    await onUpdateUser(user.id, data)
                    toast.success('Usuário atualizado com sucesso!')
                    onClose()
                    reset()
                } catch (updateError) {
                    console.error('onUpdateUser failed:', updateError)
                    toast.error('Erro ao atualizar usuário')
                    throw updateError
                }
            } else {
                await onCreateUser(data as unknown as CreateUserRequest)
                toast.success('Usuário criado com sucesso!')
                onClose()
                reset()
            }
        } catch (error) {
            console.error('Form submission error:', error)
            toast.error('Erro ao salvar usuário')
        }
    }

    const roles = [
        { value: 'ADMINISTRADOR', label: 'Administrador' },
        { value: 'MEDICO', label: 'Médico' },
        { value: 'RECEPCIONISTA', label: 'Recepcionista' },
        { value: 'SERVICOS_GERAIS', label: 'Serviços Gerais' }
    ]

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={isEdit ? 'Editar Usuário' : 'Novo Usuário'}
            className="max-w-2xl"
        >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Nome*</label>
                        <input 
                            className="input" 
                            {...register("name")}
                            placeholder="Nome completo"
                        />
                        {errors.name && (
                            <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Email*</label>
                        <input 
                            className="input" 
                            type="email"
                            {...register("email")}
                            placeholder="email@exemplo.com"
                        />
                        {errors.email && (
                            <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Telefone</label>
                        <input 
                            className="input" 
                            {...register("phone")}
                            placeholder="(11) 99999-9999"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-gray-700 mb-2">Perfil*</label>
                        <select className="input" {...register("role")}>
                            <option value="">Selecione um perfil</option>
                            {roles.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        {errors.role && (
                            <p className="text-red-400 text-sm mt-1">{errors.role.message}</p>
                        )}
                    </div>

                    {!isEdit && (
                        <div>
                            <label className="block text-sm text-gray-700 mb-2">Senha*</label>
                            <input 
                                className="input" 
                                type="password"
                                {...register("password")}
                                placeholder="Mínimo 6 caracteres"
                            />
                            {errors.password && (
                                <p className="text-red-400 text-sm mt-1">{errors.password.message}</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        className="accent-blue-500"
                        {...register("isActive")}
                    />
                    <label className="text-sm text-gray-700">Usuário ativo</label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button 
                        type="button" 
                        className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300" 
                        onClick={onClose}
                    >
                        Cancelar
                    </button>
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={isSubmitting}
                        onClick={() => console.log('Save button clicked - isEdit:', isEdit, 'isSubmitting:', isSubmitting)}
                    >
                        {isSubmitting ? 'Salvando...' : (isEdit ? 'Salvar alterações' : 'Criar usuário')}
                    </button>
                </div>
            </form>
        </Modal>
    )
}

// Modal de resetar senha
function ResetPasswordModal({ 
    open, 
    onClose, 
    onConfirm, 
    userName,
    loading 
}: {
    open: boolean
    onClose: () => void
    onConfirm: (password: string) => void
    userName: string
    loading: boolean
}) {
    const [password, setPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [error, setError] = React.useState('')

    const handleSubmit = () => {
        setError('')
        
        if (!password || password.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres')
            return
        }
        
        if (password !== confirmPassword) {
            setError('As senhas não coincidem')
            return
        }
        
        onConfirm(password)
        setPassword('')
        setConfirmPassword('')
    }

    const handleClose = () => {
        setPassword('')
        setConfirmPassword('')
        setError('')
        onClose()
    }

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title="Resetar Senha"
            className="max-w-md"
        >
            <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-amber-100 border border-amber-200">
                    <Key className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                    <h4 className="text-gray-900 font-medium mb-2">Nova senha para {userName}</h4>
                    <p className="text-gray-600 text-sm mb-4">
                        Digite a nova senha para o usuário. A senha deve ter pelo menos 6 caracteres.
                    </p>
                    
                    <div className="space-y-3 mb-4">
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Nova Senha</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input"
                                placeholder="Mínimo 6 caracteres"
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-700 mb-1">Confirmar Senha</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input"
                                placeholder="Digite a senha novamente"
                                disabled={loading}
                            />
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm">{error}</p>
                        )}
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            className="btn bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 flex-1" 
                            onClick={handleClose}
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button 
                            className="btn bg-amber-600 hover:bg-amber-700 text-white flex-1" 
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : 'Resetar Senha'}
                        </button>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

// Modal de confirmação de exclusão
function DeleteConfirmationModal({ 
    open, 
    onClose, 
    onConfirm, 
    userName 
}: {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    userName: string
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
                    <h4 className="text-gray-900 font-medium mb-2">Excluir usuário</h4>
                    <p className="text-gray-600 text-sm mb-4">
                        Tem certeza que deseja excluir o usuário <strong>{userName}</strong>? 
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

export default function UsersPage() {
    const {
        users,
        loading,
        error,
        pagination,
        stats,
        roles,
        searchUsers,
        filterByRole,
        filterByStatus,
        toggleUserStatus,
        deleteUser,
        createUser,
        updateUser,
    } = useUsers()

    // Debug: Ver dados retornados
    console.log('📊 DADOS DA TABELA:', {
        users,
        totalUsuarios: users?.length,
        loading,
        error,
        pagination,
        stats,
        roles
    })

    const [searchTerm, setSearchTerm] = useState("")
    const [selectedRole, setSelectedRole] = useState<string>("")
    const [selectedStatus, setSelectedStatus] = useState<string>("")
    const [showFilters, setShowFilters] = useState(false)
    
    // Estados dos modais
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showResetPasswordModal, setShowResetPasswordModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | undefined>(undefined)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [userToResetPassword, setUserToResetPassword] = useState<User | null>(null)
    const [resettingPassword, setResettingPassword] = useState(false)

    // ===== Handlers =====
    const handleSearch = () => {
        searchUsers(searchTerm)
    }

    const handleRoleFilter = (role: string) => {
        setSelectedRole(role)
        filterByRole(role)
    }

    const handleStatusFilter = (status: string) => {
        setSelectedStatus(status)
        filterByStatus(status === "active")
    }

    const handleToggleStatus = async (userId: string) => {
        try {
            const result = await toggleUserStatus(userId)
            
            if (result) {
                toast.success('Status do usuário atualizado!')
            } else {
                toast.error('Erro ao atualizar status')
            }
        } catch (error) {
            console.error('handleToggleStatus error:', error)
            toast.error('Erro ao atualizar status')
        }
    }

    const handleDeleteUser = (userId: string) => {
        
        const user = users.find(u => u.id === userId)
        if (user) {
            
            setUserToDelete(user)
            setShowDeleteModal(true)
        } else {
            console.error('User not found for ID:', userId)
            toast.error('Usuário não encontrado')
        }
    }

    const handleConfirmDelete = async () => {
        if (userToDelete) {
            try {
                const success = await deleteUser(userToDelete.id)
                if (success) {
                    toast.success('Usuário excluído com sucesso!')
                    setShowDeleteModal(false)
                    setUserToDelete(null)
                } else {
                    // O erro já foi tratado no hook useUsers
                    toast.error('Não foi possível excluir o usuário')
                }
            } catch (error) {
                console.error('Delete user error:', error)
                toast.error('Erro inesperado ao excluir usuário')
            }
        }
    }

    const handleEditUser = (user: User) => {
        
        setSelectedUser(user)
        setShowEditModal(true)
    }

    const handleCreateUser = () => {
        setSelectedUser(undefined)
        setShowCreateModal(true)
    }

    const handleResetPassword = (userId: string) => {
        const user = users.find(u => u.id === userId)
        if (user) {
            setUserToResetPassword(user)
            setShowResetPasswordModal(true)
        } else {
            console.error('User not found for ID:', userId)
            toast.error('Usuário não encontrado')
        }
    }

    const handleConfirmResetPassword = async (newPassword: string) => {
        if (!userToResetPassword) return
        
        setResettingPassword(true)
        try {
            await UserService.resetPassword(userToResetPassword.id, newPassword)
            toast.success('Senha resetada com sucesso!')
            setShowResetPasswordModal(false)
            setUserToResetPassword(null)
        } catch (error) {
            console.error('Reset password error:', error)
            toast.error(error instanceof Error ? error.message : 'Erro ao resetar senha')
        } finally {
            setResettingPassword(false)
        }
    }

    const handleCreateUserSubmit = async (data: CreateUserRequest) => {
        try {
            await createUser({
                name: data.name,
                email: data.email,
                password: data.password,
                role: data.role,
                phone: data.phone
            })
            setShowCreateModal(false)
        } catch (error) {
            throw error
        }
    }

    const handleUpdateUserSubmit = async (userId: string, data: UpdateUserRequest) => {
        try {
            const updateData = {
                name: data.name,
                role: data.role,
                phone: data.phone,
                isActive: data.isActive
            }
            
            const result = await updateUser(userId, updateData)
            
            
            if (result) {
                
                setShowEditModal(false)
            } else {
                console.error('Update failed - no result returned')
                toast.error('Falha ao atualizar usuário')
            }
        } catch (error) {
            console.error('Update user error in handleUpdateUserSubmit:', error)
            toast.error('Erro ao atualizar usuário')
            // Re-throw o erro para que seja capturado pelo onSubmit
            throw error
        }
    }

    // ===== UI =====
    if (loading && users.length === 0) {
        return (
            <div className="min-h-screen grid place-items-center">
                <LoadingSpinner size="lg" text="Carregando usuários..." />
            </div>
        )
    }

    const safePagination = pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">Usuários</h1>
                    <p className="text-gray-600 mt-1">Gerencie todos os usuários do sistema</p>
                </div>
                <button 
                    className="btn btn-primary flex items-center gap-2"
                    onClick={handleCreateUser}
                >
                    <UserPlus size={20} />
                    Novo Usuário
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        title="Total de Usuários"
                        value={stats.totalUsers}
                        icon={Users}
                        color="bg-blue-100 text-blue-600"
                        trend={{ value: 12, isPositive: true }}
                    />
                    <StatCard
                        title="Usuários Ativos"
                        value={stats.activeUsers}
                        icon={UserCheck}
                        color="bg-green-100 text-green-600"
                        trend={{ value: 8, isPositive: true }}
                    />
                    <StatCard
                        title="Usuários Inativos"
                        value={stats.inactiveUsers}
                        icon={UserX}
                        color="bg-red-100 text-red-600"
                        trend={{ value: -3, isPositive: false }}
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
                            placeholder="Buscar usuários por nome, email..."
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
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-50'
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
                            <label className="block text-sm text-gray-700 mb-2">Role</label>
                            <select
                                value={selectedRole}
                                onChange={(e) => handleRoleFilter(e.target.value)}
                                className="input"
                            >
                                <option value="">Todos os roles</option>
                                {roles.map((role) => (
                                    <option key={role.role} value={role.role}>
                                        {role.description}
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

            {/* Users Table */}
            <div className="card p-6">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-gray-700">
                            <tr>
                                <th className="py-3 pr-4 font-medium">Usuário</th>
                                <th className="py-3 pr-4 font-medium">Email</th>
                                <th className="py-3 pr-4 font-medium">Telefone</th>
                                <th className="py-3 pr-4 font-medium">Status</th>
                                <th className="py-3 pr-4 font-medium">Criado em</th>
                                <th className="py-3 pr-0 font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                user && user.id && (
                                    <UserRow
                                        key={user.id}
                                        user={user}
                                        onEdit={handleEditUser}
                                        onToggleStatus={handleToggleStatus}
                                        onDelete={handleDeleteUser}
                                        onResetPassword={handleResetPassword}
                                    />
                                )
                            ))}
                            {!users.length && !loading && (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                                                <Users className="text-gray-400" size={32} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário encontrado</h3>
                                                <p className="text-gray-600">Tente ajustar os filtros ou criar um novo usuário.</p>
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
                            Mostrando {((safePagination.page - 1) * safePagination.limit) + 1} a {Math.min(safePagination.page * safePagination.limit, safePagination.total)} de {safePagination.total} usuários
                        </div>
                    </div>
                </div>
            )}

            {/* Modais */}
            
            {/* Modal de Criação */}
            <UserFormModal
                open={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                user={undefined}
                isEdit={false}
                onCreateUser={handleCreateUserSubmit}
                onUpdateUser={handleUpdateUserSubmit}
            />

            {/* Modal de Edição */}
            <UserFormModal
                open={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={selectedUser}
                isEdit={true}
                onCreateUser={handleCreateUserSubmit}
                onUpdateUser={handleUpdateUserSubmit}
            />

            {/* Modal de Resetar Senha */}
            <ResetPasswordModal
                open={showResetPasswordModal}
                onClose={() => {
                    setShowResetPasswordModal(false)
                    setUserToResetPassword(null)
                }}
                onConfirm={handleConfirmResetPassword}
                userName={userToResetPassword?.name || 'Usuário'}
                loading={resettingPassword}
            />

            {/* Modal de Confirmação de Exclusão */}
            <DeleteConfirmationModal
                open={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false)
                    setUserToDelete(null)
                }}
                onConfirm={handleConfirmDelete}
                userName={userToDelete?.name || 'Usuário'}
            />
        </div>
    )
}
