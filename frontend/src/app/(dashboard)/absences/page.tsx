"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { useLangStore } from "@/stores/langStore";
import { translations } from "@/lib/i18n";
import { 
  CalendarOff, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  X, 
  AlertCircle, 
  Calendar, 
  UserCheck, 
  Check, 
  Ban 
} from "lucide-react";

interface Absence {
  id: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote: string | null;
  createdAt: string;
  requester?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AbsencesPage() {
  const { user } = useAuthStore();
  const { lang } = useLangStore();
  const t = translations[lang] || translations.fr;

  const [activeTab, setActiveTab] = useState<"my" | "pending">("my");
  const [myRequests, setMyRequests] = useState<Absence[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Absence[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Request Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalErr, setModalErr] = useState("");
  const [feedback, setFeedback] = useState("");

  const isManagerOrAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const myRes = await api.get("/absences/my-requests");
      setMyRequests(myRes.data || []);

      if (isManagerOrAdmin) {
        const pendingRes = await api.get("/absences/pending");
        setPendingRequests(pendingRes.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch absences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErr("");

    if (!startDate || !endDate || !reason.trim()) {
      setModalErr(lang === "fr" ? "Tous les champs sont requis." : "All parameters are required.");
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setModalErr(lang === "fr" ? "La date de début ne peut pas être postérieure à la date de fin." : "Start date cannot be after end date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/absences", {
        reason: reason.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
      });
      setMyRequests((prev) => [res.data, ...prev]);
      setIsModalOpen(false);
      setReason("");
      setStartDate("");
      setEndDate("");
      showFeedback(lang === "fr" ? "Demande d'absence soumise avec succès." : "Absence request submitted for review.");
    } catch (error: any) {
      setModalErr(error.response?.data?.message || (lang === "fr" ? "Échec de la soumission de la demande" : "Failed to submit request"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async (id: string, status: "APPROVED" | "REJECTED") => {
    const reviewNote = prompt(
      lang === "fr" 
        ? `Saisissez une note de validation pour cette décision (${status === "APPROVED" ? "Approuvée" : "Rejetée"}) :`
        : `Enter review note for ${status}:`,
      status === "APPROVED" ? "Approuvé par le responsable" : "Non validé"
    );

    try {
      await api.patch(`/absences/${id}/review`, {
        status,
        reviewNote: reviewNote || undefined,
      });
      setPendingRequests((prev) => prev.filter((r) => r.id !== id));
      showFeedback(lang === "fr" ? `Demande ${status === "APPROVED" ? "approuvée" : "rejetée"} avec succès.` : `Request has been ${status}.`);
      fetchData();
    } catch (error) {
      console.error("Failed to review absence:", error);
    }
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

  const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
    PENDING: { bg: "bg-amber-950/50", text: "text-amber-400", border: "border-amber-800/50" },
    APPROVED: { bg: "bg-emerald-950/50", text: "text-emerald-400", border: "border-emerald-800/50" },
    REJECTED: { bg: "bg-rose-950/50", text: "text-rose-400", border: "border-rose-800/50" },
  };

  return (
    <div className="space-y-8 max-w-7xl page-transition">
      {/* Header with enhanced animations */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-50 animate-pulse"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold tracking-tight text-slate-100 flex items-center gap-3 neon-text">
              <div className="relative">
                <CalendarOff className="w-8 h-8 text-emerald-400 float-animation" />
                <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-50"></div>
              </div>
              <span>{t.absences_title}</span>
            </h1>
            <p className="text-sm text-slate-400 mt-2 ml-11">
              {t.absences_subtitle}
            </p>
          </div>
        </div>

        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="rounded-xl text-sm gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/30 button-cyber magnetic-button"
        >
          <Plus className="w-5 h-5 bounce-animation" /> {t.request_leave}
        </Button>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-emerald-500/60 bg-emerald-950/40 p-4 text-sm text-emerald-400 font-semibold flex items-center gap-3 slide-up interactive-hover holographic">
          <CheckCircle2 className="w-5 h-5 shrink-0 heartbeat" /> {feedback}
        </div>
      )}

      {/* Enhanced Tabs with animations */}
      {isManagerOrAdmin && (
        <div className="flex gap-3 border-b border-[#232f44] pb-3 text-sm">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 relative overflow-hidden ${
              activeTab === "my"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20 glow-border"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#162032] border border-transparent"
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {t.my_requests} 
              <span className="bg-emerald-500/30 px-2 py-0.5 rounded-full text-xs">{myRequests.length}</span>
            </span>
            {activeTab === "my" && <div className="absolute inset-0 bg-emerald-500/10 slide-left"></div>}
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 relative overflow-hidden ${
              activeTab === "pending"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/20 glow-border"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#162032] border border-transparent"
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {t.pending_approvals}
              {pendingRequests.length > 0 && (
                <span className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-full text-xs font-bold pulse-glow">
                  {pendingRequests.length}
                </span>
              )}
            </span>
            {activeTab === "pending" && <div className="absolute inset-0 bg-amber-500/10 slide-left"></div>}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-400" />
            <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-50"></div>
          </div>
        </div>
      ) : activeTab === "my" ? (
        /* Enhanced My Requests Table */
        <div className="rounded-2xl border border-[#232f44] bg-[#111827] overflow-hidden shadow-lg interactive-hover card-3d reveal-animation matrix-bg">
          <div className="p-6 border-b border-[#1e2a3e] bg-[#162032]/50">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <span>{lang === "fr" ? "Mes Demandes d'Absence" : "My Absence Requests"}</span>
            </h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="text-[12px] text-slate-400 uppercase bg-[#162032] border-b border-[#232f44]">
              <tr>
                <th className="px-6 py-4">{t.reason}</th>
                <th className="px-6 py-4">{t.timeframe}</th>
                <th className="px-6 py-4">{t.duration}</th>
                <th className="px-6 py-4">{t.status}</th>
                <th className="px-6 py-4">{t.review_note}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a3e]">
              {myRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <CalendarOff className="w-12 h-12 text-slate-600 mx-auto float-animation" />
                        <div className="absolute inset-0 bg-slate-600 blur-xl opacity-30"></div>
                      </div>
                      <span className="text-sm">{lang === "fr" ? "Aucune demande de congé enregistrée." : "No absence records logged."}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                myRequests.map((req, index) => {
                  const days = Math.ceil(
                    (new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) + 1;
                  const sStyle = statusStyles[req.status] || statusStyles.PENDING;

                  return (
                    <tr key={req.id} className={`hover:bg-[#162032]/60 transition-all duration-300 border-l-2 border-l-transparent hover:border-l-emerald-500 interactive-hover slide-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                      <td className="px-6 py-4 font-bold text-slate-100">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400 pulse-glow"></div>
                          {req.reason}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-cyan-400" />
                          <span className="font-medium">{new Date(req.startDate).toLocaleDateString()}</span>
                          <span className="text-slate-500">→</span>
                          <span className="font-medium">{new Date(req.endDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        <span className="font-semibold">{days}</span> {days === 1 ? (lang === "fr" ? "jour" : "day") : (lang === "fr" ? "jours" : "days")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-lg text-[11px] font-bold uppercase border ${sStyle.bg} ${sStyle.text} ${sStyle.border} interactive-hover`}>
                          {req.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {req.reviewNote || (req.status === "PENDING" ? (lang === "fr" ? "En attente de validation..." : "Awaiting clearance...") : "-")}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Enhanced Pending Approvals Table */
        <div className="rounded-2xl border border-[#232f44] bg-[#111827] overflow-hidden shadow-lg interactive-hover card-3d reveal-animation matrix-bg">
          <div className="p-6 border-b border-[#1e2a3e] bg-[#162032]/50">
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              <span>{lang === "fr" ? "Demandes en Attente d'Validation" : "Pending Approval Requests"}</span>
              {pendingRequests.length > 0 && (
                <span className="ml-3 bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/40 pulse-glow">
                  {pendingRequests.length} {lang === "fr" ? "en attente" : "pending"}
                </span>
              )}
            </h2>
          </div>
          <table className="w-full text-left text-sm">
            <thead className="text-[12px] text-slate-400 uppercase bg-[#162032] border-b border-[#232f44]">
              <tr>
                <th className="px-6 py-4">{lang === "fr" ? "Opérateur" : "Operator"}</th>
                <th className="px-6 py-4">{t.reason}</th>
                <th className="px-6 py-4">{t.timeframe}</th>
                <th className="px-6 py-4">{lang === "fr" ? "Date de soumission" : "Submitted"}</th>
                <th className="px-6 py-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2a3e]">
              {pendingRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="relative">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto bounce-animation" />
                        <div className="absolute inset-0 bg-emerald-600 blur-xl opacity-30"></div>
                      </div>
                      <span className="text-sm">{lang === "fr" ? "Toutes les demandes de congés ont été traitées !" : "All absence requests cleared."}</span>
                    </div>
                  </td>
                </tr>
              ) : (
                pendingRequests.map((req, index) => (
                  <tr key={req.id} className={`hover:bg-[#162032]/60 transition-all duration-300 border-l-2 border-l-transparent hover:border-l-amber-500 interactive-hover slide-up`} style={{ animationDelay: `${index * 0.1}s` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500/30 to-emerald-500/30 flex items-center justify-center border border-cyan-500/40 text-emerald-300 font-bold text-sm">
                          {req.requester?.firstName?.[0]}{req.requester?.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100">{req.requester?.firstName} {req.requester?.lastName}</div>
                          <div className="text-slate-400 text-xs">{req.requester?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-200 font-medium">
                      {req.reason}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-cyan-400" />
                        <span>{new Date(req.startDate).toLocaleDateString()}</span>
                        <span className="text-slate-500">→</span>
                        <span>{new Date(req.endDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Button
                          size="sm"
                          onClick={() => handleReview(req.id, "APPROVED")}
                          className="h-10 text-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold rounded-xl gap-2 button-cyber magnetic-button"
                        >
                          <Check className="w-4 h-4" />
                          <span>{t.approve}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReview(req.id, "REJECTED")}
                          className="h-10 text-sm text-rose-400 border-rose-800/60 hover:bg-rose-950/40 font-bold rounded-xl gap-2 button-cyber magnetic-button"
                        >
                          <Ban className="w-4 h-4" />
                          <span>{t.reject}</span>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Enhanced Leave Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 select-none">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 pointer-events-none"></div>
          <div className="w-full max-w-lg rounded-2xl border border-[#26334a] bg-[#111827] p-8 shadow-2xl relative text-sm zoom-in interactive-hover holographic">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/30 to-cyan-500/30 rounded-2xl blur-xl opacity-50"></div>
              <div className="relative flex items-center justify-between border-b border-[#232e42] pb-5 mb-6">
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-3 neon-text">
                  <div className="relative">
                    <CalendarOff className="w-5 h-5 text-emerald-400" />
                    <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-50"></div>
                  </div>
                  <span>{lang === "fr" ? "SOUMETTRE UNE DEMANDE D'ABSENCE" : "SUBMIT ABSENCE REQUEST"}</span>
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[#1e293b] transition-all duration-300 interactive-hover"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-5 relative">
              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-slate-300 font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    {lang === "fr" ? "DATE DE DÉBUT" : "START DATE"}
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl focus:border-emerald-500 focus:ring-0 focus:ring-offset-0 transition-all duration-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-slate-300 font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    {lang === "fr" ? "DATE DE FIN" : "END DATE"}
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl focus:border-emerald-500 focus:ring-0 focus:ring-offset-0 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason" className="text-slate-300 font-semibold flex items-center gap-2">
                  <CalendarOff className="w-4 h-4 text-emerald-400" />
                  {t.reason}
                </Label>
                <textarea
                  id="reason"
                  rows={4}
                  placeholder={lang === "fr" ? "Congés annuels, raison médicale, absence personnelle..." : "Vacation, medical leave, personal absence..."}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#2b3a55] bg-[#162032] p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-0 transition-all duration-300 resize-none"
                />
              </div>

              {modalErr && (
                <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 p-4 text-rose-400 flex items-center gap-3 font-medium slide-up interactive-hover">
                  <AlertCircle className="w-5 h-5 shrink-0 shake-animation" /> {modalErr}
                </div>
              )}

              <div className="flex justify-end gap-4 pt-6 border-t border-[#232e42]">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setIsModalOpen(false)} 
                  className="rounded-xl border-[#2b3a55] bg-[#162032] hover:bg-[#1e293b] text-slate-300 font-medium transition-all duration-300 interactive-hover"
                >
                  {t.cancel}
                </Button>
                <Button 
                  type="submit" 
                  size="sm" 
                  disabled={isSubmitting} 
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-lg shadow-emerald-500/30 button-cyber magnetic-button px-6"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {lang === "fr" ? "Soumission en cours..." : "Submitting..."}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      {lang === "fr" ? "Soumettre la demande" : "Submit Request"}
                    </span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
