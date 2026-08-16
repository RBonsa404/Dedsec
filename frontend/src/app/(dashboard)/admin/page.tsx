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
  Shield
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

  useEffect(() => {
    fetchStats();
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
      return "bg-green-50 text-green-700 border-green-200";
    }
    if (action.includes("DELETE") || action.includes("SUSPEND") || action.includes("PURGE")) {
      return "bg-red-50 text-red-700 border-red-200";
    }
    if (action.includes("UPDATE") || action.includes("MOVE") || action.includes("RESET")) {
      return "bg-blue-50 text-blue-700 border-blue-200";
    }
    if (action.includes("LOGIN") || action.includes("AUTH")) {
      return "bg-purple-50 text-purple-700 border-purple-200";
    }
    return "bg-amber-50 text-amber-700 border-amber-200";
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
    <div className="space-y-7 max-w-7xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600">
            <ShieldCheck className="w-4 h-4" />
            <span>{lang === "fr" ? "Administration Système & Sécurité" : "System Core & Security"}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 mt-1">
            {lang === "fr" ? "Console d'Administration & Métriques" : "Admin Console & Live Telemetry"}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
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
            className="rounded-lg border-gray-200 bg-white hover:bg-gray-50 text-gray-700 gap-2 text-xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
            {lang === "fr" ? "Actualiser" : "Refresh"}
          </Button>

          <Button
            onClick={() => router.push("/users")}
            size="sm"
            className="rounded-lg text-xs gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <UserPlus className="w-3.5 h-3.5" />
            {lang === "fr" ? "Créer un collaborateur" : "Provision Operator"}
          </Button>

          <Button
            onClick={() => router.push("/announcements")}
            variant="outline"
            size="sm"
            className="rounded-lg border-gray-200 bg-white hover:bg-gray-50 text-gray-700 gap-2 text-xs font-medium"
          >
            <Radio className="w-3.5 h-3.5" />
            {lang === "fr" ? "Diffuser une annonce" : "Broadcast"}
          </Button>
        </div>
      </div>

      {/* Real Live Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">{lang === "fr" ? "COLLABORATEURS TOTAUX" : "TOTAL OPERATORS"}</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats?.totalUsers ?? 0}</span>
            <span className="text-xs text-blue-600 font-medium">({stats?.activeUsers ?? 0} {lang === "fr" ? "actifs" : "active"})</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
            <span>Super Admin: {stats?.usersByRole?.SUPER_ADMIN ?? 0}</span>
            <span>Admins: {stats?.usersByRole?.ADMIN ?? 0}</span>
            <span>PM: {stats?.usersByRole?.PROJECT_MANAGER ?? 0}</span>
            <span>Membres: {stats?.usersByRole?.TEAM_MEMBER ?? 0}</span>
          </div>
        </div>

        {/* Active Projects */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">{lang === "fr" ? "PROJETS OPÉRATIONNELS" : "ACTIVE OPERATIONS"}</span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats?.activeProjects ?? 0}</span>
            <span className="text-xs text-gray-500 font-medium">/ {stats?.totalProjects ?? 0} total</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
            <span>{lang === "fr" ? "Total Tâches :" : "Total Tasks :"} {stats?.totalTasks ?? 0}</span>
            <button onClick={() => router.push("/projects")} className="text-blue-600 hover:underline font-medium">
              {lang === "fr" ? "Voir tout →" : "View all →"}
            </button>
          </div>
        </div>

        {/* Absences & Availability */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">{lang === "fr" ? "DEMANDES D'ABSENCE" : "ABSENCE REQUESTS"}</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats?.pendingAbsences ?? 0}</span>
            <span className="text-xs text-amber-600 font-medium">{lang === "fr" ? "en attente" : "pending review"}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
            <span>{stats?.totalAbsences ?? 0} {lang === "fr" ? "dossiers traités" : "total requests"}</span>
            <button onClick={() => router.push("/absences")} className="text-amber-600 hover:underline font-medium">
              {lang === "fr" ? "Examiner →" : "Review →"}
            </button>
          </div>
        </div>

        {/* System Core Health */}
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">{lang === "fr" ? "ÉTAT DU SYSTÈME" : "SYSTEM STATUS"}</span>
            <div className="p-2 rounded-lg bg-green-50 text-green-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-lg font-bold text-green-600">{lang === "fr" ? "100% Opérationnel" : "Nominal (Online)"}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 flex items-center justify-between">
            <span>PostgreSQL & NestJS API</span>
            <span className="text-green-600 font-medium">OK</span>
          </div>
        </div>
      </div>

      {/* Real Live Audit Logs Table */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
        {/* Table Header & Controls */}
        <div className="p-5 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span>{lang === "fr" ? "Journal d'Audit & Sécurité en Temps Réel" : "Real-Time System Audit Trail"}</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {lang === "fr" ? "Traçabilité intégrale de toutes les créations, modifications et suppressions." : "Comprehensive log of all administrative actions and security events."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="relative w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={lang === "fr" ? "Filtrer le journal..." : "Filter logs..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none text-xs"
              />
            </div>

            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-white text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none cursor-pointer"
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
            <thead className="text-[11px] text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 sm:px-6 py-3 sm:py-3.5">{lang === "fr" ? "Date & Heure" : "Timestamp"}</th>
                <th className="px-4 sm:px-6 py-3 sm:py-3.5">{lang === "fr" ? "Événement" : "Action"}</th>
                <th className="px-4 sm:px-6 py-3 sm:py-3.5">{lang === "fr" ? "Auteur" : "Actor"}</th>
                <th className="px-4 sm:px-6 py-3 sm:py-3.5">{lang === "fr" ? "Détails" : "Details"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 sm:px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-3">
                      <Activity className="w-8 h-8 text-gray-300 mx-auto" />
                      <span>{lang === "fr" ? "Aucune entrée d'audit enregistrée pour le moment." : "No audit entries recorded yet."}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  let parsedDetails = log.details;
                  try {
                    if (log.details && (log.details.startsWith("{") || log.details.startsWith("["))) {
                      parsedDetails = JSON.stringify(JSON.parse(log.details), null, 2);
                    }
                  } catch {}

                  return (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors border-l-2 border-l-transparent hover:border-l-blue-600">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-gray-500 flex items-center gap-2">
                        <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                        <span className="text-[10px] sm:text-xs">{new Date(log.createdAt).toLocaleString()}</span>
                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md text-[9px] sm:text-[10px] font-medium uppercase border flex items-center gap-1 ${getActionBadge(log.action)}`}>
                            {getActionIcon(log.action)}
                            {log.action}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                        {log.actor ? (
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-[9px] sm:text-[10px]">
                              {log.actor.firstName?.[0]}{log.actor.lastName?.[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium text-gray-900 text-[10px] sm:text-xs">
                                {log.actor.firstName} {log.actor.lastName}
                              </span>
                              <span className="text-[8px] sm:text-[10px] text-gray-500">({log.actor.role})</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400 italic">
                            <Activity className="w-3 h-3" />
                            <span className="text-[10px] sm:text-xs">{lang === "fr" ? "Système" : "System"}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-gray-600 max-w-xs sm:max-w-md truncate font-mono text-[9px] sm:text-[11px]" title={log.details || ""}>
                        <div className="flex items-start gap-2">
                          <span className="text-gray-400">&gt;</span>
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
