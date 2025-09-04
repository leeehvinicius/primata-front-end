"use client";

import { useMemo, useState } from "react";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { format, subDays, parseISO, isWithinInterval } from "date-fns";
import ExportPDFButton from "@/components/ExportPDFButton";

// Paletas
const COLORS_FIN = ["#22c55e", "#3b82f6", "#eab308"]; // pix, cartão, dinheiro
const COLORS_SRV = ["#a855f7", "#ef4444", "#06b6d4"]; // serviços

// Nomes fixos
const PAYMENT_METHODS = ["Pix", "Cartão", "Dinheiro"] as const;
const SERVICES = ["Limpeza de Pele", "Massagem Relaxante", "Depilação a Laser"] as const;

type Payment = typeof PAYMENT_METHODS[number];
type Service = typeof SERVICES[number];

type Transaction = {
    date: string;       // ISO
    method: Payment;
    value: number;      // R$
};

type Appointment = {
    date: string;       // ISO
    service: Service;
    value: number;      // ticket médio
};

// Gera dados "bonitos" para os últimos N dias
function generateMockData(days = 120) {
    const txs: Transaction[] = [];
    const appts: Appointment[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
        const d = subDays(today, i);
        const iso = d.toISOString();

        // volume financeiro diário
        const baseFin = 10 + Math.floor(Math.random() * 20); // 10~30 registros
        for (let j = 0; j < baseFin; j++) {
            const method = weightedPick<Payment>([
                ["Pix", 0.52],
                ["Cartão", 0.35],
                ["Dinheiro", 0.13],
            ]);
            const value = randomBetween(40, 450);
            txs.push({ date: iso, method, value });
        }

        // volume de serviços diário
        const baseSrv = 6 + Math.floor(Math.random() * 12); // 6~18 atendimentos
        for (let k = 0; k < baseSrv; k++) {
            const service = weightedPick<Service>([
                ["Limpeza de Pele", 0.42],
                ["Massagem Relaxante", 0.33],
                ["Depilação a Laser", 0.25],
            ]);
            const value =
                service === "Depilação a Laser" ? randomBetween(180, 650) :
                    service === "Massagem Relaxante" ? randomBetween(90, 280) :
                        randomBetween(70, 220);
            appts.push({ date: iso, service, value });
        }
    }

    return { txs, appts };
}

function randomBetween(min: number, max: number) {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function weightedPick<T>(pairs: [T, number][]): T {
    const r = Math.random();
    let acc = 0;
    for (const [item, w] of pairs) {
        acc += w;
        if (r <= acc) return item;
    }
    return pairs[pairs.length - 1][0];
}

const MOCK = generateMockData();

export default function DashboardPage() {
    // filtros: hoje até últimos 30 dias (default)
    const [start, setStart] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
    const [end, setEnd] = useState(format(new Date(), "yyyy-MM-dd"));

    const range = useMemo(() => {
        const startDate = parseISO(new Date(start).toISOString());
        const endDate = parseISO(new Date(end + "T23:59:59").toISOString());
        return { startDate, endDate };
    }, [start, end]);

    // aplica filtro no mock
    const { finAgg, finAggCount, srvAgg, srvAggCount, totalFin } = useMemo(() => {
        const inRange = (iso: string) =>
            isWithinInterval(parseISO(iso), { start: range.startDate, end: range.endDate });

        const tx = MOCK.txs.filter(t => inRange(t.date));
        const ap = MOCK.appts.filter(a => inRange(a.date));

        // Financeiro: soma por método
        const sumByMethod = PAYMENT_METHODS.map(m => ({
            name: m,
            value: Number(tx.filter(t => t.method === m).reduce((acc, t) => acc + t.value, 0).toFixed(2)),
        }));
        const countByMethod = PAYMENT_METHODS.map(m => ({
            name: m,
            value: tx.filter(t => t.method === m).length,
        }));
        const total = Number(tx.reduce((acc, t) => acc + t.value, 0).toFixed(2));

        // Serviços: soma por serviço
        const sumByService = SERVICES.map(s => ({
            name: s,
            value: Number(ap.filter(a => a.service === s).reduce((acc, a) => acc + a.value, 0).toFixed(2)),
        }));
        const countByService = SERVICES.map(s => ({
            name: s,
            value: ap.filter(a => a.service === s).length,
        }));

        return {
            finAgg: sumByMethod,
            finAggCount: countByMethod,
            srvAgg: sumByService,
            srvAggCount: countByService,
            totalFin: total,
        };
    }, [range]);

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <div className="flex flex-wrap gap-3 items-end">
                <div>
                    <label className="block text-sm text-gray-600 mb-1">De</label>
                    <input
                        type="date"
                        value={start}
                        max={end}
                        onChange={(e) => setStart(e.target.value)}
                        className="bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Até</label>
                    <input
                        type="date"
                        value={end}
                        min={start}
                        onChange={(e) => setEnd(e.target.value)}
                        className="bg-white border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="ml-auto flex gap-2">
                    <PresetButton label="7 dias" onClick={() => {
                        setStart(format(subDays(new Date(), 7), "yyyy-MM-dd"));
                        setEnd(format(new Date(), "yyyy-MM-dd"));
                    }} />
                    <PresetButton label="30 dias" onClick={() => {
                        setStart(format(subDays(new Date(), 30), "yyyy-MM-dd"));
                        setEnd(format(new Date(), "yyyy-MM-dd"));
                    }} />
                    <PresetButton label="90 dias" onClick={() => {
                        setStart(format(subDays(new Date(), 90), "yyyy-MM-dd"));
                        setEnd(format(new Date(), "yyyy-MM-dd"));
                    }} />

                    {/* Botão Exportar PDF */}
                    <ExportPDFButton
                        targetId="dash-export"
                        filename={`primata-dashboard_${start}_a_${end}.pdf`}
                        label="Exportar PDF"
                        landscape
                    />
                </div>
            </div>
            <div id="dash-export" className="space-y-6">
                {/* Bloco Financeiro */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Financeiro</h2>
                        <div className="text-sm text-gray-600">
                            Total no período: <span className="text-gray-900 font-semibold">R$ {totalFin.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <ChartCard title="Participação por método (R$)">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={finAgg}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={110}
                                        innerRadius={60}
                                        paddingAngle={2}
                                    >
                                        {finAgg.map((_, i) => <Cell key={i} fill={COLORS_FIN[i % COLORS_FIN.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Quantidade por método">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={finAggCount} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                                    <YAxis tick={{ fill: "#6b7280" }} />
                                    <Tooltip />
                                    <Bar dataKey="value">
                                        {finAggCount.map((_, i) => <Cell key={i} fill={COLORS_FIN[i % COLORS_FIN.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                </section>

                {/* Bloco Serviços */}
                <section className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-900">Serviços</h2>

                    <div className="grid lg:grid-cols-2 gap-6">
                        <ChartCard title="Participação por serviço (R$)">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={srvAgg}
                                        dataKey="value"
                                        nameKey="name"
                                        outerRadius={110}
                                        innerRadius={60}
                                        paddingAngle={2}
                                    >
                                        {srvAgg.map((_, i) => <Cell key={i} fill={COLORS_SRV[i % COLORS_SRV.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Quantidade por serviço">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={srvAggCount} barSize={32}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tick={{ fill: "#6b7280" }} />
                                    <YAxis tick={{ fill: "#6b7280" }} />
                                    <Tooltip />
                                    <Bar dataKey="value">
                                        {srvAggCount.map((_, i) => <Cell key={i} fill={COLORS_SRV[i % COLORS_SRV.length]} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                </section>
            </div>
        </div>
    );
}

// Botão de preset
function PresetButton({ label, onClick }: { label: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="px-3 py-2 rounded-lg border border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition text-sm text-gray-700"
        >
            {label}
        </button>
    );
}

// Card genérico
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{title}</h3>
            </div>
            {children}
        </div>
    );
}
