import { useState, useEffect, useCallback } from 'react'
import { PartnerService } from './partnerService'
import { 
  HealthPlan, 
  Agreement, 
  AgreementDiscount, 
  CoverageLimit, 
  Payment, 
  CoverageAlert, 
  OperatorIntegration,
  PartnerFilters,
  PartnerListResponse,
  PartnerStats,
  CreateHealthPlanData,
  CreateAgreementData,
  CreateDiscountData,
  CreateCoverageLimitData,
  CreatePaymentData,
  UpdateHealthPlanData,
  UpdateAgreementData,
  UpdateDiscountData,
  UpdateCoverageLimitData,
  UpdatePaymentData
} from '@/types/partners'

export function usePartners() {
  const [healthPlans, setHealthPlans] = useState<HealthPlan[]>([])
  const [agreements, setAgreements] = useState<Agreement[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [alerts, setAlerts] = useState<CoverageAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<PartnerStats | null>(null)
  const [pagination, setPagination] = useState<{
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  } | null>(null)
  const [filters, setFilters] = useState<PartnerFilters>({
    page: 1,
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc'
  })

  // ===== PLANOS DE SAÚDE =====

  // Carregar planos de saúde
  const loadHealthPlans = useCallback(async (newFilters?: PartnerFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const defaultFilters = {
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc' as const
      }
      
      const updatedFilters = { ...defaultFilters, ...newFilters }
      const response = await PartnerService.listHealthPlans(updatedFilters)
      
      // A API pode retornar os dados diretamente ou em uma propriedade 'data'
      const healthPlansData = response.data || response.healthPlans || response || []
      setHealthPlans(Array.isArray(healthPlansData) ? healthPlansData : [])
      
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
        hasNext: response.hasNext || false,
        hasPrev: response.hasPrev || false
      })
      setFilters(updatedFilters)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar planos de saúde')
      console.error('Erro ao carregar planos de saúde:', err)
      setHealthPlans([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar plano de saúde por ID
  const getHealthPlan = useCallback(async (id: string): Promise<HealthPlan | null> => {
    try {
      return await PartnerService.getHealthPlan(id)
    } catch (err) {
      console.error('Erro ao buscar plano de saúde:', err)
      return null
    }
  }, [])

  // Criar plano de saúde
  const createHealthPlan = useCallback(async (data: CreateHealthPlanData) => {
    try {
      setLoading(true)
      setError(null)
      
      const newHealthPlan = await PartnerService.createHealthPlan(data)
      
      // Recarregar a lista
      await loadHealthPlans()
      
      return newHealthPlan
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar plano de saúde'
      setError(errorMessage)
      console.error('Erro ao criar plano de saúde:', err)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [loadHealthPlans])

  // Atualizar plano de saúde
  const updateHealthPlan = useCallback(async (id: string, data: UpdateHealthPlanData) => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedHealthPlan = await PartnerService.updateHealthPlan(id, data)
      
      // Recarregar a lista
      await loadHealthPlans()
      
      return updatedHealthPlan
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar plano de saúde'
      setError(errorMessage)
      console.error('Erro ao atualizar plano de saúde:', err)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [loadHealthPlans])

  // Deletar plano de saúde
  const deleteHealthPlan = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await PartnerService.deleteHealthPlan(id)
      
      // Recarregar a lista
      await loadHealthPlans()
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar plano de saúde'
      setError(errorMessage)
      console.error('Erro ao deletar plano de saúde:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadHealthPlans])

  // ===== CONVÊNIOS =====

  // Carregar convênios
  const loadAgreements = useCallback(async (newFilters?: PartnerFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const defaultFilters = {
        page: 1,
        limit: 10,
        sortBy: 'agreementNumber',
        sortOrder: 'asc' as const
      }
      
      const updatedFilters = { ...defaultFilters, ...newFilters }
      const response = await PartnerService.listAgreements(updatedFilters)
      
      setAgreements(response.data)
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
      setError(err instanceof Error ? err.message : 'Erro ao carregar convênios')
      console.error('Erro ao carregar convênios:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Buscar convênio por ID
  const getAgreement = useCallback(async (id: string): Promise<Agreement | null> => {
    try {
      return await PartnerService.getAgreement(id)
    } catch (err) {
      console.error('Erro ao buscar convênio:', err)
      return null
    }
  }, [])

  // Criar convênio
  const createAgreement = useCallback(async (data: CreateAgreementData) => {
    try {
      setLoading(true)
      setError(null)
      
      const newAgreement = await PartnerService.createAgreement(data)
      
      // Recarregar a lista
      await loadAgreements()
      
      return newAgreement
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar convênio'
      setError(errorMessage)
      console.error('Erro ao criar convênio:', err)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [loadAgreements])

  // Atualizar convênio
  const updateAgreement = useCallback(async (id: string, data: UpdateAgreementData) => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedAgreement = await PartnerService.updateAgreement(id, data)
      
      // Recarregar a lista
      await loadAgreements()
      
      return updatedAgreement
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar convênio'
      setError(errorMessage)
      console.error('Erro ao atualizar convênio:', err)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [loadAgreements])

  // Deletar convênio
  const deleteAgreement = useCallback(async (id: string) => {
    try {
      setLoading(true)
      setError(null)
      
      await PartnerService.deleteAgreement(id)
      
      // Recarregar a lista
      await loadAgreements()
      
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar convênio'
      setError(errorMessage)
      console.error('Erro ao deletar convênio:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [loadAgreements])

  // ===== DESCONTOS =====

  // Listar descontos de um convênio
  const loadDiscounts = useCallback(async (agreementId: string) => {
    try {
      const discounts = await PartnerService.listDiscounts(agreementId)
      return discounts
    } catch (err) {
      console.error('Erro ao carregar descontos:', err)
      return []
    }
  }, [])

  // Criar desconto
  const createDiscount = useCallback(async (agreementId: string, data: CreateDiscountData) => {
    try {
      const newDiscount = await PartnerService.createDiscount(agreementId, data)
      return newDiscount
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar desconto'
      console.error('Erro ao criar desconto:', err)
      throw new Error(errorMessage)
    }
  }, [])

  // Atualizar desconto
  const updateDiscount = useCallback(async (id: string, data: UpdateDiscountData) => {
    try {
      const updatedDiscount = await PartnerService.updateDiscount(id, data)
      return updatedDiscount
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar desconto'
      console.error('Erro ao atualizar desconto:', err)
      throw new Error(errorMessage)
    }
  }, [])

  // Deletar desconto
  const deleteDiscount = useCallback(async (id: string) => {
    try {
      await PartnerService.deleteDiscount(id)
      return true
    } catch (err) {
      console.error('Erro ao deletar desconto:', err)
      return false
    }
  }, [])

  // Calcular desconto
  const calculateDiscount = useCallback(async (agreementId: string, serviceId: string, amount: number) => {
    try {
      const result = await PartnerService.calculateDiscount(agreementId, serviceId, amount)
      return result
    } catch (err) {
      console.error('Erro ao calcular desconto:', err)
      throw err
    }
  }, [])

  // ===== PAGAMENTOS =====

  // Carregar pagamentos
  const loadPayments = useCallback(async (newFilters?: PartnerFilters) => {
    try {
      setLoading(true)
      setError(null)
      
      const defaultFilters = {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc' as const
      }
      
      const updatedFilters = { ...defaultFilters, ...newFilters }
      const response = await PartnerService.listPayments(updatedFilters)
      
      setPayments(response.data)
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
      setError(err instanceof Error ? err.message : 'Erro ao carregar pagamentos')
      console.error('Erro ao carregar pagamentos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Criar pagamento
  const createPayment = useCallback(async (data: CreatePaymentData) => {
    try {
      setLoading(true)
      setError(null)
      
      const newPayment = await PartnerService.createPayment(data)
      
      // Recarregar a lista
      await loadPayments()
      
      return newPayment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar pagamento'
      setError(errorMessage)
      console.error('Erro ao criar pagamento:', err)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [loadPayments])

  // Atualizar pagamento
  const updatePayment = useCallback(async (id: string, data: UpdatePaymentData) => {
    try {
      setLoading(true)
      setError(null)
      
      const updatedPayment = await PartnerService.updatePayment(id, data)
      
      // Recarregar a lista
      await loadPayments()
      
      return updatedPayment
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar pagamento'
      setError(errorMessage)
      console.error('Erro ao atualizar pagamento:', err)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [loadPayments])

  // ===== ALERTAS =====

  // Carregar alertas
  const loadAlerts = useCallback(async () => {
    try {
      const alertsData = await PartnerService.listAlerts()
      setAlerts(alertsData)
    } catch (err) {
      console.error('Erro ao carregar alertas:', err)
    }
  }, [])

  // Resolver alerta
  const resolveAlert = useCallback(async (id: string) => {
    try {
      const resolvedAlert = await PartnerService.resolveAlert(id)
      
      // Atualizar o alerta na lista local
      setAlerts(prev => prev.map(alert => 
        alert.id === id ? resolvedAlert : alert
      ))
      
      return resolvedAlert
    } catch (err) {
      console.error('Erro ao resolver alerta:', err)
      return null
    }
  }, [])

  // ===== ESTATÍSTICAS =====

  // Carregar estatísticas
  const loadStats = useCallback(async () => {
    try {
      const statsData = await PartnerService.getPartnerStats()
      setStats(statsData)
    } catch (err) {
      console.error('Erro ao carregar estatísticas:', err)
    }
  }, [])

  // ===== UTILITÁRIOS =====

  // Aplicar desconto automático
  const applyDiscount = useCallback(async (clientId: string, serviceId: string, amount: number) => {
    try {
      const result = await PartnerService.applyDiscount(clientId, serviceId, amount)
      return result
    } catch (err) {
      console.error('Erro ao aplicar desconto:', err)
      throw err
    }
  }, [])

  // Verificar cobertura
  const checkCoverage = useCallback(async (agreementId: string, serviceId: string, amount: number) => {
    try {
      const result = await PartnerService.checkCoverage(agreementId, serviceId, amount)
      return result
    } catch (err) {
      console.error('Erro ao verificar cobertura:', err)
      throw err
    }
  }, [])

  // ===== FILTROS E BUSCA =====

  // Buscar planos de saúde
  const searchHealthPlans = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      await loadHealthPlans({ search: undefined, page: 1 })
      return
    }
    
    try {
      setLoading(true)
      setError(null)
      
      const response = await PartnerService.listHealthPlans({
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'asc',
        search: searchTerm
      })
      
      // A API pode retornar os dados diretamente ou em uma propriedade 'data'
      const healthPlansData = response.data || response.healthPlans || response || []
      setHealthPlans(Array.isArray(healthPlansData) ? healthPlansData : [])
      
      setPagination({
        page: response.page || 1,
        limit: response.limit || 10,
        total: response.total || 0,
        totalPages: response.totalPages || 0,
        hasNext: response.hasNext || false,
        hasPrev: response.hasPrev || false
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar planos de saúde')
      console.error('Erro ao buscar planos de saúde:', err)
      setHealthPlans([])
    } finally {
      setLoading(false)
    }
  }, [loadHealthPlans])

  // Filtrar por tipo de plano
  const filterByPlanType = useCallback(async (planType: string) => {
    const newFilters = planType ? { planType: planType as any, page: 1 } : { planType: undefined, page: 1 }
    await loadHealthPlans(newFilters)
  }, [loadHealthPlans])

  // Filtrar por status
  const filterByStatus = useCallback(async (isActive: boolean | null) => {
    const newFilters = isActive !== null ? { isActive, page: 1 } : { isActive: undefined, page: 1 }
    await loadHealthPlans(newFilters)
  }, [loadHealthPlans])

  // Alterar página
  const changePage = useCallback(async (page: number) => {
    await loadHealthPlans({ page })
  }, [loadHealthPlans])

  // Alterar limite por página
  const changeLimit = useCallback(async (limit: number) => {
    await loadHealthPlans({ limit, page: 1 })
  }, [loadHealthPlans])

  // Ordenar
  const sortBy = useCallback(async (sortBy: string, sortOrder: 'asc' | 'desc') => {
    await loadHealthPlans({ sortBy, sortOrder, page: 1 })
  }, [loadHealthPlans])

  // Recarregar dados
  const refreshData = useCallback(async () => {
    await loadHealthPlans()
    await loadAgreements()
    await loadPayments()
    await loadAlerts()
    await loadStats()
  }, [loadHealthPlans, loadAgreements, loadPayments, loadAlerts, loadStats])

  // Carregar dados iniciais
  useEffect(() => {
    refreshData()
  }, [refreshData])

  return {
    // Estado
    healthPlans,
    agreements,
    payments,
    alerts,
    loading,
    error,
    stats,
    pagination,
    filters,
    
    // Ações - Planos de Saúde
    loadHealthPlans,
    getHealthPlan,
    createHealthPlan,
    updateHealthPlan,
    deleteHealthPlan,
    
    // Ações - Convênios
    loadAgreements,
    getAgreement,
    createAgreement,
    updateAgreement,
    deleteAgreement,
    
    // Ações - Descontos
    loadDiscounts,
    createDiscount,
    updateDiscount,
    deleteDiscount,
    calculateDiscount,
    
    // Ações - Pagamentos
    loadPayments,
    createPayment,
    updatePayment,
    
    // Ações - Alertas
    loadAlerts,
    resolveAlert,
    
    // Ações - Estatísticas
    loadStats,
    
    // Ações - Utilitários
    applyDiscount,
    checkCoverage,
    
    // Ações - Filtros e Busca
    searchHealthPlans,
    filterByPlanType,
    filterByStatus,
    changePage,
    changeLimit,
    sortBy,
    refreshData
  }
}
