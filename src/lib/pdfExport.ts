import jsPDF from 'jspdf';
import type { Payment } from '../types/finance';

const BRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/**
 * Exporta relatório financeiro para PDF com apenas valor da comissão do parceiro
 * Não inclui: status, forma de pagamento, desconto do parceiro, nome do cliente
 */
/**
 * Carrega a logo do sistema e retorna como base64
 */
async function loadLogoAsBase64(): Promise<string | null> {
  // Verificar se estamos no navegador
  if (typeof window === 'undefined') {
    return null;
  }
  
  try {
    // Usar caminho absoluto ou relativo dependendo do ambiente
    const logoPath = window.location.origin + '/LOGO_REVITTAH_CARE_SEM_FUNDO.png';
    const response = await fetch(logoPath);
    
    if (!response.ok) {
      console.warn('Logo não encontrada em:', logoPath);
      return null;
    }
    
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = () => {
        console.error('Erro ao ler logo como base64');
        resolve(null);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Erro ao carregar logo, usando apenas texto:', error);
    return null;
  }
}

export async function exportFinancialReportToPDF(
  payments: Payment[],
  title: string = 'Relatório Financeiro',
  dateRange?: { start: string; end: string }
): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Paleta de cores moderna
  const primaryColor = [41, 128, 185]; // Azul primário
  const secondaryColor = [52, 152, 219]; // Azul secundário
  const accentColor = [46, 204, 113]; // Verde
  const headerColor = [44, 62, 80]; // Cinza escuro
  const textColor = [52, 73, 94]; // Cinza médio
  const lightGray = [236, 240, 241]; // Cinza claro
  const borderColor = [189, 195, 199]; // Cinza borda
  const white = [255, 255, 255];

  // Função para adicionar nova página se necessário
  const checkPageBreak = (requiredSpace: number = 10) => {
    if (yPos + requiredSpace > pageHeight - margin - 15) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Função auxiliar para desenhar retângulos estilizados
  const drawStyledRect = (x: number, y: number, w: number, h: number, fillColor: number[], strokeColor?: number[], lineWidth: number = 0.5) => {
    if (fillColor && fillColor.length === 3) {
      doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
      doc.rect(x, y, w, h, 'F');
    }
    if (strokeColor && strokeColor.length === 3) {
      doc.setDrawColor(strokeColor[0], strokeColor[1], strokeColor[2]);
      doc.setLineWidth(lineWidth);
      doc.rect(x, y, w, h, 'S');
    }
  };

  // ===== CABEÇALHO ESTILIZADO =====
  // Barra superior colorida (mais alta para logo)
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, pageWidth, 50, 'F');
  
  // Tentar adicionar logo
  const logoBase64 = await loadLogoAsBase64();
  if (logoBase64) {
    try {
      // Adicionar logo à esquerda (tamanho 30x30)
      doc.addImage(logoBase64, 'PNG', margin, 10, 30, 30);
      // Ajustar posição do texto para não sobrepor a logo
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('REVITTAH CARE', margin + 35, 20);
      
      // Título do relatório
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin + 35, 35);
    } catch (error) {
      console.error('Erro ao adicionar logo:', error);
      // Fallback: apenas texto
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('REVITTAH CARE', margin, 18);
      
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(title, margin, 32);
    }
  } else {
    // Sem logo: apenas texto
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('REVITTAH CARE', margin, 18);
    
    // Título do relatório
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(title, margin, 32);
  }
  
  // Informações do período (se houver)
  if (dateRange) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dateText = `${formatDate(dateRange.start)} a ${formatDate(dateRange.end)}`;
    doc.text(dateText, pageWidth - margin, 35, { align: 'right' });
  }
  
  yPos = 60;

  // Data de geração (subtítulo)
  doc.setFontSize(9);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'italic');
  const generatedAt = `Gerado em ${new Date().toLocaleString('pt-BR', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`;
  doc.text(generatedAt, margin, yPos);
  
  // Linha divisória sutil
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos + 5, pageWidth - margin, yPos + 5);
  yPos += 15;

  // Agrupar por parceiro
  const paymentsByPartner: Record<string, Payment[]> = {};
  payments.forEach(payment => {
    const partnerName = payment.partnerName || 'Sem parceiro';
    if (!paymentsByPartner[partnerName]) {
      paymentsByPartner[partnerName] = [];
    }
    paymentsByPartner[partnerName].push(payment);
  });

  // Calcular totais
  let totalCommission = 0;
  Object.values(paymentsByPartner).forEach(partnerPayments => {
    partnerPayments.forEach(payment => {
      const commission = Number(payment.partnerDiscount || 0);
      totalCommission += commission;
    });
  });

  // ===== CARDS DE RESUMO =====
  checkPageBreak(35);
  
  const cardHeight = 25;
  const cardWidth = (maxWidth - 10) / 3; // 3 cards com espaçamento
  const cardY = yPos;
  
  // Card 1: Total de Parceiros
  drawStyledRect(margin, cardY, cardWidth, cardHeight, lightGray, borderColor, 0.5);
  
  doc.setFontSize(8);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Total de Parceiros', margin + 8, cardY + 8);
  doc.setFontSize(16);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(String(Object.keys(paymentsByPartner).length), margin + 8, cardY + 18);
  
  // Card 2: Total de Registros
  drawStyledRect(margin + cardWidth + 5, cardY, cardWidth, cardHeight, lightGray, borderColor, 0.5);
  
  doc.setFontSize(8);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Total de Registros', margin + cardWidth + 13, cardY + 8);
  doc.setFontSize(16);
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(String(payments.length), margin + cardWidth + 13, cardY + 18);
  
  // Card 3: Total de Comissões
  drawStyledRect(margin + (cardWidth + 5) * 2, cardY, cardWidth, cardHeight, [230, 245, 255], accentColor, 1);
  
  doc.setFontSize(8);
  doc.setTextColor(textColor[0], textColor[1], textColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Total de Comissões', margin + (cardWidth + 5) * 2 + 8, cardY + 8);
  doc.setFontSize(14);
  doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.setFont('helvetica', 'bold');
  const totalText = BRL.format(totalCommission);
  // Ajustar tamanho se necessário
  const totalTextWidth = doc.getTextWidth(totalText);
  if (totalTextWidth > cardWidth - 16) {
    doc.setFontSize(11);
  }
  doc.text(totalText, margin + (cardWidth + 5) * 2 + 8, cardY + 18);
  
  yPos = cardY + cardHeight + 15;
  
  // Linha divisória estilizada
  doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setLineWidth(2);
  doc.line(margin, yPos, margin + 50, yPos);
  yPos += 12;

  // ===== TABELAS POR PARCEIRO =====
  Object.entries(paymentsByPartner)
    .sort(([, a], [, b]) => {
      const totalA = a.reduce((sum, p) => sum + Number(p.partnerDiscount || 0), 0);
      const totalB = b.reduce((sum, p) => sum + Number(p.partnerDiscount || 0), 0);
      return totalB - totalA; // Ordenar por total decrescente
    })
    .forEach(([partnerName, partnerPayments]) => {
      checkPageBreak(35);

      // Calcular total do parceiro
      const partnerTotal = partnerPayments.reduce(
        (sum, p) => sum + Number(p.partnerDiscount || 0),
        0
      );

      // Cabeçalho do parceiro com fundo colorido
      const headerHeight = 12;
      drawStyledRect(margin, yPos, maxWidth, headerHeight, primaryColor);
      
      doc.setFontSize(12);
      doc.setTextColor(white[0], white[1], white[2]);
      doc.setFont('helvetica', 'bold');
      doc.text(partnerName, margin + 8, yPos + 8);
      
      // Total do parceiro no cabeçalho (à direita)
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const totalText = `Total: ${BRL.format(partnerTotal)}`;
      doc.text(totalText, pageWidth - margin - 8, yPos + 8, { align: 'right' });
      
      yPos += headerHeight + 2;

      // Tabela de comissões
      const tableTop = yPos;
      const rowHeight = 8;
      const colWidths = [maxWidth * 0.45, maxWidth * 0.25, maxWidth * 0.30];
      let currentY = tableTop;

      // Cabeçalho da tabela estilizado
      drawStyledRect(margin, currentY, maxWidth, rowHeight, lightGray, borderColor, 0.5);
      
      doc.setFontSize(9);
      doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('Serviço', margin + 8, currentY + 6);
      doc.text('Data', margin + colWidths[0] + 8, currentY + 6);
      doc.text('Comissão', margin + colWidths[0] + colWidths[1] + 8, currentY + 6);
      currentY += rowHeight;

      // Linhas da tabela
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      partnerPayments.forEach((payment, index) => {
        checkPageBreak(rowHeight + 2);
        
        // Alternar cor de fundo e bordas
        const rowFillColor = index % 2 === 0 ? white : lightGray;
        drawStyledRect(margin, currentY, maxWidth, rowHeight, rowFillColor, borderColor, 0.1);

        const serviceName = payment.service?.name || payment.serviceName || 'N/A';
        const paymentDate = payment.paymentDate || payment.createdAt || '';
        const commission = Number(payment.partnerDiscount || 0);

        // Truncar texto se necessário
        const maxServiceLength = 30;
        const displayService = serviceName.length > maxServiceLength 
          ? serviceName.substring(0, maxServiceLength - 3) + '...' 
          : serviceName;

        doc.setTextColor(textColor[0], textColor[1], textColor[2]);
        doc.text(displayService, margin + 8, currentY + 6);
        doc.text(formatDate(paymentDate), margin + colWidths[0] + 8, currentY + 6);
        
        // Valor destacado
        doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(BRL.format(commission), margin + colWidths[0] + colWidths[1] + 8, currentY + 6);
        
        currentY += rowHeight;
      });

      // Total do parceiro destacado
      checkPageBreak(rowHeight + 5);
      drawStyledRect(margin, currentY, maxWidth, rowHeight + 2, [245, 250, 255], primaryColor, 1);
      currentY += 2;
      
      doc.setFontSize(10);
      doc.setTextColor(headerColor[0], headerColor[1], headerColor[2]);
      doc.setFont('helvetica', 'bold');
      doc.text('Total do Parceiro:', margin + colWidths[0] + colWidths[1] - 50, currentY + 6);
      doc.setFontSize(11);
      doc.setTextColor(accentColor[0], accentColor[1], accentColor[2]);
      doc.text(BRL.format(partnerTotal), margin + colWidths[0] + colWidths[1] + 8, currentY + 6);
      currentY += rowHeight + 8;

      yPos = currentY;
    });

  // ===== TOTAL GERAL DESTACADO =====
  if (Object.keys(paymentsByPartner).length > 0) {
    checkPageBreak(20);
    
    drawStyledRect(margin, yPos, maxWidth, 15, accentColor);
    
    doc.setFontSize(12);
    doc.setTextColor(white[0], white[1], white[2]);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL GERAL DE COMISSÕES', margin + 8, yPos + 10);
    
    doc.setFontSize(14);
    doc.text(BRL.format(totalCommission), pageWidth - margin - 8, yPos + 10, { align: 'right' });
    
    yPos += 20;
  }

  // ===== RODAPÉ ESTILIZADO =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Linha superior do rodapé
    doc.setDrawColor(borderColor[0], borderColor[1], borderColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    
    // Texto do rodapé
    doc.setFontSize(8);
    doc.setTextColor(textColor[0], textColor[1], textColor[2]);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 12,
      { align: 'center' }
    );
    
    // Informação adicional no rodapé
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'Revittah Care - Relatório gerado automaticamente pelo sistema',
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  // Salvar PDF
  const fileName = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

/**
 * Formata data para exibição
 */
function formatDate(dateString: string): string {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  } catch {
    return dateString;
  }
}

/**
 * Gera relatório financeiro diário otimizado (para e-mail)
 */
export function generateDailyFinancialReport(payments: Payment[]): {
  summary: {
    totalReceived: number;
    totalPending: number;
    totalCommission: number;
    totalPayments: number;
  };
  byPartner: Array<{
    partnerName: string;
    commission: number;
    count: number;
  }>;
  byMethod: Record<string, { total: number; count: number }>;
  byStatus: Record<string, { total: number; count: number }>;
} {
  const summary = {
    totalReceived: 0,
    totalPending: 0,
    totalCommission: 0,
    totalPayments: payments.length,
  };

  const byPartner: Record<string, { commission: number; count: number }> = {};
  const byMethod: Record<string, { total: number; count: number }> = {};
  const byStatus: Record<string, { total: number; count: number }> = {};

  payments.forEach(payment => {
    const amount = Number(payment.amount || 0);
    const commission = Number(payment.partnerDiscount || 0);
    const finalAmount = payment.finalAmount !== undefined 
      ? Number(payment.finalAmount) 
      : amount - Number(payment.partnerDiscount || 0) - Number(payment.clientDiscount || 0);

    // Totais por status
    if (payment.paymentStatus === 'PAID') {
      summary.totalReceived += finalAmount;
    } else if (payment.paymentStatus === 'PENDING' || payment.paymentStatus === 'OVERDUE') {
      summary.totalPending += finalAmount;
    }

    summary.totalCommission += commission;

    // Por parceiro
    const partnerName = payment.partnerName || 'Sem parceiro';
    if (!byPartner[partnerName]) {
      byPartner[partnerName] = { commission: 0, count: 0 };
    }
    byPartner[partnerName].commission += commission;
    byPartner[partnerName].count += 1;

    // Por método de pagamento
    const method = payment.paymentMethod;
    if (!byMethod[method]) {
      byMethod[method] = { total: 0, count: 0 };
    }
    byMethod[method].total += finalAmount;
    byMethod[method].count += 1;

    // Por status
    const status = payment.paymentStatus;
    if (!byStatus[status]) {
      byStatus[status] = { total: 0, count: 0 };
    }
    byStatus[status].total += finalAmount;
    byStatus[status].count += 1;
  });

  return {
    summary,
    byPartner: Object.entries(byPartner)
      .map(([partnerName, data]) => ({
        partnerName,
        commission: data.commission,
        count: data.count,
      }))
      .sort((a, b) => b.commission - a.commission),
    byMethod,
    byStatus,
  };
}

