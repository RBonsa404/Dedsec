"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  ShieldCheck, 
  Activity, 
  FolderKanban, 
  UserPlus, 
  Radio, 
  RefreshCw, 
  Loader2, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  FileCheck,
  Shield,
  Key,
  Lock,
  Unlock,
  Trash2,
  Eye
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useLangStore } from "@/stores/langStore";
import { translations } from "@/lib/i18n";

interface AuditLog {
  id: string;
  action: string;
  createdAt: string;
  details?: string;
  actor?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: {
    SUPER_ADMIN: number;
    ADMIN: number;
    PROJECT_MANAGER: number;
    TEAM_MEMBER: number;
  };
  totalProjects: number;
  activeProjects: number;
  totalTasks: number;
  totalAbsences: number;
  pendingAbsences: number;
  recentAuditLogs: AuditLog[];
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { lang } = useLangStore();
  const t = translations[lang] || translations.fr;

  const [stats, setStats] = useState<SystemStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [resetRequests, setResetRequests] = useState<any[]>([]);
  const [showResetRequests, setShowResetRequests] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchResetRequests();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/audit-logs/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch live admin stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchResetRequests = async () => {
    try {
      const res = await api.get("/password-reset-requests/pending");
      setResetRequests(res.data);
    } catch (error) {
      console.error("Failed to fetch reset requests:", error);
    }
  };

  const handleApproveReset = async (requestId: string) => {
    try {
      const res = await api.patch(`/password-reset-requests/${requestId}/approve`);
      alert(`Mot de passe temporaire: ${res.data.tempPassword}`);
      fetchResetRequests();
    } catch (error) {
      console.error("Failed to approve reset request:", error);
    }
  };

  const handleRejectReset = async (requestId: string) => {
    try {
      await api.patch(`/password-reset-requests/${requestId}/reject`, { reason: "Rejeté par l'administrateur" });
      fetchResetRequests();
    } catch (error) {
      console.error("Failed to reject reset request:", error);
    }
  };

  const handleRestrictUser = async (userId: string, email: string) => {
    if (confirm(`Voulez-vous vraiment restreindre le compte ${email} ?`)) {
      try {
        await api.patch(`/users/${userId}/restrict`, { restriction: "ADMIN_RESTRICTION", reason: "Violation des règles de sécurité" });
        fetchStats();
      } catch (error) {
        console.error("Failed to restrict user:", error);
      }
    }
  };

  const handleUnrestrictUser = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}/unrestrict`);
      fetchStats();
    } catch (error) {
      console.error("Failed to unrestrict user:", error);
    }
  };

  const filteredLogs = (stats?.recentAuditLogs || []).filter((log) => {
    const matchesSearch =
      searchQuery === "" ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.actor && `${log.actor.firstName} ${log.actor.lastName} ${log.actor.email}`.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesAction = actionFilter === "ALL" || log.action === actionFilter;

    return matchesSearch && matchesAction;
  });

  const getActionBadge = (action: string) => {
    if (action.includes("CREATE") || action.includes("ADD")) {
      return "bg-emerald-950/60 text-emerald-400 border-emerald-800/60";
    }
    if (action.includes("DELETE") || action.includes("SUSPEND") || action.includes("PURGE")) {
      return "bg-rose-950/60 text-rose-400 border-rose-800/60";
    }
    if (action.includes("UPDATE") || action.includes("MOVE") || action.includes("RESET")) {
      return "bg-cyan-950/60 text-cyan-400 border-cyan-800/60";
    }
    if (action.includes("LOGIN") || action.includes("AUTH")) {
      return "bg-purple-950/60 text-purple-400 border-purple-800/60";
    }
    return "bg-amber-950/60 text-amber-400 border-amber-800/60";
  };

  const getActionIcon = (action: string) => {
    if (action.includes("CREATE") || action.includes("ADD")) return <CheckCircle2 className="w-3.5 h-3.5" />;
    if (action.includes("DELETE") || action.includes("SUSPEND")) return <AlertTriangle className="w-3.5 h-3.5" />;
    if (action.includes("UPDATE") || action.includes("MOVE")) return <RefreshCw className="w-3.5 h-3.5" />;
    if (action.includes("LOGIN") || action.includes("AUTH")) return <Shield className="w-3.5 h-3.5" />;
    if (action.includes("PASSWORD")) return <FileCheck className="w-3.5 h-3.5" />;
    return <Activity className="w-3.5 h-3.5" />;
  };

  if (isLoading && !stats) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-7 max-w-7xl page-transition">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 neon-text">
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === "fr" ? "Administration Système & Sécurité" : "System Core & Security"}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
            {lang === "fr" ? "Console d'Administration & Métriques" : "Admin Console & Live Telemetry"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {lang === "fr" 
              ? "Télémétrie en temps réel, gouvernance des accès et journal d'audit de sécurité." 
              : "Real-time system telemetry, access governance, and immutable security audit trail."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={fetchStats}
            variant="outline"
            size="sm"
            className="rounded-xl border-[#2a3850] bg-[#141b2b] hover:bg-[#1e293b] text-slate-300 gap-2 text-xs button-cyber"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
            {lang === "fr" ? "Actualiser" : "Refresh"}
          </Button>

          <Button
            onClick={() => router.push("/users")}
            size="sm"
            className="rounded-xl text-xs gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20 button-cyber"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {lang === "fr" ? "Créer un collaborateur" : "Provision Operator"}
          </Button>

          <Button
            onClick={() => router.push("/announcements")}
            variant="outline"
            size="sm"
            className="rounded-xl border-cyan-800/60 bg-cyan-950/30 hover:bg-cyan-950/60 text-cyan-400 gap-2 text-xs font-semibold button-cyber"
          >
            <Radio className="w-3.5 h-3.5" />
            {lang === "fr" ? "Diffuser une annonce" : "Broadcast"}
          </Button>

          <Button
            onClick={() => setShowResetRequests(!showResetRequests)}
            variant="outline"
            size="sm"
            className="rounded-xl border-purple-800/60 bg-purple-950/30 hover:bg-purple-950/60 text-purple-400 gap-2 text-xs font-semibold glow-border button-cyber"
          >
            <Key className="w-3.5 h-3.5" />
            {lang === "fr" ? "Demandes Reset MDP" : "Password Resets"}
            {resetRequests.length > 0 && (
              <span className="bg-purple-500 text-white text-[9px] px-1.5 py-0.5 rounded-full pulse-glow">
                {resetRequests.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Password Reset Requests Panel */}
      {showResetRequests && (
        <div className="rounded-2xl border border-[#232f44] bg-[#111827] overflow-hidden shadow-sm reveal-animation">
          <div className="p-5 border-b border-[#1e2a3e] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-400" />
              <h2 className="text-base font-bold text-slate-100">
                {lang === "fr" ? "Demandes de Réinitialisation de Mot de Passe" : "Password Reset Requests"}
              </h2>
            </div>
            <span className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded-lg text-xs font-semibold">
              {resetRequests.length} {lang === "fr" ? "en attente" : "pending"}
            </span>
          </div>
          
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto custom-scrollbar">
            {resetRequests.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                <Key className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">{lang === "fr" ? "Aucune demande en attente" : "No pending requests"}</p>
              </div>
            ) : (
              resetRequests.map((request) => (
                <div key={request.id} className="bg-[#1e293b] rounded-xl p-4 border border-[#232f44] hover:border-purple-500/50 transition-all interactive-hover">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {request.user?.firstName} {request.user?.lastName}
                      </p>
                      <p className="text-xs text-slate-400">{request.user?.email}</p>
                      <p className="text-[10px] text-purple-400 mt-1">
                        {request.user?.role} • {lang === "fr" ? "Demandé le" : "Requested"} {new Date(request.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveReset(request.id)}
                        size="sm"
                        className="h-8 px-3 text-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-semibold button-cyber"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                      </Button>
                      <Button
                        onClick={() => handleRejectReset(request.id)}
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 text-xs border-rose-900/50 bg-rose-950/30 hover:bg-rose-950/60 text-rose-400 font-semibold"
                      >
                        <AlertTriangle className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Real Live Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Users */}
        <div className="rounded-2xl border border-[#232f44] bg-[#111827] p-6 shadow-sm interactive-hover holographic relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400">{lang === "fr" ? "COLLABORATEURS TOTAUX" : "TOTAL OPERATORS"}</span>
              <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 float-animation">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-100 counter-animate">{stats?.totalUsers ?? 0}</span>
              <span className="text-xs text-emerald-400 font-medium">({stats?.activeUsers ?? 0} {lang === "fr" ? "actifs" : "active"})</span>
            </div>
            <div className="mt-4 pt-4 border-t border-[#1e2a3e] flex items-center justify-between text-[11px] text-slate-400">
              <span>Super Admin: {stats?.usersByRole?.SUPER_ADMIN ?? 0}</span>
              <span>Admins: {stats?.usersByRole?.ADMIN ?? 0}</span>
              <span>PM: {stats?.usersByRole?.PROJECT_MANAGER ?? 0}</span>
              <span>Membres: {stats?.usersByRole?.TEAM_MEMBER ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Active Projects */}
        <div className="rounded-2xl border border-[#232f44] bg-[#111827] p-6 shadow-sm interactive-hover holographic relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400">{lang === "fr" ? "PROJETS OPÉRATIONNELS" : "ACTIVE OPERATIONS"}</span>
              <div className="p-2 rounded-xl bg-cyan-950/50 border border-cyan-800/50 text-cyan-400 float-animation">
                <FolderKanban className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-100 counter-animate">{stats?.activeProjects ?? 0}</span>
              <span className="text-xs text-slate-400 font-medium">/ {stats?.totalProjects ?? 0} total</span>
            </div>
            <div className="mt-4 pt-4 border-t border-[#1e2a3e] text-[11px] text-slate-400 flex items-center justify-between">
              <span>{lang === "fr" ? "Total Tâches :" : "Total Tasks :"} {stats?.totalTasks ?? 0}</span>
              <button onClick={() => router.push("/projects")} className="text-cyan-400 hover:underline font-semibold interactive-hover">
                {lang === "fr" ? "Voir tout →" : "View all →"}
              </button>
            </div>
          </div>
        </div>

        {/* Absences & Availability */}
        <div className="rounded-2xl border border-[#232f44] bg-[#111827] p-6 shadow-sm interactive-hover holographic relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400">{lang === "fr" ? "DEMANDES D'ABSENCE" : "ABSENCE REQUESTS"}</span>
              <div className="p-2 rounded-xl bg-amber-950/50 border border-amber-800/50 text-amber-400 float-animation">
                <FileCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-100 counter-animate">{stats?.pendingAbsences ?? 0}</span>
              <span className="text-xs text-amber-400 font-medium">{lang === "fr" ? "en attente" : "pending review"}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-[#1e2a3e] text-[11px] text-slate-400 flex items-center justify-between">
              <span>{stats?.totalAbsences ?? 0} {lang === "fr" ? "dossiers traités" : "total requests"}</span>
              <button onClick={() => router.push("/absences")} className="text-amber-400 hover:underline font-semibold interactive-hover">
                {lang === "fr" ? "Examiner →" : "Review →"}
              </button>
            </div>
          </div>
        </div>

        {/* System Core Health */}
        <div className="rounded-2xl border border-[#232f44] bg-[#111827] p-6 shadow-sm interactive-hover holographic relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-400">{lang === "fr" ? "ÉTAT DU SYSTÈME" : "SYSTEM STATUS"}</span>
              <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-emerald-400 float-animation">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse status-online"></span>
              <span className="text-lg font-bold text-emerald-400">{lang === "fr" ? "100% Opérationnel" : "Nominal (Online)"}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-[#1e2a3e] text-[11px] text-slate-400 flex items-center justify-between">
              <span>PostgreSQL & NestJS API</span>
              <span className="text-emerald-400 font-bold">OK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Real Live Audit Logs Table */}
      <div className="rounded-2xl border border-[#232f44] bg-[#111827] overflow-hidden shadow-sm reveal-animation matrix-bg">
        {/* Table Header & Controls */}
        <div className="p-6 border-b border-[#1e2a3e] flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent opacity-50"></div>
          <div className="relative z-10">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>{lang === "fr" ? "Journal d'Audit & Sécurité en Temps Réel" : "Real-Time System Audit Trail"}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === "fr" ? "Traçabilité intégrale de toutes les créations, modifications et suppressions." : "Comprehensive log of all administrative actions and security events."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs relative z-10">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={lang === "fr" ? "Filtrer le journal..." : "Filter logs..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141b2a] border-[#222d42] text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:bg-[#182032] focus:ring-0 transition-all duration-300"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-[#141b2a] text-slate-200 border border-[#222d42] rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer transition-all duration-300 hover:border-emerald-500/50"
            >
              <option value="ALL">{lang === "fr" ? "Toutes les actions" : "All Actions"}</option>
              <option value="USER_CREATED">USER_CREATED</option>
              <option value="PROJECT_CREATED">PROJECT_CREATED</option>
              <option value="TASK_CREATED">TASK_CREATED</option>
              <option value="USER_DELETED">USER_DELETED</option>
              <option value="PASSWORD_RESET">PASSWORD_RESET</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 uppercase bg-[#162032] border-b border-[#232f44]">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-3.5">{lang === "fr" ? "Date & Heure" : "Timestamp"}</th>
                <th className="px-4 sm:px-6 py-3 sm:py-3.5">{lang === "fr" ? "Événement" : "Action"}</th>
                <th className="px-4 sm:px-6 py-3 sm:py-3.5">{lang === "fr" ? "Auteur" : "Actor"}</th>
                <th className="px-4 sm:px-6 py-3 sm:py-3.5">{lang === "fr" ? "Détails" : "Details"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a3e]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 sm:px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <Activity className="w-8 h-8 text-slate-600 mx-auto float-animation" />
                      <span>{lang === "fr" ? "Aucune entrée d'audit enregistrée pour le moment." : "No audit entries recorded yet."}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => {
                  let parsedDetails = log.details;
                  try {
                    if (log.details && (log.details.startsWith("{") || log.details.startsWith("["))) {
                      parsedDetails = JSON.stringify(JSON.parse(log.details), null, 2);
                    }
                  } catch {}

                  return (
                    <tr key={log.id} className={`hover:bg-[#162032]/50 transition-all duration-300 border-l-2 border-l-transparent hover:border-l-emerald-500 interactive-hover slide-up`} style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-slate-400 flex items-center gap-2">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500" />
                        <span className="text-[10px] sm:text-xs">{new Date(log.createdAt).toLocaleString()}</span>
                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-bold uppercase border flex items-center gap-1 ${getActionBadge(log.action)}`}>
                            {getActionIcon(log.action)}
                            {log.action}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {log.actor ? (
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-300 flex items-center justify-center font-bold text-[9px] sm:text-[10px]">
                              {log.actor.firstName?.[0]}{log.actor.lastName?.[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-200 text-[10px] sm:text-xs">
                                {log.actor.firstName} {log.actor.lastName}
                              </span>
                              <span className="text-[8px] sm:text-[10px] text-slate-500">({log.actor.role})</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-slate-500 italic">
                            <Activity className="w-3 h-3" />
                            <span className="text-[10px] sm:text-xs">{lang === "fr" ? "Système" : "System"}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-300 max-w-xs sm:max-w-md truncate font-mono text-[9px] sm:text-[11px]" title={log.details || ""}>
                        <div className="flex items-start gap-2">
                          <span className="text-slate-500">&gt;</span>
                          <span className="truncate">{parsedDetails || "--"}</span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
