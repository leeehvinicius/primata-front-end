'use client'
import { useEffect, useMemo, useState } from 'react'
import { TimeTrackingService } from '@/lib/timeTrackingService'
import type { TimeTrackingListResponse, TimeTrackingQueryDto } from '@/types/timeTracking'
import Link from 'next/link'

export default function TimeTrackingListPage() {
  const [data, setData] = useState<TimeTrackingListResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TimeTrackingQueryDto>({ page: 1, limit: 10, sortBy: 'timestamp', sortOrder: 'desc' })

  const totalPages = useMemo(() => data?.pagination?.totalPages ?? 1, [data])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await TimeTrackingService.list(filters)
      setData(response)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao carregar registros'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.type, filters.status, filters.sortBy, filters.sortOrder])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value || undefined, page: 1 }))
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Registros de Ponto</h1>
        <div className="flex gap-2">
          <Link href="/time-tracking/register" className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700">Registrar Ponto</Link>
          <Link href="/time-tracking/settings" className="px-3 py-2 rounded-md bg-gray-100 text-gray-800 text-sm hover:bg-gray-200">Minhas Configurações</Link>
          <Link href="/time-tracking/reports" className="px-3 py-2 rounded-md bg-gray-100 text-gray-800 text-sm hover:bg-gray-200">Relatórios</Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 bg-white p-4 rounded-lg border">
        <select name="type" value={filters.type ?? ''} onChange={handleChange} className="border rounded-md p-2 text-sm">
          <option value="">Tipo</option>
          <option value="CHECK_IN">CHECK_IN</option>
          <option value="CHECK_OUT">CHECK_OUT</option>
        </select>
        <select name="status" value={filters.status ?? ''} onChange={handleChange} className="border rounded-md p-2 text-sm">
          <option value="">Status</option>
          <option value="PENDING">PENDENTE</option>
          <option value="APPROVED">APROVADO</option>
          <option value="REJECTED">REJEITADO</option>
        </select>
        <input type="date" name="startDate" value={filters.startDate || ''} onChange={handleChange} className="border rounded-md p-2 text-sm" />
        <input type="date" name="endDate" value={filters.endDate || ''} onChange={handleChange} className="border rounded-md p-2 text-sm" />
        <select name="limit" value={filters.limit} onChange={handleChange} className="border rounded-md p-2 text-sm">
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 text-xs font-semibold text-gray-600">
          <div>Data/Hora</div>
          <div>Tipo</div>
          <div>Status</div>
          <div>Ações</div>
        </div>
        {loading && <div className="p-4 text-sm">Carregando...</div>}
        {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="divide-y">
            {(data?.items ?? []).map(item => (
              <div key={item.id} className="grid grid-cols-4 gap-2 p-3 text-sm">
                <div>{new Date(item.timestamp).toLocaleString()}</div>
                <div>{item.type}</div>
                <div>{item.status}</div>
                <div className="flex gap-2">
                  <Link className="text-emerald-700 hover:underline" href={`/time-tracking/${item.id}`}>Detalhes</Link>
                </div>
              </div>
            ))}
            {(!(data && Array.isArray(data.items) && data.items.length > 0)) && (
              <div className="p-4 text-sm text-gray-500">Nenhum registro encontrado</div>
            )}
          </div>
        )}
      </div>

      {/* Paginação */}
      {data?.pagination && (
        <div className="flex items-center justify-between text-sm">
          <div>
            Página {data.pagination.page} de {data.pagination.totalPages} — Total: {data.pagination.total}
          </div>
          <div className="flex gap-2">
            <button disabled={filters.page === 1} onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) - 1 }))} className="px-3 py-1 rounded border disabled:opacity-50">Anterior</button>
            <button disabled={(filters.page || 1) >= totalPages} onClick={() => setFilters(p => ({ ...p, page: (p.page || 1) + 1 }))} className="px-3 py-1 rounded border disabled:opacity-50">Próxima</button>
          </div>
        </div>
      )}
    </div>
  )
}


