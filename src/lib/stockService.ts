import { api } from './api'
import type { StockCategory, StockCategoryFilters, StockCategoryListResponse, CreateStockCategoryDto, UpdateStockCategoryDto } from '@/types/stock'

export class StockService {
  // Categorias
  static async createCategory(data: CreateStockCategoryDto): Promise<StockCategory> {
    return api.post<StockCategory>('/stock/categories', data)
  }

  static async listCategories(filters: StockCategoryFilters = {}): Promise<StockCategoryListResponse> {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') params.append(k, String(v))
    })
    const qs = params.toString()
    const res = await api.get<unknown>(`/stock/categories${qs ? `?${qs}` : ''}`)
    if (res && typeof res === 'object' && Array.isArray((res as { categories?: unknown[] }).categories)) {
      return res as StockCategoryListResponse
    }
    // adapt to { data, total, page, limit }
    const obj = (res ?? {}) as { data?: unknown[]; total?: number; page?: number; limit?: number }
    const items = Array.isArray(obj.data) ? (obj.data as StockCategory[]) : []
    const page = Number(obj.page) || Number(filters.page) || 1
    const limit = Number(obj.limit) || Number(filters.limit) || 10
    const total = Number(obj.total) || items.length
    const totalPages = Math.max(1, Math.ceil(total / limit))
    return { categories: items, page, limit, total, totalPages }
  }

  static async getCategory(id: string): Promise<StockCategory> {
    return api.get<StockCategory>(`/stock/categories/${id}`)
  }

  static async updateCategory(id: string, data: UpdateStockCategoryDto): Promise<StockCategory> {
    return api.put<StockCategory>(`/stock/categories/${id}`, data)
  }

  static async toggleCategoryStatus(id: string): Promise<{ id: string; isActive: boolean }> {
    return api.patch<{ id: string; isActive: boolean }>(`/stock/categories/${id}/toggle-status`)
  }

  static async deleteCategory(id: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/stock/categories/${id}`)
  }
}


