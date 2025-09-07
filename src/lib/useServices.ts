import { useState, useEffect, useCallback } from 'react'
import { ServiceService } from './serviceService'
import { 
  Service, 
  ServiceListItem, 
  ServiceFilters, 
  ServiceStats,
  ServiceCategory,
  CreateServiceData,
  UpdateServiceData
} from '@/types/services'

export function useServices() {
  const [services, setServices] = useState<ServiceListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  } | null>(null)
  const [stats, setStats] = useState<ServiceStats | null>(null)
  const [filters, setFilters] = useState<ServiceFilters>({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc'
  })

  // Carregar serviços
  const loadServices = useCallback(async (newFilters?: ServiceFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      // Usa os filtros padrão se não foram fornecidos novos filtros
      const defaultFilters = {
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc' as const
      }
      
      const updatedFilters = { ...defaultFilters, ...newFilters }
      const response = await ServiceService.listServices(updatedFilters)
      
      setServices(response.services)
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrev: response.hasPrev
      })
      setFilters(updatedFilters)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar serviços')
      console.error('Erro ao carregar serviços:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    try {
      const statsData = await ServiceService.getServiceStats()
      setStats(statsData)
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }, [])

  // Buscar serviços
  const searchServices = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      await loadServices({ search: undefined, page: 1 })
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await ServiceService.listServices({
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
        search: searchTerm
      })
      
      setServices(response.services)
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
        hasNext: response.hasNext,
        hasPrev: response.hasPrev
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar serviços')
      console.error('Erro ao buscar serviços:', err)
    } finally {
      setLoading(false)
    }
  }, [loadServices])

  // Filtrar por categoria
  const filterByCategory = useCallback(async (category: ServiceCategory | '') => {
    const newFilters = category ? { category, page: 1 } : { category: undefined, page: 1 }
    await loadServices(newFilters)
  }, [loadServices])

  // Filtrar por status
  const filterByStatus = useCallback(async (isActive: boolean | null) => {
    const newFilters = isActive !== null ? { isActive, page: 1 } : { isActive: undefined, page: 1 }
    await loadServices(newFilters)
  }, [loadServices])

  // Filtrar por faixa de preço
  const filterByPriceRange = useCallback(async (minPrice?: number, maxPrice?: number) => {
    const newFilters = { minPrice, maxPrice, page: 1 }
    await loadServices(newFilters)
  }, [loadServices])

  // Filtrar por duração
  const filterByDuration = useCallback(async (maxDuration?: number) => {
    const newFilters = { page: 1 }
    if (maxDuration) {
      // Implementar filtro por duração se a API suportar
      console.log('Filtro por duração:', maxDuration)
    }
    await loadServices(newFilters)
  }, [loadServices])

  // Alterar página
  const changePage = useCallback(async (page: number) => {
    await loadServices({ page })
  }, [loadServices])

  // Alterar limite por página
  const changeLimit = useCallback(async (limit: number) => {
    await loadServices({ limit, page: 1 })
  }, [loadServices])

  // Ordenar
  const sortBy = useCallback(async (sortBy: string, sortOrder: 'asc' | 'desc') => {
    await loadServices({ sortBy, sortOrder, page: 1 })
  }, [loadServices])

  // Criar serviço
  const createService = useCallback(async (serviceData: CreateServiceData) => {
    try {
      setLoading(true)
      setError(null)
      
      const newService = await ServiceService.createService(serviceData)
      
      // Recarregar a lista
      await loadServices()
      
      return newService
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar serviço'
      setError(errorMessage)
      console.error('Erro ao criar serviço:', err)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [loadServices])

  // Atualizar serviço
  const updateService = useCallback(async (serviceId: string, serviceData: UpdateServiceData) => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedService = await ServiceService.updateService(serviceId, serviceData)
      
      // Recarregar a lista
      await loadServices()
      
      return updatedService
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar serviço'
      setError(errorMessage)
      console.error('Erro ao atualizar serviço:', err)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [loadServices])

  // Deletar serviço
  const deleteService = useCallback(async (serviceId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await ServiceService.deleteService(serviceId)
      
      // Recarregar a lista
      await loadServices()
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar serviço'
      setError(errorMessage)
      console.error('Erro ao deletar serviço:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadServices])

  // Alternar status do serviço
  const toggleServiceStatus = useCallback(async (serviceId: string) => {
    try {
      setError(null)
      
      const result = await ServiceService.toggleServiceStatus(serviceId)
      
      // Atualizar o serviço na lista local
      setServices(prev => prev.map(service => 
        service.id === serviceId 
          ? { ...service, isActive: result.isActive }
          : service
      ))
      
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao alternar status do serviço'
      setError(errorMessage)
      console.error('Erro ao alternar status do serviço:', err)
      return null
    }
  }, [])

  // Buscar serviço por ID
  const getService = useCallback(async (serviceId: string): Promise<Service | null> => {
    try {
      return await ServiceService.getService(serviceId)
    } catch (err) {
      console.error('Erro ao buscar serviço:', err)
      return null
    }
  }, [])

  // Buscar serviços por nome
  const searchServicesByName = useCallback(async (name: string) => {
    try {
      return await ServiceService.searchServicesByName(name)
    } catch (err) {
      console.error('Erro ao buscar serviços por nome:', err)
      return []
    }
  }, [])

  // Buscar serviços por categoria
  const searchServicesByCategory = useCallback(async (category: string) => {
    try {
      return await ServiceService.searchServicesByCategory(category)
    } catch (err) {
      console.error('Erro ao buscar serviços por categoria:', err)
      return []
    }
  }, [])

  // Buscar serviços por faixa de preço
  const searchServicesByPriceRange = useCallback(async (minPrice: number, maxPrice: number) => {
    try {
      return await ServiceService.searchServicesByPriceRange(minPrice, maxPrice)
    } catch (err) {
      console.error('Erro ao buscar serviços por faixa de preço:', err)
      return []
    }
  }, [])

  // Buscar serviços por duração
  const searchServicesByDuration = useCallback(async (maxDuration: number) => {
    try {
      return await ServiceService.searchServicesByDuration(maxDuration)
    } catch (err) {
      console.error('Erro ao buscar serviços por duração:', err)
      return []
    }
  }, [])

  // Recarregar dados
  const refreshServices = useCallback(async () => {
    await loadServices()
    await loadStats()
  }, [loadServices, loadStats])

  // Carregar dados iniciais
  useEffect(() => {
    refreshServices()
  }, [refreshServices])

  return {
    // Estado
    services,
    loading,
    error,
    pagination,
    stats,
    filters,
    
    // Ações
    loadServices,
    searchServices,
    filterByCategory,
    filterByStatus,
    filterByPriceRange,
    filterByDuration,
    changePage,
    changeLimit,
    sortBy,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    getService,
    searchServicesByName,
    searchServicesByCategory,
    searchServicesByPriceRange,
    searchServicesByDuration,
    refreshServices
  }
}
