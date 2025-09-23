import { config } from './config'
import { 
  Service, 
  ServiceListItem, 
  ServiceFilters, 
  ServiceListResponse, 
  ServiceStats, 
  CreateServiceData, 
  UpdateServiceData,
  ServiceCategoryEntity 
} from '@/types/services'

export class ServiceService {
  private static getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('primata_access_token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  }

  // Listar serviços com filtros
  static async listServices(filters: ServiceFilters = {}): Promise<ServiceListResponse> {
    const params = new URLSearchParams()
    
    if (filters.page) params.append('page', filters.page.toString())
    if (filters.limit) params.append('limit', filters.limit.toString())
    if (filters.search) params.append('search', filters.search)
    if (filters.serviceCategoryId) params.append('serviceCategoryId', filters.serviceCategoryId)
    if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString())
    if (filters.minPrice) params.append('minPrice', filters.minPrice.toString())
    if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString())
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)

    const response = await fetch(`${config.apiUrl}/services?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao listar serviços: ${response.status}`)
    }

    return response.json()
  }

  // ===== Categorias de Serviços (dinâmicas) =====
  static async listServiceCategories(filters: { name?: string; isActive?: boolean | string; page?: number; limit?: number; sortBy?: string; sortOrder?: string } = {}): Promise<{ categories: ServiceCategoryEntity[]; page?: number; limit?: number; total?: number; totalPages?: number }> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v))
    })
    const qs = params.toString()
    const response = await fetch(`${config.apiUrl}/services/categories${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })
    if (!response.ok) {
      throw new Error(`Erro ao listar categorias: ${response.status}`)
    }
    return response.json()
  }

  // Buscar serviço por ID
  static async getService(id: string): Promise<Service> {
    const response = await fetch(`${config.apiUrl}/services/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar serviço: ${response.status}`)
    }

    return response.json()
  }

  // Criar novo serviço
  static async createService(data: CreateServiceData): Promise<Service> {
    const response = await fetch(`${config.apiUrl}/services`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Erro ao criar serviço: ${response.status}`)
    }

    return response.json()
  }

  // Atualizar serviço
  static async updateService(id: string, data: UpdateServiceData): Promise<Service> {
    const response = await fetch(`${config.apiUrl}/services/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      throw new Error(`Erro ao atualizar serviço: ${response.status}`)
    }

    return response.json()
  }

  // Deletar serviço
  static async deleteService(id: string): Promise<{ message: string }> {
    const response = await fetch(`${config.apiUrl}/services/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao deletar serviço: ${response.status}`)
    }

    return response.json()
  }

  // Alternar status do serviço
  static async toggleServiceStatus(id: string): Promise<{ id: string; name: string; isActive: boolean; updatedAt: string }> {
    const response = await fetch(`${config.apiUrl}/services/${id}/toggle-status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao alternar status do serviço: ${response.status}`)
    }

    return response.json()
  }

  // Buscar estatísticas dos serviços
  static async getServiceStats(): Promise<ServiceStats> {
    const response = await fetch(`${config.apiUrl}/services/stats/overview`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar estatísticas: ${response.status}`)
    }

    return response.json()
  }

  // Buscar serviços por nome
  static async searchServicesByName(name: string): Promise<ServiceListItem[]> {
    const response = await fetch(`${config.apiUrl}/services/search/name/${encodeURIComponent(name)}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar serviços por nome: ${response.status}`)
    }

    return response.json()
  }

  // Buscar serviços por categoria
  static async searchServicesByCategory(serviceCategoryId: string): Promise<ServiceListItem[]> {
    const response = await fetch(`${config.apiUrl}/services/search/category/${encodeURIComponent(serviceCategoryId)}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar serviços por categoria: ${response.status}`)
    }

    return response.json()
  }

  // Buscar serviços por faixa de preço
  static async searchServicesByPriceRange(minPrice: number, maxPrice: number): Promise<ServiceListItem[]> {
    const response = await fetch(`${config.apiUrl}/services/search/price-range/${minPrice}/${maxPrice}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar serviços por faixa de preço: ${response.status}`)
    }

    return response.json()
  }

  // Buscar serviços por duração máxima
  static async searchServicesByDuration(maxDuration: number): Promise<ServiceListItem[]> {
    const response = await fetch(`${config.apiUrl}/services/search/duration/${maxDuration}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    })

    if (!response.ok) {
      throw new Error(`Erro ao buscar serviços por duração: ${response.status}`)
    }

    return response.json()
  }
}
