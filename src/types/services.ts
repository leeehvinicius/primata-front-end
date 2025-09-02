// Tipos para serviços estéticos
export enum ServiceCategory {
  FACIAL_TREATMENT = 'FACIAL_TREATMENT',
  BODY_TREATMENT = 'BODY_TREATMENT',
  HAIR_REMOVAL = 'HAIR_REMOVAL',
  SKIN_CLEANING = 'SKIN_CLEANING',
  AESTHETIC_PROCEDURE = 'AESTHETIC_PROCEDURE',
  CONSULTATION = 'CONSULTATION',
  MAINTENANCE = 'MAINTENANCE',
  OTHER = 'OTHER'
}

export interface Service {
  id: string
  name: string
  description?: string
  category: ServiceCategory
  duration: number
  basePrice: number
  currentPrice: number
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
  category: ServiceCategory
  duration: number
  currentPrice: number
  isActive: boolean
}

export interface ServiceFilters {
  page?: number
  limit?: number
  search?: string
  category?: ServiceCategory
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
  byCategory: Record<ServiceCategory, number>
  averagePrice: number
  averageDuration: number
  totalRevenue: number
}

export interface CreateServiceData {
  name: string
  description?: string
  category: ServiceCategory
  duration: number
  basePrice: number
  currentPrice: number
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
  category?: ServiceCategory
  duration?: number
  basePrice?: number
  currentPrice?: number
  requiresProfessional?: boolean
  maxConcurrentClients?: number
  preparationTime?: number
  recoveryTime?: number
  contraindications?: string
  benefits?: string
  notes?: string
  isActive?: boolean
}

// Configuração das categorias para exibição
export const categoryConfig = {
  [ServiceCategory.FACIAL_TREATMENT]: {
    name: 'Tratamentos Faciais',
    icon: '👩‍⚕️',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20'
  },
  [ServiceCategory.BODY_TREATMENT]: {
    name: 'Tratamentos Corporais',
    icon: '💪',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20'
  },
  [ServiceCategory.HAIR_REMOVAL]: {
    name: 'Depilação',
    icon: '✨',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20'
  },
  [ServiceCategory.SKIN_CLEANING]: {
    name: 'Limpeza de Pele',
    icon: '🧴',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20'
  },
  [ServiceCategory.AESTHETIC_PROCEDURE]: {
    name: 'Procedimentos Estéticos',
    icon: '💉',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20'
  },
  [ServiceCategory.CONSULTATION]: {
    name: 'Consultas',
    icon: '📋',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20'
  },
  [ServiceCategory.MAINTENANCE]: {
    name: 'Manutenção',
    icon: '🔧',
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/20'
  },
  [ServiceCategory.OTHER]: {
    name: 'Outros',
    icon: '📦',
    color: 'text-slate-400',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20'
  }
}
