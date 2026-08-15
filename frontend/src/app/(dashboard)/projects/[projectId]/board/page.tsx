"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { KanbanBoard } from "@/components/kanban/Board";
import { ColumnType } from "@/components/kanban/Column";
import { TaskModal } from "@/components/kanban/TaskModal";
import api from "@/lib/api";
import { 
  Loader2, 
  Plus, 
  ArrowLeft, 
  Search, 
  ArrowUpDown, 
  X, 
  User, 
  FileSpreadsheet, 
  FolderArchive,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Users,
  UserPlus,
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import { useLangStore } from "@/stores/langStore";
import { translations } from "@/lib/i18n";

interface Member {
  id: string;
  userId: string;
  isManager?: boolean;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role?: string;
    avatarUrl?: string;
  };
}

interface AvailableUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export default function ProjectBoardPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const currentUser = useAuthStore((state) => state.user);
  const { lang } = useLangStore();
  const t = translations[lang] || translations.fr;

  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [boardId, setBoardId] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("Projet");
  const [projectQuota, setProjectQuota] = useState<{ used: number; quota: number }>({ used: 0, quota: 500 });
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  // Team Management Modal
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<AvailableUser[]>([]);
  const [selectedUserIdToAdd, setSelectedUserIdToAdd] = useState("");
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [teamModalMsg, setTeamModalMsg] = useState("");
  const [teamModalErr, setTeamModalErr] = useState("");

  // Search, Filters & Sorting
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("DEFAULT");

  // Create Task Modal state
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [targetColumnId, setTargetColumnId] = useState<string>("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskPriority, setNewTaskPriority] = useState<string>("MEDIUM");
  const [newTaskAssigneeId, setNewTaskAssigneeId] = useState<string>("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Create Column Modal state
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnColor, setNewColumnColor] = useState("#10b981");
  const [isSubmittingColumn, setIsSubmittingColumn] = useState(false);

  useEffect(() => {
    fetchBoard();
    fetchMembers();
  }, [projectId]);

  const fetchBoard = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/boards`);
      const board = res.data[0];
      if (board) {
        setBoardId(board.id);
        if (board.project?.name) setProjectName(board.project.name);
        if (board.project?.storageQuotaMb) {
          setProjectQuota({
            used: board.project.storageUsedMb || 0,
            quota: board.project.storageQuotaMb || 500,
          });
        }
        
        // Format columns & tasks
        const formattedColumns = (board.columns || []).map((col: any) => ({
          ...col,
          tasks: (col.tasks || []).map((t: any) => ({
            ...t,
            labels: (t.labels || []).map((l: any) => l.label || l),
          })),
        }));
        setColumns(formattedColumns);
      }
    } catch (error) {
      console.error("Failed to fetch board:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      setMembers(res.data || []);
    } catch (error) {
      console.error("Failed to fetch project members:", error);
    }
  };

  const openTeamModal = async () => {
    setTeamModalMsg("");
    setTeamModalErr("");
    setIsTeamModalOpen(true);
    try {
      const usersRes = await api.get("/users");
      setAvailableUsers(usersRes.data || []);
      await fetchMembers();
    } catch (error) {
      console.error("Failed to fetch available users:", error);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserIdToAdd) return;
    setTeamModalErr("");
    setTeamModalMsg("");
    setIsAddingMember(true);
    try {
      await api.post(`/projects/${projectId}/members`, { userId: selectedUserIdToAdd });
      setTeamModalMsg(lang === "fr" ? "Collaborateur assigné avec succès !" : "Collaborator assigned successfully!");
      setSelectedUserIdToAdd("");
      await fetchMembers();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      setTeamModalErr(Array.isArray(msg) ? msg.join(", ") : (msg || (lang === "fr" ? "Impossible d'ajouter ce membre." : "Failed to add member.")));
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userIdToRemove: string) => {
    if (!confirm(lang === "fr" ? "Retirer ce collaborateur du projet ?" : "Remove this collaborator from project?")) return;
    setTeamModalErr("");
    setTeamModalMsg("");
    try {
      await api.delete(`/projects/${projectId}/members/${userIdToRemove}`);
      setTeamModalMsg(lang === "fr" ? "Collaborateur retiré du projet." : "Collaborator removed.");
      await fetchMembers();
    } catch (error: any) {
      const msg = error.response?.data?.message;
      setTeamModalErr(Array.isArray(msg) ? msg.join(", ") : (msg || (lang === "fr" ? "Impossible de retirer ce membre." : "Failed to remove member.")));
    }
  };

  const handleTaskMove = async (taskId: string, targetColId: string, newPosition: number) => {
    try {
      await api.patch(`/tasks/${taskId}/move`, {
        columnId: targetColId,
        position: newPosition,
      });
    } catch (error) {
      console.error("Failed to move task:", error);
      fetchBoard(); 
    }
  };

  const handleColumnMove = async (columnId: string, newPosition: number) => {
    try {
      if (!boardId) return;
      
      const newColumnIds = [...columns.map((c) => c.id)];
      const colIndex = newColumnIds.indexOf(columnId);
      if (colIndex === -1) return;
      
      newColumnIds.splice(colIndex, 1);
      newColumnIds.splice(newPosition, 0, columnId);

      await api.patch(`/projects/${projectId}/boards/${boardId}/columns/reorder`, {
        columnIds: newColumnIds,
      });
    } catch (error) {
      console.error("Failed to reorder columns:", error);
      fetchBoard();
    }
  };

  const openAddTaskModal = (columnId: string) => {
    setTargetColumnId(columnId);
    setIsTaskModalOpen(true);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !targetColumnId) return;

    setIsSubmittingTask(true);
    try {
      await api.post("/tasks", {
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim() || undefined,
        columnId: targetColumnId,
        priority: newTaskPriority,
        assigneeId: newTaskAssigneeId || undefined,
        dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : undefined,
      });
      setIsTaskModalOpen(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
      setNewTaskPriority("MEDIUM");
      setNewTaskAssigneeId("");
      setNewTaskDueDate("");
      await fetchBoard();
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnName.trim() || !boardId) return;

    setIsSubmittingColumn(true);
    try {
      await api.post(`/projects/${projectId}/boards/${boardId}/columns`, {
        name: newColumnName.trim(),
        color: newColumnColor,
      });
      setIsColumnModalOpen(false);
      setNewColumnName("");
      await fetchBoard();
    } catch (error) {
      console.error("Failed to create column:", error);
    } finally {
      setIsSubmittingColumn(false);
    }
  };

  const resetFilters = () => {
    setSearchQuery("");
    setPriorityFilter("ALL");
    setAssigneeFilter("ALL");
    setSortBy("DEFAULT");
  };

  const isFilterActive = searchQuery !== "" || priorityFilter !== "ALL" || assigneeFilter !== "ALL" || sortBy !== "DEFAULT";

  const priorityWeight: Record<string, number> = {
    URGENT: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  // Filter and Sort tasks per column
  const processedColumns = useMemo(() => {
    return columns.map((col) => {
      // 1. Filter
      let filtered = col.tasks.filter((task) => {
        const matchesSearch =
          searchQuery === "" ||
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (task.labels && task.labels.some((l) => l.name.toLowerCase().includes(searchQuery.toLowerCase())));

        const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;

        const matchesAssignee =
          assigneeFilter === "ALL" ||
          (assigneeFilter === "UNASSIGNED" ? !task.assigneeId : task.assigneeId === assigneeFilter);

        return matchesSearch && matchesPriority && matchesAssignee;
      });

      // 2. Sort
      filtered = [...filtered].sort((a, b) => {
        if (sortBy === "DUE_ASC") {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (sortBy === "DUE_DESC") {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
        }
        if (sortBy === "PRIORITY_DESC") {
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        }
        if (sortBy === "PRIORITY_ASC") {
          return (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
        }
        if (sortBy === "TITLE_ASC") {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === "TITLE_DESC") {
          return b.title.localeCompare(a.title);
        }
        if (sortBy === "CREATED_DESC") {
          return new Date(b.id || 0).getTime() - new Date(a.id || 0).getTime();
        }
        // Default position order
        return 0;
      });

      return {
        ...col,
        tasks: filtered,
      };
    });
  }, [columns, searchQuery, priorityFilter, assigneeFilter, sortBy]);

  const totalTasksCount = columns.reduce((acc, c) => acc + c.tasks.length, 0);
  const visibleTasksCount = processedColumns.reduce((acc, c) => acc + c.tasks.length, 0);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col -m-2 sm:-m-4 md:-m-6 relative bg-[#090d16]">
      {/* Top Project Navigation Bar */}
      <div className="px-2 sm:px-4 md:px-8 py-2 sm:py-3 md:py-4 border-b border-[#1c2638] bg-[#0d131f]/95 backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
        {/* Left: Breadcrumbs & Project Title */}
        <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
          <button
            onClick={() => router.push("/projects")}
            className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[#182234] transition-all border border-[#233148]"
            title={lang === "fr" ? "Retour aux projets" : "Back to projects"}
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
          
          <div className="min-w-0">
            <div className="flex items-center gap-1 sm:gap-2 text-[9px] sm:text-xs font-semibold text-slate-400">
              <span className="hidden sm:inline">{lang === "fr" ? "Projets" : "Projects"}</span>
              <span className="hidden sm:inline">/</span>
              <span className="text-emerald-400 font-bold truncate">{projectName}</span>
            </div>
            <h1 className="text-sm sm:text-base md:text-xl font-bold tracking-tight text-slate-100 mt-0 sm:mt-0.5 truncate">
              {projectName}
            </h1>
          </div>
        </div>

        {/* Right: Team Avatars & Main Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Member Avatars Stack with Manage Team Trigger */}
          <button
            onClick={openTeamModal}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl bg-[#141b2b] border border-[#26334a] hover:border-emerald-500/60 transition-all text-[9px] sm:text-xs font-semibold text-slate-300"
            title={lang === "fr" ? "Gérer l'équipe du projet" : "Manage project team"}
          >
            <div className="flex items-center -space-x-1 sm:-space-x-2">
              {members.slice(0, 2).map((m) => (
                <div
                  key={m.user?.id || m.userId}
                  className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 rounded-full bg-[#1e293b] border-2 border-[#0d131f] flex items-center justify-center text-[8px] sm:text-[10px] font-bold text-emerald-300"
                >
                  {m.user?.firstName?.[0] || "U"}{m.user?.lastName?.[0] || ""}
                </div>
              ))}
            </div>
            <span className="hidden sm:inline">{members.length} {lang === "fr" ? "membres" : "members"}</span>
            <span className="sm:hidden">{members.length}</span>
            <UserPlus className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-400 ml-0.5" />
          </button>

          {/* Deliverables Link */}
          <Button
            onClick={() => router.push(`/projects/${projectId}/deliverables`)}
            variant="outline"
            size="sm"
            className="rounded-lg sm:rounded-xl text-[9px] sm:text-xs gap-1.5 sm:gap-2 text-cyan-400 border-cyan-800/60 bg-cyan-950/30 hover:bg-cyan-950/60 font-semibold"
          >
            <FolderArchive className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">{t.deliverables_storage}</span>
          </Button>

          {/* Export Tasks Button */}
          <Button
            onClick={() => {
              const allTasks = columns.flatMap((c) =>
                c.tasks.map((t) => [t.id, `"${t.title}"`, c.name, t.priority, t.dueDate || "N/A"])
              );
              const csv = "ID,Title,Column,Priority,DueDate\n" + allTasks.map((r) => r.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.setAttribute("href", url);
              link.setAttribute("download", `Tasks_${projectName}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            variant="outline"
            size="sm"
            className="rounded-lg sm:rounded-xl text-[9px] sm:text-xs gap-1.5 sm:gap-2 text-slate-300 border-[#2a3850] bg-[#141b2b] hover:bg-[#1e293b]"
          >
            <FileSpreadsheet className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{t.export_tasks}</span>
          </Button>

          {/* Add Column Button */}
          <Button
            onClick={() => setIsColumnModalOpen(true)}
            size="sm"
            className="rounded-lg sm:rounded-xl text-[9px] sm:text-xs gap-1.5 sm:gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-2.5 h-2.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">{t.new_column}</span>
          </Button>
        </div>
      </div>

      {/* Spacious, Intuitive Filter & Sort Toolbar */}
      <div className="px-2 sm:px-4 md:px-8 py-2 sm:py-3.5 border-b border-[#1c2638] bg-[#0c111c] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 text-[9px] sm:text-xs">
        {/* Left Side: Search & Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-1 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-48 md:w-64 max-w-full">
            <Search className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 absolute left-2 sm:left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === "fr" ? "Rechercher..." : "Search..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 sm:pl-9 pr-6 sm:pr-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-[#141a27] border border-[#232e42] text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:bg-[#182030] focus:outline-none transition-all text-[9px] sm:text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Priority */}
          <div className="flex items-center gap-1 sm:gap-2 bg-[#141a27] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-[#232e42]">
            <span className="text-slate-400 font-semibold text-[8px] sm:text-xs hidden sm:inline">{t.priority} :</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-[9px] sm:text-xs flex-1"
            >
              <option value="ALL" className="bg-[#141a27] text-slate-200">{t.filter_priority}</option>
              <option value="URGENT" className="bg-[#141a27] text-rose-400">{t.p_urgent}</option>
              <option value="HIGH" className="bg-[#141a27] text-amber-400">{t.p_high}</option>
              <option value="MEDIUM" className="bg-[#141a27] text-cyan-400">{t.p_medium}</option>
              <option value="LOW" className="bg-[#141a27] text-slate-300">{t.p_low}</option>
            </select>
          </div>

          {/* Filter by Assignee */}
          <div className="flex items-center gap-1 sm:gap-2 bg-[#141a27] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-[#232e42]">
            <User className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-slate-400" />
            <span className="text-slate-400 font-semibold text-[8px] sm:text-xs hidden sm:inline">{t.task_assignee} :</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-[9px] sm:text-xs flex-1"
            >
              <option value="ALL" className="bg-[#141a27] text-slate-200">{t.all}</option>
              {members.map((m) => (
                <option key={m.userId} value={m.userId} className="bg-[#141a27] text-slate-200">
                  {m.user.firstName} {m.user.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-1 sm:gap-2 bg-[#141a27] px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-[#232e42]">
            <ArrowUpDown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer text-[9px] sm:text-xs flex-1"
            >
              <option value="DEFAULT" className="bg-[#141a27] text-slate-200">{t.sort_default}</option>
              <option value="PRIORITY_DESC" className="bg-[#141a27] text-slate-200">{t.sort_priority_desc}</option>
              <option value="DUE_ASC" className="bg-[#141a27] text-slate-200">{t.sort_due_asc}</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {isFilterActive && (
            <Button
              onClick={resetFilters}
              variant="outline"
              size="sm"
              className="rounded-lg sm:rounded-xl border-[#2a3850] bg-[#141b2b] hover:bg-[#1e293b] text-[9px] sm:text-xs"
            >
              <SlidersHorizontal className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">{t.reset_filters}</span>
            </Button>
          )}
        </div>

        {/* Right Side: Filter Status Badge */}
        <div className="flex items-center gap-2">
          {isFilterActive && (
            <span className="text-slate-400 text-[8px] sm:text-xs">
              <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 inline" />
              {visibleTasksCount} / {totalTasksCount} {t.tasks_count}
            </span>
          )}
        </div>
      </div>

      {/* Kanban Board Canvas */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard
          initialColumns={processedColumns}
          onTaskMove={handleTaskMove}
          onColumnMove={handleColumnMove}
          onAddTask={openAddTaskModal}
          onTaskClick={(taskId) => setSelectedTaskId(taskId)}
        />
      </div>

      {/* Trello-Style Task Modal */}
      <TaskModal
        taskId={selectedTaskId}
        projectId={projectId as string}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={fetchBoard}
      />

      {/* Modern Create Task Modal */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
          <div className="w-full max-w-lg rounded-xl sm:rounded-2xl border border-[#26334a] bg-[#111827] p-4 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#232e42] pb-3 sm:pb-4 mb-4 sm:mb-5">
              <h3 className="text-sm sm:text-base md:text-lg font-bold text-slate-100 flex items-center gap-2 sm:gap-2.5">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-emerald-400" />
                <span>{t.create_task_title}</span>
              </h3>
              <button 
                onClick={() => setIsTaskModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 sm:space-y-4 text-[10px] sm:text-xs">
              <div className="space-y-1 sm:space-y-1.5">
                <Label htmlFor="taskTitle" className="text-slate-300 font-semibold text-[9px] sm:text-xs">{t.task_title_label}</Label>
                <Input
                  id="taskTitle"
                  placeholder="e.g. Conception de l'architecture d'authentification"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  className="bg-[#141a27] border-[#232e42] text-slate-100 rounded-lg sm:rounded-xl text-[10px] sm:text-xs"
                />
              </div>

              <div className="space-y-1 sm:space-y-1.5">
                <Label htmlFor="taskDesc" className="text-slate-300 font-semibold text-[9px] sm:text-xs">{t.task_desc_label}</Label>
                <textarea
                  id="taskDesc"
                  rows={3}
                  placeholder={lang === "fr" ? "Description détaillée de la tâche..." : "Detailed task description..."}
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full rounded-lg sm:rounded-xl border border-[#232e42] bg-[#141a27] p-2 sm:p-3 text-[10px] sm:text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="taskPriority" className="text-slate-300 font-semibold text-[9px] sm:text-xs">{t.priority}</Label>
                  <select
                    id="taskPriority"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full rounded-lg sm:rounded-xl border border-[#232e42] bg-[#141a27] px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="LOW">{t.p_low}</option>
                    <option value="MEDIUM">{t.p_medium}</option>
                    <option value="HIGH">{t.p_high}</option>
                    <option value="URGENT">{t.p_urgent}</option>
                  </select>
                </div>

                <div className="space-y-1 sm:space-y-1.5">
                  <Label htmlFor="taskAssignee" className="text-slate-300 font-semibold text-[9px] sm:text-xs">{t.task_assignee}</Label>
                  <select
                    id="taskAssignee"
                    value={newTaskAssigneeId}
                    onChange={(e) => setNewTaskAssigneeId(e.target.value)}
                    className="w-full rounded-lg sm:rounded-xl border border-[#232e42] bg-[#141a27] px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-slate-100 focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">{t.unassigned}</option>
                    {members.map((m) => (
                      <option key={m.userId} value={m.userId}>
                        {m.user.firstName} {m.user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1 sm:space-y-1.5">
                <Label htmlFor="taskDueDate" className="text-slate-300 font-semibold text-[9px] sm:text-xs">{t.task_due_label}</Label>
                <Input
                  id="taskDueDate"
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                  className="bg-[#141a27] border-[#232e42] text-slate-100 rounded-lg sm:rounded-xl text-[10px] sm:text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#232e42]">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsTaskModalOpen(false)} className="rounded-lg sm:rounded-xl border-[#2a3850] bg-[#141b2b] hover:bg-[#1e293b] text-slate-300 text-[9px] sm:text-xs">
                  {t.cancel}
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingTask} className="rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20 text-[9px] sm:text-xs">
                  {isSubmittingTask ? (lang === "fr" ? "Création..." : "Creating...") : (lang === "fr" ? "Créer la tâche" : "Create Task")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Column Modal */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
          <div className="w-full max-w-md rounded-xl sm:rounded-2xl border border-[#26334a] bg-[#111827] p-4 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#232e42] pb-3 sm:pb-4 mb-4 sm:mb-5">
              <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                <span>{t.new_column}</span>
              </h3>
              <button 
                onClick={() => setIsColumnModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateColumn} className="space-y-3 sm:space-y-4 text-[10px] sm:text-xs">
              <div className="space-y-1 sm:space-y-1.5">
                <Label htmlFor="columnName" className="text-slate-300 font-semibold text-[9px] sm:text-xs">{lang === "fr" ? "Nom de la colonne" : "Column Name"}</Label>
                <Input
                  id="columnName"
                  placeholder={lang === "fr" ? "e.g. En cours" : "e.g. In Progress"}
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  required
                  className="bg-[#141a27] border-[#232e42] text-slate-100 rounded-lg sm:rounded-xl text-[10px] sm:text-xs"
                />
              </div>

              <div className="space-y-1 sm:space-y-1.5">
                <Label htmlFor="columnColor" className="text-slate-300 font-semibold text-[9px] sm:text-xs">{lang === "fr" ? "Couleur" : "Color"}</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="columnColor"
                    type="color"
                    value={newColumnColor}
                    onChange={(e) => setNewColumnColor(e.target.value)}
                    className="w-12 h-10 rounded-lg sm:rounded-xl bg-[#141a27] border-[#232e42] p-1"
                  />
                  <Input
                    type="text"
                    value={newColumnColor}
                    onChange={(e) => setNewColumnColor(e.target.value)}
                    className="flex-1 bg-[#141a27] border-[#232e42] text-slate-100 rounded-lg sm:rounded-xl text-[10px] sm:text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-[#232e42]">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsColumnModalOpen(false)} className="rounded-lg sm:rounded-xl border-[#2a3850] bg-[#141b2b] hover:bg-[#1e293b] text-slate-300 text-[9px] sm:text-xs">
                  {t.cancel}
                </Button>
                <Button type="submit" size="sm" disabled={isSubmittingColumn} className="rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20 text-[9px] sm:text-xs">
                  {isSubmittingColumn ? (lang === "fr" ? "Création..." : "Creating...") : (lang === "fr" ? "Créer" : "Create")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Team Management Modal */}
      {isTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4">
          <div className="w-full max-w-xl rounded-xl sm:rounded-2xl border border-[#26334a] bg-[#111827] p-4 sm:p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#232e42] pb-3 sm:pb-4 mb-4 sm:mb-5">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-400" />
                  <span>{lang === "fr" ? "Équipe du projet" : "Project Team"}</span>
                </h3>
                <p className="text-slate-400 text-[9px] sm:text-[11px] mt-0.5 font-semibold text-emerald-400">
                  {projectName}
                </p>
              </div>
              <button onClick={() => setIsTeamModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]">
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-[#162032] border border-[#26334a] mb-4 sm:mb-5 space-y-2 sm:space-y-3">
              <span className="text-slate-200 font-bold flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs">
                <UserPlus className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                {lang === "fr" ? "Ajouter un membre" : "Add Team Member"}
              </span>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedUserIdToAdd}
                  onChange={(e) => setSelectedUserIdToAdd(e.target.value)}
                  className="flex-1 rounded-lg sm:rounded-xl border border-[#2b3a55] bg-[#111827] px-2 sm:px-3 py-2 text-[10px] sm:text-xs text-slate-100 focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- {lang === "fr" ? "Sélectionner un utilisateur" : "Select user"} --</option>
                  {availableUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.firstName} {u.lastName} ({u.role})
                    </option>
                  ))}
                </select>

                <Button
                  onClick={handleAddMember}
                  disabled={!selectedUserIdToAdd || isAddingMember}
                  size="sm"
                  className="rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shrink-0 text-[9px] sm:text-xs"
                >
                  {isAddingMember ? <Loader2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 animate-spin" /> : (lang === "fr" ? "Ajouter" : "Add")}
                </Button>
              </div>
            </div>

            {teamModalErr && (
              <div className="rounded-lg sm:rounded-xl border border-rose-800/60 bg-rose-950/40 p-2 sm:p-3 text-rose-400 flex items-center gap-2 font-medium mb-3 text-[9px] sm:text-xs">
                <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> {teamModalErr}
              </div>
            )}

            {teamModalMsg && (
              <div className="rounded-lg sm:rounded-xl border border-emerald-500/60 bg-emerald-950/40 p-2 sm:p-3 text-emerald-400 flex items-center gap-2 font-medium mb-3 text-[9px] sm:text-xs">
                <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" /> {teamModalMsg}
              </div>
            )}

            <div className="space-y-2 max-h-48 sm:max-h-64 overflow-y-auto pr-1">
              <span className="text-slate-400 font-semibold text-[10px] sm:text-[11px] uppercase tracking-wider block mb-2">
                {lang === "fr" ? "Membres actuels" : "Current Members"}
              </span>

              {members.length === 0 ? (
                <div className="p-3 sm:p-4 rounded-lg sm:rounded-xl bg-[#141b2b] text-center text-slate-500 text-[10px] sm:text-xs">
                  {lang === "fr" ? "Aucun membre" : "No members"}
                </div>
              ) : (
                members.map((m) => (
                  <div key={m.userId} className="flex items-center justify-between p-2 sm:p-3 rounded-lg sm:rounded-xl bg-[#162032] border border-[#232f44]">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="h-6 w-6 sm:h-7 sm:w-7 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-300 text-[9px] sm:text-[10px]">
                        {m.user?.firstName?.[0] || "U"}{m.user?.lastName?.[0] || ""}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-100 text-[10px] sm:text-xs truncate">
                          {m.user?.firstName} {m.user?.lastName}
                        </div>
                        <span className="text-slate-400 text-[8px] sm:text-[10px]">{m.user?.role}</span>
                      </div>
                    </div>

                    <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-bold ${m.isManager ? 'bg-cyan-950 text-cyan-400 border border-cyan-800' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                      {m.isManager ? (lang === "fr" ? "CHEF" : "MGR") : (lang === "fr" ? "MEMBRE" : "MEMBER")}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-4 sm:pt-5 border-t border-[#232e42] mt-4 sm:mt-5">
              <Button onClick={() => setIsTeamModalOpen(false)} size="sm" className="rounded-lg sm:rounded-xl bg-[#162032] hover:bg-[#1e293b] text-slate-200 border border-[#2b3a55] text-[9px] sm:text-xs">
                {lang === "fr" ? "Fermer" : "Close"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
