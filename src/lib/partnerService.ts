import { config } from './config'
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
  UpdatePaymentData,
  PlanType
} from '@/types/partners'

export class PartnerService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('primata_access_token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  // ===== PLANOS DE SAÚDE =====

  // Listar planos de saúde
  static async listHealthPlans(filters: PartnerFilters = {}): Promise<PartnerListResponse<HealthPlan>> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
    if (filters.planType) params.append('planType', filters.planType)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await fetch(`${config.apiUrl}/agreements/health-plans?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao listar planos de saúde: ${response.status}`)
    }

    return response.json()
  }

  // Buscar plano de saúde por ID
  static async getHealthPlan(id: string): Promise<HealthPlan> {
    const response = await fetch(`${config.apiUrl}/agreements/health-plans/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar plano de saúde: ${response.status}`)
    }

    return response.json()
  }

  // Criar plano de saúde
  static async createHealthPlan(data: CreateHealthPlanData): Promise<HealthPlan> {
    const response = await fetch(`${config.apiUrl}/agreements/health-plans`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Erro ao criar plano de saúde: ${response.status}`)
    }

    return response.json()
  }

  // Atualizar plano de saúde
  static async updateHealthPlan(id: string, data: UpdateHealthPlanData): Promise<HealthPlan> {
    const response = await fetch(`${config.apiUrl}/agreements/health-plans/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Erro ao atualizar plano de saúde: ${response.status}`)
    }

    return response.json()
  }

  // Deletar plano de saúde
  static async deleteHealthPlan(id: string): Promise<{ message: string }> {
    const response = await fetch(`${config.apiUrl}/agreements/health-plans/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao deletar plano de saúde: ${response.status}`)
    }

    return response.json()
  }

  // ===== CONVÊNIOS =====

  // Listar convênios
  static async listAgreements(filters: PartnerFilters = {}): Promise<PartnerListResponse<Agreement>> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
    if (filters.healthPlanId) params.append('healthPlanId', filters.healthPlanId)
    if (filters.clientId) params.append('clientId', filters.clientId)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await fetch(`${config.apiUrl}/agreements/agreements?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao listar convênios: ${response.status}`)
    }

    return response.json()
  }

  // Buscar convênio por ID
  static async getAgreement(id: string): Promise<Agreement> {
    const response = await fetch(`${config.apiUrl}/agreements/agreements/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar convênio: ${response.status}`)
    }

    return response.json()
  }

  // Criar convênio
  static async createAgreement(data: CreateAgreementData): Promise<Agreement> {
    const response = await fetch(`${config.apiUrl}/agreements/agreements`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Erro ao criar convênio: ${response.status}`)
    }

    return response.json()
  }

  // Atualizar convênio
  static async updateAgreement(id: string, data: UpdateAgreementData): Promise<Agreement> {
    const response = await fetch(`${config.apiUrl}/agreements/agreements/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Erro ao atualizar convênio: ${response.status}`)
    }

    return response.json()
  }

  // Deletar convênio
  static async deleteAgreement(id: string): Promise<{ message: string }> {
    const response = await fetch(`${config.apiUrl}/agreements/agreements/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao deletar convênio: ${response.status}`)
    }

    return response.json()
  }

  // ===== DESCONTOS =====

  // Listar descontos de um convênio
  static async listDiscounts(agreementId: string): Promise<AgreementDiscount[]> {
    const response = await fetch(`${config.apiUrl}/agreements/agreements/${agreementId}/discounts`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao listar descontos: ${response.status}`)
    }

    return response.json()
  }

  // Criar desconto
  static async createDiscount(agreementId: string, data: CreateDiscountData): Promise<AgreementDiscount> {
    const response = await fetch(`${config.apiUrl}/agreements/agreements/${agreementId}/discounts`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Erro ao criar desconto: ${response.status}`)
    }

    return response.json()
  }

  // Atualizar desconto
  static async updateDiscount(id: string, data: UpdateDiscountData): Promise<AgreementDiscount> {
    const response = await fetch(`${config.apiUrl}/agreements/discounts/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Erro ao atualizar desconto: ${response.status}`)
    }

    return response.json()
  }

  // Deletar desconto
  static async deleteDiscount(id: string): Promise<{ message: string }> {
    const response = await fetch(`${config.apiUrl}/agreements/discounts/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao deletar desconto: ${response.status}`)
    }

    return response.json()
  }

  // Calcular desconto
  static async calculateDiscount(agreementId: string, serviceId: string, amount: number): Promise<{ discountAmount: number; finalAmount: number }> {
    const response = await fetch(`${config.apiUrl}/agreements/calculate-discount`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ agreementId, serviceId, amount })
    })

    if (!response.ok) {
      throw new Error(`Erro ao calcular desconto: ${response.status}`)
    }

    return response.json()
  }

  // ===== LIMITES DE COBERTURA =====

  // Listar limites de cobertura de um plano
  static async listCoverageLimits(healthPlanId: string): Promise<CoverageLimit[]> {
    const response = await fetch(`${config.apiUrl}/agreements/health-plans/${healthPlanId}/coverage-limits`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao listar limites de cobertura: ${response.status}`)
    }

    return response.json()
  }

  // Criar limite de cobertura
  static async createCoverageLimit(healthPlanId: string, data: CreateCoverageLimitData): Promise<CoverageLimit> {
    const response = await fetch(`${config.apiUrl}/agreements/health-plans/${healthPlanId}/coverage-limits`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Erro ao criar limite de cobertura: ${response.status}`)
    }

    return response.json()
  }

  // Atualizar limite de cobertura
  static async updateCoverageLimit(id: string, data: UpdateCoverageLimitData): Promise<CoverageLimit> {
    const response = await fetch(`${config.apiUrl}/agreements/coverage-limits/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Erro ao atualizar limite de cobertura: ${response.status}`)
    }

    return response.json()
  }

  // Deletar limite de cobertura
  static async deleteCoverageLimit(id: string): Promise<{ message: string }> {
    const response = await fetch(`${config.apiUrl}/agreements/coverage-limits/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao deletar limite de cobertura: ${response.status}`)
    }

    return response.json()
  }

  // Verificar limite de cobertura
  static async checkCoverageLimit(agreementId: string, serviceId: string, amount: number): Promise<{ isCovered: boolean; remainingLimit: number }> {
    const response = await fetch(`${config.apiUrl}/agreements/check-coverage-limit`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ agreementId, serviceId, amount })
    })

    if (!response.ok) {
      throw new Error(`Erro ao verificar limite de cobertura: ${response.status}`)
    }

    return response.json()
  }

  // ===== PAGAMENTOS =====

  // Listar pagamentos
  static async listPayments(filters: PartnerFilters = {}): Promise<PartnerListResponse<Payment>> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.clientId) params.append('clientId', filters.clientId)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await fetch(`${config.apiUrl}/payments?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao listar pagamentos: ${response.status}`)
    }

    return response.json()
  }

  // Buscar pagamento por ID
  static async getPayment(id: string): Promise<Payment> {
    const response = await fetch(`${config.apiUrl}/payments/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar pagamento: ${response.status}`)
    }

    return response.json()
  }

  // Criar pagamento
  static async createPayment(data: CreatePaymentData): Promise<Payment> {
    const response = await fetch(`${config.apiUrl}/payments`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Erro ao criar pagamento: ${response.status}`)
    }

    return response.json()
  }

  // Atualizar pagamento
  static async updatePayment(id: string, data: UpdatePaymentData): Promise<Payment> {
    const response = await fetch(`${config.apiUrl}/payments/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Erro ao atualizar pagamento: ${response.status}`)
    }

    return response.json()
  }

  // ===== ALERTAS =====

  // Listar alertas ativos
  static async listAlerts(): Promise<CoverageAlert[]> {
    const response = await fetch(`${config.apiUrl}/agreements/alerts`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao listar alertas: ${response.status}`)
    }

    return response.json()
  }

  // Listar alertas de um convênio
  static async listAgreementAlerts(agreementId: string): Promise<CoverageAlert[]> {
    const response = await fetch(`${config.apiUrl}/agreements/agreements/${agreementId}/alerts`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao listar alertas do convênio: ${response.status}`)
    }

    return response.json()
  }

  // Resolver alerta
  static async resolveAlert(id: string): Promise<CoverageAlert> {
    const response = await fetch(`${config.apiUrl}/agreements/alerts/${id}/resolve`, {
      method: 'PUT',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao resolver alerta: ${response.status}`)
    }

    return response.json()
  }

  // ===== INTEGRAÇÕES =====

  // Listar integrações de um plano
  static async listIntegrations(healthPlanId: string): Promise<OperatorIntegration[]> {
    const response = await fetch(`${config.apiUrl}/agreements/health-plans/${healthPlanId}/integrations`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao listar integrações: ${response.status}`)
    }

    return response.json()
  }

  // Criar integração
  static async createIntegration(healthPlanId: string, data: any): Promise<OperatorIntegration> {
    const response = await fetch(`${config.apiUrl}/agreements/health-plans/${healthPlanId}/integrations`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Erro ao criar integração: ${response.status}`)
    }

    return response.json()
  }

  // Testar integração
  static async testIntegration(id: string): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${config.apiUrl}/agreements/integrations/${id}/test`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao testar integração: ${response.status}`)
    }

    return response.json()
  }

  // Atualizar integração
  static async updateIntegration(id: string, data: any): Promise<OperatorIntegration> {
    const response = await fetch(`${config.apiUrl}/agreements/integrations/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Erro ao atualizar integração: ${response.status}`)
    }

    return response.json()
  }

  // Deletar integração
  static async deleteIntegration(id: string): Promise<{ message: string }> {
    const response = await fetch(`${config.apiUrl}/agreements/integrations/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao deletar integração: ${response.status}`)
    }

    return response.json()
  }

  // ===== RELATÓRIOS =====

  // Relatório por plano de saúde
  static async getHealthPlanReport(healthPlanId: string, startDate: string, endDate: string): Promise<any> {
    const response = await fetch(`${config.apiUrl}/agreements/reports/health-plans/${healthPlanId}?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar relatório: ${response.status}`)
    }

    return response.json()
  }

  // Relatório por cliente
  static async getClientReport(clientId: string): Promise<any> {
    const response = await fetch(`${config.apiUrl}/agreements/reports/clients/${clientId}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar relatório do cliente: ${response.status}`)
    }

    return response.json()
  }

  // ===== UTILITÁRIOS =====

  // Aplicar desconto automático
  static async applyDiscount(clientId: string, serviceId: string, amount: number): Promise<{ discountAmount: number; finalAmount: number }> {
    const response = await fetch(`${config.apiUrl}/agreements/apply-discount`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ clientId, serviceId, amount })
    })

    if (!response.ok) {
      throw new Error(`Erro ao aplicar desconto: ${response.status}`)
    }

    return response.json()
  }

  // Verificar cobertura de convênio
  static async checkCoverage(agreementId: string, serviceId: string, amount: number): Promise<{ isCovered: boolean; coverageDetails: any }> {
    const response = await fetch(`${config.apiUrl}/agreements/check-coverage`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ agreementId, serviceId, amount })
    })

    if (!response.ok) {
      throw new Error(`Erro ao verificar cobertura: ${response.status}`)
    }

    return response.json()
  }

  // ===== ESTATÍSTICAS =====

  // Buscar estatísticas dos parceiros
  static async getPartnerStats(): Promise<PartnerStats> {
    try {
      const response = await fetch(`${config.apiUrl}/agreements/stats/overview`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      })

      if (!response.ok) {
        // Se o endpoint não existir, retorna estatísticas mockadas
        console.warn('Endpoint de estatísticas não encontrado, usando dados mockados')
        return {
          totalHealthPlans: 0,
          activeHealthPlans: 0,
          totalAgreements: 0,
          activeAgreements: 0,
          totalDiscounts: 0,
          activeDiscounts: 0,
          totalPayments: 0,
          totalAmount: 0,
          averageDiscount: 0,
          byPlanType: {
            [PlanType.INDIVIDUAL]: 0,
            [PlanType.FAMILIAR]: 0,
            [PlanType.EMPRESARIAL]: 0
          }
        }
      }

      return response.json()
    } catch (error) {
      console.warn('Erro ao buscar estatísticas, usando dados mockados:', error)
      return {
        totalHealthPlans: 0,
        activeHealthPlans: 0,
        totalAgreements: 0,
        activeAgreements: 0,
        totalDiscounts: 0,
        activeDiscounts: 0,
        totalPayments: 0,
        totalAmount: 0,
        averageDiscount: 0,
        byPlanType: {
          [PlanType.INDIVIDUAL]: 0,
          [PlanType.FAMILIAR]: 0,
          [PlanType.EMPRESARIAL]: 0
        }
      }
    }
  }
}
