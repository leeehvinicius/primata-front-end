"use client";

import { useEffect, useMemo, useState } from "react";
import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { format, subDays } from "date-fns";
import ExportPDFButton from "@/components/ExportPDFButton";
import { FinanceService } from "@/lib/financeService";
import { PartnerService } from "@/lib/partnerService";
import type { Payment, PaymentFilters } from "@/types/finance";
import type { Partner } from "@/types/partners";

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
    // Por padrão, não usar filtros de data para mostrar todos os dados recentes
    const [start, setStart] = useState<string>("");
    const [end, setEnd] = useState<string>("");

    // Removido: range não utilizado

    // Removido: loading não utilizado
    const [payments, setPayments] = useState<Payment[]>([]);
    const [partners, setPartners] = useState<Partner[]>([]);

    // Carregar dados reais do período
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Se há filtros de data, usar eles, senão buscar todos
                const filters: PaymentFilters = {
                    limit: 100,
                    page: 1
                };
                
                if (start && end) {
                    filters.startDate = start;
                    filters.endDate = end;
                }
                
                const res = await FinanceService.getPayments(filters);
                
                console.log('Dashboard - Full response:', res);
                console.log('Dashboard - res.payments:', res?.payments);
                
                const list = Array.isArray(res?.payments) ? res.payments : [];
                console.log('Payments loaded:', list.length, list);
                setPayments(list as Payment[]);
            } catch (error) {
                console.error('Error loading payments:', error);
                setPayments([]);
            }
        };
        fetchData();
    }, [start, end]);

    // Carregar parceiros
    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await PartnerService.listPartners();
                const partnersList = Array.isArray(res?.partners) ? res.partners : [];
                setPartners(partnersList);
            } catch {
                setPartners([]);
            }
        };
        fetchPartners();
    }, []);

    // Agregações
    const { finAgg, finAggCount, srvAgg, srvAggCount, totalFin, partnerPayments } = useMemo(() => {
        // Totais por método (agrupando crédito/débito em "Cartão")
        const amountByLabel: Record<string, number> = {};
        const countByLabel: Record<string, number> = {};

        for (const p of payments) {
            const label = PAYMENT_METHOD_LABELS[p.paymentMethod] || null;
            if (!label) continue;
            
            // Converter amount para número se for string
            const amount = typeof p.amount === 'string' ? parseFloat(p.amount) || 0 : (p.amount || 0);
            
            // Usar finalAmount se disponível, senão calcular
            let net = amount;
            if (p.finalAmount) {
                net = typeof p.finalAmount === 'string' ? parseFloat(p.finalAmount) || 0 : (p.finalAmount || 0);
            } else {
                // Calcular desconto total
                const partnerDisc = typeof p.partnerDiscount === 'string' 
                    ? parseFloat(p.partnerDiscount) || 0 
                    : (p.partnerDiscount || 0);
                const clientDisc = typeof p.clientDiscount === 'string' 
                    ? parseFloat(p.clientDiscount) || 0 
                    : (p.clientDiscount || 0);
                const discountAmount = p.discountAmount || 0;
                net = Math.max(0, amount - discountAmount - (partnerDisc + clientDisc));
            }
            
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

        // Serviços por nome (usa service.name ou serviceName)
        const amountByService: Record<string, number> = {};
        const countByService: Record<string, number> = {};
        for (const p of payments) {
            const s = p.service?.name || p.serviceName || "Outros";
            
            // Converter amount para número se for string
            const amount = typeof p.amount === 'string' ? parseFloat(p.amount) || 0 : (p.amount || 0);
            
            // Usar finalAmount se disponível, senão calcular
            let net = amount;
            if (p.finalAmount) {
                net = typeof p.finalAmount === 'string' ? parseFloat(p.finalAmount) || 0 : (p.finalAmount || 0);
            } else {
                const partnerDisc = typeof p.partnerDiscount === 'string' 
                    ? parseFloat(p.partnerDiscount) || 0 
                    : (p.partnerDiscount || 0);
                const clientDisc = typeof p.clientDiscount === 'string' 
                    ? parseFloat(p.clientDiscount) || 0 
                    : (p.clientDiscount || 0);
                const discountAmount = p.discountAmount || 0;
                net = Math.max(0, amount - discountAmount - (partnerDisc + clientDisc));
            }
            
            amountByService[s] = (amountByService[s] || 0) + net;
            countByService[s] = (countByService[s] || 0) + 1;
        }
        const sumByService = Object.keys(amountByService).map((k) => ({ name: k, value: Number(amountByService[k].toFixed(2)) }));
        const qtyByService = Object.keys(countByService).map((k) => ({ name: k, value: countByService[k] }));

        const total = Object.values(amountByLabel).reduce((a, b) => a + b, 0);

        // Agregação por parceiro - calcular valores a pagar
        const partnerData: Record<string, { 
            name: string; 
            totalAmount: number; 
            totalToPay: number; 
            averageDiscount: number;
            paymentCount: number;
            partnerDiscount: number;
        }> = {};

        // Inicializar com todos os parceiros ativos
        partners.forEach(partner => {
            if (partner.isActive) {
                partnerData[partner.id] = {
                    name: partner.name,
                    totalAmount: 0,
                    totalToPay: 0,
                    averageDiscount: partner.partnerDiscount,
                    paymentCount: 0,
                    partnerDiscount: partner.partnerDiscount
                };
            }
        });

        // Processar pagamentos e calcular valores
        for (const p of payments) {
            // Verificar se tem parceiro associado - pode vir de partnerName ou appointment.partner
            let partnerName: string | null = null;
            let partnerId: string | null = null;
            
            // Primeiro tenta pegar do partnerName direto
            if (p.partnerName) {
                partnerName = p.partnerName;
            } 
            // Se não tiver, tenta pegar do appointment.partner
            else if (p.appointment?.partner) {
                const appointmentPartner = p.appointment.partner;
                if (appointmentPartner && appointmentPartner.name) {
                    partnerName = appointmentPartner.name;
                    partnerId = appointmentPartner.id;
                }
            }

            // Converter partnerDiscount para número se for string
            let partnerDiscount = typeof p.partnerDiscount === 'string' 
                ? parseFloat(p.partnerDiscount) || 0 
                : (p.partnerDiscount || 0);

            // Se não encontrou parceiro, mas tem partnerDiscount > 0, ainda processa
            // (pode ser um desconto de parceiro sem nome associado)
            if (!partnerName) {
                if (partnerDiscount > 0) {
                    // Criar um registro genérico para descontos sem parceiro identificado
                    partnerName = "Parceiro não identificado";
                    partnerId = "unknown_" + partnerDiscount;
                } else {
                    continue;
                }
            }

            // Buscar parceiro pelo nome ou ID
            const foundPartner = partners.find(partner => 
                partner.name === partnerName || 
                partner.id === partnerId ||
                partner.id === partnerName
            );

            // Se não encontrou o parceiro na lista, ainda assim processa com o nome
            if (!foundPartner && partnerName && partnerName !== "Parceiro não identificado") {
                // Usa o nome como chave
                partnerId = partnerName;
            } else if (foundPartner) {
                partnerId = foundPartner.id;
                partnerName = foundPartner.name;
                // Se não tiver desconto no pagamento, usar do parceiro encontrado
                if (partnerDiscount === 0) {
                    partnerDiscount = foundPartner.partnerDiscount;
                }
            } else if (partnerName === "Parceiro não identificado") {
                // Mantém o ID gerado
            }

            // Converter amount para número se for string
            const amount = typeof p.amount === 'string' 
                ? parseFloat(p.amount) || 0 
                : (p.amount || 0);
            
            // Calcular valor a pagar ao parceiro (percentual do valor original)
            const toPay = (amount * partnerDiscount) / 100;

            const key = partnerId || partnerName;
            if (!partnerData[key]) {
                partnerData[key] = {
                    name: partnerName,
                    totalAmount: 0,
                    totalToPay: 0,
                    averageDiscount: partnerDiscount,
                    paymentCount: 0,
                    partnerDiscount: partnerDiscount
                };
            }

            partnerData[key].totalAmount += amount;
            partnerData[key].totalToPay += toPay;
            partnerData[key].paymentCount += 1;
        }

        // Calcular média de desconto por parceiro e ordenar
        const partnerPaymentsList = Object.values(partnerData)
            .map(partner => ({
                ...partner,
                averageDiscount: partner.totalAmount > 0 
                    ? (partner.totalToPay / partner.totalAmount) * 100 
                    : partner.partnerDiscount
            }))
            .sort((a, b) => b.totalToPay - a.totalToPay);

        // Debug: log para verificar dados
        if (partnerPaymentsList.length > 0) {
            console.log('Partner payments found:', partnerPaymentsList);
        } else {
            console.log('No partner payments:', { 
                paymentsCount: payments.length, 
                partnersCount: partners.length,
                paymentsWithPartner: payments.filter(p => p.partnerName || p.appointment?.partner).length
            });
        }

        return { 
            finAgg: sumByMethod, 
            finAggCount: quantityByMethod, 
            srvAgg: sumByService, 
            srvAggCount: qtyByService, 
            totalFin: total,
            partnerPayments: partnerPaymentsList
        };
    }, [payments, partners]);

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
                    <PresetButton label="Todos" onClick={() => {
                        setStart("");
                        setEnd("");
                    }} />
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

                {/* Bloco Parceiros - Valores a Pagar */}
                <section className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold text-gray-900">Pagamentos aos Parceiros</h2>
                        <div className="text-sm text-gray-600">
                            Total a pagar: <span className="text-gray-900 font-semibold">
                                R$ {partnerPayments.reduce((sum, p) => sum + p.totalToPay, 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                        {partnerPayments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="text-gray-700 border-b border-gray-200">
                                        <tr>
                                            <th className="py-3 pr-4 font-medium">Parceiro</th>
                                            <th className="py-3 pr-4 font-medium text-right">Percentual</th>
                                            <th className="py-3 pr-4 font-medium text-right">Valor Total</th>
                                            <th className="py-3 pr-4 font-medium text-right">A Pagar</th>
                                            <th className="py-3 pr-0 font-medium text-center">Transações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {partnerPayments
                                            .filter(p => p.totalToPay > 0 || p.paymentCount > 0)
                                            .map((partner, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <td className="py-4 pr-4">
                                                    <div className="font-medium text-gray-900">{partner.name}</div>
                                                </td>
                                                <td className="py-4 pr-4 text-right">
                                                    <span className="text-gray-900 font-semibold">
                                                        {partner.averageDiscount.toFixed(2)}%
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-4 text-right">
                                                    <span className="text-gray-700">
                                                        R$ {partner.totalAmount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-4 text-right">
                                                    <span className="text-green-600 font-semibold">
                                                        R$ {partner.totalToPay.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                    </span>
                                                </td>
                                                <td className="py-4 pr-0 text-center">
                                                    <span className="text-gray-600">
                                                        {partner.paymentCount}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-gray-500">Nenhum pagamento com parceiros no período selecionado.</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    Total de pagamentos: {payments.length} | Parceiros cadastrados: {partners.length}
                                </p>
                            </div>
                        )}
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
