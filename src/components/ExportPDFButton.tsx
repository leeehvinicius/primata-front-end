"use client"
import { useState } from "react"
import { Download } from "lucide-react"

interface ExportPDFButtonProps {
    onExport: () => Promise<void>
    disabled?: boolean
    className?: string
}

export default function ExportPDFButton({ onExport, disabled = false, className = "" }: ExportPDFButtonProps) {
    const [loading, setLoading] = useState(false)

    const handleExport = async () => {
        if (loading) return
        
        setLoading(true)
        try {
            await onExport()
        } catch (error) {
            console.error("Erro ao exportar PDF:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handleExport}
            disabled={disabled || loading}
            className={`btn btn-outline flex items-center gap-2 transition-all duration-200 ${className}`}
            title="Exportar a área acima para PDF"
        >
            <Download className="h-4 w-4" />
            {loading ? "Exportando..." : "Exportar PDF"}
        </button>
    )
}
