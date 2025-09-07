// Utilitários de debug para autenticação
export const debugAuth = {
  // Loga o estado atual da autenticação
  logAuthState() {
    if (typeof window === 'undefined') return;
    
    console.group('🔐 Estado da Autenticação');
    console.log('Access Token:', localStorage.getItem('primata_access_token') ? '✅ Presente' : '❌ Ausente');
    console.log('Refresh Token:', localStorage.getItem('primata_refresh_token') ? '✅ Presente' : '❌ Ausente');
    console.log('User Data:', localStorage.getItem('primata_user') ? '✅ Presente' : '❌ Ausente');
    
    try {
      const userData = localStorage.getItem('primata_user');
      if (userData) {
        console.log('User Object:', JSON.parse(userData));
      }
    } catch (error) {
      console.error('Erro ao parsear user data:', error);
    }
    
    console.groupEnd();
  },

  // Limpa todos os dados de autenticação
  clearAll() {
    if (typeof window === 'undefined') return;
    
    console.log('🧹 Limpando todos os dados de autenticação...');
    localStorage.removeItem('primata_access_token');
    localStorage.removeItem('primata_refresh_token');
    localStorage.removeItem('primata_user');
    console.log('✅ Dados limpos');
  },

  // Testa a conectividade com a API
  async testApiConnection() {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      console.log('🧪 Testando conexão com:', apiUrl);
      
      const response = await fetch(`${apiUrl}/health`);
      console.log('📡 Status:', response.status);
      console.log('📡 OK:', response.ok);
      
      return response.ok;
    } catch (error) {
      console.error('❌ Erro de conexão:', error);
      return false;
    }
  },

  // Mostra informações do ambiente
  showEnvironment() {
    console.group('🌍 Ambiente');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('API_URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('User Agent:', navigator.userAgent);
    console.log('Timestamp:', new Date().toISOString());
    console.groupEnd();
  }
};

// Adiciona ao console global em desenvolvimento
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as unknown as { debugAuth: typeof debugAuth }).debugAuth = debugAuth;
  console.log('🐛 Debug de autenticação disponível em: window.debugAuth');
}
