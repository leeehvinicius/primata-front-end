// Tipos para usuários baseados na API

export type UserRole = 'ADMINISTRADOR' | 'MEDICO' | 'RECEPCIONISTA' | 'SERVICOS_GERAIS';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  document?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password: string;
  role: UserRole;
  phone?: string;
  document?: string;
}

export interface UpdateUserRequest {
  name?: string;
  phone?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  usersByRole: Record<UserRole, number>;
  recentRegistrations: number;
}

export interface UserRoleInfo {
  role: UserRole;
  description: string;
  permissions: string[];
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ToggleStatusResponse {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  updatedAt: string;
}

export interface DeleteUserResponse {
  success: boolean;
  message: string;
}
