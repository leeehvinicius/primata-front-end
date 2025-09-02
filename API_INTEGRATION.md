# 🔗 Integração com API - Primata Estética

## 📋 **Configuração**

### 1. **Variáveis de Ambiente**
Crie um arquivo `.env.local` na raiz do projeto:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Development
NODE_ENV=development
```

### 2. **URL da API**
A aplicação está configurada para se conectar com:
- **Desenvolvimento**: `http://localhost:3000/api`
- **Produção**: Configure `NEXT_PUBLIC_API_URL` no seu ambiente

## 🚀 **Funcionalidades Implementadas**

### **Sistema de Autenticação**
- ✅ Login com email/senha
- ✅ Gerenciamento de tokens (access + refresh)
- ✅ Renovação automática de tokens
- ✅ Logout com limpeza de dados
- ✅ Proteção de rotas privadas

### **Gerenciamento de Estado**
- ✅ Zustand para estado global
- ✅ Persistência de dados no localStorage
- ✅ Sincronização com API
- ✅ Estados de loading

### **Componentes Atualizados**
- ✅ Página de login integrada
- ✅ Layout privado com autenticação
- ✅ Sidebar com informações do usuário
- ✅ Topbar com perfil do usuário

## 🔧 **Como Usar**

### **1. Login**
```typescript
import { useAuth } from '@/lib/auth';

const { login, isLoading } = useAuth();

const handleLogin = async () => {
  const success = await login({ 
    email: 'admin@primata.com', 
    password: 'admin123' 
  });
  
  if (success) {
    // Redireciona para dashboard
  }
};
```

### **2. Verificar Autenticação**
```typescript
import { useAuth } from '@/lib/auth';

const { user, isLoading } = useAuth();

if (isLoading) {
  return <LoadingSpinner />;
}

if (!user) {
  return <LoginPage />;
}
```

### **3. Logout**
```typescript
import { useAuth } from '@/lib/auth';

const { logout } = useAuth();

const handleLogout = async () => {
  await logout();
  // Redireciona para login
};
```

### **3. Gerenciar Usuários**
```typescript
import { useUsers } from '@/lib/useUsers';

const { 
  users, 
  loading, 
  createUser, 
  updateUser, 
  deleteUser,
  searchUsers,
  filterByRole 
} = useUsers();

// Criar usuário
const newUser = await createUser({
  name: 'João Silva',
  email: 'joao@primata.com',
  password: 'senha123',
  role: 'RECEPCIONISTA',
  phone: '(11) 99999-9999'
});

// Buscar usuários
searchUsers('joão');

// Filtrar por role
filterByRole('MEDICO');
```

## 📡 **Endpoints da API**

### **Autenticação**
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/refresh` - Renovação de token
- `POST /api/auth/logout` - Logout do usuário

### **Usuários**
- `GET /api/users/me` - Perfil do usuário logado

## 🛡️ **Segurança**

### **Tokens**
- **Access Token**: JWT para requisições autenticadas
- **Refresh Token**: JWT para renovação automática
- **Expiração**: Configurável via `config.auth`

### **Interceptors**
- Adição automática de `Authorization` header
- Renovação automática em caso de 401
- Limpeza automática de tokens expirados

## 🔄 **Fluxo de Autenticação**

1. **Login**: Usuário insere credenciais
2. **Validação**: API valida e retorna tokens
3. **Armazenamento**: Tokens salvos no localStorage
4. **Perfil**: Sistema busca dados do usuário
5. **Acesso**: Usuário acessa rotas protegidas
6. **Renovação**: Token renovado automaticamente
7. **Logout**: Tokens limpos e sessão encerrada

## 🐛 **Troubleshooting**

### **Erro de CORS**
```bash
# No backend, adicione:
Access-Control-Allow-Origin: http://localhost:3001
Access-Control-Allow-Headers: Authorization, Content-Type
```

### **Token Expirado**
- O sistema renova automaticamente
- Se falhar, redireciona para login
- Verifique logs do console

### **Erro de Conexão**
- Verifique se a API está rodando
- Confirme a URL em `.env.local`
- Teste com `curl` ou Postman

### **API Indisponível (Modo Desenvolvimento)**
Se a API não estiver disponível, o sistema automaticamente:
- Detecta o erro de conexão
- Ativa o modo de desenvolvimento
- Permite login com credenciais padrão
- Mostra indicador visual "🧪 Modo Desenvolvimento"

**Credenciais de desenvolvimento:**
- Email: `admin@primata.com`
- Senha: `admin123`

### **Problemas de Hidratação**
- ✅ Resolvido: Toaster movido para componente client
- ✅ Resolvido: Indicadores de desenvolvimento isolados
- ✅ Resolvido: Verificações de window isoladas

## 📚 **Arquivos Principais**

- `src/lib/api.ts` - Cliente HTTP da API
- `src/lib/authService.ts` - Serviços de autenticação
- `src/lib/userService.ts` - Serviços de usuários
- `src/lib/auth.ts` - Hook de autenticação
- `src/lib/useUsers.ts` - Hook de gerenciamento de usuários
- `src/lib/config.ts` - Configurações da aplicação
- `src/types/auth.ts` - Tipos de autenticação
- `src/types/users.ts` - Tipos de usuários
- `src/components/ui/LoadingSpinner.tsx` - Componente de loading

## 🎯 **Próximos Passos**

1. **Conectar outros módulos** (usuários, serviços, financeiro)
2. **Implementar refresh automático** de dados
3. **Adicionar interceptors** para tratamento de erros
4. **Implementar cache** de dados
5. **Adicionar testes** de integração

---

**Status**: ✅ **Integração Completa**
**Versão**: 1.0.0
**Última Atualização**: Dezembro 2024
