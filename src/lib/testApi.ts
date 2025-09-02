// Arquivo para testar a conectividade com a API
import { api } from './api';

export async function testApiConnection() {
  try {
    console.log('🧪 Testando conexão com a API...');
    
    // Testa se a API está respondendo
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/health`);
    
    if (response.ok) {
      console.log('✅ API está respondendo!');
      return true;
    } else {
      console.log('❌ API retornou erro:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao conectar com a API:', error);
    return false;
  }
}

export async function testAuthEndpoints() {
  try {
    console.log('🔐 Testando endpoints de autenticação...');
    
    // Testa endpoint de login (sem credenciais válidas)
    const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'test123'
      })
    });
    
    console.log('📝 Login endpoint status:', loginResponse.status);
    
    // Testa endpoint de health (se existir)
    try {
      const healthResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/health`);
      console.log('🏥 Health endpoint status:', healthResponse.status);
    } catch (error) {
      console.log('🏥 Health endpoint não disponível');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao testar endpoints:', error);
    return false;
  }
}

// Função para executar todos os testes
export async function runAllTests() {
  console.log('🚀 Iniciando testes de conectividade...');
  
  const connectionTest = await testApiConnection();
  const authTest = await testAuthEndpoints();
  
  console.log('📊 Resultados dos testes:');
  console.log('  - Conexão com API:', connectionTest ? '✅' : '❌');
  console.log('  - Endpoints de auth:', authTest ? '✅' : '❌');
  
  return connectionTest && authTest;
}

// Executa os testes se o arquivo for importado diretamente
if (typeof window !== 'undefined') {
  // No browser, adiciona ao console global para testes manuais
  (window as any).testPrimataAPI = {
    testConnection: testApiConnection,
    testAuth: testAuthEndpoints,
    runAll: runAllTests
  };
  
  console.log('🧪 Testes da API disponíveis em: window.testPrimataAPI');
}
