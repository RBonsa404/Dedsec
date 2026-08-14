"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Users, 
  Plus, 
  Search, 
  Shield, 
  UserCheck, 
  UserX, 
  Key, 
  Trash2, 
  Loader2, 
  X,
  AlertCircle,
  CheckCircle2,
  Mail,
  User as UserIcon,
  Filter
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useLangStore } from "@/stores/langStore";
import { translations } from "@/lib/i18n";

interface UserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const currentUser = useAuthStore((state) => state.user);
  const { lang } = useLangStore();
  const t = translations[lang] || translations.fr;

  // Modal Create User
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("TEAM_MEMBER");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  // Action feedback
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError("");
    setModalSuccess("");

    if (!email || !firstName || !lastName || !password) {
      setModalError(lang === "fr" ? "Tous les champs sont requis." : "All fields are required.");
      return;
    }

    if (password.length < 8) {
      setModalError(lang === "fr" ? "Le mot de passe doit contenir au moins 8 caractères." : "Password must be at least 8 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/users", {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        role,
        password,
      });

      setUsers((prev) => [res.data, ...prev]);
      setModalSuccess(lang === "fr" ? `Opérateur ${firstName} ${lastName} provisionné avec succès.` : `Operator ${firstName} ${lastName} successfully provisioned.`);
      setTimeout(() => {
        setIsCreateModalOpen(false);
        setEmail("");
        setFirstName("");
        setLastName("");
        setPassword("");
        setRole("TEAM_MEMBER");
        setModalSuccess("");
      }, 1200);
    } catch (error: any) {
      setModalError(error.response?.data?.message || (lang === "fr" ? "Échec de création de l'opérateur" : "Failed to create operator"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuspend = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}/suspend`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: "SUSPENDED" } : u))
      );
      showFeedback(lang === "fr" ? "Opérateur suspendu avec succès." : "Operator suspended successfully.");
    } catch (error: any) {
      showFeedback(error.response?.data?.message || (lang === "fr" ? "Impossible de suspendre cet opérateur." : "Failed to suspend user."));
    }
  };

  const handleReactivate = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}/reactivate`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, status: "ACTIVE" } : u))
      );
      showFeedback(lang === "fr" ? "Opérateur réactivé avec succès." : "Operator reactivated successfully.");
    } catch (error: any) {
      showFeedback(error.response?.data?.message || (lang === "fr" ? "Impossible de réactiver cet opérateur." : "Failed to reactivate user."));
    }
  };

  const handleResetPassword = async (userId: string) => {
    const tempPass = prompt(
      lang === "fr" ? "Entrez le nouveau mot de passe temporaire (min 8 car.) :" : "Enter new temporary passphrase (min 8 chars):",
      "Temporary@2026"
    );
    if (!tempPass) return;
    if (tempPass.length < 8) {
      alert(lang === "fr" ? "Le mot de passe doit faire au moins 8 caractères." : "Password must be at least 8 characters.");
      return;
    }

    try {
      await api.patch(`/users/${userId}/reset-password`, { newPassword: tempPass });
      showFeedback(lang === "fr" ? "Mot de passe réinitialisé avec succès." : "Passphrase reset successfully.");
      fetchUsers();
    } catch (error: any) {
      showFeedback(error.response?.data?.message || (lang === "fr" ? "Action non autorisée." : "Failed to reset password."));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(lang === "fr" ? "Êtes-vous sûr de vouloir supprimer définitivement cet opérateur ?" : "Are you sure you want to completely purge this operator?")) return;

    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      showFeedback(lang === "fr" ? "Opérateur supprimé de la base." : "Operator purged from database.");
    } catch (error: any) {
      showFeedback(error.response?.data?.message || (lang === "fr" ? "Action non autorisée : Vous ne pouvez pas supprimer cet utilisateur." : "Action unauthorized."));
    }
  };

  const showFeedback = (msg: string) => {
    setActionMessage(msg);
    setTimeout(() => setActionMessage(""), 3500);
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      searchQuery === "" ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.lastName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === "ALL" || u.role === roleFilter;
    const matchesStatus = statusFilter === "ALL" || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const roleStyles: Record<string, { bg: string; text: string; border: string }> = {
    ADMIN: { bg: "bg-rose-950/60", text: "text-rose-400", border: "border-rose-800/60" },
    PROJECT_MANAGER: { bg: "bg-cyan-950/60", text: "text-cyan-400", border: "border-cyan-800/60" },
    TEAM_MEMBER: { bg: "bg-emerald-950/60", text: "text-emerald-400", border: "border-emerald-800/60" },
  };

  const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
    ACTIVE: { bg: "bg-emerald-950/50", text: "text-emerald-400", border: "border-emerald-800/50" },
    SUSPENDED: { bg: "bg-rose-950/50", text: "text-rose-400", border: "border-rose-800/50" },
    PENDING_PASSWORD_CHANGE: { bg: "bg-amber-950/50", text: "text-amber-400", border: "border-amber-800/50" },
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            <span>{t.users_title}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t.users_subtitle}
          </p>
        </div>

        <Button 
          onClick={() => setIsCreateModalOpen(true)} 
          className="rounded-xl text-xs gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> {t.provision_operator}
        </Button>
      </div>

      {actionMessage && (
        <div className="rounded-2xl border border-emerald-500/60 bg-emerald-950/40 p-3.5 text-xs text-emerald-400 font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {actionMessage}
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#232f44] bg-[#111827] p-4 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[260px]">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === "fr" ? "Rechercher par nom ou email..." : "Search by name or email..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#162032] border border-[#26334a] text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#162032] px-3 py-1.5 rounded-xl border border-[#26334a]">
            <span className="text-slate-400 font-semibold">{t.role} :</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#162032] text-slate-200">{t.all}</option>
              <option value="ADMIN" className="bg-[#162032] text-rose-400">ADMIN</option>
              <option value="PROJECT_MANAGER" className="bg-[#162032] text-cyan-400">PROJECT_MANAGER</option>
              <option value="TEAM_MEMBER" className="bg-[#162032] text-emerald-400">TEAM_MEMBER</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[#162032] px-3 py-1.5 rounded-xl border border-[#26334a]">
            <span className="text-slate-400 font-semibold">{t.status} :</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#162032] text-slate-200">{t.all}</option>
              <option value="ACTIVE" className="bg-[#162032] text-emerald-400">ACTIVE</option>
              <option value="SUSPENDED" className="bg-[#162032] text-rose-400">SUSPENDED</option>
              <option value="PENDING_PASSWORD_CHANGE" className="bg-[#162032] text-amber-400">PENDING_CHANGE</option>
            </select>
          </div>
        </div>
      </div>

      {/* Operators Table */}
      <div className="rounded-2xl border border-[#232f44] bg-[#111827] overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="text-[11px] text-slate-400 uppercase bg-[#162032] border-b border-[#232f44]">
            <tr>
              <th className="px-6 py-4">{lang === "fr" ? "Opérateur" : "Operator"}</th>
              <th className="px-6 py-4">{t.role}</th>
              <th className="px-6 py-4">{t.security_status}</th>
              <th className="px-6 py-4">{t.provisioned_on}</th>
              <th className="px-6 py-4">{t.last_activity}</th>
              <th className="px-6 py-4 text-right">{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e2a3e]">
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                  {lang === "fr" ? "Aucun opérateur ne correspond aux filtres de recherche." : "No operators matching the current filters."}
                </td>
              </tr>
            ) : (
              filteredUsers.map((u) => {
                const rStyle = roleStyles[u.role] || roleStyles.TEAM_MEMBER;
                const sStyle = statusStyles[u.status] || statusStyles.ACTIVE;

                return (
                  <tr key={u.id} className="hover:bg-[#162032]/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-300 text-xs">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100">
                            {u.firstName} {u.lastName}
                          </div>
                          <div className="text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${rStyle.bg} ${rStyle.text} ${rStyle.border}`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
                        {u.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-6 py-4 text-slate-400">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : (lang === "fr" ? "Jamais" : "Never")}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Reset Passphrase */}
                        {(currentUser?.role === 'ADMIN' || (currentUser?.role === 'PROJECT_MANAGER' && u.role === 'TEAM_MEMBER')) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResetPassword(u.id)}
                            className="h-8 w-8 p-0 rounded-lg border-[#2b3a55] bg-[#141b2b] hover:bg-[#1e293b] text-amber-400"
                            title={lang === "fr" ? "Réinitialiser le mot de passe" : "Reset Passphrase"}
                          >
                            <Key className="w-3.5 h-3.5" />
                          </Button>
                        )}

                        {/* Suspend / Reactivate */}
                        {u.role !== 'ADMIN' && (currentUser?.role === 'ADMIN' || (currentUser?.role === 'PROJECT_MANAGER' && u.role === 'TEAM_MEMBER')) && (
                          u.status === "SUSPENDED" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReactivate(u.id)}
                              className="h-8 w-8 p-0 rounded-lg border-[#2b3a55] bg-[#141b2b] hover:bg-emerald-950/50 text-emerald-400"
                              title={lang === "fr" ? "Réactiver l'opérateur" : "Reactivate"}
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSuspend(u.id)}
                              disabled={u.id === currentUser?.id}
                              className="h-8 w-8 p-0 rounded-lg border-[#2b3a55] bg-[#141b2b] hover:bg-rose-950/50 text-rose-400"
                              title={lang === "fr" ? "Suspendre l'opérateur" : "Suspend"}
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </Button>
                          )
                        )}

                        {/* Delete User */}
                        {u.role !== 'ADMIN' && (currentUser?.role === 'ADMIN' || (currentUser?.role === 'PROJECT_MANAGER' && u.role === 'TEAM_MEMBER')) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteUser(u.id)}
                            disabled={u.id === currentUser?.id}
                            className="h-8 w-8 p-0 rounded-lg border-[#2b3a55] bg-[#141b2b] hover:bg-rose-950/50 text-slate-400 hover:text-rose-400"
                            title={t.delete}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Provision Operator Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
          <div className="w-full max-w-lg rounded-2xl border border-[#26334a] bg-[#111827] p-7 shadow-2xl relative text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#232e42] pb-4 mb-5">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>{t.provision_operator}</span>
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-slate-300 font-semibold">{lang === "fr" ? "PRÉNOM" : "FIRST NAME"}</Label>
                  <Input
                    id="firstName"
                    placeholder="e.g. Elliot"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-slate-300 font-semibold">{lang === "fr" ? "NOM" : "LAST NAME"}</Label>
                  <Input
                    id="lastName"
                    placeholder="e.g. Alderson"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-slate-300 font-semibold">{lang === "fr" ? "ADRESSE EMAIL / IDENTIFIANT" : "EMAIL / IDENTIFIER"}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="operator@dedsec.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-slate-300 font-semibold">{t.role}</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full rounded-xl border border-[#2b3a55] bg-[#162032] p-2.5 text-xs text-slate-100 font-medium focus:border-emerald-500 focus:outline-none"
                >
                  <option value="TEAM_MEMBER">{lang === "fr" ? "TEAM_MEMBER (Membre Opérateur)" : "TEAM_MEMBER (Operative)"}</option>
                  <option value="PROJECT_MANAGER">{lang === "fr" ? "PROJECT_MANAGER (Chef de Projet)" : "PROJECT_MANAGER (Field Commander)"}</option>
                  <option value="ADMIN">{lang === "fr" ? "ADMIN (Administrateur Système)" : "ADMIN (System Core)"}</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-slate-300 font-semibold">{lang === "fr" ? "MOT DE PASSE PROVISOIRE" : "TEMPORARY PASSWORD"}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={lang === "fr" ? "Min 8 caractères" : "Min 8 characters"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                />
              </div>

              {modalError && (
                <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 p-3 text-rose-400 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {modalError}
                </div>
              )}

              {modalSuccess && (
                <div className="rounded-xl border border-emerald-500/60 bg-emerald-950/40 p-3 text-emerald-400 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0" /> {modalSuccess}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#232e42]">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl border-[#2b3a55] bg-[#162032] hover:bg-[#1e293b] text-slate-300">
                  {t.cancel}
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                  {isSubmitting ? (lang === "fr" ? "Création en cours..." : "Provisioning...") : t.provision_operator}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
