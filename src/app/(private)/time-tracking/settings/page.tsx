'use client'
import { useEffect, useState } from 'react'
import { TimeTrackingService } from '@/lib/timeTrackingService'
import type { MyTimeTrackingSettings } from '@/types/timeTracking'

export default function MyTimeTrackingSettingsPage() {
  const [settings, setSettings] = useState<MyTimeTrackingSettings>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const load = async (): Promise<void> => {
    setLoading(true)
    setError(null)
    try {
      const s = await TimeTrackingService.getMySettings()
      setSettings(s || {})
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Erro ao carregar configurações'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setSettings(prev => ({ ...prev, [name]: value }))
  }

  const handleSave = async (): Promise<void> => {
    setSaving(true)
    setError(null)
    setSuccess(null)
    try {
      await TimeTrackingService.updateMySettings(settings)
      setSuccess('Configurações atualizadas com sucesso')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Falha ao salvar'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-6">Carregando...</div>

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Minhas Configurações de Ponto</h1>
      <div className="bg-white p-4 rounded-lg border space-y-4 max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Início do Expediente</label>
            <input name="workdayStart" value={settings.workdayStart || ''} onChange={handleChange} type="time" className="border rounded-md p-2 text-sm w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fim do Expediente</label>
            <input name="workdayEnd" value={settings.workdayEnd || ''} onChange={handleChange} type="time" className="border rounded-md p-2 text-sm w-full" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Intervalo (min)</label>
            <input name="breakMinutes" value={settings.breakMinutes ?? ''} onChange={(e) => setSettings(p => ({ ...p, breakMinutes: Number(e.target.value) }))} type="number" min={0} className="border rounded-md p-2 text-sm w-full" />
          </div>
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}
        {success && <div className="text-sm text-emerald-700">{success}</div>}

        <div className="flex gap-2">
          <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-50">
            {saving ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  )
}


