// Tipos para autenticação e usuários

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  profile: {
    id: string;
    role: string;
    isActive?: boolean;
  };
}

export interface LogoutResponse {
  success: boolean;
}

export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  restore: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Tipos para permissões
export type PermissionKey = 
  | 'dashboard'
  | 'patients'
  | 'partners'
  | 'appointments'
  | 'services'
  | 'billing'
  | 'users'
  | 'settings';

export interface Profile {
  id: string;
  name: string;
  description?: string;
  permissions: PermissionKey[];
}
