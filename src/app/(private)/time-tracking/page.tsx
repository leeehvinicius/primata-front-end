'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { TimeTrackingService } from '@/lib/timeTrackingService'
import { UserService } from '@/lib/userService'
import type { TimeTrackingDailyByUserResponse, TimeTrackingQueryDto } from '@/types/timeTracking'
import type { User } from '@/types/users'

const formatHour = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const formatDay = (value: string): string => {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('pt-BR')
}

const formatType = (value: string): string => {
  if (value === 'CHECK_IN') return 'Entrada'
  if (value === 'CHECK_OUT') return 'Saida'
  return value
}

const formatStatus = (value: string): string => {
  if (value === 'PENDING') return 'Pendente'
  if (value === 'APPROVED') return 'Aprovado'
  if (value === 'REJECTED') return 'Rejeitado'
  return value
}

export default function TimeTrackingListPage() {
  const [data, setData] = useState<TimeTrackingDailyByUserResponse | null>(null)
  const [employees, setEmployees] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<TimeTrackingQueryDto>({
    page: 1,
    limit: 10,
    sortOrder: 'desc',
  })

  const totalPages = useMemo(() => data?.pagination?.totalPages ?? 1, [data])

  const fetchData = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await TimeTrackingService.listDailyByUser(filters)
      setData(response)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao carregar registros de ponto'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployees = async (): Promise<void> => {
    try {
      const response = await UserService.listUsers({
        page: 1,
        limit: 500,
        sortBy: 'name',
        sortOrder: 'asc',
        isActive: true,
      })
      setEmployees(Array.isArray(response.users) ? response.users : [])
    } catch {
      setEmployees([])
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.page,
    filters.limit,
    filters.userId,
    filters.type,
    filters.status,
    filters.startDate,
    filters.endDate,
    filters.sortOrder,
  ])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    const parsedValue = name === 'limit' ? Number(value) : (value || undefined)
    setFilters((prev) => ({ ...prev, [name]: parsedValue, page: 1 }))
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Registros de Ponto</h1>
        <div className="flex gap-2">
          <Link href="/time-tracking/register" className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700">Registrar Ponto</Link>
          <Link href="/time-tracking/settings" className="px-3 py-2 rounded-md bg-gray-100 text-gray-800 text-sm hover:bg-gray-200">Minhas Configuracoes</Link>
          <Link href="/time-tracking/reports" className="px-3 py-2 rounded-md bg-gray-100 text-gray-800 text-sm hover:bg-gray-200">Relatorios</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 bg-white p-4 rounded-lg border">
        <select name="userId" value={filters.userId ?? ''} onChange={handleChange} className="border rounded-md p-2 text-sm">
          <option value="">Funcionario</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>{employee.name}</option>
          ))}
        </select>
        <select name="type" value={filters.type ?? ''} onChange={handleChange} className="border rounded-md p-2 text-sm">
          <option value="">Tipo</option>
          <option value="CHECK_IN">Entrada</option>
          <option value="CHECK_OUT">Saida</option>
        </select>
        <select name="status" value={filters.status ?? ''} onChange={handleChange} className="border rounded-md p-2 text-sm">
          <option value="">Status</option>
          <option value="PENDING">Pendente</option>
          <option value="APPROVED">Aprovado</option>
          <option value="REJECTED">Rejeitado</option>
        </select>
        <input type="date" name="startDate" value={filters.startDate || ''} onChange={handleChange} className="border rounded-md p-2 text-sm" />
        <input type="date" name="endDate" value={filters.endDate || ''} onChange={handleChange} className="border rounded-md p-2 text-sm" />
        <select name="limit" value={filters.limit} onChange={handleChange} className="border rounded-md p-2 text-sm">
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 text-xs font-semibold text-gray-600">
          <div>Funcionario</div>
          <div>Dia</div>
          <div>Pontos do dia</div>
          <div>Acoes</div>
        </div>
        {loading && <div className="p-4 text-sm">Carregando...</div>}
        {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="divide-y">
            {(data?.items ?? []).map((group) => (
              <div key={`${group.userId}-${group.date}`} className="grid grid-cols-4 gap-2 p-3 text-sm">
                <div className="font-medium">{group.userName || 'Sem nome'}</div>
                <div>{formatDay(group.date)}</div>
                <div className="flex flex-wrap gap-2">
                  {(group.records ?? []).map((record) => (
                    <span key={record.id} className="px-2 py-1 rounded-md bg-gray-100 border text-xs">
                      {formatHour(record.timestamp)} - {formatType(record.type)} - {formatStatus(record.status)}
                    </span>
                  ))}
                  {(!(Array.isArray(group.records) && group.records.length > 0)) && <span className="text-gray-500">Sem pontos</span>}
                </div>
                <div className="flex flex-col gap-1">
                  {(group.records ?? []).map((record) => (
                    <Link key={`${group.userId}-${group.date}-${record.id}`} className="text-emerald-700 hover:underline text-xs" href={`/time-tracking/${record.id}`}>
                      {formatHour(record.timestamp)} - Detalhes
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            {(!(data && Array.isArray(data.items) && data.items.length > 0)) && (
              <div className="p-4 text-sm text-gray-500">Nenhum registro encontrado</div>
            )}
          </div>
        )}
      </div>

      {data?.pagination && (
        <div className="flex items-center justify-between text-sm">
          <div>
            Pagina {data.pagination.page} de {data.pagination.totalPages} - Total: {data.pagination.total}
          </div>
          <div className="flex gap-2">
            <button
              disabled={filters.page === 1}
              onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              disabled={(filters.page || 1) >= totalPages}
              onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}
              className="px-3 py-1 rounded border disabled:opacity-50"
            >
              Proxima
            </button>
          </div>
        </div>
      )}
    </div>
  )
}