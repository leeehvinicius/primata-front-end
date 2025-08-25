"use client"

import React, { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

// 👇 importe os componentes refatorados
import AccessModal, { PermissionKey } from "@/components/users/AccessModal"
import ProfileFormModal from "@/components/users/ProfileFormModal"
import UserFormModal from "@/components/users/UserFormModal"

/* ================== Tipos & Mocks ================== */
type Profile = { id: string; name: string; description?: string; permissions: PermissionKey[] }
type User = {
    id: string
    name: string
    email: string
    phone?: string
    profileId: string
    active: boolean
    createdAt?: string
}

const ALL_MODULES: { key: PermissionKey; label: string }[] = [
    { key: "dashboard", label: "Dashboard" },
    { key: "patients", label: "Pacientes" },
    { key: "partners", label: "Parceiros/Convênios" },
    { key: "appointments", label: "Agendamentos" },
    { key: "services", label: "Serviços" },
    { key: "billing", label: "Financeiro" },
    { key: "users", label: "Usuários" },
    { key: "settings", label: "Configurações" },
]

const initialProfiles: Profile[] = [
    { id: "p1", name: "Recepção", description: "Atendimento e agendamentos", permissions: ["dashboard", "patients", "appointments", "billing"] },
    { id: "p2", name: "Administrador", description: "Acesso total ao sistema", permissions: ALL_MODULES.map(m => m.key) },
]

const initialUsers: User[] = [
    { id: "u1", name: "Ana Souza", email: "ana@clinic.com", phone: "11 99999-0000", profileId: "p1", active: true, createdAt: "2025-08-20" },
    { id: "u2", name: "Carlos Lima", email: "carlos@clinic.com", profileId: "p2", active: true, createdAt: "2025-08-18" },
]

/* ================== Schemas ================== */
const userSchema = z.object({
    name: z.string().min(2, "Informe o nome"),
    email: z.string().email("E-mail inválido"),
    phone: z.string().optional(),
    password: z.string().min(4, "Mínimo 4 caracteres").optional(), // mock
    profileId: z.string().min(1, "Selecione um perfil"),
    active: z.boolean().default(true),
})
type UserForm = z.infer<typeof userSchema>

const profileSchema = z.object({
    name: z.string().min(2, "Informe o nome do perfil"),
    description: z.string().optional(),
})
type ProfileForm = z.infer<typeof profileSchema>

/* ================== Utils ================== */
const genId = (p: "u" | "p") => `${p}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg viewBox="0 0 24 24" fill="none" {...props}><path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M16.5 3.5a2.12 2.12 0 1 1 3 3L8 18l-4 1 1-4 11.5-11.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>
)

/* ================== Página ================== */
export default function UsersPage() {
    const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
    const [users, setUsers] = useState<User[]>(initialUsers)
    const [q, setQ] = useState("")

    // modais usuário
    const [openUser, setOpenUser] = useState(false)
    const [openUserEdit, setOpenUserEdit] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    // modais perfil
    const [openProfile, setOpenProfile] = useState(false)
    const [openEditProfile, setOpenEditProfile] = useState(false)
    const [editingProfile, setEditingProfile] = useState<Profile | null>(null)

    // modal níveis de acesso
    const [openAccess, setOpenAccess] = useState(false)
    const [editingAccessProfile, setEditingAccessProfile] = useState<Profile | null>(null)
    const [accessDraft, setAccessDraft] = useState<PermissionKey[]>([])

    // forms
    const {
        register: registerUser,
        handleSubmit: handleSubmitUser,
        reset: resetUser,
        formState: { isSubmitting: savingUser, errors: userErrors },
    } = useForm<UserForm>({ resolver: zodResolver(userSchema), defaultValues: { active: true } })

    const {
        register: registerUserEdit,
        handleSubmit: handleSubmitUserEdit,
        reset: resetUserEdit,
        formState: { isSubmitting: savingUserEdit, errors: userEditErrors },
    } = useForm<UserForm>({ resolver: zodResolver(userSchema) })

    const {
        register: registerProfile,
        handleSubmit: handleSubmitProfile,
        reset: resetProfile,
        formState: { isSubmitting: savingProfile, errors: profileErrors },
    } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) })

    const {
        register: registerProfileEdit,
        handleSubmit: handleSubmitProfileEdit,
        reset: resetProfileEdit,
        formState: { isSubmitting: savingProfileEdit, errors: profileEditErrors },
    } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) })

    // busca
    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase()
        if (!term) return users
        const byProfileId = (id: string) => profiles.find(p => p.id === id)?.name?.toLowerCase() ?? ""
        return users.filter(u =>
            u.name.toLowerCase().includes(term) ||
            u.email.toLowerCase().includes(term) ||
            byProfileId(u.profileId).includes(term)
        )
    }, [q, users, profiles])

    const profileName = (id: string) => profiles.find(p => p.id === id)?.name ?? "—"

    /* ===== Usuário ===== */
    function openEditUser(u: User) {
        setEditingUser(u)
        resetUserEdit({
            name: u.name, email: u.email, phone: u.phone ?? "",
            password: "", profileId: u.profileId, active: u.active,
        })
        setOpenUserEdit(true)
    }
    function toggleUser(id: string, active: boolean) {
        setUsers(prev => prev.map(u => (u.id === id ? { ...u, active } : u)))
    }
    async function onCreateUser(values: UserForm) {
        const novo: User = {
            id: genId("u"), name: values.name, email: values.email,
            phone: values.phone || undefined, profileId: values.profileId,
            active: !!values.active, createdAt: new Date().toISOString().slice(0, 10),
        }
        setUsers(prev => [novo, ...prev])
        toast.success("Usuário cadastrado!")
        resetUser({ active: true }); setOpenUser(false)
    }
    async function onUpdateUser(values: UserForm) {
        if (!editingUser) return
        setUsers(prev => prev.map(u =>
            u.id === editingUser.id
                ? { ...u, name: values.name, email: values.email, phone: values.phone || undefined, profileId: values.profileId, active: values.active }
                : u
        ))
        toast.success("Usuário atualizado!")
        setOpenUserEdit(false); setEditingUser(null)
    }

    /* ===== Perfil ===== */
    async function onCreateProfile(values: ProfileForm) {
        const novo: Profile = { id: genId("p"), name: values.name, description: values.description || undefined, permissions: [] }
        setProfiles(prev => [novo, ...prev])
        toast.success("Perfil cadastrado!")
        resetProfile({})
        // mantém o modal aberto se quiser continuar cadastrando
    }
    function onOpenEditProfile(p: Profile) {
        setEditingProfile(p)
        resetProfileEdit({ name: p.name, description: p.description ?? "" })
        setOpenEditProfile(true)
    }
    async function onUpdateProfile(values: ProfileForm) {
        if (!editingProfile) return
        setProfiles(prev => prev.map(p => p.id === editingProfile.id ? { ...p, name: values.name, description: values.description } : p))
        toast.success("Perfil atualizado!")
        setOpenEditProfile(false); setEditingProfile(null)
    }

    /* ===== Níveis de acesso ===== */
    function openAccessModal(profile: Profile) {
        setEditingAccessProfile(profile)
        setAccessDraft(profile.permissions)
        setOpenAccess(true)
    }
    function togglePermission(key: PermissionKey) {
        setAccessDraft(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key])
    }
    function saveAccess() {
        if (!editingAccessProfile) return
        setProfiles(prev => prev.map(p => p.id === editingAccessProfile.id ? { ...p, permissions: accessDraft } : p))
        toast.success("Níveis de acesso salvos!")
        setOpenAccess(false); setEditingAccessProfile(null)
    }

    /* ================== UI ================== */
    return (
        <div className="grid gap-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">Usuários</h1>
                <div className="flex gap-2">
                    <input
                        className="input w-72"
                        placeholder="Buscar por nome, e-mail ou perfil..."
                        value={q}
                        onChange={e => setQ(e.target.value)}
                    />
                    <button className="btn" onClick={() => setOpenProfile(true)}>Novo perfil</button>
                    <button className="btn btn-primary" onClick={() => setOpenUser(true)}>Novo usuário</button>
                </div>
            </div>

            {/* Lista de Usuários */}
            <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Usuários cadastrados</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-white/70">
                            <tr>
                                <th className="py-2 pr-4">Nome</th>
                                <th className="py-2 pr-4">E-mail</th>
                                <th className="py-2 pr-4">Perfil</th>
                                <th className="py-2 pr-4">Status</th>
                                <th className="py-2 pr-4 w-40">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(u => (
                                <tr key={u.id} className="border-t border-white/5">
                                    <td className="py-3 pr-4">{u.name}</td>
                                    <td className="py-3 pr-4">{u.email}</td>
                                    <td className="py-3 pr-4">
                                        <button
                                            type="button"
                                            className="text-blue-300 hover:text-blue-200 underline underline-offset-4"
                                            onClick={() => {
                                                const p = profiles.find(p => p.id === u.profileId)
                                                if (p) openAccessModal(p)
                                            }}
                                            title="Ver/editar níveis de acesso"
                                        >
                                            {profileName(u.profileId)}
                                        </button>
                                    </td>
                                    <td className="py-3 pr-4">{u.active ? "Ativo" : "Inativo"}</td>
                                    <td className="py-3 pr-0 flex gap-2">
                                        <button className="btn" onClick={() => openEditUser(u)}>
                                            <PencilIcon className="w-4 h-4 mr-1" /> Editar
                                        </button>
                                        <button className="btn" onClick={() => toggleUser(u.id, !u.active)}>
                                            {u.active ? "Desativar" : "Ativar"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {!filtered.length && (
                                <tr>
                                    <td colSpan={5} className="py-6 text-white/50">Nenhum usuário encontrado.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ===== Modais (componentizados) ===== */}

            {/* Perfil: Novo */}
            <ProfileFormModal
                open={openProfile}
                onClose={() => setOpenProfile(false)}
                title="Novo perfil"
                onSubmit={handleSubmitProfile(onCreateProfile)}
                register={registerProfile}
                errors={profileErrors}
                saving={savingProfile}
                /* 👇 NOVO: lista dentro da modal */
                profiles={profiles}
                onEdit={onOpenEditProfile}
                formId="new-profile-form"
            />


            {/* Perfil: Editar */}
            <ProfileFormModal
                open={openEditProfile && !!editingProfile}
                onClose={() => setOpenEditProfile(false)}
                title="Editar perfil"
                onSubmit={handleSubmitProfileEdit(onUpdateProfile)}
                register={registerProfileEdit}
                errors={profileEditErrors}
                saving={savingProfileEdit}
            />

            {/* Usuário: Novo */}
            <UserFormModal
                open={openUser}
                onClose={() => setOpenUser(false)}
                title="Novo usuário"
                onSubmit={handleSubmitUser(onCreateUser)}
                register={registerUser}
                errors={userErrors}
                saving={savingUser}
                profiles={profiles}
            />

            {/* Usuário: Editar */}
            <UserFormModal
                open={openUserEdit && !!editingUser}
                onClose={() => setOpenUserEdit(false)}
                title="Editar usuário"
                onSubmit={handleSubmitUserEdit(onUpdateUser)}
                register={registerUserEdit}
                errors={userEditErrors}
                saving={savingUserEdit}
                profiles={profiles}
                isEdit
            />

            {/* Níveis de Acesso */}
            <AccessModal
                open={openAccess}
                onClose={() => setOpenAccess(false)}
                profile={editingAccessProfile}
                draft={accessDraft}
                modules={ALL_MODULES}
                onToggle={togglePermission}
                onSave={saveAccess}
            />
        </div>
    )
}
