'use client'
import { useState } from 'react'
import { TimeTrackingService } from '@/lib/timeTrackingService'
import type { RegisterTimeTrackingDto, TimeTrackingType } from '@/types/timeTracking'
import { useRouter } from 'next/navigation'

export default function RegisterTimeTrackingPage() {
  const router = useRouter()
  const [type, setType] = useState<TimeTrackingType>("CHECK_IN" as TimeTrackingType)
  const [notes, setNotes] = useState('')
  const [photoData, setPhotoData] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const payload: RegisterTimeTrackingDto = {
        type,
        notes,
        photoData,
        deviceInfo: typeof window !== 'undefined' ? {
          userAgent: navigator.userAgent,
          platform: (navigator as unknown as { platform?: string }).platform,
        } : undefined,
      }
      await TimeTrackingService.register(payload)
      router.push('/time-tracking')
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Falha ao registrar ponto'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Registrar Ponto</h1>
      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg border space-y-4 max-w-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value as TimeTrackingType)} className="border rounded-md p-2 text-sm w-full">
              <option value="CHECK_IN">CHECK_IN</option>
              <option value="CHECK_OUT">CHECK_OUT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Observações</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" className="border rounded-md p-2 text-sm w-full" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Foto (Base64 Data URL)</label>
          <textarea value={photoData || ''} onChange={(e) => setPhotoData(e.target.value || undefined)} placeholder="data:image/jpeg;base64,..." className="border rounded-md p-2 text-sm w-full h-24" />
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

        <div className="flex gap-2">
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-50">
            {loading ? 'Enviando...' : 'Registrar'}
          </button>
        </div>
      </form>
    </div>
  )
}


