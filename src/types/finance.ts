// Tipos para o sistema financeiro baseados na API

export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_TRANSFER' | 'CHECK' | 'VOUCHER' | 'OTHER';

export type PaymentStatus = 'PENDING' | 'PAID' | 'PARTIAL' | 'CANCELLED' | 'REFUNDED' | 'OVERDUE';

export interface Payment {
  id: string;
  clientId: string;
  serviceId: string;
  appointmentId?: string;
  amount: number;
  discountAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  
  // Campos relacionados (opcionais, podem vir da API)
  clientName?: string;
  serviceName?: string;
  appointmentDate?: string;
}

export interface PaymentListResponse {
  payments: Payment[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Alternative format - pagination fields at root level
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  clientId?: string;
  serviceId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaymentStats {
  totalPayments: number;
  totalAmount: number;
  totalDiscounts: number;
  paymentsByStatus: Record<PaymentStatus, { count: number; amount: number }>;
  paymentsByMethod: Record<PaymentMethod, { count: number; amount: number }>;
  recentPayments: number;
  overduePayments: number;
}

// Mapeamento para exibição em português
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Dinheiro',
  CREDIT_CARD: 'Crédito',
  DEBIT_CARD: 'Débito',
  PIX: 'PIX',
  BANK_TRANSFER: 'Transferência',
  CHECK: 'Cheque',
  VOUCHER: 'Vale',
  OTHER: 'Outro'
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  PARTIAL: 'Parcial',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
  OVERDUE: 'Vencido'
};

// Cores para UI
export const PAYMENT_METHOD_COLORS: Record<PaymentMethod, { bg: string; text: string; ring: string }> = {
  CASH: { bg: 'bg-lime-600/15', text: 'text-lime-300', ring: 'ring-lime-500/30' },
  CREDIT_CARD: { bg: 'bg-fuchsia-600/15', text: 'text-fuchsia-300', ring: 'ring-fuchsia-500/30' },
  DEBIT_CARD: { bg: 'bg-sky-600/15', text: 'text-sky-300', ring: 'ring-sky-500/30' },
  PIX: { bg: 'bg-teal-600/15', text: 'text-teal-300', ring: 'ring-teal-500/30' },
  BANK_TRANSFER: { bg: 'bg-indigo-600/15', text: 'text-indigo-300', ring: 'ring-indigo-500/30' },
  CHECK: { bg: 'bg-orange-600/15', text: 'text-orange-300', ring: 'ring-orange-500/30' },
  VOUCHER: { bg: 'bg-violet-600/15', text: 'text-violet-300', ring: 'ring-violet-500/30' },
  OTHER: { bg: 'bg-slate-600/15', text: 'text-slate-300', ring: 'ring-slate-500/30' }
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, { bg: string; text: string; ring: string }> = {
  PENDING: { bg: 'bg-yellow-600/15', text: 'text-yellow-300', ring: 'ring-yellow-500/30' },
  PAID: { bg: 'bg-green-600/15', text: 'text-green-300', ring: 'ring-green-500/30' },
  PARTIAL: { bg: 'bg-blue-600/15', text: 'text-blue-300', ring: 'ring-blue-500/30' },
  CANCELLED: { bg: 'bg-red-600/15', text: 'text-red-300', ring: 'ring-red-500/30' },
  REFUNDED: { bg: 'bg-purple-600/15', text: 'text-purple-300', ring: 'ring-purple-500/30' },
  OVERDUE: { bg: 'bg-orange-600/15', text: 'text-orange-300', ring: 'ring-orange-500/30' }
};
