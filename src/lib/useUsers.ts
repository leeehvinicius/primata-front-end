'use client'
import { useState, useCallback, useEffect } from 'react'
import { UserService } from './userService'
import type { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserFilters, 
  UserStats, 
  UserRoleInfo,
  UserRole
} from '../types/users'

interface UseUsersState {
  users: User[]
  loading: boolean
  error: string | null
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  stats: UserStats | null
  roles: UserRoleInfo[]
}

interface UseUsersActions {
  // CRUD básico
  createUser: (userData: CreateUserRequest) => Promise<User | null>
  updateUser: (userId: string, userData: UpdateUserRequest) => Promise<User | null>
  deleteUser: (userId: string) => Promise<boolean>
  toggleUserStatus: (userId: string) => Promise<boolean>
  
  // Listagem e filtros
  loadUsers: (filters?: UserFilters) => Promise<void>
  searchUsers: (searchTerm: string) => Promise<void>
  filterByRole: (role: string) => Promise<void>
  filterByStatus: (isActive: boolean) => Promise<void>
  
  // Paginação
  goToPage: (page: number) => Promise<void>
  changeLimit: (limit: number) => Promise<void>
  
  // Ordenação
  sortUsers: (sortBy: string, sortOrder: 'asc' | 'desc') => Promise<void>
  
  // Estatísticas e roles
  loadStats: () => Promise<void>
  loadRoles: () => Promise<void>
  
  // Utilitários
  refreshUsers: () => Promise<void>
  clearError: () => void
}

export function useUsers(): UseUsersState & UseUsersActions {
  const [state, setState] = useState<UseUsersState>({
    users: [],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    },
    stats: null,
    roles: []
  })

  // Função para atualizar o estado
  const updateState = useCallback((updates: Partial<UseUsersState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // Função para limpar erros
  const clearError = useCallback(() => {
    updateState({ error: null })
  }, [updateState])

  // Carregar usuários com filtros
  const loadUsers = useCallback(async (filters: UserFilters = {}) => {
    try {
      updateState({ loading: true, error: null })
      
      // Usa valores padrão seguros se pagination ainda não foi inicializada
      const currentPage = filters.page ?? state.pagination?.page ?? 1
      const currentLimit = filters.limit ?? state.pagination?.limit ?? 10
      
      const response = await UserService.listUsers({
        page: currentPage,
        limit: currentLimit,
        ...filters
      })
      
      // Garante que a resposta tem a estrutura esperada
      const safePagination = response.pagination || {
        page: currentPage,
        limit: currentLimit,
        total: 0,
        totalPages: 0
      }
      
      updateState({
        users: response.users || [],
        pagination: safePagination,
        loading: false
      })
    } catch (error) {
      console.error('Load users failed:', error)
      updateState({
        error: error instanceof Error ? error.message : 'Erro ao carregar usuários',
        loading: false
      })
    }
  }, [state.pagination, updateState])

  // Buscar usuários
  const searchUsers = useCallback(async (searchTerm: string) => {
    await loadUsers({ search: searchTerm, page: 1 })
  }, [loadUsers])

  // Filtrar por role
  const filterByRole = useCallback(async (role: string) => {
    await loadUsers({ role: role as UserRole, page: 1 })
  }, [loadUsers])

  // Filtrar por status
  const filterByStatus = useCallback(async (isActive: boolean) => {
    await loadUsers({ isActive, page: 1 })
  }, [loadUsers])

  // Ir para página específica
  const goToPage = useCallback(async (page: number) => {
    const currentPagination = state.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
    updateState({ pagination: { ...currentPagination, page } })
    await loadUsers({ page })
  }, [loadUsers, state.pagination, updateState])

  // Alterar limite por página
  const changeLimit = useCallback(async (limit: number) => {
    const currentPagination = state.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 }
    updateState({ pagination: { ...currentPagination, limit, page: 1 } })
    await loadUsers({ limit, page: 1 })
  }, [loadUsers, state.pagination, updateState])

  // Ordenar usuários
  const sortUsers = useCallback(async (sortBy: string, sortOrder: 'asc' | 'desc') => {
    await loadUsers({ sortBy, sortOrder })
  }, [loadUsers])

  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    try {
      const stats = await UserService.getUserStats()
      updateState({ stats })
    } catch (error) {
      console.error('Load stats failed:', error)
    }
  }, [updateState])

  // Carregar roles
  const loadRoles = useCallback(async () => {
    try {
      const roles = await UserService.listRoles()
      updateState({ roles })
    } catch (error) {
      console.error('Load roles failed:', error)
    }
  }, [updateState])

  // Criar usuário
  const createUser = useCallback(async (userData: CreateUserRequest): Promise<User | null> => {
    try {
      updateState({ loading: true, error: null })
      
      const newUser = await UserService.createUser(userData)
      
      // Recarrega a lista para incluir o novo usuário
      await loadUsers()
      
      updateState({ loading: false })
      return newUser
    } catch (error) {
      console.error('Create user failed:', error)
      updateState({
        error: error instanceof Error ? error.message : 'Erro ao criar usuário',
        loading: false
      })
      return null
    }
  }, [loadUsers, updateState])

  // Atualizar usuário
  const updateUser = useCallback(async (userId: string, userData: UpdateUserRequest): Promise<User | null> => {
    try {
      updateState({ loading: true, error: null })
      
      const updatedUser = await UserService.updateUser(userId, userData)
      
      // Recarrega a lista completa para garantir que o estado seja atualizado
      await loadUsers()
      
      return updatedUser
    } catch (error) {
      console.error('Update user failed in useUsers:', error)
      updateState({
        error: error instanceof Error ? error.message : 'Erro ao atualizar usuário',
        loading: false
      })
      return null
    }
  }, [updateState, loadUsers])

  // Deletar usuário
  const deleteUser = useCallback(async (userId: string): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null })
      
      // Valida o ID antes de tentar deletar
      if (!userId || typeof userId !== 'string') {
        throw new Error('ID do usuário é obrigatório')
      }
      
      await UserService.deleteUser(userId)
      
      // Remove o usuário da lista local
      updateState({
        users: state.users.filter(user => user.id !== userId),
        loading: false
      })
      
      return true
    } catch (error) {
      console.error('Delete user failed:', error)
      
      // Mensagem de erro mais específica
      let errorMessage = 'Erro ao deletar usuário'
      if (error instanceof Error) {
        if (error.message.includes('ID do usuário')) {
          errorMessage = error.message
        } else if (error.message.includes('Validation failed (uuid is expected)')) {
          errorMessage = 'Formato de ID incompatível com a API. Entre em contato com o administrador.'
        } else if (error.message.includes('Validation failed')) {
          errorMessage = 'ID do usuário não está em um formato válido'
        } else if (error.message.includes('400')) {
          errorMessage = 'Dados inválidos para exclusão do usuário'
        } else if (error.message.includes('404')) {
          errorMessage = 'Usuário não encontrado'
        } else if (error.message.includes('403')) {
          errorMessage = 'Você não tem permissão para excluir este usuário'
        } else {
          errorMessage = error.message
        }
      }
      
      updateState({
        error: errorMessage,
        loading: false
      })
      return false
    }
  }, [state.users, updateState])

  // Alternar status do usuário
  const toggleUserStatus = useCallback(async (userId: string): Promise<boolean> => {
    try {
      updateState({ loading: true, error: null })
      
      await UserService.toggleUserStatus(userId)
      
      // Recarrega a lista completa para garantir que o estado seja atualizado
      await loadUsers()
      
      // Atualiza as estatísticas para refletir a mudança
      await loadStats()
      
      return true
    } catch (error) {
      console.error('Toggle user status failed:', error)
      updateState({
        error: error instanceof Error ? error.message : 'Erro ao alterar status do usuário',
        loading: false
      })
      return false
    }
  }, [loadUsers, loadStats, updateState])

  // Recarregar usuários
  const refreshUsers = useCallback(async () => {
    await loadUsers()
  }, [loadUsers])

  // Carregar dados iniciais
  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          loadUsers(),
          loadStats(),
          loadRoles()
        ])
      } catch (error) {
        console.error('Failed to initialize users data:', error)
      }
    }
    
    initializeData()
  }, [loadRoles, loadStats, loadUsers]) // Carregamento inicial quando as funções mudarem

  return {
    ...state,
    createUser,
    updateUser,
    deleteUser,
    toggleUserStatus,
    loadUsers,
    searchUsers,
    filterByRole,
    filterByStatus,
    goToPage,
    changeLimit,
    sortUsers,
    loadStats,
    loadRoles,
    refreshUsers,
    clearError
  }
}
