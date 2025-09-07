"use client";

import { useEffect, useMemo, useState } from "react";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { format, subDays } from "date-fns";
import ExportPDFButton from "@/components/ExportPDFButton";
import { FinanceService } from "@/lib/financeService";
import type { Payment } from "@/types/finance";

// Paletas
const COLORS_FIN = ["#22c55e", "#3b82f6", "#eab308"]; // pix, cartão, dinheiro
const COLORS_SRV = ["#a855f7", "#ef4444", "#06b6d4"]; // serviços

// Rótulos fixos de exibição
const PAYMENT_METHOD_LABELS: Record<string, string> = {
    PIX: "Pix",
    CREDIT_CARD: "Cartão",
    DEBIT_CARD: "Cartão",
    CASH: "Dinheiro",
};

export default function DashboardPage() {
    // filtros: hoje até últimos 30 dias (default)
    const [start, setStart] = useState(format(subDays(new Date(), 30), "yyyy-MM-dd"));
    const [end, setEnd] = useState(format(new Date(), "yyyy-MM-dd"));

    // Removido: range não utilizado

    // Removido: loading não utilizado
    const [payments, setPayments] = useState<Payment[]>([]);

    // Carregar dados reais do período
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await FinanceService.getPayments({ startDate: start, endDate: end, limit: 100 });
                const list = Array.isArray(res?.payments) ? res.payments : [];
                setPayments(list as Payment[]);
            } catch {
                setPayments([]);
            }
        };
        fetchData();
    }, [start, end]);

    // Agregações
    const { finAgg, finAggCount, srvAgg, srvAggCount, totalFin } = useMemo(() => {
        // Totais por método (agrupando crédito/débito em "Cartão")
        const amountByLabel: Record<string, number> = {};
        const countByLabel: Record<string, number> = {};

        for (const p of payments) {
            const label = PAYMENT_METHOD_LABELS[p.paymentMethod] || null;
            if (!label) continue;
            const net = Math.max(0, (p.amount || 0) - (p.discountAmount || 0));
            amountByLabel[label] = (amountByLabel[label] || 0) + net;
            countByLabel[label] = (countByLabel[label] || 0) + 1;
        }

        const order = ["Pix", "Cartão", "Dinheiro"];
        const sumByMethod = order
            .filter((k) => amountByLabel[k] !== undefined)
            .map((k) => ({ name: k, value: Number((amountByLabel[k] || 0).toFixed(2)) }));
        const quantityByMethod = order
            .filter((k) => countByLabel[k] !== undefined)
            .map((k) => ({ name: k, value: countByLabel[k] || 0 }));

        // Serviços por nome (usa serviceName)
        const amountByService: Record<string, number> = {};
        const countByService: Record<string, number> = {};
        for (const p of payments) {
            const s = p.serviceName || "Outros";
            const net = Math.max(0, (p.amount || 0) - (p.discountAmount || 0));
            amountByService[s] = (amountByService[s] || 0) + net;
            countByService[s] = (countByService[s] || 0) + 1;
        }
        const sumByService = Object.keys(amountByService).map((k) => ({ name: k, value: Number(amountByService[k].toFixed(2)) }));
        const qtyByService = Object.keys(countByService).map((k) => ({ name: k, value: countByService[k] }));

        const total = Object.values(amountByLabel).reduce((a, b) => a + b, 0);

        return { finAgg: sumByMethod, finAggCount: quantityByMethod, srvAgg: sumByService, srvAggCount: qtyByService, totalFin: total };
    }, [payments]);

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
                        onExport={async () => {
                            // Implementar lógica de exportação
                            console.log('Exportando PDF...');
                        }}
                        className="ml-auto"
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
