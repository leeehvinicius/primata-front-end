"use client"

import React, { useEffect, useMemo, useState } from "react"

// ===== Tipos =====
type PaymentMethod = 'Crédito' | 'Débito' | 'PIX' | 'Dinheiro' | 'Parceria'
type RangeKey = 'today' | 'week' | 'month' | 'custom'

interface Lancamento {
    id: string
    cliente: string
    servico: string
    inicio: string // HH:mm
    fim: string    // HH:mm
    pagamento: PaymentMethod
    valor: number
    servicoKey: 'Câmara Hiperbárica' | 'Drenagem Pós-Cirurgia' | 'Hingetáveis' | 'Nutricionista'
    dia: string    // YYYY-MM-DD
}

// ===== Mock =====
const lancamentosPorServico: Record<string, Lancamento[]> = {
    'Câmara Hiperbárica': [
        { id: 'l1', cliente: 'Carlos Silva', servico: 'Sessão Hiperbárica', inicio: '08:00', fim: '08:45', pagamento: 'PIX', valor: 180, servicoKey: 'Câmara Hiperbárica', dia: '2025-08-24' },
        { id: 'l2', cliente: 'Marina Alves', servico: 'Sessão Hiperbárica', inicio: '09:00', fim: '09:45', pagamento: 'Crédito', valor: 180, servicoKey: 'Câmara Hiperbárica', dia: '2025-08-23' },
    ],
    'Drenagem Pós-Cirurgia': [
        { id: 'l3', cliente: 'Ana Souza', servico: 'Drenagem Linfática', inicio: '11:00', fim: '11:40', pagamento: 'Débito', valor: 120, servicoKey: 'Drenagem Pós-Cirurgia', dia: '2025-08-24' },
    ],
    'Hingetáveis': [
        { id: 'l4', cliente: 'João Ferreira', servico: 'Aplicação', inicio: '14:00', fim: '14:30', pagamento: 'Dinheiro', valor: 250, servicoKey: 'Hingetáveis', dia: '2025-08-22' },
        { id: 'l5', cliente: 'Rafaella Dias', servico: 'Aplicação', inicio: '16:00', fim: '16:30', pagamento: 'Parceria', valor: 0, servicoKey: 'Hingetáveis', dia: '2025-08-24' },
    ],
    'Nutricionista': [
        { id: 'l6', cliente: 'Guilherme T.', servico: 'Consulta Nutri', inicio: '09:00', fim: '09:30', pagamento: 'PIX', valor: 150, servicoKey: 'Nutricionista', dia: '2025-08-24' },
    ],
}

// ===== Cores (mesmas do Taurin) =====
const coresPorServico: Record<string, { bg: string; border: string; text: string; chipBg: string; chipText: string; headBg: string }> = {
    'Câmara Hiperbárica': { bg: 'bg-blue-900/20', border: 'border-blue-600/40', text: 'text-blue-200', chipBg: 'bg-blue-600/20', chipText: 'text-blue-300', headBg: 'bg-blue-600/10' },
    'Drenagem Pós-Cirurgia': { bg: 'bg-rose-900/20', border: 'border-rose-600/40', text: 'text-rose-200', chipBg: 'bg-rose-600/20', chipText: 'text-rose-300', headBg: 'bg-rose-600/10' },
    'Hingetáveis': { bg: 'bg-amber-900/20', border: 'border-amber-500/40', text: 'text-amber-200', chipBg: 'bg-amber-500/20', chipText: 'text-amber-300', headBg: 'bg-amber-500/10' },
    'Nutricionista': { bg: 'bg-emerald-900/20', border: 'border-emerald-600/40', text: 'text-emerald-200', chipBg: 'bg-emerald-600/20', chipText: 'text-emerald-300', headBg: 'bg-emerald-600/10' },
}

const corPagamento: Record<PaymentMethod, { bg: string; text: string; ring: string }> = {
    'Crédito': { bg: 'bg-fuchsia-600/15', text: 'text-fuchsia-300', ring: 'ring-fuchsia-500/30' },
    'Débito': { bg: 'bg-sky-600/15', text: 'text-sky-300', ring: 'ring-sky-500/30' },
    'PIX': { bg: 'bg-teal-600/15', text: 'text-teal-300', ring: 'ring-teal-500/30' },
    'Dinheiro': { bg: 'bg-lime-600/15', text: 'text-lime-300', ring: 'ring-lime-500/30' },
    'Parceria': { bg: 'bg-violet-600/15', text: 'text-violet-300', ring: 'ring-violet-500/30' },
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
    const c = corPagamento[method]
    return (
        <div className={`rounded-2xl p-4 border border-white/10 ${c.bg}`}>
            <div className="text-xs text-white/60">{title}</div>
            <div className="mt-1 flex items-baseline justify-between">
                <div className={`text-3xl font-bold ${c.text}`}>{BRL.format(total)}</div>
                <div className="text-white/60 text-sm">{count}x</div>
            </div>
        </div>
    )
}

function TabelaServico({ titulo, dados }: { titulo: string; dados: Lancamento[] }) {
    const cores = coresPorServico[titulo] ?? {
        bg: 'bg-slate-900/20', border: 'border-slate-600/40', text: 'text-slate-200',
        chipBg: 'bg-slate-600/20', chipText: 'text-slate-300', headBg: 'bg-slate-600/10'
    }
    return (
        <div className={`rounded-2xl border ${cores.border} ${cores.bg} backdrop-blur-sm`}>
            <div className="flex items-center justify-between p-4">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${cores.chipBg} ${cores.chipText}`}>{titulo}</div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className={`text-left text-white/70 ${cores.headBg}`}>
                            <th className="px-4 py-2 font-semibold">Cliente</th>
                            <th className="px-4 py-2 font-semibold">Serviço</th>
                            <th className="px-4 py-2 font-semibold">Início</th>
                            <th className="px-4 py-2 font-semibold">Fim</th>
                            <th className="px-4 py-2 font-semibold">Pagamento</th>
                            <th className="px-4 py-2 font-semibold text-right">Valor</th>
                        </tr>
                    </thead>
                    <tbody>
                        {dados.map((l, i) => (
                            <tr key={l.id} className={`border-t border-white/5 ${i % 2 ? 'bg-white/5' : ''}`}>
                                <td className="px-4 py-2 whitespace-nowrap text-white/90">{l.cliente}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-white/80">{l.servico}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-white/70">{l.inicio}</td>
                                <td className="px-4 py-2 whitespace-nowrap text-white/70">{l.fim}</td>
                                <td className="px-4 py-2 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs ${corPagamento[l.pagamento].bg} ${corPagamento[l.pagamento].text}`}>{l.pagamento}</span>
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap text-right text-white/90">{BRL.format(l.valor)}</td>
                            </tr>
                        ))}
                        {!dados.length && (
                            <tr><td colSpan={6} className="px-4 py-6 text-center text-white/50">Sem lançamentos neste serviço</td></tr>
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

    useEffect(() => {
        const now = new Date()
        if (range === 'today') {
            const s = new Date(now); s.setHours(0, 0, 0, 0)
            const e = new Date(now); e.setHours(23, 59, 59, 999)
            setFrom(toISODate(s)); setTo(toISODate(e))
        } else if (range === 'week') {
            setFrom(toISODate(startOfWeek(now))); setTo(toISODate(endOfWeek(now)))
        } else if (range === 'month') {
            setFrom(toISODate(startOfMonth(now))); setTo(toISODate(endOfMonth(now)))
        }
    }, [range])

    const filtrado = useMemo(() => {
        const flat = Object.values(lancamentosPorServico).flat()
        if (!from || !to) return flat
        return flat.filter(l => l.dia >= from && l.dia <= to)
    }, [from, to])

    const porServico = useMemo(() => {
        const map: Record<string, Lancamento[]> = {
            'Câmara Hiperbárica': [], 'Drenagem Pós-Cirurgia': [], 'Hingetáveis': [], 'Nutricionista': []
        }
        for (const l of filtrado) (map[l.servicoKey] ??= []).push(l)
        return map
    }, [filtrado])

    const totais = useMemo(() => {
        const base: Record<PaymentMethod, { count: number; total: number }> = {
            'Crédito': { count: 0, total: 0 }, 'Débito': { count: 0, total: 0 }, 'PIX': { count: 0, total: 0 }, 'Dinheiro': { count: 0, total: 0 }, 'Parceria': { count: 0, total: 0 }
        }
        for (const l of filtrado) { base[l.pagamento].count++; base[l.pagamento].total += l.valor }
        return base
    }, [filtrado])

    return (
        <div className="grid gap-6">
            {/* Header + filtro inline */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <h1 className="text-2xl font-semibold">Financeiro</h1>

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
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 012 0v1h4V2a1 1 0 112 0v1h1.5A1.5 1.5 0 0117 4.5v12A1.5 1.5 0 0115.5 18h-11A1.5 1.5 0 013 16.5v-12A1.5 1.5 0 014.5 3H6V2zM4.5 6h11v10.5a.5.5 0 01-.5.5h-10a.5.5 0 01-.5-.5V6z" /></svg>
                                <input type="date" className="h-11 w-[12rem] rounded-xl bg-slate-900/60 border border-white/20 text-white px-9 focus:outline-none focus:ring-2 focus:ring-white/30"
                                    value={from} onChange={e => setFrom(e.target.value)} />
                            </div>
                            <span className="text-white/50">–</span>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 opacity-70" viewBox="0 0 20 20" fill="currentColor"><path d="M6 2a1 1 0 012 0v1h4V2a1 1 0 112 0v1h1.5A1.5 1.5 0 0117 4.5v12A1.5 1.5 0 0115.5 18h-11A1.5 1.5 0 013 16.5v-12A1.5 1.5 0 014.5 3H6V2zM4.5 6h11v10.5a.5.5 0 01-.5.5h-10a.5.5 0 01-.5-.5V6z" /></svg>
                                <input type="date" className="h-11 w-[12rem] rounded-xl bg-slate-900/60 border border-white/20 text-white px-9 focus:outline-none focus:ring-2 focus:ring-white/30"
                                    value={to} onChange={e => setTo(e.target.value)} />
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
                <StatBox title="Crédito" method="Crédito" count={totais['Crédito'].count} total={totais['Crédito'].total} />
                <StatBox title="Débito" method="Débito" count={totais['Débito'].count} total={totais['Débito'].total} />
                <StatBox title="PIX" method="PIX" count={totais['PIX'].count} total={totais['PIX'].total} />
                <StatBox title="Dinheiro" method="Dinheiro" count={totais['Dinheiro'].count} total={totais['Dinheiro'].total} />
                <StatBox title="Parceria" method="Parceria" count={totais['Parceria'].count} total={totais['Parceria'].total} />
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
