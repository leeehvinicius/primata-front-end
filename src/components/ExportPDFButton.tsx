"use client";

import { useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";

type Props = {
    targetId: string;          // id do container a exportar
    filename?: string;         // nome do arquivo
    label?: string;            // texto do botão
    landscape?: boolean;       // paisagem?
};

export default function ExportPDFButton({
    targetId,
    filename = "dashboard.pdf",
    label = "Exportar PDF",
    landscape = true,
}: Props) {
    const [loading, setLoading] = useState(false);

    async function handleExport() {
        const el = document.getElementById(targetId);
        if (!el) {
            toast.error("Área para exportar não encontrada.");
            return;
        }
        try {
            setLoading(true);
            // aumenta o scale para melhorar nitidez dos gráficos (SVG->raster)
            const canvas = await html2canvas(el, {
                backgroundColor: "#0a0a0a", // fundo dark
                scale: 2,
                useCORS: true,
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF({
                orientation: landscape ? "landscape" : "portrait",
                unit: "pt",
                format: "a4",
                compress: true,
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();

            // dimensiona a imagem para caber na largura e calcula altura proporcional
            const imgWidth = pageWidth;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            // se o conteúdo for maior que 1 página, paginar verticalmente
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft > 0) {
                pdf.addPage();
                position = heightLeft - imgHeight;
                pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            pdf.save(filename);
            toast.success("PDF gerado com sucesso!");
        } catch (err) {
            console.error(err);
            toast.error("Falha ao gerar PDF.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={loading}
            className="px-3 py-2 rounded-lg border border-neutral-700 hover:border-indigo-500 hover:bg-neutral-800 transition text-sm"
            title="Exportar a área acima para PDF"
        >
            {loading ? "Gerando..." : label}
        </button>
    );
}
