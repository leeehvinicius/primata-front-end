"use client"

import React, { useEffect, useMemo, useState, useCallback } from "react"
import { useFinance } from "../../../lib/useFinance"
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_COLORS, PAYMENT_STATUS_LABELS, PAYMENT_STATUS_COLORS } from "../../../types/finance"
import type { PaymentMethod, Payment } from "../../../types/finance"

// ===== Tipos =====
type RangeKey = 'today' | 'week' | 'month' | 'custom'

// ===== Cores (mesmas do Taurin) =====
const coresPorServico: Record<string, { bg: string; border: string; text: string; chipBg: string; chipText: string; headBg: string }> = {
    'Câmara Hiperbárica': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', chipBg: 'bg-blue-100', chipText: 'text-blue-700', headBg: 'bg-blue-100' },
    'Drenagem Pós-Cirurgia': { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', chipBg: 'bg-rose-100', chipText: 'text-rose-700', headBg: 'bg-rose-100' },
    'Hingetáveis': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', chipBg: 'bg-amber-100', chipText: 'text-amber-700', headBg: 'bg-amber-100' },
    'Nutricionista': { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', chipBg: 'bg-emerald-100', chipText: 'text-emerald-700', headBg: 'bg-emerald-100' },
}

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

// ===== Utils data =====
function toISODate(d: Date) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
function startOfWeek(d: Date) { const x = new Date(d); const diff = (x.getDay() + 6) % 7; x.setDate(x.getDate() - diff); x.setHours(0, 0, 0, 0); return x }
function endOfWeek(d: Date) { const s = startOfWeek(d); const x = new Date(s); x.setDate(s.getDate() + 6); x.setHours(23, 59, 59, 999); return x }
function startOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth(), 1) }
function endOfMonth(d: Date) { return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999) }

// ===== UI bits =====
function StatBox({ title, count, total, method }: { title: string; count: number; total: number; method: PaymentMethod }) {
    const c = PAYMENT_METHOD_COLORS[method] || PAYMENT_METHOD_COLORS.OTHER
    return (
        <div className={`rounded-2xl p-4 border border-gray-200 ${c.bg}`}>
            <div className="text-xs text-gray-600">{title}</div>
            <div className="mt-1 flex items-baseline justify-between">
                <div className={`text-3xl font-bold ${c.text}`}>{BRL.format(total)}</div>
                <div className="text-gray-600 text-sm">{count}x</div>
            </div>
        </div>
    )
}

function TabelaServico({ titulo, dados }: { titulo: string; dados: Payment[] }) {
    const cores = coresPorServico[titulo] ?? {
        bg: 'bg-slate-50', border: 'border-slate-200', text: 'text-slate-800',
        chipBg: 'bg-slate-100', chipText: 'text-slate-700', headBg: 'bg-slate-100'
    }
    return (
        <div className={`rounded-2xl border ${cores.border} ${cores.bg} backdrop-blur-sm`}>
            <div className="flex items-center justify-between p-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${cores.chipBg} ${cores.chipText}`}>{titulo}</div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className={`text-left text-gray-700 ${cores.headBg}`}>
                            <th className="px-4 py-2 font-semibold">Cliente</th>
                            <th className="px-4 py-2 font-semibold">Serviço</th>
                            <th className="px-4 py-2 font-semibold">Status</th>
                            <th className="px-4 py-2 font-semibold">Pagamento</th>
                            <th className="px-4 py-2 font-semibold text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dados.map((item, i) => (
                            <tr key={item.id} className={`border-t border-gray-100 ${i % 2 ? 'bg-gray-50' : ''}`}>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-900">{item.clientId}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-gray-800">{item.serviceId}</td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${PAYMENT_STATUS_COLORS[item.paymentStatus].bg} ${PAYMENT_STATUS_COLORS[item.paymentStatus].text}`}>
                                        {PAYMENT_STATUS_LABELS[item.paymentStatus]}
                                    </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${PAYMENT_METHOD_COLORS[item.paymentMethod].bg} ${PAYMENT_METHOD_COLORS[item.paymentMethod].text}`}>
                                        {PAYMENT_METHOD_LABELS[item.paymentMethod]}
                                    </span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-right text-gray-900">{BRL.format(item.amount)}</td>
                            </tr>
                        ))}
                        {!dados.length && (
                            <tr><td colSpan={5} className="px-4 py-6 text-center text-gray-500">Sem lançamentos neste serviço</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

// ===== Página =====
export default function BillingPage() {
    const [range, setRange] = useState<RangeKey>('today')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')

    // Hook para dados financeiros
    const { 
        payments, 
        loading, 
        error, 
        paymentsByMethod, 
        updateFilters 
    } = useFinance()

    // Função para aplicar filtros com debounce
    const applyFilters = useCallback((newFrom: string, newTo: string) => {
        if (newFrom && newTo) {
            updateFilters({ startDate: newFrom, endDate: newTo })
        }
    }, [updateFilters])

    // Configurar datas iniciais apenas uma vez
    useEffect(() => {
        const now = new Date()
        if (range === 'today') {
            const s = new Date(now); s.setHours(0, 0, 0, 0)
            const e = new Date(now); e.setHours(23, 59, 59, 999)
            const newFrom = toISODate(s)
            const newTo = toISODate(e)
            setFrom(newFrom)
            setTo(newTo)
            // Aplicar filtros iniciais
            applyFilters(newFrom, newTo)
        } else if (range === 'week') {
            const newFrom = toISODate(startOfWeek(now))
            const newTo = toISODate(endOfWeek(now))
            setFrom(newFrom)
            setTo(newTo)
            applyFilters(newFrom, newTo)
        } else if (range === 'month') {
            const newFrom = toISODate(startOfMonth(now))
            const newTo = toISODate(endOfMonth(now))
            setFrom(newFrom)
            setTo(newTo)
            applyFilters(newFrom, newTo)
        }
    }, [range, applyFilters]) // range muda apenas quando o usuário seleciona

    // Aplicar filtros quando datas customizadas mudarem (com debounce)
    useEffect(() => {
        if (range === 'custom' && from && to) {
            const timeoutId = setTimeout(() => {
                applyFilters(from, to)
            }, 500) // Debounce de 500ms

            return () => clearTimeout(timeoutId)
        }
    }, [from, to, range, applyFilters])

    // Agrupar pagamentos por serviço (simulado - você pode ajustar conforme sua API)
    const porServico = useMemo(() => {
        const map: Record<string, Payment[]> = {
            'Câmara Hiperbárica': [],
            'Drenagem Pós-Cirurgia': [],
            'Hingetáveis': [],
            'Nutricionista': []
        }
        
        // Simular agrupamento por serviço - ajuste conforme sua lógica de negócio
        payments.forEach(payment => {
            // Aqui você pode implementar a lógica real de agrupamento
            // Por enquanto, vamos distribuir aleatoriamente
            const services = Object.keys(map)
            const randomService = services[Math.floor(Math.random() * services.length)]
            map[randomService].push(payment)
        })
        
        return map
    }, [payments])

    // Loading state
    if (loading && payments.length === 0) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-gray-600">Carregando dados financeiros...</div>
            </div>
        )
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-600">Erro ao carregar dados: {error}</div>
            </div>
        )
    }

    return (
        <div className="grid gap-6">
            {/* Header + filtro inline */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-semibold text-gray-900">Financeiro</h1>

                <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
                    <div className="relative">
                        <select className="input pr-10" value={range} onChange={e => setRange(e.target.value as RangeKey)}>
                            <option value="today">Hoje</option>
                            <option value="week">Semana</option>
                            <option value="month">Mês</option>
                            <option value="custom">Personalizado</option>
                        </select>
                        <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-60" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" /></svg>
                    </div>

                    {range === 'custom' && (
                        <>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 012 0v1h4V2a1 1 0 112 0v1h1.5A1.5 0 0117 4.5v12A1.5 0 0115.5 18h-11A1.5 0 013 16.5v-12A1.5 0 014.5 3H6V2zM4.5 6h11v10.5a.5.5 0 01-.5.5h-10a.5.5 0 01-.5-.5V6z" /></svg>
                                <input type="date" className="h-11 w-[12rem] rounded-xl bg-white border border-gray-300 text-gray-900 px-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={from} onChange={e => setFrom(e.target.value)} />
                            </div>
                            <span className="text-gray-500">–</span>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 012 0v1h4V2a1 1 0 112 0v1h1.5A1.5 0 0117 4.5v12A1.5 0 0115.5 18h-11A1.5 0 013 16.5v-12A1.5 0 014.5 3H6V2zM4.5 6h11v10.5a.5.5 0 01-.5.5h-10a.5.5 0 01-.5-.5V6z" /></svg>
                                <input type="date" className="h-11 w-[12rem] rounded-xl bg-white border border-gray-300 text-gray-900 px-9 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    value={to} onChange={e => setTo(e.target.value)} />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Cards de estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                {Object.entries(PAYMENT_METHOD_COLORS).map(([method]) => {
                    const data = paymentsByMethod[method as PaymentMethod] || { count: 0, total: 0 }
                    return (
                        <StatBox 
                            key={method}
                            title={PAYMENT_METHOD_LABELS[method as PaymentMethod]} 
                            method={method as PaymentMethod} 
                            count={data.count} 
                            total={data.total} 
                        />
                    )
                })}
            </div>

            {/* Tabelas por serviço */}
            <div className="grid lg:grid-cols-2 gap-4">
                {Object.entries(porServico).map(([servico, rows]) => (
                    <TabelaServico key={servico} titulo={servico} dados={rows} />
                ))}
            </div>
        </div>
    )
}
