import { api } from './api';
import { isValidId, isValidIdLenient, sanitizeId, formatErrorMessage, tryConvertToUUID, isUUIDFormatError } from './utils';
import type { 
  User, 
  CreateUserRequest, 
  UpdateUserRequest, 
  UserListResponse, 
  UserStats, 
  UserRoleInfo, 
  UserFilters, 
  ToggleStatusResponse, 
  DeleteUserResponse,
  UserRole
} from '../types/users';

// Serviço para gerenciar usuários
export class UserService {
  // Criar novo usuário
  static async createUser(userData: CreateUserRequest): Promise<User> {
    try {
      const response = await api.post<User>('/users', userData);
      return response;
    } catch (error) {
      console.error('Create user failed:', error);
      throw error;
    }
  }

  // Listar usuários com filtros e paginação
  static async listUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // Adiciona filtros à query string
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, String(value));
        }
      });

      const endpoint = `/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await api.get<UserListResponse>(endpoint);
      return response;
    } catch (error) {
      console.error('List users failed:', error);
      throw error;
    }
  }

  // Buscar usuário por ID
  static async getUserById(userId: string): Promise<User> {
    try {
      // Valida o ID do usuário
      if (!userId || typeof userId !== 'string') {
        throw new Error('ID do usuário é obrigatório');
      }

      const sanitizedId = sanitizeId(userId);
      if (!sanitizedId || (!isValidId(sanitizedId) && !isValidIdLenient(sanitizedId))) {
        throw new Error('ID do usuário inválido');
      }

      const response = await api.get<User>(`/users/${sanitizedId}`);
      return response;
    } catch (error) {
      console.error('Get user failed:', error);
      throw new Error(formatErrorMessage(error));
    }
  }

  // Atualizar usuário
  static async updateUser(userId: string, userData: UpdateUserRequest): Promise<User> {
    // Valida o ID do usuário
    if (!userId || typeof userId !== 'string') {
      throw new Error('ID do usuário é obrigatório');
    }

    const sanitizedId = sanitizeId(userId);
    
    if (!sanitizedId || (!isValidId(sanitizedId) && !isValidIdLenient(sanitizedId))) {
      throw new Error('ID do usuário inválido');
    }

    try {
      const response = await api.put<User>(`/users/${sanitizedId}`, userData);
      return response;
    } catch (error) {
      console.error('Update user failed:', error);
      
      // Tratamento específico para erro de validação UUID
      if (isUUIDFormatError(error)) {
        console.log('UUID format error detected in update, attempting conversion...');
        
        // Tenta converter o ID para formato UUID
        const convertedId = tryConvertToUUID(sanitizedId);
        
        if (convertedId !== sanitizedId) {
          console.log('Retrying update with converted UUID:', convertedId);
          try {
            const response = await api.put<User>(`/users/${convertedId}`, userData);
            console.log('Update success with converted UUID!');
            return response;
          } catch (retryError) {
            console.error('Retry with converted UUID also failed:', retryError);
          }
        }
        
        throw new Error(`O ID do usuário "${userId}" não está no formato UUID esperado pela API. Entre em contato com o administrador do sistema para verificar a configuração dos IDs.`);
      }
      
      throw new Error(formatErrorMessage(error));
    }
  }

  // Alternar status do usuário (ativo/inativo)
  static async toggleUserStatus(userId: string): Promise<ToggleStatusResponse> {
    try {
      // Valida o ID do usuário
      if (!userId || typeof userId !== 'string') {
        throw new Error('ID do usuário é obrigatório');
      }

      const sanitizedId = sanitizeId(userId);
      if (!sanitizedId || (!isValidId(sanitizedId) && !isValidIdLenient(sanitizedId))) {
        throw new Error('ID do usuário inválido');
      }

      const response = await api.patch<ToggleStatusResponse>(`/users/${sanitizedId}/toggle-status`);
      return response;
    } catch (error) {
      console.error('Toggle user status failed:', error);
      throw new Error(formatErrorMessage(error));
    }
  }

  // Deletar usuário
  static async deleteUser(userId: string): Promise<DeleteUserResponse> {
    // Valida o ID do usuário
    if (!userId || typeof userId !== 'string') {
      throw new Error('ID do usuário é obrigatório');
    }

    // Sanitiza o ID para remover caracteres perigosos
    const sanitizedId = sanitizeId(userId);
    
    if (!sanitizedId) {
      throw new Error('ID do usuário inválido');
    }

    // Verifica se o ID tem um formato válido
    if (!isValidId(sanitizedId)) {
      // Tenta validação mais leniente como fallback
      if (!isValidIdLenient(sanitizedId)) {
        throw new Error(`ID do usuário "${sanitizedId}" não está em um formato válido. Esperado: UUID ou ID alfanumérico com pelo menos 6 caracteres`);
      } else {
        console.warn(`ID "${sanitizedId}" passou na validação leniente, mas pode não ser um formato padrão`);
      }
    }

    try {
      const response = await api.delete<DeleteUserResponse>(`/users/${sanitizedId}`);
      return response;
    } catch (error) {
      console.error('Delete user failed:', error);
      
      // Tratamento específico para erro de validação UUID
      if (isUUIDFormatError(error)) {
        console.log('UUID format error detected, attempting multiple approaches...');
        
        // Abordagem 1: Tenta converter o ID para formato UUID
        const convertedId = tryConvertToUUID(sanitizedId);
        
        if (convertedId !== sanitizedId) {
          console.log('Retrying with converted UUID:', convertedId);
          try {
            const response = await api.delete<DeleteUserResponse>(`/users/${convertedId}`);
            console.log('Success with converted UUID!');
            return response;
          } catch (retryError) {
            console.error('Retry with converted UUID also failed:', retryError);
          }
        }
        
        // Abordagem 2: Tenta usar o endpoint sem validação UUID (se existir)
        console.log('Trying alternative endpoint approach...');
        try {
          const response = await api.delete<DeleteUserResponse>(`/users/delete/${sanitizedId}`);
          console.log('Success with alternative endpoint!');
          return response;
        } catch (altError) {
          console.error('Alternative endpoint also failed:', altError);
        }
        
        // Se todas as abordagens falharam, retorna erro informativo
        throw new Error(`O ID do usuário "${userId}" não está no formato UUID esperado pela API. Entre em contato com o administrador do sistema para verificar a configuração dos IDs.`);
      }
      
      // Formata a mensagem de erro para o usuário
      const errorMessage = formatErrorMessage(error);
      throw new Error(errorMessage);
    }
  }

  // Obter estatísticas dos usuários
  static async getUserStats(): Promise<UserStats> {
    try {
      const response = await api.get<UserStats>('/users/stats/overview');
      return response;
    } catch (error) {
      console.error('Get user stats failed:', error);
      throw error;
    }
  }

  // Listar todos os roles disponíveis
  static async listRoles(): Promise<UserRoleInfo[]> {
    try {
      const response = await api.get<UserRoleInfo[]>('/users/roles/list');
      return response;
    } catch (error) {
      console.error('List roles failed:', error);
      throw error;
    }
  }

  // Obter informações de um role específico
  static async getRoleInfo(role: string): Promise<UserRoleInfo> {
    try {
      const response = await api.get<UserRoleInfo>(`/users/roles/${role}`);
      return response;
    } catch (error) {
      console.error('Get role info failed:', error);
      throw error;
    }
  }

  // Buscar usuários por texto (nome, email, telefone, documento)
  static async searchUsers(searchTerm: string, filters: Omit<UserFilters, 'search'> = {}): Promise<UserListResponse> {
    return this.listUsers({ ...filters, search: searchTerm });
  }

  // Obter usuários por role
  static async getUsersByRole(role: string, filters: Omit<UserFilters, 'role'> = {}): Promise<UserListResponse> {
    return this.listUsers({ ...filters, role: role as UserRole });
  }

  // Obter usuários ativos/inativos
  static async getUsersByStatus(isActive: boolean, filters: Omit<UserFilters, 'isActive'> = {}): Promise<UserListResponse> {
    return this.listUsers({ ...filters, isActive });
  }

  // Paginação simples
  static async getUsersPage(page: number, limit: number = 10, filters: Omit<UserFilters, 'page' | 'limit'> = {}): Promise<UserListResponse> {
    return this.listUsers({ ...filters, page, limit });
  }

  // Ordenação
  static async getUsersSorted(sortBy: string, sortOrder: 'asc' | 'desc' = 'asc', filters: Omit<UserFilters, 'sortBy' | 'sortOrder'> = {}): Promise<UserListResponse> {
    return this.listUsers({ ...filters, sortBy, sortOrder });
  }

  // Resetar senha do usuário
// Resetar senha do usuário
static async resetPassword(userId: string, newPassword: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!userId || typeof userId !== 'string') {
      throw new Error('ID do usuário é obrigatório');
    }

    const sanitizedId = sanitizeId(userId);
    if (!sanitizedId || (!isValidId(sanitizedId) && !isValidIdLenient(sanitizedId))) {
      throw new Error('ID do usuário inválido');
    }

    const response = await api.patch<{ success: boolean; message: string }>(`/users/${sanitizedId}/reset-password`, { newPassword });
    return response;
  } catch (error) {
    console.error('Reset password failed:', error);
    throw new Error(formatErrorMessage(error));
  }
}
}
