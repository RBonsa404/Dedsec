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
  Megaphone, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  Calendar,
  ToggleLeft,
  ToggleRight
} from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: string;
}

export default function AnnouncementsPage() {
  const { user } = useAuthStore();
  const { lang } = useLangStore();
  const t = translations[lang] || translations.fr;

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalErr, setModalErr] = useState("");
  const [feedback, setFeedback] = useState("");

  const isAdmin = user?.role === "SUPER_ADMIN" || user?.role === "ADMIN";

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const endpoint = isAdmin ? "/announcements/all" : "/announcements";
      const res = await api.get(endpoint);
      setAnnouncements(res.data);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalErr("");

    if (!title.trim() || !content.trim()) {
      setModalErr(lang === "fr" ? "Le titre et le message sont requis." : "Title and message are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/announcements", { title, content });
      setAnnouncements((prev) => [res.data, ...prev]);
      setIsModalOpen(false);
      setTitle("");
      setContent("");
      showFeedback(lang === "fr" ? "Annonce publiée avec succès." : "Announcement published successfully.");
    } catch (error: any) {
      setModalErr(error.response?.data?.message || (lang === "fr" ? "Échec de la publication" : "Failed to publish"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentActive: boolean) => {
    try {
      const res = await api.patch(`/announcements/${id}`, { isActive: !currentActive });
      setAnnouncements((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: res.data.isActive } : a))
      );
      showFeedback(lang === "fr" ? `Annonce ${!currentActive ? "activée" : "désactivée"}.` : `Announcement ${!currentActive ? "activated" : "deactivated"}.`);
    } catch (error) {
      console.error("Failed to toggle announcement:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(lang === "fr" ? "Voulez-vous supprimer définitivement cette annonce ?" : "Delete this announcement permanently?")) return;

    try {
      await api.delete(`/announcements/${id}`);
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
      showFeedback(lang === "fr" ? "Annonce supprimée." : "Announcement deleted.");
    } catch (error) {
      console.error("Failed to delete announcement:", error);
    }
  };

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(""), 3500);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            <Megaphone className="w-6 h-6 text-cyan-400" />
            <span>{t.announcements_title}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t.announcements_subtitle}
          </p>
        </div>

        {isAdmin && (
          <Button 
            onClick={() => setIsModalOpen(true)} 
            className="rounded-xl text-xs gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> {t.broadcast_directive}
          </Button>
        )}
      </div>

      {feedback && (
        <div className="rounded-2xl border border-emerald-500/60 bg-emerald-950/40 p-3.5 text-xs text-emerald-400 font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {feedback}
        </div>
      )}

      {/* Announcements List */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-2xl border border-[#232f44] bg-[#111827] p-12 text-center text-xs text-slate-500">
          {lang === "fr" ? "Aucune annonce publiée pour le moment." : "No announcements posted yet."}
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl border p-6 transition-all shadow-sm ${
                item.isActive
                  ? "border-[#25364f] bg-[#111827]"
                  : "border-[#1e2636] bg-[#0d121c] opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-slate-100">{item.title}</h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase border ${
                        item.isActive
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-800/60"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {item.isActive ? t.active_transmission : t.archived}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{new Date(item.createdAt).toLocaleDateString(lang === "fr" ? "fr-FR" : "en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                </div>

                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggle(item.id, item.isActive)}
                      className="h-8 px-3 rounded-xl border-[#2b3a55] bg-[#141b2b] hover:bg-[#1e293b] text-slate-200 text-xs font-semibold gap-1.5"
                    >
                      {item.isActive ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-400" />
                          <span>{lang === "fr" ? "Désactiver" : "Deactivate"}</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-400" />
                          <span>{lang === "fr" ? "Activer" : "Activate"}</span>
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(item.id)}
                      className="h-8 w-8 p-0 rounded-xl border-[#2b3a55] bg-[#141b2b] hover:bg-rose-950/50 text-rose-400"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                )}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* New Announcement Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
          <div className="w-full max-w-lg rounded-2xl border border-[#26334a] bg-[#111827] p-7 shadow-2xl relative text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#232e42] pb-4 mb-5">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-cyan-400" />
                <span>{lang === "fr" ? "PUBLIER UNE NOUVELLE ANNONCE" : "PUBLISH NEW ANNOUNCEMENT"}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title" className="text-slate-300 font-semibold">{lang === "fr" ? "TITRE DE L'ANNONCE" : "TITLE"}</Label>
                <Input
                  id="title"
                  placeholder={lang === "fr" ? "Ex: Maintenance planifiée des serveurs le week-end prochain" : "e.g. Scheduled Infrastructure Maintenance"}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="content" className="text-slate-300 font-semibold">{lang === "fr" ? "CONTENU DE L'ANNONCE" : "CONTENT"}</Label>
                <textarea
                  id="content"
                  rows={4}
                  placeholder={lang === "fr" ? "Rédigez les détails de l'annonce pour l'ensemble des collaborateurs..." : "Write announcement details..."}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
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
                  {isSubmitting ? (lang === "fr" ? "Publication..." : "Publishing...") : (lang === "fr" ? "Publier l'annonce" : "Publish Announcement")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
