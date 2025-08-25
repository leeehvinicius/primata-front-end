"use client"
import React from "react"
import Modal from "@/components/ui/Modal"

export type PermissionKey =
    | "dashboard" | "patients" | "partners" | "appointments"
    | "services" | "billing" | "users" | "settings"

export type Profile = {
    id: string
    name: string
    description?: string
    permissions: PermissionKey[]
}

type AccessModalProps = {
    open: boolean
    onClose: () => void
    profile: Profile | null
    draft: PermissionKey[]
    modules: { key: PermissionKey; label: string }[]
    onToggle: (key: PermissionKey) => void
    onSave: () => void
}

export default function AccessModal({
    open, onClose, profile, draft, modules, onToggle, onSave,
}: AccessModalProps) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Níveis de acesso — ${profile?.name ?? ""}`}
            footer={
                <>
                    <button className="btn" onClick={onClose}>Cancelar</button>
                    <button className="btn btn-primary" onClick={onSave}>Salvar níveis</button>
                </>
            }
        >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modules.map(mod => (
                    <label key={mod.key} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                        <input
                            type="checkbox"
                            className="accent-brand-500"
                            checked={draft.includes(mod.key)}
                            onChange={() => onToggle(mod.key)}
                        />
                        <span className="text-white/90">{mod.label}</span>
                    </label>
                ))}
            </div>
        </Modal>
    )
}
