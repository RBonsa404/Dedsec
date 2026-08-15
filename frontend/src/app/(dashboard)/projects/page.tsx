"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  FolderKanban, 
  Plus, 
  Users, 
  HardDrive, 
  Calendar, 
  ArrowRight, 
  Loader2, 
  X, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Shield,
  Search,
  Settings,
  MoreVertical
} from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useLangStore } from "@/stores/langStore";
import { translations } from "@/lib/i18n";

interface ProjectMember {
  id: string;
  isManager: boolean;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
}

interface Project {
  id: string;
  name: string;
  description: string | null;
  status: string;
  storageQuotaMb: number;
  storageUsedMb: number;
  createdAt: string;
  members?: ProjectMember[];
  _count?: {
    boards: number;
    members: number;
  };
}

interface AvailableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function ProjectsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const { lang } = useLangStore();
  const t = translations[lang] || translations.fr;

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // New Project Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [storageQuotaMb, setStorageQuotaMb] = useState(500);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  // Manage Project Members Modal State
  const [selectedProjectForMembers, setSelectedProjectForMembers] = useState<Project | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [selectedUserIdToAdd, setSelectedUserIdToAdd] = useState("");
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberModalError, setMemberModalError] = useState("");
  const [memberModalSuccess, setMemberModalSuccess] = useState("");

  const isManagerOrAdmin = user?.role === "ADMIN" || user?.role === "PROJECT_MANAGER";

  useEffect(() => {
    fetchProjects();
  }, []);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(""), 3500);
  };

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
    setCreateError("");
    if (!name.trim()) {
      setCreateError(lang === "fr" ? "Le nom du projet est requis." : "Project name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post("/projects", { 
        name: name.trim(), 
        description: description.trim() || undefined,
        storageQuotaMb: Number(storageQuotaMb) || 500,
      });

      setProjects((prev) => [res.data, ...prev]);
      setIsCreateModalOpen(false);
      setName("");
      setDescription("");
      setStorageQuotaMb(500);
      showFeedback(lang === "fr" ? "Projet initialisé avec succès !" : "Project successfully initialized!");
    } catch (error: any) {
      const msg = error.response?.data?.message;
      setCreateError(Array.isArray(msg) ? msg.join(", ") : (msg || (lang === "fr" ? "Échec de création du projet." : "Failed to create project.")));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Member Management Modal
  const openMemberModal = async (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProjectForMembers(project);
    setMemberModalError("");
    setMemberModalSuccess("");
    setIsLoadingMembers(true);

    try {
      const [membersRes, allUsersRes] = await Promise.all([
        api.get(`/projects/${project.id}/members`),
        api.get("/users"),
      ]);
      setProjectMembers(membersRes.data || []);
      setAvailableUsers(allUsersRes.data || []);
    } catch (error: any) {
      setMemberModalError(lang === "fr" ? "Impossible de charger la liste des membres." : "Failed to load members list.");
    } finally {
      setIsLoadingMembers(false);
    }
  };

  const handleAddMemberToProject = async () => {
    if (!selectedProjectForMembers || !selectedUserIdToAdd) return;
    setMemberModalError("");
    setMemberModalSuccess("");
    setIsAddingMember(true);

    try {
      await api.post(`/projects/${selectedProjectForMembers.id}/members`, {
        userId: selectedUserIdToAdd,
      });

      // Refresh members list
      const membersRes = await api.get(`/projects/${selectedProjectForMembers.id}/members`);
      setProjectMembers(membersRes.data || []);
      setSelectedUserIdToAdd("");
      setMemberModalSuccess(lang === "fr" ? "Membre ajouté avec succès au projet !" : "Member successfully assigned to project!");
      fetchProjects(); // Update counts in grid
    } catch (error: any) {
      const msg = error.response?.data?.message;
      setMemberModalError(Array.isArray(msg) ? msg.join(", ") : (msg || (lang === "fr" ? "Impossible d'ajouter ce membre." : "Failed to add member.")));
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMemberFromProject = async (memberUserId: string) => {
    if (!selectedProjectForMembers) return;
    if (!confirm(lang === "fr" ? "Retirer ce collaborateur du projet ?" : "Remove this collaborator from project?")) return;

    try {
      await api.delete(`/projects/${selectedProjectForMembers.id}/members/${memberUserId}`);
      setProjectMembers((prev) => prev.filter((m) => m.userId !== memberUserId));
      setMemberModalSuccess(lang === "fr" ? "Membre retiré du projet." : "Member removed from project.");
      fetchProjects();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      setMemberModalError(Array.isArray(msg) ? msg.join(", ") : (msg || (lang === "fr" ? "Impossible de retirer ce membre." : "Failed to remove member.")));
    }
  };

  const handleDeleteProject = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(lang === "fr" ? "Êtes-vous certain de vouloir supprimer ce projet et toutes ses tâches ?" : "Are you sure you want to delete this project and all its tasks?")) return;

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      showFeedback(lang === "fr" ? "Projet supprimé définitivement." : "Project deleted.");
    } catch (error: any) {
      alert(error.response?.data?.message || (lang === "fr" ? "Action non autorisée." : "Unauthorized action."));
    }
  };

  // Filter out users already in project
  const nonMemberUsers = availableUsers.filter(
    (u) => !projectMembers.some((pm) => pm.userId === u.id || pm.user?.id === u.id) && u.role !== "ADMIN"
  );

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <FolderKanban className="w-4 h-4" />
            <span>{lang === "fr" ? "Espace Projets & Opérations" : "Projects & Operations"}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 mt-1">
            {lang === "fr" ? "Gestion des Projets" : "Projects Overview"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {t.projects_subtitle}
          </p>
        </div>

        {isManagerOrAdmin && (
          <Button 
            onClick={() => setIsCreateModalOpen(true)} 
            className="rounded-xl text-xs gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> {t.new_project}
          </Button>
        )}
      </div>

      {feedbackMsg && (
        <div className="rounded-2xl border border-emerald-500/60 bg-emerald-950/40 p-3.5 text-xs text-emerald-400 font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {feedbackMsg}
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="rounded-2xl border border-[#232f44] bg-[#111827] p-12 text-center">
          <FolderKanban className="w-12 h-12 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-200 mb-1">
            {lang === "fr" ? "Aucun projet actif pour le moment" : "No active projects found"}
          </h3>
          <p className="text-xs text-slate-400 mb-6 max-w-md mx-auto">
            {lang === "fr" 
              ? "Initialisez un premier projet pour commencer à organiser les tableaux Kanban, les livrables et assigner vos collaborateurs." 
              : "Initialize your first project to start organizing boards, deliverables, and team assignments."}
          </p>
          {isManagerOrAdmin && (
            <Button 
              onClick={() => setIsCreateModalOpen(true)} 
              className="rounded-xl text-xs gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold"
            >
              <Plus className="w-4 h-4" /> {lang === "fr" ? "Créer un premier projet" : "Create First Project"}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const memberCount = project.members?.length || project._count?.members || 1;

            return (
              <div
                key={project.id}
                onClick={() => router.push(`/projects/${project.id}/board`)}
                className="group cursor-pointer rounded-2xl border border-[#232f44] bg-[#111827] p-6 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(16,185,129,0.08)] flex flex-col justify-between"
              >
                <div>
                  {/* Status & Date */}
                  <div className="flex items-center justify-between mb-3 text-xs">
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                      {project.status}
                    </span>
                    <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Project Name */}
                  <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors mb-2">
                    {project.name}
                  </h3>

                  {/* Project Description */}
                  <p className="text-xs text-slate-400 line-clamp-2 mb-6">
                    {project.description || (lang === "fr" ? "Aucune description de projet renseignée." : "No project description provided.")}
                  </p>
                </div>

                <div>
                  {/* Members & Quota Telemetry */}
                  <div className="flex items-center justify-between border-t border-[#1e2a3e] pt-4 text-xs text-slate-400">
                    <div className="flex items-center gap-3">
                      {/* Manage Team Button */}
                      <button
                        onClick={(e) => openMemberModal(project, e)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#162032] border border-[#26334a] hover:border-emerald-500/50 hover:text-emerald-400 text-slate-300 font-semibold transition-all"
                        title={lang === "fr" ? "Gérer l'équipe du projet" : "Manage project team"}
                      >
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{memberCount} {lang === "fr" ? "membres" : "members"}</span>
                        <UserPlus className="w-3 h-3 ml-1 text-slate-400" />
                      </button>

                      <span className="flex items-center gap-1" title="Stockage">
                        <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-[11px]">{project.storageUsedMb?.toFixed(1) || 0} / {project.storageQuotaMb}MB</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {user?.role === "ADMIN" && (
                        <button
                          onClick={(e) => handleDeleteProject(project.id, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
                          title={lang === "fr" ? "Supprimer le projet" : "Delete project"}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <span className="flex items-center gap-1 font-bold text-emerald-400 group-hover:translate-x-1 transition-transform">
                        {t.enter_project} <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#26334a] bg-[#111827] p-7 shadow-2xl relative text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#232e42] pb-4 mb-5">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>{lang === "fr" ? "Initialiser un Nouveau Projet" : "Initialize New Project"}</span>
              </h3>
              <button onClick={() => setIsCreateModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-slate-300 font-semibold">{lang === "fr" ? "NOM DU PROJET *" : "PROJECT NAME *"}</Label>
                <Input
                  id="name"
                  placeholder="e.g. Migration Infrastructure Cloud"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-slate-300 font-semibold">{lang === "fr" ? "DESCRIPTION & OBJECTIFS" : "MISSION BRIEF"}</Label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Objectifs opérationnels, périmètre de mission..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border border-[#2b3a55] bg-[#162032] p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quota" className="text-slate-300 font-semibold">{lang === "fr" ? "QUOTA STOCKAGE LIVRABLES (MO)" : "STORAGE QUOTA (MB)"}</Label>
                <Input
                  id="quota"
                  type="number"
                  min="50"
                  max="10000"
                  value={storageQuotaMb}
                  onChange={(e) => setStorageQuotaMb(Number(e.target.value))}
                  className="bg-[#162032] border-[#2b3a55] text-slate-100 rounded-xl"
                />
              </div>

              {createError && (
                <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 p-3 text-rose-400 flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {createError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#232e42]">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateModalOpen(false)} className="rounded-xl border-[#2b3a55] bg-[#162032] hover:bg-[#1e293b] text-slate-300">
                  {t.cancel}
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                  {isSubmitting ? (lang === "fr" ? "Initialisation..." : "Initializing...") : (lang === "fr" ? "Lancer le Projet" : "Launch Project")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Project Members Modal */}
      {selectedProjectForMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#26334a] bg-[#111827] p-7 shadow-2xl relative text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#232e42] pb-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>{lang === "fr" ? "Équipe & Collaborateurs assignés" : "Project Team & Assignees"}</span>
                </h3>
                <p className="text-slate-400 text-[11px] mt-0.5 font-semibold text-emerald-400">
                  {selectedProjectForMembers.name}
                </p>
              </div>
              <button onClick={() => setSelectedProjectForMembers(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add Member Section */}
            {isManagerOrAdmin && (
              <div className="p-4 rounded-xl bg-[#162032] border border-[#26334a] mb-5 space-y-3">
                <span className="text-slate-200 font-bold flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
                  {lang === "fr" ? "Ajouter un collaborateur au projet" : "Assign Collaborator to Project"}
                </span>

                <div className="flex gap-2">
                  <select
                    value={selectedUserIdToAdd}
                    onChange={(e) => setSelectedUserIdToAdd(e.target.value)}
                    className="flex-1 rounded-xl border border-[#2b3a55] bg-[#111827] px-3 py-2 text-xs text-slate-100 focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="">-- {lang === "fr" ? "Sélectionner un collaborateur disponible" : "Select available operator"} --</option>
                    {nonMemberUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.role}) - {u.email}
                      </option>
                    ))}
                  </select>

                  <Button
                    onClick={handleAddMemberToProject}
                    disabled={!selectedUserIdToAdd || isAddingMember}
                    size="sm"
                    className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shrink-0"
                  >
                    {isAddingMember ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (lang === "fr" ? "Ajouter" : "Assign")}
                  </Button>
                </div>
              </div>
            )}

            {memberModalError && (
              <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 p-3 text-rose-400 flex items-center gap-2 font-medium mb-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {memberModalError}
              </div>
            )}

            {memberModalSuccess && (
              <div className="rounded-xl border border-emerald-500/60 bg-emerald-950/40 p-3 text-emerald-400 flex items-center gap-2 font-medium mb-3">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {memberModalSuccess}
              </div>
            )}

            {/* Current Members List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider block mb-2">
                {lang === "fr" ? "Collaborateurs actuellement assignés :" : "Currently Assigned Collaborators :"}
              </span>

              {isLoadingMembers ? (
                <div className="py-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                </div>
              ) : projectMembers.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#141b2b] text-center text-slate-500">
                  {lang === "fr" ? "Aucun membre assigné pour le moment." : "No members currently assigned."}
                </div>
              ) : (
                projectMembers.map((m) => {
                  const isSelf = m.userId === user?.id || m.user?.id === user?.id;

                  return (
                    <div key={m.id || m.userId} className="flex items-center justify-between p-3 rounded-xl bg-[#162032] border border-[#232f44]">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 font-bold flex items-center justify-center text-xs">
                          {m.user?.firstName?.[0] || "U"}{m.user?.lastName?.[0] || ""}
                        </div>
                        <div>
                          <div className="font-bold text-slate-100 flex items-center gap-2">
                            <span>{m.user?.firstName} {m.user?.lastName}</span>
                            {m.isManager && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                                {lang === "fr" ? "CHEF DE PROJET" : "MANAGER"}
                              </span>
                            )}
                          </div>
                          <span className="text-slate-400 text-[11px]">{m.user?.email}</span>
                        </div>
                      </div>

                      {isManagerOrAdmin && !m.isManager && !isSelf && (
                        <Button
                          onClick={() => handleRemoveMemberFromProject(m.userId || m.user?.id)}
                          size="sm"
                          variant="outline"
                          className="h-7 px-2.5 rounded-lg border-rose-800/50 bg-rose-950/20 hover:bg-rose-950/60 text-rose-400 text-[11px]"
                        >
                          <Trash2 className="w-3 h-3 mr-1" /> {lang === "fr" ? "Retirer" : "Remove"}
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-end pt-5 border-t border-[#232e42] mt-5">
              <Button onClick={() => setSelectedProjectForMembers(null)} size="sm" className="rounded-xl bg-[#162032] hover:bg-[#1e293b] text-slate-200 border border-[#2b3a55]">
                {lang === "fr" ? "Fermer" : "Close"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
