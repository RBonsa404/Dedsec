"use client";

import React, { useEffect, useState } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Clock, 
  MessageSquare, 
  CheckSquare, 
  Plus, 
  Send, 
  Loader2, 
  Trash2,
  Tag,
  AlertCircle,
  UserCheck,
  CalendarCheck,
  AlignLeft,
  CheckCircle2,
  Sliders,
  ListTodo,
  Lock
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useLangStore } from '@/stores/langStore';
import { translations } from '@/lib/i18n';

interface TaskDetail {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  dueDate: string | null;
  startDate: string | null;
  estimatedHours: number | null;
  assigneeId?: string | null;
  column?: { id: string; name: string };
  assignee?: { id: string; firstName: string; lastName: string; email: string; avatarUrl?: string };
  creator?: { id: string; firstName: string; lastName: string };
  labels: { id: string; label: { id: string; name: string; color: string } }[];
  checklists: {
    id: string;
    title: string;
    items: { id: string; text: string; isCompleted: boolean; position: number }[];
  }[];
  comments: {
    id: string;
    content: string;
    createdAt: string;
    author: { id: string; firstName: string; lastName: string; avatarUrl?: string };
  }[];
}

interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
  };
}

interface TaskModalProps {
  taskId: string | null;
  projectId?: string;
  onClose: () => void;
  onTaskUpdated?: () => void;
}

export function TaskModal({ taskId, projectId, onClose, onTaskUpdated }: TaskModalProps) {
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedDesc, setEditedDesc] = useState("");

  const [newComment, setNewComment] = useState("");
  const [isSendingComment, setIsSendingComment] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [isAddingChecklist, setIsAddingChecklist] = useState(false);
  const [newItemText, setNewItemText] = useState<{ [checklistId: string]: string }>({});
  
  const { lang } = useLangStore();
  const t = translations[lang] || translations.fr;
  const currentUser = useAuthStore((state) => state.user);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetail(taskId);
      fetchMembers();
    } else {
      setTask(null);
    }
  }, [taskId]);

  const fetchTaskDetail = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/tasks/${id}`);
      setTask(res.data);
      setEditedTitle(res.data.title);
      setEditedDesc(res.data.description || "");
    } catch (error) {
      console.error("Failed to load task details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      if (projectId) {
        const res = await api.get(`/projects/${projectId}/members`);
        setMembers(res.data || []);
      } else {
        const res = await api.get("/users");
        setMembers(res.data.map((u: any) => ({ id: u.id, userId: u.id, user: u })));
      }
    } catch {
      try {
        const usersRes = await api.get("/users");
        setMembers(usersRes.data.map((u: any) => ({ id: u.id, userId: u.id, user: u })));
      } catch {
        // ignore
      }
    }
  };

  const isManagerOrAdmin = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.role === 'PROJECT_MANAGER';
  const isAllocatedAssignee = task?.assigneeId === currentUser?.id || task?.assignee?.id === currentUser?.id;
  const canManageChecklists = isManagerOrAdmin || isAllocatedAssignee;
  const canReassign = isManagerOrAdmin;

  const handleSaveTitle = async () => {
    if (!task || !editedTitle.trim()) return;
    try {
      await api.patch(`/tasks/${task.id}`, { title: editedTitle.trim() });
      setTask({ ...task, title: editedTitle.trim() });
      setIsEditingTitle(false);
      onTaskUpdated?.();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update title");
    }
  };

  const handleSaveDescription = async () => {
    if (!task) return;
    try {
      await api.patch(`/tasks/${task.id}`, { description: editedDesc.trim() || null });
      setTask({ ...task, description: editedDesc.trim() || null });
      setIsEditingDesc(false);
      onTaskUpdated?.();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update description");
    }
  };

  const handleToggleChecklistItem = async (itemId: string, currentCompleted: boolean) => {
    if (!task) return;
    if (!canManageChecklists) {
      alert(lang === "fr" 
        ? "Action non autorisée : Seule la personne allouée à la tâche et le chef de projet peuvent cocher les sous-tâches."
        : "Unauthorized: Only the assigned operator and project manager can check subtasks.");
      return;
    }

    try {
      await api.patch(`/tasks/checklists/items/${itemId}/toggle`, {
        isCompleted: !currentCompleted,
      });
      setTask({
        ...task,
        checklists: task.checklists.map((cl) => ({
          ...cl,
          items: cl.items.map((it) =>
            it.id === itemId ? { ...it, isCompleted: !currentCompleted } : it
          ),
        })),
      });
      onTaskUpdated?.();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to toggle checklist item");
    }
  };

  const handleAddChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newChecklistTitle.trim()) return;
    if (!canManageChecklists) {
      alert(lang === "fr"
        ? "Action non autorisée : Seule la personne allouée à la tâche et le chef de projet peuvent ajouter des sous-listes."
        : "Unauthorized: Only the assigned operator and project manager can add checklists.");
      return;
    }

    try {
      const res = await api.post(`/tasks/${task.id}/checklists`, {
        title: newChecklistTitle.trim(),
      });
      setTask({
        ...task,
        checklists: [...task.checklists, { ...res.data, items: [] }],
      });
      setNewChecklistTitle("");
      setIsAddingChecklist(false);
      onTaskUpdated?.();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to create checklist");
    }
  };

  const handleAddChecklistItem = async (checklistId: string) => {
    const text = newItemText[checklistId];
    if (!task || !text || !text.trim()) return;
    if (!canManageChecklists) {
      alert(lang === "fr"
        ? "Action non autorisée : Seule la personne allouée à la tâche et le chef de projet peuvent ajouter des sous-tâches."
        : "Unauthorized: Only the assigned operator and project manager can add subtasks.");
      return;
    }

    try {
      const res = await api.post(`/tasks/checklists/${checklistId}/items`, {
        text: text.trim(),
      });
      setTask({
        ...task,
        checklists: task.checklists.map((cl) =>
          cl.id === checklistId
            ? { ...cl, items: [...cl.items, res.data] }
            : cl
        ),
      });
      setNewItemText({ ...newItemText, [checklistId]: "" });
      onTaskUpdated?.();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add checklist item");
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newComment.trim()) return;

    setIsSendingComment(true);
    try {
      const res = await api.post(`/tasks/${task.id}/comments`, {
        content: newComment.trim(),
      });
      setTask({
        ...task,
        comments: [res.data, ...task.comments],
      });
      setNewComment("");
      onTaskUpdated?.();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to post comment");
    } finally {
      setIsSendingComment(false);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    if (!task) return;
    try {
      await api.patch(`/tasks/${task.id}`, { priority: newPriority });
      setTask({ ...task, priority: newPriority });
      onTaskUpdated?.();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update priority");
    }
  };

  const handleAssigneeChange = async (newAssigneeId: string) => {
    if (!task) return;
    if (!canReassign) {
      alert(lang === "fr" 
        ? "Action non autorisée : Un membre opérateur ne peut pas modifier la personne allouée à une tâche."
        : "Unauthorized: A team member cannot reassign a task.");
      return;
    }

    try {
      const assigneeValue = newAssigneeId === "UNASSIGNED" ? null : newAssigneeId;
      await api.patch(`/tasks/${task.id}`, { assigneeId: assigneeValue });
      
      const foundUser = members.find((m) => m.user.id === newAssigneeId)?.user;
      setTask({
        ...task,
        assigneeId: assigneeValue,
        assignee: foundUser || undefined,
      });
      onTaskUpdated?.();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update assignee");
    }
  };

  const handleDueDateChange = async (newDate: string) => {
    if (!task) return;
    try {
      const dueIso = newDate ? new Date(newDate).toISOString() : null;
      await api.patch(`/tasks/${task.id}`, { dueDate: dueIso });
      setTask({ ...task, dueDate: dueIso });
      onTaskUpdated?.();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update due date");
    }
  };

  if (!taskId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 select-none">
      <div className="flex h-[90vh] w-[980px] max-w-[96vw] flex-col overflow-hidden rounded-2xl border border-[#232f44] bg-[#0f1523] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-[#1c2638] bg-[#0c111c] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>{lang === "fr" ? "Colonne :" : "List :"}</span>
              <span className="px-2.5 py-0.5 rounded-lg bg-[#182234] text-emerald-400 border border-[#233148] font-bold">
                {task?.column?.name || "Kanban"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:bg-[#182234] hover:text-slate-100 transition-all border border-transparent hover:border-[#233148]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading || !task ? (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-9 w-9 animate-spin text-emerald-400" />
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            
            {/* Left Content Area (70%) */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
              
              {/* Task Title */}
              <div>
                {isEditingTitle ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      className="flex-1 rounded-xl bg-[#182234] border border-emerald-500 px-4 py-2 text-lg font-bold text-slate-100 focus:outline-none"
                    />
                    <Button size="sm" onClick={handleSaveTitle} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl">
                      {t.save}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setIsEditingTitle(false)} className="rounded-xl">
                      {t.cancel}
                    </Button>
                  </div>
                ) : (
                  <h2 
                    onClick={() => setIsEditingTitle(true)}
                    className="text-2xl font-bold text-slate-100 hover:text-emerald-400 cursor-pointer transition-colors leading-tight"
                    title={lang === "fr" ? "Cliquer pour modifier le titre" : "Click to edit title"}
                  >
                    {task.title}
                  </h2>
                )}

                {/* Labels Row */}
                {task.labels && task.labels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {task.labels.map(({ label }) => (
                      <span
                        key={label.id}
                        className="px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider shadow-xs"
                        style={{
                          backgroundColor: `${label.color}25`,
                          color: label.color,
                          border: `1px solid ${label.color}50`,
                        }}
                      >
                        {label.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description Block */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-200">
                    <AlignLeft className="w-4 h-4 text-emerald-400" />
                    <span>{t.task_desc}</span>
                  </h3>
                  {!isEditingDesc && (
                    <button
                      onClick={() => setIsEditingDesc(true)}
                      className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors"
                    >
                      {lang === "fr" ? "Modifier" : "Edit"}
                    </button>
                  )}
                </div>

                {isEditingDesc ? (
                  <div className="space-y-3">
                    <textarea
                      rows={4}
                      value={editedDesc}
                      onChange={(e) => setEditedDesc(e.target.value)}
                      placeholder="Ajouter une description plus détaillée..."
                      className="w-full rounded-xl border border-emerald-500/80 bg-[#161f30] p-4 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                    />
                    <div className="flex items-center gap-2">
                      <Button size="sm" onClick={handleSaveDescription} className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold rounded-xl">
                        {t.save}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setIsEditingDesc(false)} className="rounded-xl">
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingDesc(true)}
                    className="rounded-2xl border border-[#1e2a3e] bg-[#141b2b] p-5 text-sm text-slate-200 whitespace-pre-wrap leading-relaxed cursor-pointer hover:border-[#2b3a55] transition-all min-h-[80px]"
                  >
                    {task.description || (
                      <span className="text-slate-500 italic">
                        {lang === "fr" ? "Ajouter une description plus détaillée à cette carte..." : "Add a more detailed description to this card..."}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Checklists Block */}
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-slate-200">
                    <CheckSquare className="w-4 h-4 text-cyan-400" />
                    <span>{t.task_checklists} ({task.checklists.length})</span>
                  </h3>
                  {canManageChecklists && (
                    <button
                      onClick={() => setIsAddingChecklist(!isAddingChecklist)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:underline"
                    >
                      <Plus className="h-4 w-4" /> {t.add_checklist}
                    </button>
                  )}
                </div>

                {!canManageChecklists && (
                  <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 font-medium">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>
                      {lang === "fr" 
                        ? `Lecture seule : Seule la personne allouée (${task.assignee ? `${task.assignee.firstName} ${task.assignee.lastName}` : "l'opérateur"}) et le chef de projet peuvent cocher ou ajouter des sous-listes.` 
                        : `Read-only: Only the allocated assignee and project manager can check or add subtasks.`}
                    </span>
                  </div>
                )}

                {isAddingChecklist && canManageChecklists && (
                  <form onSubmit={handleAddChecklist} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Titre de la checklist..."
                      value={newChecklistTitle}
                      onChange={(e) => setNewChecklistTitle(e.target.value)}
                      className="flex-1 rounded-xl bg-[#161f30] border border-cyan-500 px-4 py-2 text-xs text-slate-100 focus:outline-none"
                    />
                    <Button type="submit" size="sm" className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold rounded-xl text-xs">
                      {t.save}
                    </Button>
                  </form>
                )}

                {task.checklists.map((cl) => {
                  const completedCount = cl.items.filter((i) => i.isCompleted).length;
                  const progress = cl.items.length > 0 ? Math.round((completedCount / cl.items.length) * 100) : 0;

                  return (
                    <div key={cl.id} className="rounded-2xl border border-[#1e2a3e] bg-[#131a29] p-5 space-y-4 shadow-sm">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-200 text-sm font-bold">{cl.title}</span>
                        <span className="text-slate-400">{completedCount}/{cl.items.length} ({progress}%)</span>
                      </div>

                      {/* Smooth Progress Bar */}
                      <div className="h-2 w-full rounded-full bg-[#1e2a3e] overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-300 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      {/* Checklist items list */}
                      <div className="space-y-2 text-xs">
                        {cl.items.map((item) => (
                          <label
                            key={item.id}
                            className={`flex items-center gap-3 rounded-xl p-2.5 transition-colors ${
                              canManageChecklists ? "hover:bg-[#1a2336] cursor-pointer" : "opacity-80 cursor-not-allowed"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={item.isCompleted}
                              disabled={!canManageChecklists}
                              onChange={() => handleToggleChecklistItem(item.id, item.isCompleted)}
                              className="h-4 w-4 rounded-md accent-emerald-500 cursor-pointer disabled:cursor-not-allowed"
                              title={!canManageChecklists ? "Seule la personne allouée à la tâche et le chef peuvent cocher les sous-tâches" : ""}
                            />
                            <span
                              className={`text-slate-200 leading-relaxed ${
                                item.isCompleted ? "line-through text-slate-500" : ""
                              }`}
                            >
                              {item.text}
                            </span>
                          </label>
                        ))}
                      </div>

                      {/* Add item input */}
                      {canManageChecklists && (
                        <div className="flex gap-2 pt-2">
                          <input
                            type="text"
                            placeholder={lang === "fr" ? "Ajouter un élément..." : "Add an item..."}
                            value={newItemText[cl.id] || ""}
                            onChange={(e) =>
                              setNewItemText({ ...newItemText, [cl.id]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                handleAddChecklistItem(cl.id);
                              }
                            }}
                            className="flex-1 rounded-xl bg-[#182234] border border-[#26334a] px-3.5 py-2 text-xs text-slate-100 focus:border-cyan-400 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddChecklistItem(cl.id)}
                            className="px-4 py-2 rounded-xl bg-[#1e2b42] text-slate-200 hover:text-emerald-400 text-xs font-semibold transition-colors"
                          >
                            {t.task_add_item}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Activity & Comments Stream */}
              <div className="space-y-5 pt-4 border-t border-[#1c2638]">
                <h3 className="flex items-center gap-2 text-sm font-bold text-slate-200">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>{t.task_comments}</span>
                </h3>

                {/* Comment Input */}
                <form onSubmit={handleAddComment} className="space-y-3">
                  <textarea
                    rows={2}
                    placeholder={lang === "fr" ? "Écrire un commentaire ou une mise à jour d'état..." : "Write a comment or status update..."}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full rounded-2xl border border-[#232f44] bg-[#141b2b] p-4 text-xs text-slate-100 placeholder:text-slate-500 focus:border-amber-400 focus:outline-none"
                  />
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size="sm"
                      disabled={isSendingComment || !newComment.trim()}
                      className="rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold gap-2 text-xs"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {isSendingComment ? t.loading : t.task_dispatch_comment}
                    </Button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-3">
                  {task.comments.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-500">
                      {lang === "fr" ? "Aucun commentaire pour le moment." : "No comments recorded."}
                    </div>
                  ) : (
                    task.comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3.5 rounded-2xl bg-[#141b2b] border border-[#1e2a3e] p-4">
                        <div className="h-8 w-8 shrink-0 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-300 text-xs">
                          {comment.author.firstName[0]}{comment.author.lastName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-bold text-xs text-slate-200">
                              {comment.author.firstName} {comment.author.lastName}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {new Date(comment.createdAt).toLocaleString(lang === 'fr' ? 'fr-FR' : 'en-US')}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Right Sidebar Actions (30%) */}
            <div className="w-80 border-l border-[#1c2638] bg-[#0c111c] p-6 space-y-6 text-xs">
              
              {/* Quick Actions Header */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === "fr" ? "Détails & Paramètres" : "Details & Settings"}</span>
                </h4>
              </div>

              {/* Assignee Card & Selector (Protected) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <span>{t.task_assignee}</span>
                  </span>
                  {!canReassign && (
                    <span className="flex items-center gap-1 text-[10px] text-amber-400/90 font-medium">
                      <Lock className="w-3 h-3" /> {lang === "fr" ? "Chef / Admin" : "PM / Admin"}
                    </span>
                  )}
                </div>

                {canReassign ? (
                  <select
                    value={task.assigneeId || (task.assignee?.id ?? "UNASSIGNED")}
                    onChange={(e) => handleAssigneeChange(e.target.value)}
                    className="w-full rounded-xl border border-[#232f44] bg-[#141b2b] p-3 text-xs text-slate-200 font-semibold focus:border-emerald-400 focus:outline-none cursor-pointer"
                  >
                    <option value="UNASSIGNED">-- ({t.unassigned}) --</option>
                    {members.map((m) => (
                      <option key={m.user.id} value={m.user.id}>
                        {m.user.firstName} {m.user.lastName} ({m.user.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full rounded-xl border border-[#232f44] bg-[#141b2b]/60 p-2.5 text-xs text-slate-400 font-medium">
                    {task.assignee 
                      ? `${task.assignee.firstName} ${task.assignee.lastName}` 
                      : `(${t.unassigned})`}
                  </div>
                )}

                {task.assignee && (
                  <div className="flex items-center gap-3 rounded-xl bg-[#141b2b] p-3 border border-[#232f44] mt-2">
                    <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/50 font-bold text-emerald-300 text-xs shrink-0">
                      {task.assignee.firstName[0]}{task.assignee.lastName[0]}
                    </div>
                    <div className="truncate">
                      <div className="font-bold text-slate-100 truncate">
                        {task.assignee.firstName} {task.assignee.lastName}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {task.assignee.email}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Priority Selector */}
              <div className="space-y-2">
                <span className="text-slate-400 font-semibold block flex items-center gap-2">
                  <Tag className="w-4 h-4 text-amber-400" />
                  <span>{t.task_priority_label}</span>
                </span>

                <select
                  value={task.priority}
                  onChange={(e) => handlePriorityChange(e.target.value)}
                  className="w-full rounded-xl border border-[#232f44] bg-[#141b2b] p-3 text-xs font-bold text-slate-200 focus:border-amber-400 focus:outline-none cursor-pointer"
                >
                  <option value="LOW" className="bg-[#141b2b] text-slate-300">{t.p_low}</option>
                  <option value="MEDIUM" className="bg-[#141b2b] text-cyan-400">{t.p_medium}</option>
                  <option value="HIGH" className="bg-[#141b2b] text-amber-400">{t.p_high}</option>
                  <option value="URGENT" className="bg-[#141b2b] text-rose-400">{t.p_urgent}</option>
                </select>
              </div>

              {/* Due Date Picker */}
              <div className="space-y-2">
                <span className="text-slate-400 font-semibold block flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-cyan-400" />
                  <span>{t.task_due_date}</span>
                </span>

                <input
                  type="date"
                  value={task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ""}
                  onChange={(e) => handleDueDateChange(e.target.value)}
                  className="w-full rounded-xl border border-[#232f44] bg-[#141b2b] p-2.5 text-xs text-slate-200 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Creator Info Footer */}
              {task.creator && (
                <div className="border-t border-[#1c2638] pt-4 text-xs text-slate-400 space-y-1">
                  <span>{lang === "fr" ? "Créée par :" : "Created by :"}</span>
                  <div className="font-semibold text-slate-200">
                    {task.creator.firstName} {task.creator.lastName}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
