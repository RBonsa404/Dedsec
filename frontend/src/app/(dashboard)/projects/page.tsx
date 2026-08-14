"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FolderKanban, Plus, Users, HardDrive, Calendar, ArrowRight, Loader2, X } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useLangStore } from "@/stores/langStore";
import { translations } from "@/lib/i18n";

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  storageQuotaMb: number;
  storageUsedMb: number;
  createdAt: string;
  members?: {
    id: string;
    isManager: boolean;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatarUrl?: string;
    };
  }[];
  _count?: {
    boards: number;
    members: number;
  };
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuthStore((state) => state.user);
  const { lang } = useLangStore();
  const t = translations[lang] || translations.fr;
  const router = useRouter();

  const isManagerOrAdmin = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get("/projects");
      setProjects(res.data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post("/projects", { name: name.trim(), description: description.trim() || undefined });
      setProjects((prev) => [res.data, ...prev]);
      setIsModalOpen(false);
      setName("");
      setDescription("");
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-accent-primary flex items-center gap-2">
            &gt; /ops/projects
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-mono">
            {t.projects_subtitle}
          </p>
        </div>

        {isManagerOrAdmin && (
          <Button onClick={() => setIsModalOpen(true)} className="font-mono gap-2 text-xs">
            <Plus className="w-4 h-4" /> {t.new_project}
          </Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-border-color bg-bg-secondary p-12 text-center font-mono">
          <FolderKanban className="w-12 h-12 text-text-muted mx-auto mb-4" />
          <h3 className="text-lg font-bold text-text-primary mb-1">
            {lang === "fr" ? "AUCUN PROJET ACTIF" : "NO_PROJECTS_FOUND"}
          </h3>
          <p className="text-sm text-text-muted mb-4">
            {lang === "fr" ? "Vous n'êtes actuellement assigné à aucune opération active." : "You are not currently assigned to any active operations."}
          </p>
          {isManagerOrAdmin && (
            <Button onClick={() => setIsModalOpen(true)} variant="outline" className="font-mono">
              {lang === "fr" ? "INITIALISER UN PREMIER PROJET" : "INITIALIZE FIRST PROJECT"}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              onClick={() => router.push(`/projects/${project.id}/board`)}
              className="group cursor-pointer rounded-lg border border-border-color bg-bg-secondary/90 backdrop-blur-md p-6 shadow-sm transition-all hover:border-accent-primary/50 hover:shadow-[0_0_20px_rgba(0,255,136,0.12)] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3 font-mono">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent-primary/20 text-accent-primary border border-accent-primary/40">
                    {project.status}
                  </span>
                  <span className="text-xs text-text-muted flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-text-primary group-hover:text-accent-primary transition-colors mb-2 font-mono">
                  {project.name}
                </h3>

                <p className="text-sm text-text-secondary line-clamp-2 mb-6 font-sans">
                  {project.description || (lang === "fr" ? "Aucune description de mission renseignée." : "No mission brief provided.")}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between border-t border-border-color pt-4 text-xs text-text-muted font-mono">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5" title="Opérateurs assignés">
                      <Users className="w-3.5 h-3.5 text-accent-secondary" />
                      {project.members?.length || project._count?.members || 1}
                    </span>
                    <span className="flex items-center gap-1.5" title="Utilisation stockage">
                      <HardDrive className="w-3.5 h-3.5 text-accent-warning" />
                      {project.storageUsedMb.toFixed(1)} / {project.storageQuotaMb}MB
                    </span>
                  </div>

                  <span className="flex items-center gap-1 font-bold text-accent-primary group-hover:translate-x-1 transition-transform">
                    {t.enter_project} <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Project Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 font-mono text-xs">
          <div className="w-full max-w-lg rounded-lg border border-border-color bg-bg-secondary p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-border-color pb-4 mb-6">
              <h3 className="text-base font-bold text-accent-primary flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {lang === "fr" ? "INITIALISER UN NOUVEAU PROJET" : "INITIALIZE NEW PROJECT"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-text-muted hover:text-text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name">{lang === "fr" ? "NOM DU PROJET / OPÉRATION" : "PROJECT NAME"}</Label>
                <Input
                  id="name"
                  placeholder="e.g. Opération Watchdog"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-bg-primary"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="description">{lang === "fr" ? "DESCRIPTION & OBJECTIFS" : "MISSION BRIEF"}</Label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Objectifs opérationnels, périmètre de mission..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-border-color bg-bg-primary p-3 text-xs text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-border-color">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
                  {t.cancel}
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? t.loading : (lang === "fr" ? "LANCER L'OPÉRATION()" : "LAUNCH OPERATION()")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
