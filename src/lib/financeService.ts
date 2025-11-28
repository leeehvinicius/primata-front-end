import { api } from './api';
import type {
  PaymentListResponse,
  PaymentFilters,
  PaymentStats,
  PaymentMethod,
  PaymentStatus
} from '../types/finance';

export class FinanceService {
  // READ - Listar Pagamentos
  static async getPayments(filters: PaymentFilters = {}): Promise<PaymentListResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters.paymentMethod) params.append('paymentMethod', filters.paymentMethod);
    if (filters.clientId) params.append('clientId', filters.clientId);
    if (filters.serviceId) params.append('serviceId', filters.serviceId);
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const endpoint = queryString ? `/payments?${queryString}` : '/payments';
    
    console.log('FinanceService.getPayments - Endpoint:', endpoint, 'Filters:', filters);
    
    return api.get<PaymentListResponse>(endpoint);
  }

  // ESTATÍSTICAS - Visão Geral
  static async getPaymentStats(): Promise<PaymentStats> {
    return api.get<PaymentStats>('/payments/stats/overview');
  }

  // Método auxiliar para obter pagamentos por período
  static async getPaymentsByPeriod(startDate: string, endDate: string, filters: Omit<PaymentFilters, 'startDate' | 'endDate'> = {}): Promise<PaymentListResponse> {
    return this.getPayments({
      ...filters,
      startDate,
      endDate
    });
  }

  // Método auxiliar para obter pagamentos por método de pagamento
  static async getPaymentsByMethod(method: string, filters: Omit<PaymentFilters, 'paymentMethod'> = {}): Promise<PaymentListResponse> {
    return this.getPayments({
      ...filters,
      paymentMethod: method as PaymentMethod
    });
  }

  // Método auxiliar para obter pagamentos por status
  static async getPaymentsByStatus(status: string, filters: Omit<PaymentFilters, 'paymentStatus'> = {}): Promise<PaymentListResponse> {
    return this.getPayments({
      ...filters,
      paymentStatus: status as PaymentStatus
    });
  }
}
