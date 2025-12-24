'use client'
import { useEffect, useState } from 'react'
import { WhatsAppService, type WhatsAppStatus, type AppointmentNotificationLog } from '@/lib/whatsappService'
import { MessageSquare, QrCode, CheckCircle2, XCircle, RefreshCw, Power, Trash2, Send, Clock, AlertCircle } from 'lucide-react'

export default function WhatsAppPage() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [logs, setLogs] = useState<AppointmentNotificationLog[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [logsPage, setLogsPage] = useState(1)

  const fetchStatus = async () => {
    try {
      const response = await WhatsAppService.getStatus()
      setStatus(response)
    } catch (err) {
      console.error('Erro ao buscar status:', err)
    }
  }

  const fetchQRCode = async () => {
    try {
      const response = await WhatsAppService.getQRCode()
      if (response.qrCode) {
        setQrCode(response.qrCode)
      }
    } catch (err) {
      console.error('Erro ao buscar QR Code:', err)
    }
  }

  const fetchLogs = async () => {
    setLogsLoading(true)
    try {
      const response = await WhatsAppService.getNotificationLogs({ page: logsPage, limit: 10 })
      setLogs(response.items)
    } catch (err) {
      console.error('Erro ao buscar logs:', err)
    } finally {
      setLogsLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchLogs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logsPage])

  // Polling para atualizar status e QR Code quando desconectado
  useEffect(() => {
    if (status && !status.connected && status.status === 'qr_code_ready') {
      // Busca QR Code imediatamente
      fetchQRCode()
      
      // Atualiza status e QR Code a cada 3 segundos
      const interval = setInterval(() => {
        fetchStatus()
        fetchQRCode()
      }, 3000)
      return () => clearInterval(interval)
    }
  }, [status])

  const handleConnect = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await WhatsAppService.connect()
      if (response.qrCode) {
        setQrCode(response.qrCode)
        setSuccess('QR Code gerado! Escaneie com o WhatsApp.')
      } else if (response.status === 'connected') {
        setSuccess('Conectado com sucesso!')
      }
      await fetchStatus()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao conectar'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('Tem certeza que deseja desconectar do WhatsApp?')) return

    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await WhatsAppService.disconnect()
      setQrCode(null)
      await fetchStatus()
      setSuccess('Desconectado com sucesso!')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao desconectar'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleClearAuth = async () => {
    if (!confirm('Tem certeza? Isso irá remover as credenciais salvas e você precisará escanear o QR Code novamente.')) return

    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await WhatsAppService.clearAuth()
      setQrCode(null)
      await fetchStatus()
      setSuccess('Credenciais removidas! Conecte novamente para gerar um novo QR Code.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao limpar autenticação'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendReminders = async () => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const response = await WhatsAppService.sendReminders()
      setSuccess(response.message || 'Lembretes enviados com sucesso!')
      await fetchLogs()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao enviar lembretes'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = () => {
    if (!status) return 'bg-gray-500'
    if (status.connected) return 'bg-green-500'
    if (status.status === 'qr_code_ready') return 'bg-yellow-500'
    return 'bg-red-500'
  }

  const getStatusText = () => {
    if (!status) return 'Verificando...'
    if (status.connected) return 'Conectado'
    if (status.status === 'qr_code_ready') return 'Aguardando QR Code'
    return 'Desconectado'
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <MessageSquare className="h-5 w-5 text-green-600" />
        <h1 className="text-xl font-semibold">WhatsApp Bot</h1>
      </div>

      {/* Alertas */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
          <XCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
          <CheckCircle2 className="h-4 w-4" />
          <span>{success}</span>
        </div>
      )}

      {/* Status Card */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Status da Conexão</h2>
          <button
            onClick={fetchStatus}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
            title="Atualizar status"
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${status?.connected ? 'animate-pulse' : ''}`} />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{getStatusText()}</p>
            <p className="text-xs text-gray-500">{status?.message || 'Carregando...'}</p>
          </div>
          {status?.connected && (
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
              Online
            </span>
          )}
        </div>

        {/* QR Code */}
        {qrCode && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <QrCode className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-medium">Escaneie o QR Code</h3>
            </div>
            <div className="flex justify-center mb-3">
              <img 
                src={qrCode} 
                alt="QR Code WhatsApp" 
                className="w-48 h-48 border-2 border-white rounded-lg shadow-sm" 
              />
            </div>
            <p className="text-xs text-gray-600 text-center">
              Abra o WhatsApp → Configurações → Aparelhos conectados → Conectar um aparelho
            </p>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-2">
          {!status?.connected && (
            <button
              onClick={handleConnect}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
            >
              <Power className="h-3.5 w-3.5" />
              {loading ? 'Conectando...' : 'Conectar'}
            </button>
          )}

          {status?.connected && (
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
            >
              <Power className="h-3.5 w-3.5" />
              {loading ? 'Desconectando...' : 'Desconectar'}
            </button>
          )}

          <button
            onClick={handleClearAuth}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Limpar Auth
          </button>

          <button
            onClick={handleSendReminders}
            disabled={loading || !status?.connected}
            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
          >
            <Send className="h-3.5 w-3.5" />
            {loading ? 'Enviando...' : 'Enviar Lembretes'}
          </button>
        </div>
      </div>

      {/* Logs de Notificações */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Logs de Notificações</h2>
          <button
            onClick={fetchLogs}
            disabled={logsLoading}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="Atualizar logs"
          >
            <RefreshCw className={`h-4 w-4 text-gray-600 ${logsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {logsLoading && logs.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500">Carregando logs...</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-6 text-sm text-gray-500">Nenhum log encontrado</div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {log.status === 'SENT' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                    {log.status === 'FAILED' && <XCircle className="h-4 w-4 text-red-500" />}
                    {log.status === 'PENDING' && <Clock className="h-4 w-4 text-yellow-500" />}
                    <span className="text-sm font-medium">{log.phoneNumber}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      log.status === 'SENT'
                        ? 'bg-green-100 text-green-800'
                        : log.status === 'FAILED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {log.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mb-2">{log.message}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span>{log.channel}</span>
                  {log.sentAt && <span>{new Date(log.sentAt).toLocaleString('pt-BR')}</span>}
                  {log.errorMessage && (
                    <span className="flex items-center gap-1 text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      {log.errorMessage}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginação */}
        {logs.length > 0 && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            <button
              onClick={() => setLogsPage(prev => Math.max(1, prev - 1))}
              disabled={logsPage === 1}
              className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-sm text-gray-600">Página {logsPage}</span>
            <button
              onClick={() => setLogsPage(prev => prev + 1)}
              disabled={logs.length < 10}
              className="px-3 py-1.5 border rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Próxima
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

