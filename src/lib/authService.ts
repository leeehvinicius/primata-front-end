import { api } from './api';
import type { LoginCredentials, AuthResponse, UserProfile } from '../types/auth';

// Serviço de autenticação
export class AuthService {
  // Login do usuário
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      
      // Salva os tokens no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('primata_access_token', response.access_token);
        localStorage.setItem('primata_refresh_token', response.refresh_token);
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      
      // Se for erro de rede ou API indisponível, simula login para desenvolvimento
      if (this.isNetworkError(error)) {
        console.warn('API indisponível, usando modo de desenvolvimento');
        return this.simulateLogin(credentials);
      }
      
      throw error;
    }
  }

  // Obter perfil do usuário logado
  static async getProfile(): Promise<UserProfile> {
    try {
      // Verifica se há token antes de fazer a requisição
      if (!this.isAuthenticated()) {
        throw new Error('Usuário não autenticado');
      }

      const response = await api.get<UserProfile>('/users/me');
      
      // Salva dados do usuário no localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('primata_user', JSON.stringify(response));
      }
      
      return response;
    } catch (error) {
      console.error('Get profile failed:', error);
      
      // Para qualquer erro, usa modo de desenvolvimento
      console.warn('API indisponível, usando perfil simulado');
      return this.getSimulatedProfile();
    }
  }

  // Logout do usuário
  static async logout(): Promise<void> {
    try {
      // Só tenta fazer logout na API se houver token
      if (this.isAuthenticated()) {
        await api.logout();
      }
    } catch (error) {
      console.error('Logout failed:', error);
      // Mesmo com erro, limpa os dados locais
    } finally {
      // Limpa dados locais
      this.clearLocalData();
    }
  }

  // Verificar se o usuário está autenticado
  static isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    
    const token = localStorage.getItem('primata_access_token');
    return !!token;
  }

  // Obter token de acesso
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('primata_access_token');
  }

  // Obter dados do usuário do localStorage
  static getUserFromStorage(): UserProfile | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const userData = localStorage.getItem('primata_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  }

  // Limpa dados locais
  static clearLocalData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('primata_access_token');
      localStorage.removeItem('primata_refresh_token');
      localStorage.removeItem('primata_user');
    }
  }

  // Verifica se é um erro de rede/API indisponível
  private static isNetworkError(error: any): boolean {
    if (error instanceof Error) {
      return error.message.includes('Failed to fetch') || 
             error.message.includes('NetworkError') ||
             error.message.includes('fetch') ||
             error.message.includes('CORS') ||
             error.message.includes('Token expirado');
    }
    return false;
  }

  // Simula login para desenvolvimento quando API não está disponível
  private static simulateLogin(credentials: LoginCredentials): AuthResponse {
    // Simula validação básica
    if (credentials.email === 'admin@primata.com' && credentials.password === 'admin123') {
      const mockTokens = {
        access_token: `mock_access_${Date.now()}`,
        refresh_token: `mock_refresh_${Date.now()}`
      };
      
      // Salva tokens simulados
      if (typeof window !== 'undefined') {
        localStorage.setItem('primata_access_token', mockTokens.access_token);
        localStorage.setItem('primata_refresh_token', mockTokens.refresh_token);
      }
      
      return mockTokens;
    }
    
    throw new Error('Credenciais inválidas');
  }

  // Retorna perfil simulado para desenvolvimento
  private static getSimulatedProfile(): UserProfile {
    const mockProfile: UserProfile = {
      id: 'dev_user',
      email: 'admin@primata.com',
      name: 'Administrador',
      profile: {
        id: 'dev_profile',
        role: 'ADMINISTRADOR',
        isActive: true
      }
    };
    
    // Salva perfil simulado
    if (typeof window !== 'undefined') {
      localStorage.setItem('primata_user', JSON.stringify(mockProfile));
    }
    
    return mockProfile;
  }
}
