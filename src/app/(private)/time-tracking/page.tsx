'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { TimeTrackingService } from '@/lib/timeTrackingService'
import { UserService } from '@/lib/userService'
import type {
  TimeTrackingDailyByUserResponse,
  TimeTrackingQueryDto,
  TimeTrackingRecord,
  ValidateTimeTrackingDto,
  ValidationAction,
} from '@/types/timeTracking'
import type { User } from '@/types/users'

const formatHour = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

const formatDateTime = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('pt-BR')
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

const formatDateInput = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function TimeTrackingListPage() {
  const [data, setData] = useState<TimeTrackingDailyByUserResponse | null>(null)
  const [employees, setEmployees] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<TimeTrackingRecord | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [validationReason, setValidationReason] = useState('')

  const [filters, setFilters] = useState<TimeTrackingQueryDto>(() => {
    const today = new Date()
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
    return {
      page: 1,
      limit: 500,
      sortOrder: 'desc',
      startDate: formatDateInput(firstDay),
      endDate: formatDateInput(today),
    }
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

  const openDetailsModal = async (id: string): Promise<void> => {
    setIsModalOpen(true)
    setDetailLoading(true)
    setDetailError(null)
    setSelectedRecord(null)
    setValidationReason('')
    try {
      const record = await TimeTrackingService.getById(id)
      setSelectedRecord(record)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao carregar detalhes do registro'
      setDetailError(message)
    } finally {
      setDetailLoading(false)
    }
  }

  const closeDetailsModal = (): void => {
    setIsModalOpen(false)
    setDetailError(null)
    setSelectedRecord(null)
    setValidationReason('')
  }

  const handleValidate = async (action: ValidationAction): Promise<void> => {
    if (!selectedRecord) return

    setActionLoading(true)
    setDetailError(null)
    try {
      const payload: ValidateTimeTrackingDto = {
        timeTrackingId: selectedRecord.id,
        action,
        reason: validationReason || undefined,
      }
      await TimeTrackingService.validate(payload)

      const updated = await TimeTrackingService.getById(selectedRecord.id)
      setSelectedRecord(updated)
      await fetchData()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Falha ao validar registro'
      setDetailError(message)
    } finally {
      setActionLoading(false)
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
    <>
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
            <option value={500}>500</option>
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
                      <button
                        key={`${group.userId}-${group.date}-${record.id}`}
                        type="button"
                        onClick={() => openDetailsModal(record.id)}
                        className="text-left text-emerald-700 hover:underline text-xs"
                      >
                        {formatHour(record.timestamp)} - Ver detalhes
                      </button>
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 p-4 sm:p-6" onClick={closeDetailsModal}>
          <div
            className="mx-auto mt-4 sm:mt-8 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-semibold">Detalhes do Registro</h2>
              <button type="button" onClick={closeDetailsModal} className="px-2 py-1 rounded border text-sm hover:bg-gray-50">
                Fechar
              </button>
            </div>

            <div className="p-4 space-y-4">
              {detailLoading && <div className="text-sm">Carregando detalhes...</div>}
              {detailError && <div className="text-sm text-red-600">{detailError}</div>}

              {!detailLoading && !detailError && selectedRecord && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">ID:</span> {selectedRecord.id}</div>
                    <div><span className="text-gray-500">Usuario:</span> {selectedRecord.user?.name || selectedRecord.userId || '-'}</div>
                    <div><span className="text-gray-500">Tipo:</span> {formatType(selectedRecord.type)}</div>
                    <div><span className="text-gray-500">Status:</span> {formatStatus(selectedRecord.status)}</div>
                    <div className="md:col-span-2"><span className="text-gray-500">Data/Hora:</span> {formatDateTime(selectedRecord.timestamp)}</div>
                    {selectedRecord.location && (
                      <div className="md:col-span-2">
                        <span className="text-gray-500">Localizacao:</span> {selectedRecord.location.latitude}, {selectedRecord.location.longitude} (+/-{selectedRecord.location.accuracy ?? '-'}m)
                      </div>
                    )}
                    {selectedRecord.notes && (
                      <div className="md:col-span-2"><span className="text-gray-500">Observacoes:</span> {selectedRecord.notes}</div>
                    )}
                  </div>

                  <div className="rounded-lg border p-3">
                    <p className="text-sm text-gray-600 mb-2">Foto do registro</p>
                    {selectedRecord.photoUrl ? (
                      <img
                        src={selectedRecord.photoUrl}
                        alt="Foto do registro"
                        className="max-h-80 w-auto rounded-lg border"
                      />
                    ) : (
                      <p className="text-sm text-gray-500">Sem foto para este registro.</p>
                    )}
                  </div>

                  <div className="rounded-lg border p-3 space-y-3">
                    <p className="text-sm font-medium">Validacao</p>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Motivo (opcional)</label>
                      <input
                        value={validationReason}
                        onChange={(e) => setValidationReason(e.target.value)}
                        className="w-full border rounded-md p-2 text-sm"
                        placeholder="Motivo da validacao"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleValidate('APPROVE' as ValidationAction)}
                        className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm disabled:opacity-50"
                      >
                        Aprovar
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleValidate('REJECT' as ValidationAction)}
                        className="px-3 py-2 rounded-md bg-red-600 text-white text-sm disabled:opacity-50"
                      >
                        Rejeitar
                      </button>
                      <Link
                        href={`/time-tracking/${selectedRecord.id}`}
                        className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
                      >
                        Abrir pagina completa
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}