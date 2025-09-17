'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { TimeTrackingService } from '@/lib/timeTrackingService'
import type { TimeTrackingRecord, ValidateTimeTrackingDto, ValidationAction } from '@/types/timeTracking'

export default function TimeTrackingDetailPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const id = params?.id
  const [record, setRecord] = useState<TimeTrackingRecord | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [reason, setReason] = useState('')

  const load = async (): Promise<void> => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const data = await TimeTrackingService.getById(id)
      setRecord(data)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao carregar registro'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleValidate = async (action: ValidationAction): Promise<void> => {
    if (!id) return
    setActionLoading(true)
    setError(null)
    try {
      const payload: ValidateTimeTrackingDto = { timeTrackingId: id, action, reason }
      await TimeTrackingService.validate(payload)
      await load()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Falha ao validar'
      setError(message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!record) return <div className="p-6">Registro não encontrado</div>

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Detalhes do Registro</h1>
        <button onClick={() => router.push('/time-tracking')} className="px-3 py-2 rounded-md border text-sm">Voltar</button>
      </div>

      <div className="bg-white p-4 rounded-lg border grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div><span className="text-gray-500">ID:</span> {record.id}</div>
        <div><span className="text-gray-500">Usuário:</span> {record.user?.name || record.userId || '-'}</div>
        <div><span className="text-gray-500">Tipo:</span> {record.type}</div>
        <div><span className="text-gray-500">Status:</span> {record.status}</div>
        <div><span className="text-gray-500">Data/Hora:</span> {new Date(record.timestamp).toLocaleString()}</div>
        {record.location && (
          <div className="md:col-span-2"><span className="text-gray-500">Localização:</span> {record.location.latitude}, {record.location.longitude} (±{record.location.accuracy ?? '-'}m)</div>
        )}
        {record.photoUrl && (
          <div className="md:col-span-2">
            <span className="text-gray-500">Foto:</span>
            <div className="mt-2">
              {/* Using img intentionally; backend photo URLs may be external. Consider next/image if domains are configured. */}
              <img src={record.photoUrl} alt="Foto do registro" className="max-h-64 rounded border" />
            </div>
          </div>
        )}
        {record.notes && (
          <div className="md:col-span-2"><span className="text-gray-500">Observações:</span> {record.notes}</div>
        )}
      </div>

      <div className="bg-white p-4 rounded-lg border space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Motivo (opcional)</label>
            <input value={reason} onChange={(e) => setReason(e.target.value)} className="border rounded-md p-2 text-sm w-full" placeholder="Motivo da validação" />
          </div>
          <div className="flex gap-2">
            <button disabled={actionLoading} onClick={() => handleValidate('APPROVE' as ValidationAction)} className="px-3 py-2 rounded-md bg-emerald-600 text-white text-sm disabled:opacity-50">Aprovar</button>
            <button disabled={actionLoading} onClick={() => handleValidate('REJECT' as ValidationAction)} className="px-3 py-2 rounded-md bg-red-600 text-white text-sm disabled:opacity-50">Rejeitar</button>
          </div>
        </div>
      </div>
    </div>
  )
}


