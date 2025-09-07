// Configuração da aplicação
export const config = {
  // URL da API - mantendo compatibilidade com sistema existente
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'https://api.consutorio.revittahcare.com.br/api',
  
  // Configurações específicas do financeiro
  finance: {
    // Endpoints da API financeira (sem /api pois já está na base URL)
    endpoints: {
      payments: '/payments',
      stats: '/payments/stats/overview'
    },
    
    // Configurações de paginação padrão
    pagination: {
      defaultLimit: 10,
      maxLimit: 100
    },
    
    // Configurações de cache
    cache: {
      paymentsTTL: 5 * 60 * 1000, // 5 minutos
      statsTTL: 10 * 60 * 1000    // 10 minutos
    }
  },
  
  // Configurações de ambiente
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production'
};

// Log da configuração em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Config loaded:', config);
}

// Tipos derivados da configuração
export type Config = typeof config;
export type FinanceConfig = typeof config.finance;
