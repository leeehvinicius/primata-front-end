// Stock (Estoque) - Categorias

export interface StockCategory {
  id: string
  name: string
  description?: string | null
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface StockCategoryFilters {
  name?: string
  isActive?: boolean | string
  page?: number
  limit?: number
}

export interface StockCategoryListResponse {
  categories: StockCategory[]
  page?: number
  limit?: number
  total?: number
  totalPages?: number
}

export type CreateStockCategoryDto = Pick<StockCategory, 'name' | 'description' | 'isActive'>
export type UpdateStockCategoryDto = Partial<CreateStockCategoryDto>


