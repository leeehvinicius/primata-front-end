'use client'
import React, { useEffect, useState } from 'react'
import { StockService } from '@/lib/stockService'
import type { StockCategory, StockCategoryFilters, CreateStockCategoryDto, UpdateStockCategoryDto } from '@/types/stock'
import Modal from '@/components/ui/Modal'

const DEFAULT_LIMIT = 10

export default function StockCategoriesPage() {
  const [items, setItems] = useState<StockCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<StockCategoryFilters>({ page: 1, limit: DEFAULT_LIMIT })
  const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number }>({ page: 1, limit: DEFAULT_LIMIT, total: 0, totalPages: 1 })

  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<StockCategory | null>(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await StockService.listCategories(filters)
      setItems(res.categories || [])
      setPagination({
        page: res.page || filters.page || 1,
        limit: res.limit || filters.limit || DEFAULT_LIMIT,
        total: res.total || (res.categories?.length || 0),
        totalPages: res.totalPages || 1,
      })
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao carregar categorias'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.name, filters.isActive])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value || undefined, page: 1 }))
  }

  const openCreate = () => { setEditing(null); setShowForm(true) }
  const openEdit = (cat: StockCategory) => { setEditing(cat); setShowForm(true) }

  const saveCategory = async (data: CreateStockCategoryDto | UpdateStockCategoryDto) => {
    if (editing) {
      await StockService.updateCategory(editing.id, data as UpdateStockCategoryDto)
    } else {
      await StockService.createCategory(data as CreateStockCategoryDto)
    }
    setShowForm(false)
    setEditing(null)
    await fetchData()
  }

  const toggleStatus = async (cat: StockCategory) => {
    await StockService.toggleCategoryStatus(cat.id)
    await fetchData()
  }

  const removeCategory = async (cat: StockCategory) => {
    await StockService.deleteCategory(cat.id)
    await fetchData()
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categorias de Estoque</h1>
        <button onClick={openCreate} className="btn btn-primary">Nova categoria</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-lg border">
        <input name="name" placeholder="Nome" value={filters.name || ''} onChange={handleChange} className="input" />
        <select name="isActive" value={filters.isActive?.toString() ?? ''} onChange={handleChange} className="input">
          <option value="">Status</option>
          <option value="true">Ativas</option>
          <option value="false">Inativas</option>
        </select>
        <div />
        <select name="limit" value={filters.limit} onChange={handleChange} className="input">
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="grid grid-cols-5 gap-2 p-3 bg-gray-50 text-xs font-semibold text-gray-600">
          <div>Nome</div>
          <div>Descrição</div>
          <div>Status</div>
          <div>Criado</div>
          <div>Ações</div>
        </div>
        {loading && <div className="p-4 text-sm">Carregando...</div>}
        {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="divide-y">
            {items.map(cat => (
              <div key={cat.id} className="grid grid-cols-5 gap-2 p-3 text-sm">
                <div className="font-medium">{cat.name}</div>
                <div className="text-gray-600 truncate" title={cat.description || ''}>{cat.description || '-'}</div>
                <div>{cat.isActive ? 'Ativa' : 'Inativa'}</div>
                <div>{cat.createdAt ? new Date(cat.createdAt).toLocaleDateString('pt-BR') : '-'}</div>
                <div className="flex gap-2">
                  <button className="text-emerald-700 hover:underline" onClick={() => openEdit(cat)}>Editar</button>
                  <button className="text-amber-700 hover:underline" onClick={() => toggleStatus(cat)}>{cat.isActive ? 'Desativar' : 'Ativar'}</button>
                  <button className="text-red-700 hover:underline" onClick={() => removeCategory(cat)}>Excluir</button>
                </div>
              </div>
            ))}
            {items.length === 0 && (
              <div className="p-4 text-sm text-gray-500">Nenhuma categoria encontrada</div>
            )}
          </div>
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <div>
            Página {pagination.page} de {pagination.totalPages} — Total: {pagination.total}
          </div>
          <div className="flex gap-2">
            <button disabled={(filters.page || 1) === 1} onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) - 1 }))} className="px-3 py-1 rounded border disabled:opacity-50">Anterior</button>
            <button disabled={(filters.page || 1) >= pagination.totalPages} onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) + 1 }))} className="px-3 py-1 rounded border disabled:opacity-50">Próxima</button>
          </div>
        </div>
      )}

      {/* Modal de criação/edição */}
      <Modal open={showForm} onClose={() => { setShowForm(false); setEditing(null) }} title={editing ? 'Editar Categoria' : 'Nova Categoria'} className="max-w-lg">
        <CategoryForm
          initial={editing || undefined}
          onCancel={() => { setShowForm(false); setEditing(null) }}
          onSubmit={saveCategory}
        />
      </Modal>
    </div>
  )
}

function CategoryForm({ initial, onCancel, onSubmit }: { initial?: StockCategory; onCancel: () => void; onSubmit: (data: CreateStockCategoryDto | UpdateStockCategoryDto) => Promise<void> }) {
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [isActive, setIsActive] = useState(initial?.isActive ?? true)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSubmit({ name, description, isActive })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-gray-700 mb-2">Nome*</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} placeholder="Nome da categoria" />
      </div>
      <div>
        <label className="block text-sm text-gray-700 mb-2">Descrição</label>
        <textarea className="input min-h-[80px]" value={description || ''} onChange={e => setDescription(e.target.value)} placeholder="Descrição da categoria" />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" className="accent-emerald-600" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
        <span className="text-sm text-gray-700">Categoria ativa</span>
      </label>
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Salvando...' : (initial ? 'Salvar alterações' : 'Criar categoria')}</button>
      </div>
    </form>
  )
}


