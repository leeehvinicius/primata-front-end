'use client'
import { useEffect, useMemo, useState } from 'react'
import { AppointmentService } from '@/lib/appointmentService'
import type { AppointmentListResponse, AppointmentQueryDto, AppointmentStatus } from '@/types/appointments'

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

// Funções utilitárias
function startOfDay(d: Date) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(d: Date, days: number) {
  const x = new Date(d)
  x.setDate(x.getDate() + days)
  return x
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function formatShort(d: Date) {
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

type LayoutAppointment = {
  id: string
  title: string
  start: Date
  end: Date
  color?: string
}

function getColorByType(type?: string) {
  switch (type) {
    case 'CONSULTATION':
      return '#22c55e'
    case 'TREATMENT':
      return '#16a34a'
    case 'EMERGENCY':
      return '#ef4444'
    default:
      return '#22c55e'
  }
}

export default function AppointmentsListPage() {
  const [data, setData] = useState<AppointmentListResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AppointmentQueryDto>({ page: 1, limit: 100 })
  const [anchor, setAnchor] = useState<Date>(startOfDay(new Date()))
  const range = 7

  const hours = useMemo(() => Array.from({ length: 16 }, (_, i) => 8 + i), [])
  const days = useMemo(() => Array.from({ length: range }, (_, i) => addDays(anchor, i)), [anchor, range])

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

  const events: LayoutAppointment[] = useMemo(() => {
    return (data?.items ?? [])
      .filter(app => {
        if (filters.status && app.status !== filters.status) return false
        return true
      })
      .map(app => {
        const [startHour, startMin] = app.startTime.split(':').map(Number)
        const startDate = new Date(app.scheduledDate)
        startDate.setHours(startHour, startMin, 0, 0)

        let endDate: Date
        if (app.endTime) {
          const [endHour, endMin] = app.endTime.split(':').map(Number)
          endDate = new Date(app.scheduledDate)
          endDate.setHours(endHour, endMin, 0, 0)
        } else {
          endDate = new Date(startDate)
          endDate.setHours(endDate.getHours() + 1)
        }

        return {
          id: app.id,
          title: `${app.client?.name || app.clientId}`,
          start: startDate,
          end: endDate,
          color: getColorByType(app.appointmentType),
        }
      })
  }, [data, filters.status])

  const statsDisplay = useMemo(() => {
    const today = startOfDay(new Date())
    const todayEvents = events.filter(e => isSameDay(e.start, today))
    const weekEvents = events.filter(e => {
      const weekStart = startOfDay(anchor)
      const weekEnd = addDays(weekStart, 6)
      return e.start >= weekStart && e.start <= weekEnd
    })
    return { today: todayEvents.length, week: weekEvents.length, total: events.length, confirmed: 0 }
  }, [events, anchor])

  function next() {
    setAnchor(addDays(anchor, range))
  }
  function prev() {
    setAnchor(addDays(anchor, -range))
  }
  function todayFn() {
    setAnchor(startOfDay(new Date()))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl p-6 mb-6 border border-slate-200 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-xl">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Agendamentos</h1>
                <p className="text-slate-600">Visualização por calendário</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <button className="px-4 py-2 font-medium rounded-lg bg-gray-200 hover:bg-gray-300" onClick={todayFn}>Hoje</button>
              <button className="px-4 py-2 font-medium rounded-lg bg-gray-200 hover:bg-gray-300" onClick={prev}>◀</button>
              <div className="px-4 py-2 font-medium rounded-lg bg-gray-200">{anchor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</div>
              <button className="px-4 py-2 font-medium rounded-lg bg-gray-200 hover:bg-gray-300" onClick={next}>▶</button>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-lg border mb-6">
          <select name="status" value={filters.status ?? ''} onChange={handleChange} className="border rounded-md p-2 text-sm">
            {statusOptions.map(opt => (
              <option key={opt.label} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <input type="date" name="scheduledDate" value={filters.scheduledDate || ''} onChange={handleChange} className="border rounded-md p-2 text-sm" />
          <input type="text" placeholder="Cliente ID" name="clientId" value={filters.clientId || ''} onChange={handleChange} className="border rounded-md p-2 text-sm" />
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Hoje', value: statsDisplay.today, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
            { label: 'Esta Semana', value: statsDisplay.week, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
            { label: 'Confirmados', value: statsDisplay.confirmed, iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
            { label: 'Total', value: statsDisplay.total, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
          ].map((c, i) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl ${c.iconBg}`}>
                  <svg className={`w-6 h-6 ${c.iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-slate-600">{c.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{c.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Calendário */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm relative">
          {loading && <div className="p-4 text-sm">Carregando...</div>}
          {error && <div className="p-4 text-sm text-red-600">{error}</div>}
          {!loading && !error && (
            <>
              <div className="overflow-x-auto">
                <div>
                  <div className="grid" style={{ gridTemplateColumns: `8rem repeat(${days.length}, minmax(10rem, 1fr))` }}>
                    <div />
                    {days.map((d) => {
                      const isToday = isSameDay(d, startOfDay(new Date()))
                      return (
                        <div key={d.toISOString()} className={`px-2 pb-2 ${isToday ? 'bg-blue-50' : ''}`}>
                          <div className={`text-sm font-medium ${isToday ? 'text-blue-900' : 'text-slate-900'}`}>{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</div>
                          <div className={`text-xs ${isToday ? 'text-blue-600 font-semibold' : 'text-slate-500'}`}>{formatShort(d)}</div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="grid border-t border-slate-200 select-none" style={{ gridTemplateColumns: `8rem repeat(${days.length}, minmax(10rem, 1fr))` }}>
                    <div className="border-r border-slate-200">
                      {hours.map((h) => (
                        <div key={h} className="h-14 border-b border-slate-200 text-xs px-2 flex items-start pt-1 text-slate-500">{String(h).padStart(2, '0')}:00</div>
                      ))}
                    </div>

                    {days.map((day) => {
                      const isToday = isSameDay(day, startOfDay(new Date()))
                      return (
                        <div key={day.toISOString()} className={`${isToday ? 'bg-blue-50/40 ring-1 ring-blue-300' : ''}`}>
                          <DayColumn day={day} hours={hours} events={events.filter(e => isSameDay(e.start, day))} />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function DayColumn({ hours, events }: { day: Date; hours: number[]; events: LayoutAppointment[] }) {
  return (
    <div className="relative border-r border-slate-200 bg-gradient-to-b from-white to-slate-50" style={{ minHeight: `${3.5 * 16}rem` }}>
      <div className="absolute inset-0 z-[0] pointer-events-none">
        {hours.map((h) => (
          <div key={h} className="h-14 border-b border-slate-200" />
        ))}
      </div>
      <div className="absolute inset-0 z-[2]">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="absolute rounded-lg px-2 py-1 text-xs shadow-md ring-1 ring-black/5 select-none cursor-pointer hover:shadow-lg transition-shadow"
            style={{
              top: `${clamp((evt.start.getHours() - 8) * 3.5, 0, 56)}rem`,
              height: `${Math.max(3.5, ((evt.end.getTime() - evt.start.getTime()) / (60 * 60 * 1000)) * 3.5)}rem`,
              left: '0.25rem',
              right: '0.25rem',
              background: evt.color || '#22c55e',
              color: '#fff',
            }}
            title={`${evt.title} • ${evt.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
          >
            <div className="font-medium truncate">{evt.title}</div>
            <div className="text-[10px] opacity-95">{evt.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {evt.end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        ))}
      </div>
    </div>
  )
}


