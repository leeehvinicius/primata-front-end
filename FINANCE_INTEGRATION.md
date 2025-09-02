# Integração Financeira - Primata Estética

## 📋 Visão Geral

Esta integração conecta o sistema Primata Estética à API financeira para listar e visualizar pagamentos, estatísticas e relatórios financeiros.

## 🚀 Funcionalidades

- ✅ **Listagem de Pagamentos**: Busca pagamentos da API com filtros
- ✅ **Estatísticas**: Exibe totais por método de pagamento e status
- ✅ **Filtros por Período**: Hoje, semana, mês ou período personalizado
- ✅ **Agrupamento por Serviço**: Organiza pagamentos por tipo de serviço
- ✅ **Paginação**: Suporte a paginação para grandes volumes de dados

## 🔧 Configuração

### 1. Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# URL da API financeira
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 2. Estrutura de Arquivos

```
src/
├── types/
│   └── finance.ts          # Tipos TypeScript para finanças
├── lib/
│   ├── financeService.ts   # Serviço de API financeira
│   ├── useFinance.ts       # Hook React para dados financeiros
│   └── config.ts           # Configurações da aplicação
└── app/(private)/billing/
    └── page.tsx            # Página de visualização financeira
```

## 📊 Como Usar

### 1. Hook useFinance

```tsx
import { useFinance } from '@/lib/useFinance';

function FinanceComponent() {
  const { 
    payments, 
    loading, 
    error, 
    paymentsByMethod,
    updateFilters 
  } = useFinance();

  // Filtrar por período
  const handleDateFilter = (startDate: string, endDate: string) => {
    updateFilters({ startDate, endDate });
  };

  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;

  return (
    <div>
      {/* Seus componentes aqui */}
    </div>
  );
}
```

### 2. Filtros Disponíveis

```tsx
// Filtros por método de pagamento
updateFilters({ paymentMethod: 'PIX' });

// Filtros por status
updateFilters({ paymentStatus: 'PAID' });

// Filtros por período
updateFilters({ 
  startDate: '2024-01-01', 
  endDate: '2024-01-31' 
});

// Paginação
updateFilters({ page: 2, limit: 20 });
```

### 3. Dados Disponíveis

```tsx
const {
  // Lista de pagamentos
  payments,
  
  // Estatísticas
  stats,
  
  // Estados
  loading,
  error,
  
  // Dados agrupados
  paymentsByMethod,    // Por método de pagamento
  paymentsByStatus,    // Por status
  
  // Totais calculados
  totalAmount,         // Valor total
  totalDiscounts,      // Total de descontos
  netAmount,          // Valor líquido
  
  // Paginação
  pagination,
  
  // Funções
  updateFilters,
  nextPage,
  prevPage
} = useFinance();
```

## 🎨 Componentes UI

### StatBox

Exibe estatísticas por método de pagamento:

```tsx
<StatBox 
  title="PIX" 
  method="PIX" 
  count={5} 
  total={1500.00} 
/>
```

### TabelaServico

Exibe pagamentos agrupados por serviço:

```tsx
<TabelaServico 
  titulo="Câmara Hiperbárica" 
  dados={pagamentosDoServico} 
/>
```

## 🔌 Endpoints da API

A integração espera os seguintes endpoints:

### GET /api/payments
Lista pagamentos com filtros opcionais:

```bash
GET /api/payments?page=1&limit=10&paymentStatus=PAID&startDate=2024-01-01&endDate=2024-01-31
```

**Parâmetros:**
- `page`: Número da página
- `limit`: Itens por página
- `paymentStatus`: Status do pagamento
- `paymentMethod`: Método de pagamento
- `startDate`: Data inicial (YYYY-MM-DD)
- `endDate`: Data final (YYYY-MM-DD)

### GET /api/payments/stats/overview
Retorna estatísticas gerais:

```bash
GET /api/payments/stats/overview
```

## 📱 Responsividade

A interface é totalmente responsiva e se adapta a diferentes tamanhos de tela:

- **Mobile**: Layout em coluna única
- **Tablet**: Grid 2x2 para estatísticas
- **Desktop**: Grid 5x1 para estatísticas e 2x2 para tabelas

## 🎯 Próximos Passos

Para expandir a funcionalidade, considere:

1. **Filtros Avançados**: Busca por cliente, serviço específico
2. **Exportação**: PDF, Excel, CSV
3. **Gráficos**: Visualizações com Chart.js ou Recharts
4. **Notificações**: Alertas para pagamentos vencidos
5. **Relatórios**: Relatórios personalizados por período

## 🐛 Troubleshooting

### Erro de CORS
Verifique se a API está configurada para aceitar requisições do frontend.

### Erro 401 (Não Autorizado)
Verifique se o token de autenticação está sendo enviado corretamente.

### Dados não carregam
Verifique os logs do console para erros de rede ou validação.

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs do console
2. Teste os endpoints da API diretamente
3. Verifique a configuração das variáveis de ambiente
4. Consulte a documentação da API financeira
