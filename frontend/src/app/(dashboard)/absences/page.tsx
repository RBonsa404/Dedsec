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

  const isManagerOrAdmin = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

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
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <CalendarOff className="w-6 h-6 text-emerald-400" />
            <span>{t.absences_title}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t.absences_subtitle}
          </p>
        </div>

        <Button 
          onClick={() => setIsModalOpen(true)} 
          className="rounded-xl text-xs gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" /> {t.request_leave}
        </Button>
      </div>

      {feedback && (
        <div className="rounded-2xl border border-emerald-500/60 bg-emerald-950/40 p-3.5 text-xs text-emerald-400 font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {feedback}
        </div>
      )}

      {/* Tabs */}
      {isManagerOrAdmin && (
        <div className="flex gap-2 border-b border-[#232f44] pb-2 text-xs">
          <button
            onClick={() => setActiveTab("my")}
            className={`px-4 py-2 rounded-xl font-bold transition-all ${
              activeTab === "my"
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#162032]"
            }`}
          >
            {t.my_requests} ({myRequests.length})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
              activeTab === "pending"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200 hover:bg-[#162032]"
            }`}
          >
            <span>{t.pending_approvals}</span>
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      ) : activeTab === "my" ? (
        /* My Requests Table */
        <div className="rounded-2xl border border-[#232f44] bg-[#111827] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 uppercase bg-[#162032] border-b border-[#232f44]">
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    {lang === "fr" ? "Aucune demande de congé enregistrée." : "No absence records logged."}
                  </td>
                </tr>
              ) : (
                myRequests.map((req) => {
                  const days = Math.ceil(
                    (new Date(req.endDate).getTime() - new Date(req.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  ) + 1;
                  const sStyle = statusStyles[req.status] || statusStyles.PENDING;

                  return (
                    <tr key={req.id} className="hover:bg-[#162032]/60 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-100">
                        {req.reason}
                      </td>
                      <td className="px-6 py-4 text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{new Date(req.startDate).toLocaleDateString()} &rarr; {new Date(req.endDate).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        {days} {days === 1 ? (lang === "fr" ? "jour" : "day") : (lang === "fr" ? "jours" : "days")}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${sStyle.bg} ${sStyle.text} ${sStyle.border}`}>
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
        /* Pending Approvals Table (For PM & Admin) */
        <div className="rounded-2xl border border-[#232f44] bg-[#111827] overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="text-[11px] text-slate-400 uppercase bg-[#162032] border-b border-[#232f44]">
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    {lang === "fr" ? "Toutes les demandes de congés ont été traitées !" : "All absence requests cleared."}
                  </td>
                </tr>
              ) : (
                pendingRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#162032]/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-100">
                      <div>{req.requester?.firstName} {req.requester?.lastName}</div>
                      <div className="text-slate-400 text-[11px] font-normal">{req.requester?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-200">
                      {req.reason}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {new Date(req.startDate).toLocaleDateString()} &rarr; {new Date(req.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReview(req.id, "APPROVED")}
                          className="h-8 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 font-bold rounded-lg gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>{t.approve}</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReview(req.id, "REJECTED")}
                          className="h-8 text-xs text-rose-400 border-rose-800/60 hover:bg-rose-950/40 font-bold rounded-lg gap-1.5"
                        >
                          <Ban className="w-3.5 h-3.5" />
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

      {/* Leave Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
          <div className="w-full max-w-md rounded-2xl border border-[#26334a] bg-[#111827] p-7 shadow-2xl relative text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#232e42] pb-4 mb-5">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CalendarOff className="w-4 h-4 text-emerald-400" />
                <span>{lang === "fr" ? "SOUMETTRE UNE DEMANDE D'ABSENCE" : "SUBMIT ABSENCE REQUEST"}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="startDate" className="text-slate-300 font-semibold">{lang === "fr" ? "DATE DE DÉBUT" : "START DATE"}</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="endDate" className="text-slate-300 font-semibold">{lang === "fr" ? "DATE DE FIN" : "END DATE"}</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="reason" className="text-slate-300 font-semibold">{t.reason}</Label>
                <textarea
                  id="reason"
                  rows={3}
                  placeholder={lang === "fr" ? "Congés annuels, raison médicale, absence personnelle..." : "Vacation, medical leave, personal absence..."}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required
                  className="w-full rounded-xl border border-[#2b3a55] bg-[#162032] p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {modalErr && (
                <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 p-3 text-rose-400 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {modalErr}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#232e42]">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="rounded-xl border-[#2b3a55] bg-[#162032] hover:bg-[#1e293b] text-slate-300">
                  {t.cancel}
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                  {isSubmitting ? (lang === "fr" ? "Soumission en cours..." : "Submitting...") : (lang === "fr" ? "Soumettre la demande" : "Submit Request")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
