// Tipos para parceiros e convênios
export type DocumentType = 'CPF' | 'CNPJ'

export interface Partner {
  id: string
  name: string
  documentType: DocumentType
  document: string
  partnerDiscount: number
  clientDiscount: number
  fixedDiscount?: number
  notes?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreatePartnerData {
  name: string
  documentType: DocumentType
  document: string
  partnerDiscount: number
  clientDiscount: number
  fixedDiscount?: number
  notes?: string
  isActive?: boolean
}

export interface UpdatePartnerData {
  name?: string
  documentType?: DocumentType
  document?: string
  partnerDiscount?: number
  clientDiscount?: number
  fixedDiscount?: number
  notes?: string
  isActive?: boolean
}
export enum PlanType {
  INDIVIDUAL = 'individual',
  FAMILIAR = 'familiar',
  EMPRESARIAL = 'empresarial'
}

export enum LimitType {
  PER_SESSION = 'PER_SESSION',
  MONTHLY = 'MONTHLY',
  ANNUAL = 'ANNUAL',
  LIFETIME = 'LIFETIME'
}

export enum AlertType {
  LIMIT_EXCEEDED = 'LIMIT_EXCEEDED',
  EXPIRING_SOON = 'EXPIRING_SOON',
  INVALID_AGREEMENT = 'INVALID_AGREEMENT',
  COVERAGE_DENIED = 'COVERAGE_DENIED',
  PAYMENT_DELAYED = 'PAYMENT_DELAYED'
}

export enum IntegrationType {
  API = 'API',
  WEBHOOK = 'WEBHOOK',
  EMAIL = 'EMAIL',
  FTP = 'FTP',
  SFTP = 'SFTP'
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
  CHECK = 'CHECK'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

// Plano de Saúde
export interface HealthPlan {
  id: string
  name: string
  planType: PlanType
  operatorCode: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Convênio
export interface Agreement {
  id: string
  healthPlanId: string
  clientId: string
  agreementNumber: string
  cardNumber?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Relacionamentos
  healthPlan?: HealthPlan
  client?: {
    id: string
    name: string
    email: string
  }
}

// Desconto de Convênio
export interface AgreementDiscount {
  id: string
  agreementId: string
  serviceId?: string
  packageId?: string
  discountPercentage: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Relacionamentos
  service?: {
    id: string
    name: string
  }
  package?: {
    id: string
    name: string
  }
}

// Limite de Cobertura
export interface CoverageLimit {
  id: string
  healthPlanId: string
  serviceId?: string
  packageId?: string
  limitAmount: number
  limitType: LimitType
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Relacionamentos
  healthPlan?: HealthPlan
  service?: {
    id: string
    name: string
  }
  package?: {
    id: string
    name: string
  }
}

// Pagamento com Convênio
export interface AgreementPayment {
  id: string
  agreementId: string
  paymentId: string
  amountCovered: number
  amountClient: number
  discountApplied: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// Pagamento Geral
export interface Payment {
  id: string
  clientId: string
  appointmentId?: string
  serviceId: string
  amount: number
  partnerDiscount: number
  clientDiscount: number
  finalAmount: number
  currency: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  paymentDate?: string
  dueDate?: string
  notes?: string
  transactionId?: string
  externalPaymentId?: string
  receiptNumber?: string
  refundedAt?: string
  refundAmount?: number
  createdBy: string
  createdAt: string
  updatedAt: string
  // Relacionamentos
  client?: {
    id: string
    name: string
    email: string
  }
  service?: {
    id: string
    name: string
  }
  appointment?: {
    id: string
    scheduledDate: string
  }
}

// Alerta de Cobertura
export interface CoverageAlert {
  id: string
  agreementId: string
  serviceId?: string
  packageId?: string
  alertType: AlertType
  message: string
  isResolved: boolean
  resolvedAt?: string
  createdAt: string
  // Relacionamentos
  agreement?: Agreement
  service?: {
    id: string
    name: string
  }
  package?: {
    id: string
    name: string
  }
}

// Integração com Operadora
export interface OperatorIntegration {
  id: string
  healthPlanId: string
  integrationType: IntegrationType
  endpoint?: string
  credentials?: Record<string, unknown>
  settings?: Record<string, unknown>
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Relacionamentos
  healthPlan?: HealthPlan
}

// Filtros para listagem
export interface PartnerFilters {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  planType?: PlanType
  healthPlanId?: string
  clientId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// Resposta da listagem
export interface PartnerListResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Dados para criação
export interface CreateHealthPlanData {
  name: string
  planType: PlanType
  operatorCode: string
  isActive?: boolean
}

export interface CreateAgreementData {
  healthPlanId: string
  clientId: string
  agreementNumber: string
  cardNumber?: string
  isActive?: boolean
}

export interface CreateDiscountData {
  agreementId: string
  serviceId?: string
  packageId?: string
  discountPercentage: number
  isActive?: boolean
}

export interface CreateCoverageLimitData {
  healthPlanId: string
  serviceId?: string
  packageId?: string
  limitAmount: number
  limitType: LimitType
  isActive?: boolean
}

export interface CreatePaymentData {
  clientId: string
  appointmentId?: string
  serviceId: string
  amount: number
  partnerDiscount: number
  clientDiscount: number
  paymentMethod: PaymentMethod
  paymentStatus?: PaymentStatus
  dueDate?: string
  notes?: string
}

// Dados para atualização
export interface UpdateHealthPlanData {
  name?: string
  planType?: PlanType
  operatorCode?: string
  isActive?: boolean
}

export interface UpdateAgreementData {
  cardNumber?: string
  isActive?: boolean
}

export interface UpdateDiscountData {
  discountPercentage?: number
  isActive?: boolean
}

export interface UpdateCoverageLimitData {
  limitAmount?: number
  limitType?: LimitType
  isActive?: boolean
}

export interface UpdatePaymentData {
  partnerDiscount?: number
  clientDiscount?: number
  paymentStatus?: PaymentStatus
  notes?: string
}

// Estatísticas
export interface PartnerStats {
  totalHealthPlans: number
  activeHealthPlans: number
  totalAgreements: number
  activeAgreements: number
  totalDiscounts: number
  activeDiscounts: number
  totalPayments: number
  totalAmount: number
  averageDiscount: number
  byPlanType: Record<PlanType, number>
}

// Configuração dos tipos de plano para exibição
export const planTypeConfig = {
  [PlanType.INDIVIDUAL]: {
    name: 'Individual',
    icon: '👤',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-200'
  },
  [PlanType.FAMILIAR]: {
    name: 'Familiar',
    icon: '👨‍👩‍👧‍👦',
    color: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-200'
  },
  [PlanType.EMPRESARIAL]: {
    name: 'Empresarial',
    icon: '🏢',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-200'
  }
}

// Configuração dos tipos de limite para exibição
export const limitTypeConfig = {
  [LimitType.PER_SESSION]: {
    name: 'Por Sessão',
    icon: '🔄',
    color: 'text-amber-600',
    bg: 'bg-amber-100',
    border: 'border-amber-200'
  },
  [LimitType.MONTHLY]: {
    name: 'Mensal',
    icon: '📅',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    border: 'border-blue-200'
  },
  [LimitType.ANNUAL]: {
    name: 'Anual',
    icon: '📆',
    color: 'text-green-600',
    bg: 'bg-green-100',
    border: 'border-green-200'
  },
  [LimitType.LIFETIME]: {
    name: 'Vitalício',
    icon: '♾️',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    border: 'border-purple-200'
  }
}

// Configuração dos tipos de alerta para exibição
export const alertTypeConfig = {
  [AlertType.LIMIT_EXCEEDED]: {
    name: 'Limite Excedido',
    icon: '⚠️',
    color: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-200'
  },
  [AlertType.EXPIRING_SOON]: {
    name: 'Expirando em Breve',
    icon: '⏰',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    border: 'border-orange-200'
  },
  [AlertType.INVALID_AGREEMENT]: {
    name: 'Convênio Inválido',
    icon: '❌',
    color: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-200'
  },
  [AlertType.COVERAGE_DENIED]: {
    name: 'Cobertura Negada',
    icon: '🚫',
    color: 'text-red-600',
    bg: 'bg-red-100',
    border: 'border-red-200'
  },
  [AlertType.PAYMENT_DELAYED]: {
    name: 'Pagamento Atrasado',
    icon: '⏳',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    border: 'border-yellow-200'
  }
}

// Tipos adicionais para integrações e relatórios
export interface CreateIntegrationData {
  type: IntegrationType;
  name: string;
  description?: string;
  configuration: Record<string, unknown>;
  isActive: boolean;
}

export interface UpdateIntegrationData {
  name?: string;
  description?: string;
  configuration?: Record<string, unknown>;
  isActive?: boolean;
}

export interface HealthPlanReport {
  healthPlanId: string;
  healthPlanName: string;
  period: {
    startDate: string;
    endDate: string;
  };
  totalAgreements: number;
  activeAgreements: number;
  totalRevenue: number;
  averageAgreementValue: number;
  topServices: Array<{
    serviceId: string;
    serviceName: string;
    count: number;
    revenue: number;
  }>;
  agreementsByStatus: Record<string, number>;
}

export interface ClientReport {
  clientId: string;
  clientName: string;
  totalAgreements: number;
  activeAgreements: number;
  totalSpent: number;
  averageAgreementValue: number;
  agreements: Array<{
    id: string;
    healthPlanName: string;
    startDate: string;
    endDate: string;
    status: string;
    value: number;
  }>;
}

export interface CoverageDetails {
  isCovered: boolean;
  coveragePercentage: number;
  maxCoverageAmount: number;
  remainingCoverage: number;
  applicableDiscounts: Array<{
    type: string;
    percentage: number;
    description: string;
  }>;
  restrictions: Array<{
    type: string;
    description: string;
  }>;
}