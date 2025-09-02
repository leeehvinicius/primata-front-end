import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { FinanceService } from './financeService';
import type {
  Payment,
  PaymentListResponse,
  PaymentFilters,
  PaymentStats
} from '../types/finance';

interface UseFinanceState {
  payments: Payment[];
  stats: PaymentStats | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useFinance = (initialFilters: PaymentFilters = {}) => {
  const [state, setState] = useState<UseFinanceState>({
    payments: [],
    stats: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0
    }
  });

  const [filters, setFilters] = useState<PaymentFilters>(initialFilters);
  
  // Usar useRef para manter referência estável dos filtros
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  // Função para buscar pagamentos - SEM DEPENDÊNCIAS
  const fetchPayments = useCallback(async (newFilters?: PaymentFilters) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      // Usar filtersRef.current para acessar os filtros mais recentes
      const currentFilters = filtersRef.current;
      const updatedFilters = { ...currentFilters, ...newFilters };
      const response = await FinanceService.getPayments(updatedFilters);
      
      // Handle both response formats:
      // 1. Expected: { payments: [], pagination: { page, limit, total, totalPages } }
      // 2. Actual: { payments: [], page, limit, total, totalPages, hasNext, hasPrev }
      let payments: Payment[] = [];
      let pagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
      };

      if (response && response.payments) {
        if (response.pagination) {
          // Expected format
          payments = response.payments;
          pagination = response.pagination;
        } else {
          // Actual format - pagination fields at root level
          payments = response.payments;
          pagination = {
            page: response.page || 1,
            limit: response.limit || 10,
            total: response.total || 0,
            totalPages: response.totalPages || 0
          };
        }
      } else {
        // Fallback for malformed response
        console.warn('Unexpected API response format:', response);
        payments = [];
        pagination = {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0
        };
      }
      
      setState(prev => ({
        ...prev,
        payments,
        pagination,
        loading: false
      }));
      
      // Só atualiza os filtros se foram passados novos filtros
      if (newFilters && Object.keys(newFilters).length > 0) {
        setFilters(updatedFilters);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao buscar pagamentos',
        loading: false
      }));
    }
  }, []); // SEM DEPENDÊNCIAS - FUNÇÃO ESTÁVEL

  // Função para buscar estatísticas
  const fetchStats = useCallback(async () => {
    try {
      const stats = await FinanceService.getPaymentStats();
      setState(prev => ({ ...prev, stats }));
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    }
  }, []);

  // Função para limpar erro
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  // Função para atualizar filtros - SEM DEPENDÊNCIAS
  const updateFilters = useCallback((newFilters: Partial<PaymentFilters>) => {
    const currentFilters = filtersRef.current;
    const updatedFilters = { ...currentFilters, ...newFilters, page: 1 }; // Reset para primeira página
    setFilters(updatedFilters);
    fetchPayments(updatedFilters);
  }, [fetchPayments]); // Só depende de fetchPayments que é estável

  // Função para ir para próxima página
  const nextPage = useCallback(() => {
    const currentFilters = filtersRef.current;
    if (state.pagination.page < state.pagination.totalPages) {
      const newFilters = { ...currentFilters, page: state.pagination.page + 1 };
      setFilters(newFilters);
      fetchPayments(newFilters);
    }
  }, [state.pagination.page, state.pagination.totalPages, fetchPayments]);

  // Função para ir para página anterior
  const prevPage = useCallback(() => {
    const currentFilters = filtersRef.current;
    if (state.pagination.page > 1) {
      const newFilters = { ...currentFilters, page: state.pagination.page - 1 };
      setFilters(newFilters);
      fetchPayments(newFilters);
    }
  }, [state.pagination.page, fetchPayments]);

  // Função para ir para página específica
  const goToPage = useCallback((page: number) => {
    const currentFilters = filtersRef.current;
    if (page >= 1 && page <= state.pagination.totalPages) {
      const newFilters = { ...currentFilters, page };
      setFilters(newFilters);
      fetchPayments(newFilters);
    }
  }, [state.pagination.totalPages, fetchPayments]);

  // Cálculos derivados
  const totalAmount = useMemo(() => {
    return state.payments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [state.payments]);

  const totalDiscounts = useMemo(() => {
    return state.payments.reduce((sum, payment) => sum + payment.discountAmount, 0);
  }, [state.payments]);

  const netAmount = useMemo(() => {
    return totalAmount - totalDiscounts;
  }, [totalAmount, totalDiscounts]);

  // Agrupamento por método de pagamento
  const paymentsByMethod = useMemo(() => {
    const grouped: Record<string, { count: number; total: number }> = {};
    
    state.payments.forEach(payment => {
      const method = payment.paymentMethod;
      if (!grouped[method]) {
        grouped[method] = { count: 0, total: 0 };
      }
      grouped[method].count++;
      grouped[method].total += payment.amount;
    });
    
    return grouped;
  }, [state.payments]);

  // Agrupamento por status
  const paymentsByStatus = useMemo(() => {
    const grouped: Record<string, { count: number; total: number }> = {};
    
    state.payments.forEach(payment => {
      const status = payment.paymentStatus;
      if (!grouped[status]) {
        grouped[status] = { count: 0, total: 0 };
      }
      grouped[status].count++;
      grouped[status].total += payment.amount;
    });
    
    return grouped;
  }, [state.payments]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchPayments();
    fetchStats();
  }, []); // Executa apenas uma vez na montagem

  return {
    // Estado
    ...state,
    
    // Filtros
    filters,
    
    // Funções de busca
    fetchPayments,
    fetchStats,
    
    // Funções de paginação
    nextPage,
    prevPage,
    goToPage,
    updateFilters,
    
    // Funções utilitárias
    clearError,
    
    // Cálculos derivados
    totalAmount,
    totalDiscounts,
    netAmount,
    paymentsByMethod,
    paymentsByStatus
  };
};
