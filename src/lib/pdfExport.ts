import jsPDF from "jspdf";
import type { Payment } from "../types/finance";

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

// ✅ SUA LOGO (fica em /public)
const DEFAULT_LOGO_FILE = "LOGO BRANCA.png";

/** ===== Cores (SÓ HEX) ===== */
const THEME = {
  // ✅ Cor oficial do marketing
  green: "#659A4C",

  // Derivadas (geradas a partir do verde oficial)
  greenDark: darkenHex("#659A4C", 0.22),
  greenSoft: mixHex("#659A4C", "#FFFFFF", 0.85), // bem clarinho (cards)

  // Neutras
  text: "#232323",
  grayBg: "#F5F7F8",
  grayBorder: "#D2D7D9",
  white: "#FFFFFF",
  mutedText: "#8C8C8C",
};

/** ===== Helpers ===== */

function safeToNumber(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatDate(dateString: string): string {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("pt-BR");
}

function getPublicAssetUrl(fileName: string): string {
  return `${window.location.origin}/${encodeURIComponent(fileName)}`;
}

async function fetchAsBase64(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function loadLogoAsBase64(fileName = DEFAULT_LOGO_FILE): Promise<string | null> {
  if (typeof window === "undefined") return null;
  return fetchAsBase64(getPublicAssetUrl(fileName));
}

/** ===== HEX helpers (jsPDF usa RGB, mas aqui você só passa HEX) ===== */

function normalizeHex(hex: string): string {
  let h = hex.trim();
  if (!h.startsWith("#")) h = `#${h}`;
  if (h.length === 4) {
    // #RGB -> #RRGGBB
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  }
  return h.toUpperCase();
}

function hexToRgb(hex: string): [number, number, number] {
  const h = normalizeHex(hex).slice(1);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return [r, g, b];
}

function setFillColorHex(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  doc.setFillColor(r, g, b);
}

function setDrawColorHex(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  doc.setDrawColor(r, g, b);
}

function setTextColorHex(doc: jsPDF, hex: string) {
  const [r, g, b] = hexToRgb(hex);
  doc.setTextColor(r, g, b);
}

/**
 * Escurece uma cor HEX (0..1)
 * amount=0.22 => 22% mais escuro
 */
function darkenHex(hex: string, amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  const f = (x: number) => Math.max(0, Math.round(x * (1 - amount)));
  return rgbToHex(f(r), f(g), f(b));
}

/**
 * Mistura duas cores HEX
 * mix=0..1 (quanto mais perto de 1, mais pega a segunda cor)
 */
function mixHex(a: string, b: string, mix: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const lerp = (x: number, y: number) => Math.round(x + (y - x) * mix);
  return rgbToHex(lerp(ar, br), lerp(ag, bg), lerp(ab, bb));
}

function rgbToHex(r: number, g: number, b: number): string {
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

function drawRect(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  opts?: { fill?: string; stroke?: string; lineWidth?: number }
) {
  const { fill, stroke, lineWidth = 0.4 } = opts || {};
  if (fill) {
    setFillColorHex(doc, fill);
    doc.rect(x, y, w, h, "F");
  }
  if (stroke) {
    setDrawColorHex(doc, stroke);
    doc.setLineWidth(lineWidth);
    doc.rect(x, y, w, h, "S");
  }
}

function fallbackHeaderText(doc: jsPDF, pageWidth: number) {
  setTextColorHex(doc, THEME.white);
  doc.setFont("times", "normal");
  doc.setFontSize(22);
  doc.text("REVITTAH", pageWidth / 2, 20, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("C A R E", pageWidth / 2, 28, { align: "center" });
}

function groupByPartner(payments: Payment[]) {
  const byPartner: Record<string, Payment[]> = {};
  for (const p of payments) {
    const name = p.partnerName || "Sem parceiro";
    if (!byPartner[name]) byPartner[name] = [];
    byPartner[name].push(p);
  }
  return byPartner;
}

function calcTotalCommission(byPartner: Record<string, Payment[]>) {
  let total = 0;
  for (const arr of Object.values(byPartner)) {
    for (const p of arr) total += safeToNumber(p.partnerDiscount);
  }
  return total;
}

// ✅ pega cliente de vários formatos possíveis
function getClientNameFromPayment(p: Payment): string {
  const anyP = p as any;

  const name =
    anyP.client?.name ||
    anyP.clientName ||
    anyP.appointment?.client?.name ||
    anyP.cliente_nome ||
    anyP.customerName ||
    anyP.customer?.name ||
    anyP.patient?.name ||
    anyP.patientName ||
    "N/A";

  return String(name);
}

/** ===== Export PDF ===== */
export async function exportFinancialReportToPDF(
  payments: Payment[],
  title: string = "Relatório Financeiro",
  dateRange?: { start: string; end: string }
): Promise<void> {
  const doc = new jsPDF();

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const margin = 18;
  const maxWidth = pageWidth - 2 * margin;
  let yPos = margin;

  const checkPageBreak = (requiredSpace = 10) => {
    if (yPos + requiredSpace > pageHeight - margin - 18) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // ===== Header =====
  const headerH = 42;
  setFillColorHex(doc, THEME.green);
  doc.rect(0, 0, pageWidth, headerH, "F");

  const logoBase64 = await loadLogoAsBase64(DEFAULT_LOGO_FILE);
  if (logoBase64) {
    try {
      const logoW = 80;
      const logoH = 18;
      doc.addImage(logoBase64, "PNG", (pageWidth - logoW) / 2, 11, logoW, logoH);
    } catch {
      fallbackHeaderText(doc, pageWidth);
    }
  } else {
    fallbackHeaderText(doc, pageWidth);
  }

  // ===== Title =====
  yPos = headerH + 16;

  setTextColorHex(doc, THEME.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, pageWidth / 2, yPos, { align: "center" });

  if (dateRange) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`${formatDate(dateRange.start)} a ${formatDate(dateRange.end)}`, pageWidth - margin, yPos + 10, {
      align: "right",
    });
  }

  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.text(
    `Gerado em ${new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    margin,
    yPos + 12
  );

  setDrawColorHex(doc, THEME.grayBorder);
  doc.setLineWidth(0.4);
  doc.line(margin, yPos + 18, pageWidth - margin, yPos + 18);

  yPos += 26;

  // ===== Data =====
  const paymentsByPartner = groupByPartner(payments);
  const totalCommission = calcTotalCommission(paymentsByPartner);

  // ===== Cards =====
  checkPageBreak(36);

  const cardH = 20;
  const gap = 6;
  const cardW = (maxWidth - gap * 2) / 3;
  const cardY = yPos;

  // 1
  drawRect(doc, margin, cardY, cardW, cardH, { fill: THEME.grayBg, stroke: THEME.grayBorder, lineWidth: 0.5 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setTextColorHex(doc, THEME.text);
  doc.text("Total de Parceiros", margin + 6, cardY + 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(String(Object.keys(paymentsByPartner).length), margin + 6, cardY + 16);

  // 2
  drawRect(doc, margin + cardW + gap, cardY, cardW, cardH, {
    fill: THEME.grayBg,
    stroke: THEME.grayBorder,
    lineWidth: 0.5,
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Total de Registros", margin + cardW + gap + 6, cardY + 8);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(String(payments.length), margin + cardW + gap + 6, cardY + 16);

  // 3 (destaque)
  drawRect(doc, margin + (cardW + gap) * 2, cardY, cardW, cardH, {
    fill: THEME.greenSoft,
    stroke: THEME.green,
    lineWidth: 1,
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setTextColorHex(doc, THEME.text);
  doc.text("Total de Comissões", margin + (cardW + gap) * 2 + 6, cardY + 8);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setTextColorHex(doc, THEME.green);
  doc.text(BRL.format(totalCommission), margin + (cardW + gap) * 2 + 6, cardY + 16);

  yPos = cardY + cardH + 12;

  // ===== Linha + tracinho verde =====
  setDrawColorHex(doc, THEME.grayBorder);
  doc.setLineWidth(0.4);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  setDrawColorHex(doc, THEME.green);
  doc.setLineWidth(2.0);
  doc.line(margin, yPos, margin + 45, yPos);

  yPos += 10;

  // ===== Tables by partner =====
  Object.entries(paymentsByPartner)
    .sort(([, a], [, b]) => {
      const ta = a.reduce((s, p) => s + safeToNumber(p.partnerDiscount), 0);
      const tb = b.reduce((s, p) => s + safeToNumber(p.partnerDiscount), 0);
      return tb - ta;
    })
    .forEach(([partnerName, partnerPayments]) => {
      checkPageBreak(46);

      const partnerTotal = partnerPayments.reduce((s, p) => s + safeToNumber(p.partnerDiscount), 0);

      // partner header
      const partnerHeaderH = 8;
      drawRect(doc, margin, yPos, maxWidth, partnerHeaderH, { fill: THEME.green });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setTextColorHex(doc, THEME.white);
      doc.text(partnerName, margin + 6, yPos + 5.8);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Total: ${BRL.format(partnerTotal)}`, pageWidth - margin - 6, yPos + 5.8, { align: "right" });

      yPos += partnerHeaderH;

      const rowH = 7;
      const colW = [maxWidth * 0.52, maxWidth * 0.22, maxWidth * 0.26];

      // table header
      drawRect(doc, margin, yPos, maxWidth, rowH, { fill: THEME.grayBg, stroke: THEME.grayBorder, lineWidth: 0.4 });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.2);
      setTextColorHex(doc, THEME.text);
      doc.text("Cliente", margin + 6, yPos + 5.1);
      doc.text("Data", margin + colW[0] + 6, yPos + 5.1);
      doc.text("Comissão", margin + colW[0] + colW[1] + 6, yPos + 5.1);

      yPos += rowH;

      // rows
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.2);

      partnerPayments.forEach((p, idx) => {
        checkPageBreak(rowH + 6);

        const fill = idx % 2 === 0 ? THEME.white : THEME.grayBg;
        drawRect(doc, margin, yPos, maxWidth, rowH, { fill, stroke: THEME.grayBorder, lineWidth: 0.1 });

        // ✅ CLIENTE (no lugar do serviço)
        const clientName = getClientNameFromPayment(p);
        const displayClient = clientName.length > 42 ? `${clientName.slice(0, 39)}...` : clientName;

        const paymentDate = (p as any).paymentDate || (p as any).createdAt || "";
        const commission = safeToNumber(p.partnerDiscount);

        setTextColorHex(doc, THEME.text);
        doc.text(displayClient, margin + 6, yPos + 5.1);
        doc.text(formatDate(paymentDate), margin + colW[0] + 6, yPos + 5.1);

        doc.setFont("helvetica", "bold");
        setTextColorHex(doc, THEME.green);
        doc.text(BRL.format(commission), margin + colW[0] + colW[1] + 6, yPos + 5.1);
        doc.setFont("helvetica", "normal");

        yPos += rowH;
      });

      // partner total row
      checkPageBreak(12);
      drawRect(doc, margin, yPos, maxWidth, rowH + 0.5, { fill: THEME.white, stroke: THEME.green, lineWidth: 1 });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8.8);
      setTextColorHex(doc, THEME.text);
      doc.text("Total do Parceiro:", margin + colW[0] + colW[1] - 45, yPos + 5.1);

      setTextColorHex(doc, THEME.green);
      doc.text(BRL.format(partnerTotal), margin + colW[0] + colW[1] + 6, yPos + 5.1);

      yPos += rowH + 7;
    });

  // ===== Total geral =====
  if (Object.keys(paymentsByPartner).length > 0) {
    checkPageBreak(20);

    drawRect(doc, margin, yPos, maxWidth, 12, { fill: THEME.green });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setTextColorHex(doc, THEME.white);
    doc.text("TOTAL GERAL DE COMISSÕES", margin + 6, yPos + 8.4);

    doc.setFontSize(10);
    doc.text(BRL.format(totalCommission), pageWidth - margin - 6, yPos + 8.4, { align: "right" });

    yPos += 16;
  }

  // ===== Footer =====
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    setDrawColorHex(doc, THEME.grayBorder);
    doc.setLineWidth(0.4);
    doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    setTextColorHex(doc, THEME.text);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: "center" });

    doc.setFontSize(7);
    setTextColorHex(doc, THEME.mutedText);
    doc.text("Revittah Care - Relatório gerado automaticamente pelo sistema", pageWidth / 2, pageHeight - 5, {
      align: "center",
    });
  }

  doc.save(`relatorio_financeiro_${new Date().toISOString().split("T")[0]}.pdf`);
}

/**
 * Gera relatório financeiro diário (para e-mail)
 * (mantive sua assinatura/retorno)
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

  payments.forEach((payment) => {
    const amount = safeToNumber((payment as any).amount);
    const commission = safeToNumber((payment as any).partnerDiscount);

    const finalAmount =
      (payment as any).finalAmount !== undefined
        ? safeToNumber((payment as any).finalAmount)
        : amount - commission - safeToNumber((payment as any).clientDiscount);

    if ((payment as any).paymentStatus === "PAID") {
      summary.totalReceived += finalAmount;
    } else if ((payment as any).paymentStatus === "PENDING" || (payment as any).paymentStatus === "OVERDUE") {
      summary.totalPending += finalAmount;
    }

    summary.totalCommission += commission;

    const partnerName = (payment as any).partnerName || "Sem parceiro";
    if (!byPartner[partnerName]) byPartner[partnerName] = { commission: 0, count: 0 };
    byPartner[partnerName].commission += commission;
    byPartner[partnerName].count += 1;

    const method = (payment as any).paymentMethod;
    if (!byMethod[method]) byMethod[method] = { total: 0, count: 0 };
    byMethod[method].total += finalAmount;
    byMethod[method].count += 1;

    const status = (payment as any).paymentStatus;
    if (!byStatus[status]) byStatus[status] = { total: 0, count: 0 };
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
