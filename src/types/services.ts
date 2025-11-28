// Tipos para serviços estéticos (categorias dinâmicas)
export interface ServiceCategoryEntity {
  id: string
  name: string
  description?: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Service {
  id: string
  name: string
  description?: string
  serviceCategoryId: string
  serviceCategory?: ServiceCategoryEntity
  duration: number
  basePrice: number
  currentPrice: number
  color?: string
  requiresProfessional: boolean
  maxConcurrentClients: number
  preparationTime: number
  recoveryTime: number
  contraindications?: string
  benefits?: string
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ServiceListItem {
  id: string
  name: string
  description?: string
  serviceCategoryId: string
  serviceCategory?: ServiceCategoryEntity
  duration: number
  currentPrice: number
  isActive: boolean
}

export interface ServiceFilters {
  page?: number
  limit?: number
  search?: string
  serviceCategoryId?: string
  isActive?: boolean
  minPrice?: number
  maxPrice?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface ServiceListResponse {
  services: ServiceListItem[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface ServiceStats {
  total: number
  active: number
  inactive: number
  byCategory: Record<string, number>
  averagePrice: number
  averageDuration: number
  totalRevenue: number
}

export interface CreateServiceData {
  name: string
  description?: string
  serviceCategoryId: string
  duration: number
  basePrice: number
  currentPrice: number
  color?: string
  requiresProfessional?: boolean
  maxConcurrentClients?: number
  preparationTime?: number
  recoveryTime?: number
  contraindications?: string
  benefits?: string
  notes?: string
  isActive?: boolean
}

export interface UpdateServiceData {
  name?: string
  description?: string
  serviceCategoryId?: string
  duration?: number
  basePrice?: number
  currentPrice?: number
  color?: string
  requiresProfessional?: boolean
  maxConcurrentClients?: number
  preparationTime?: number
  recoveryTime?: number
  contraindications?: string
  benefits?: string
  notes?: string
  isActive?: boolean
}

