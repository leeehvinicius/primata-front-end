import { api } from './api'

export interface WhatsAppStatus {
  success: boolean
  connected: boolean
  status: 'connected' | 'disconnected' | 'connecting' | 'qr_code_ready'
  message: string
}

export interface WhatsAppQRCode {
  success: boolean
  status: string
  message: string
  qrCode?: string
}

export interface WhatsAppConnectResponse {
  success: boolean
  status: 'connected' | 'qr_code_ready' | 'connecting'
  message: string
  qrCode?: string
}

export interface AppointmentNotificationLog {
  id: string
  appointmentId: string
  clientId: string
  phoneNumber: string
  message: string
  status: 'PENDING' | 'SENT' | 'FAILED'
  sentAt: string | null
  errorMessage: string | null
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL'
  createdAt: string
  updatedAt: string
}

export interface NotificationLogsResponse {
  items: AppointmentNotificationLog[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class WhatsAppService {
  /**
   * Conecta ao WhatsApp
   * Se não houver credenciais salvas, retorna um QR Code
   */
  static async connect(): Promise<WhatsAppConnectResponse> {
    return api.post<WhatsAppConnectResponse>('/whatsapp/connect')
  }

  /**
   * Verifica o status atual da conexão
   */
  static async getStatus(): Promise<WhatsAppStatus> {
    return api.get<WhatsAppStatus>('/whatsapp/status')
  }

  /**
   * Obtém o QR Code atual se disponível
   */
  static async getQRCode(): Promise<WhatsAppQRCode> {
    return api.get<WhatsAppQRCode>('/whatsapp/qr-code')
  }

  /**
   * Desconecta do WhatsApp mantendo as credenciais salvas
   */
  static async disconnect(): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>('/whatsapp/disconnect')
  }

  /**
   * Remove as credenciais salvas e força a geração de um novo QR Code
   */
  static async clearAuth(): Promise<{ success: boolean; message: string }> {
    return api.delete<{ success: boolean; message: string }>('/whatsapp/clear-auth')
  }

  /**
   * Envia lembretes manualmente (para testes)
   */
  static async sendReminders(): Promise<{ success: boolean; message: string; count?: number }> {
    return api.post<{ success: boolean; message: string; count?: number }>('/appointments/send-reminders')
  }

  /**
   * Lista os logs de notificações
   */
  static async getNotificationLogs(params?: {
    page?: number
    limit?: number
    status?: 'PENDING' | 'SENT' | 'FAILED'
  }): Promise<NotificationLogsResponse> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.append('page', String(params.page))
    if (params?.limit) searchParams.append('limit', String(params.limit))
    if (params?.status) searchParams.append('status', params.status)

    const qs = searchParams.toString()
    try {
      return await api.get<NotificationLogsResponse>(`/appointments/notification-logs${qs ? `?${qs}` : ''}`)
    } catch (error) {
      // Se o endpoint não existir, retorna uma resposta vazia
      console.warn('Endpoint de logs não disponível:', error)
      return {
        items: [],
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || 10,
          total: 0,
          totalPages: 0
        }
      }
    }
  }
}

