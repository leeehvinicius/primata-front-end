"use client"
import React from "react"

type ModalProps = {
    open: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    footer?: React.ReactNode
    className?: string
}

export default function Modal({ open, onClose, title, children, footer, className }: ModalProps) {
    if (!open) return null
    return (
        <div
            className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4 animate-fade-in"
            onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            <div className={`card w-full max-w-3xl p-6 animate-slide-up ${className || ""}`}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button 
                        className="btn btn-outline px-3 py-2" 
                        onClick={onClose}
                    >
                        Fechar
                    </button>
                </div>
                {children}
                {footer && <div className="mt-4 flex justify-end gap-2">{footer}</div>}
            </div>
        </div>
    )
}
