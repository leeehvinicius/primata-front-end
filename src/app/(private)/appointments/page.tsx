'use client'
import { useEffect, useMemo, useState } from 'react'
import { AppointmentService } from '@/lib/appointmentService'
import type { Appointment, AppointmentListResponse, AppointmentQueryDto, AppointmentStatus } from '@/types/appointments'

const statusOptions: { value: AppointmentStatus | ''; label: string }[] = [
  { value: '', label: 'Todos' },
  { value: 'SCHEDULED' as AppointmentStatus, label: 'Agendado' },
  { value: 'CONFIRMED' as AppointmentStatus, label: 'Confirmado' },
  { value: 'IN_PROGRESS' as AppointmentStatus, label: 'Em andamento' },
  { value: 'COMPLETED' as AppointmentStatus, label: 'Concluído' },
  { value: 'CANCELLED' as AppointmentStatus, label: 'Cancelado' },
  { value: 'NO_SHOW' as AppointmentStatus, label: 'Não compareceu' },
  { value: 'RESCHEDULED' as AppointmentStatus, label: 'Remarcado' },
  { value: 'WAITING' as AppointmentStatus, label: 'Aguardando' },
]

export default function AppointmentsListPage() {
  const [data, setData] = useState<AppointmentListResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AppointmentQueryDto>({ page: 1, limit: 10 })

  const totalPages = useMemo(() => data?.pagination?.totalPages ?? 1, [data])

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await AppointmentService.list(filters)
      setData(response)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao carregar agendamentos'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.limit, filters.status, filters.scheduledDate])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value || undefined, page: 1 }))
  }

  const formatDateTime = (date: string | undefined, time: string | undefined) => {
    if (!date) return '-'
    return `${new Date(date).toLocaleDateString('pt-BR')}${time ? ` ${time}` : ''}`
  }

  const statusLabel: Record<string, string> = {
    SCHEDULED: 'Agendado',
    CONFIRMED: 'Confirmado',
    IN_PROGRESS: 'Em andamento',
    COMPLETED: 'Concluído',
    CANCELLED: 'Cancelado',
    NO_SHOW: 'Não compareceu',
    RESCHEDULED: 'Remarcado',
    WAITING: 'Aguardando',
  }

  const typeLabel: Record<string, string> = {
    CONSULTATION: 'Consulta',
    TREATMENT: 'Tratamento',
    PROCEDURE: 'Procedimento',
    FOLLOW_UP: 'Retorno',
    EMERGENCY: 'Emergência',
    MAINTENANCE: 'Manutenção',
    EVALUATION: 'Avaliação',
    OTHER: 'Outro',
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Agendamentos</h1>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-white p-4 rounded-lg border">
        <select name="status" value={filters.status ?? ''} onChange={handleChange} className="border rounded-md p-2 text-sm">
          {statusOptions.map(opt => (
            <option key={opt.label} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <input type="date" name="scheduledDate" value={filters.scheduledDate || ''} onChange={handleChange} className="border rounded-md p-2 text-sm" />
        <input type="text" placeholder="Cliente ID" name="clientId" value={filters.clientId || ''} onChange={handleChange} className="border rounded-md p-2 text-sm" />
        <select name="limit" value={filters.limit} onChange={handleChange} className="border rounded-md p-2 text-sm">
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="grid grid-cols-6 gap-2 p-3 bg-gray-50 text-xs font-semibold text-gray-600">
          <div>Data/Hora</div>
          <div>Cliente</div>
          <div>Serviço</div>
          <div>Profissional</div>
          <div>Status</div>
          <div>Tipo</div>
        </div>
        {loading && <div className="p-4 text-sm">Carregando...</div>}
        {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="divide-y">
            {(data?.items ?? []).map((item: Appointment) => (
              <div key={item.id} className="grid grid-cols-6 gap-2 p-3 text-sm">
                <div>{formatDateTime(item.scheduledDate, item.startTime)}</div>
                <div>{item.client?.name || item.clientId}</div>
                <div>{item.service?.name || item.serviceId}</div>
                <div>{item.professional?.name || '-'}</div>
                <div>{statusLabel[item.status] || item.status}</div>
                <div>{typeLabel[item.appointmentType] || item.appointmentType}</div>
              </div>
            ))}
            {(!(data && Array.isArray(data.items) && data.items.length > 0)) && (
              <div className="p-4 text-sm text-gray-500">Nenhum agendamento encontrado</div>
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


