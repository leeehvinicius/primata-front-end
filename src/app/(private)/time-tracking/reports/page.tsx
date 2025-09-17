'use client'
import { useCallback, useEffect, useState } from 'react'
import { TimeTrackingService } from '@/lib/timeTrackingService'
import type { GenerateTimeTrackingReportDto, TimeTrackingReportListResponse } from '@/types/timeTracking'

export default function TimeTrackingReportsPage() {
  const [list, setList] = useState<TimeTrackingReportListResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters] = useState<{ userId?: string; status?: string; startDate?: string; endDate?: string }>({})
  const [form, setForm] = useState<GenerateTimeTrackingReportDto>({ userId: '', periodStart: '', periodEnd: '' })
  const [generating, setGenerating] = useState(false)

  const load = useCallback(async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const response = await TimeTrackingService.listReports(filters)
      setList(response)
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao listar relatórios'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { load() }, [load])

  const handleGenerate = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault()
    setGenerating(true)
    setError(null)
    try {
      await TimeTrackingService.generateReport(form)
      setForm({ userId: '', periodStart: '', periodEnd: '' })
      await load()
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Falha ao gerar relatório'
      setError(message)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Relatórios de Ponto</h1>

      <form onSubmit={handleGenerate} className="bg-white p-4 rounded-lg border grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
        <input value={form.userId} onChange={(e) => setForm(p => ({ ...p, userId: e.target.value }))} placeholder="User ID" className="border rounded-md p-2" />
        <input type="date" value={form.periodStart} onChange={(e) => setForm(p => ({ ...p, periodStart: e.target.value }))} className="border rounded-md p-2" />
        <input type="date" value={form.periodEnd} onChange={(e) => setForm(p => ({ ...p, periodEnd: e.target.value }))} className="border rounded-md p-2" />
        <button type="submit" disabled={generating} className="px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">{generating ? 'Gerando...' : 'Gerar Relatório'}</button>
      </form>

      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="grid grid-cols-4 gap-2 p-3 bg-gray-50 text-xs font-semibold text-gray-600">
          <div>ID</div>
          <div>Status</div>
          <div>Período</div>
          <div>Ações</div>
        </div>
        {loading && <div className="p-4 text-sm">Carregando...</div>}
        {error && <div className="p-4 text-sm text-red-600">{error}</div>}
        {!loading && !error && (
          <div className="divide-y">
            {(list?.items ?? []).map((r) => (
              <div key={r.id} className="grid grid-cols-4 gap-2 p-3 text-sm">
                <div>{r.id}</div>
                <div>{r.status}</div>
                <div>{r.period ? `${r.period.start} → ${r.period.end}` : '-'}</div>
                <div className="flex gap-2">
                  <button onClick={async () => { await TimeTrackingService.approveReport(r.id); await load() }} className="text-emerald-700 hover:underline">Aprovar</button>
                </div>
              </div>
            ))}
            {(!(list && Array.isArray(list.items) && list.items.length > 0)) && (
              <div className="p-4 text-sm text-gray-500">Nenhum relatório encontrado</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


