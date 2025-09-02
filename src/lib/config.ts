// Configurações da aplicação
export const config = {
  // URL da API - pode ser configurada via variável de ambiente
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  
  // Configurações de autenticação
  auth: {
    // Tempo de expiração do token em segundos (padrão: 1 hora)
    tokenExpiration: 60 * 60,
    
    // Tempo de expiração do refresh token em segundos (padrão: 7 dias)
    refreshTokenExpiration: 7 * 24 * 60 * 60,
    
    // Chaves para localStorage
    storageKeys: {
      accessToken: 'primata_access_token',
      refreshToken: 'primata_refresh_token',
      user: 'primata_user',
    },
  },
  
  // Configurações da aplicação
  app: {
    name: 'Primata Estética',
    version: '1.0.0',
    description: 'Sistema de gestão para clínica estética',
  },

  // Configurações de desenvolvimento
  dev: {
    // Habilita logs detalhados em desenvolvimento
    enableDebugLogs: process.env.NODE_ENV === 'development',
    
    // Habilita testes de API em desenvolvimento
    enableApiTests: process.env.NODE_ENV === 'development',
  },

  // Configurações de UI
  ui: {
    // Tempo de exibição das notificações (ms)
    notificationDuration: 5000,
    
    // Tema padrão
    defaultTheme: 'dark',
    
    // Cores principais
    colors: {
      primary: '#3b82f6', // blue-600
      secondary: '#6366f1', // indigo-600
      success: '#22c55e', // green-600
      warning: '#eab308', // yellow-600
      error: '#ef4444', // red-600
    },
  },
} as const;

// Log da configuração em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  console.log('Config loaded:', config);
}

// Tipos derivados da configuração
export type Config = typeof config;
export type AuthConfig = typeof config.auth;
export type UIConfig = typeof config.ui;
