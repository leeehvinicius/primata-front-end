import jsPDF from 'jspdf'
import type { TimeTrackingDailyByUserGroup } from '@/types/timeTracking'

const DEFAULT_LOGO_FILE = 'LOGO BRANCA.png'

const THEME = {
  green: '#659A4C',
  text: '#232323',
  grayBg: '#F5F7F8',
  grayBorder: '#D2D7D9',
  white: '#FFFFFF',
  mutedText: '#8C8C8C',
}

function normalizeHex(hex: string): string {
  let h = hex.trim()
  if (!h.startsWith('#')) h = `#${h}`
  if (h.length === 4) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`
  }
  return h.toUpperCase()
}

function hexToRgb(hex: string): [number, number, number] {
  const h = normalizeHex(hex).slice(1)
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return [r, g, b]
}

function setFillColorHex(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex)
  doc.setFillColor(r, g, b)
}

function setDrawColorHex(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex)
  doc.setDrawColor(r, g, b)
}

function setTextColorHex(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex)
  doc.setTextColor(r, g, b)
}

function formatDay(value: string): string {
  if (!value) return '-'
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('pt-BR')
}

function formatHour(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '--:--'
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatType(value: string): string {
  if (value === 'CHECK_IN') return 'Entrada'
  if (value === 'CHECK_OUT') return 'Saida'
  return value
}

function formatStatus(value: string): string {
  if (value === 'PENDING') return 'Pendente'
  if (value === 'APPROVED') return 'Aprovado'
  if (value === 'REJECTED') return 'Rejeitado'
  return value
}

function getPublicAssetUrl(fileName: string): string {
  return `${window.location.origin}/${encodeURIComponent(fileName)}`
}

async function fetchAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

async function loadLogoAsBase64(fileName = DEFAULT_LOGO_FILE): Promise<string | null> {
  if (typeof window === 'undefined') return null
  return fetchAsBase64(getPublicAssetUrl(fileName))
}

function fallbackHeaderText(doc: jsPDF, pageWidth: number) {
  setTextColorHex(doc, THEME.white)
  doc.setFont('times', 'normal')
  doc.setFontSize(22)
  doc.text('REVITTAH', pageWidth / 2, 20, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('C A R E', pageWidth / 2, 28, { align: 'center' })
}

function buildPointsText(group: TimeTrackingDailyByUserGroup): string {
  const records = Array.isArray(group.records) ? group.records : []
  if (records.length === 0) return 'Sem pontos'

  return records
    .map((record) => `${formatHour(record.timestamp)} - ${formatType(record.type)} - ${formatStatus(record.status)}`)
    .join(' | ')
}

export async function exportTimeTrackingReportToPDF(
  groups: TimeTrackingDailyByUserGroup[],
  filters?: { startDate?: string; endDate?: string },
): Promise<void> {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  const contentWidth = pageWidth - margin * 2

  let y = margin

  const checkPageBreak = (neededHeight: number, drawHeader: () => void) => {
    if (y + neededHeight <= pageHeight - 18) return
    doc.addPage()
    y = margin
    drawHeader()
  }

  const drawHeader = async () => {
    const headerHeight = 38
    setFillColorHex(doc, THEME.green)
    doc.rect(0, 0, pageWidth, headerHeight, 'F')

    const logo = await loadLogoAsBase64(DEFAULT_LOGO_FILE)
    if (logo) {
      try {
        doc.addImage(logo, 'PNG', (pageWidth - 78) / 2, 10, 78, 18)
      } catch {
        fallbackHeaderText(doc, pageWidth)
      }
    } else {
      fallbackHeaderText(doc, pageWidth)
    }

    y = headerHeight + 12

    setTextColorHex(doc, THEME.text)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('Relatorio de Ponto', pageWidth / 2, y, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const start = filters?.startDate ? formatDay(filters.startDate) : '-'
    const end = filters?.endDate ? formatDay(filters.endDate) : '-'
    doc.text(`Periodo: ${start} a ${end}`, pageWidth / 2, y + 6, { align: 'center' })

    doc.setFontSize(8)
    setTextColorHex(doc, THEME.mutedText)
    doc.text(
      `Gerado em ${new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      pageWidth - margin,
      y + 12,
      { align: 'right' },
    )

    setDrawColorHex(doc, THEME.grayBorder)
    doc.setLineWidth(0.4)
    doc.line(margin, y + 14, pageWidth - margin, y + 14)

    y += 20
  }

  const drawTableHeader = () => {
    const headerY = y
    const rowH = 8
    const colFuncionario = 52
    const colDia = 25
    const colPontos = contentWidth - colFuncionario - colDia

    setFillColorHex(doc, THEME.grayBg)
    setDrawColorHex(doc, THEME.grayBorder)
    doc.rect(margin, headerY, contentWidth, rowH, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    setTextColorHex(doc, THEME.text)
    doc.text('Funcionario', margin + 3, headerY + 5.5)
    doc.text('Dia', margin + colFuncionario + 3, headerY + 5.5)
    doc.text('Pontos do dia', margin + colFuncionario + colDia + 3, headerY + 5.5)

    y += rowH
    return { colFuncionario, colDia, colPontos }
  }

  await drawHeader()
  const totals = groups.reduce(
    (acc, group) => {
      acc.days += 1
      acc.points += Array.isArray(group.records) ? group.records.length : 0
      acc.users.add(group.userId)
      return acc
    },
    { days: 0, points: 0, users: new Set<string>() },
  )

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  setTextColorHex(doc, THEME.text)
  doc.text(
    `Funcionarios: ${totals.users.size}   Dias: ${totals.days}   Pontos: ${totals.points}`,
    margin,
    y,
  )
  y += 6

  let table = drawTableHeader()

  groups.forEach((group, index) => {
    const employee = group.userName || 'Sem nome'
    const day = formatDay(group.date)
    const pointsText = buildPointsText(group)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)

    const employeeLines = doc.splitTextToSize(employee, table.colFuncionario - 6)
    const pointsLines = doc.splitTextToSize(pointsText, table.colPontos - 6)
    const lineCount = Math.max(employeeLines.length, pointsLines.length, 1)
    const rowH = Math.max(8, lineCount * 4 + 3)

    checkPageBreak(rowH + 2, () => {
      table = drawTableHeader()
    })

    const fillColor = index % 2 === 0 ? THEME.white : THEME.grayBg
    setFillColorHex(doc, fillColor)
    setDrawColorHex(doc, THEME.grayBorder)
    doc.rect(margin, y, contentWidth, rowH, 'FD')

    setTextColorHex(doc, THEME.text)
    doc.text(employeeLines, margin + 3, y + 5)
    doc.text(day, margin + table.colFuncionario + 3, y + 5)
    doc.text(pointsLines, margin + table.colFuncionario + table.colDia + 3, y + 5)

    y += rowH
  })

  const totalPages = doc.getNumberOfPages()
  for (let page = 1; page <= totalPages; page += 1) {
    doc.setPage(page)
    setDrawColorHex(doc, THEME.grayBorder)
    doc.setLineWidth(0.4)
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    setTextColorHex(doc, THEME.mutedText)
    doc.text(`Pagina ${page} de ${totalPages}`, pageWidth / 2, pageHeight - 8, { align: 'center' })
  }

  doc.save(`relatorio_ponto_${new Date().toISOString().slice(0, 10)}.pdf`)
}

