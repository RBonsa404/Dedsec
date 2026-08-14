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
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLangStore } from "@/stores/langStore";
import { translations } from "@/lib/i18n";

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

export default function ProjectBoardPage() {
  const { projectId } = useParams();
  const router = useRouter();
  const { lang } = useLangStore();
  const t = translations[lang] || translations.fr;

  const [columns, setColumns] = useState<ColumnType[]>([]);
  const [boardId, setBoardId] = useState<string>("");
  const [projectName, setProjectName] = useState<string>("Projet");
  const [projectQuota, setProjectQuota] = useState<{ used: number; quota: number }>({ used: 0, quota: 500 });
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

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
      try {
        const usersRes = await api.get("/users");
        setMembers(usersRes.data.map((u: any) => ({ id: u.id, userId: u.id, user: u })));
      } catch {
        // ignore
      }
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
    <div className="flex h-[calc(100vh-5rem)] flex-col -m-6 relative bg-[#090d16]">
      {/* Top Project Navigation Bar */}
      <div className="px-8 py-4 border-b border-[#1c2638] bg-[#0d131f]/95 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        {/* Left: Breadcrumbs & Project Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/projects")}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-[#182234] transition-all border border-[#233148]"
            title={lang === "fr" ? "Retour aux projets" : "Back to projects"}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
              <span>{lang === "fr" ? "Projets" : "Projects"}</span>
              <span>/</span>
              <span className="text-emerald-400 font-bold">{projectName}</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-100 mt-0.5">
              {projectName}
            </h1>
          </div>
        </div>

        {/* Right: Team Avatars & Main Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Member Avatars Stack */}
          {members.length > 0 && (
            <div className="flex items-center -space-x-2 mr-2">
              {members.slice(0, 4).map((m) => (
                <div
                  key={m.user.id}
                  className="h-8 w-8 rounded-full bg-[#1e293b] border-2 border-[#0d131f] flex items-center justify-center text-xs font-bold text-slate-200 shadow-sm"
                  title={`${m.user.firstName} ${m.user.lastName}`}
                >
                  {m.user.firstName[0]}{m.user.lastName[0]}
                </div>
              ))}
              {members.length > 4 && (
                <div className="h-8 w-8 rounded-full bg-[#24334d] border-2 border-[#0d131f] flex items-center justify-center text-xs font-semibold text-slate-300">
                  +{members.length - 4}
                </div>
              )}
            </div>
          )}

          {/* Deliverables Link */}
          <Button
            onClick={() => router.push(`/projects/${projectId}/deliverables`)}
            variant="outline"
            size="sm"
            className="rounded-xl text-xs gap-2 text-cyan-400 border-cyan-800/60 bg-cyan-950/30 hover:bg-cyan-950/60 font-semibold"
          >
            <FolderArchive className="w-3.5 h-3.5" />
            {t.deliverables_storage}
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
            className="rounded-xl text-xs gap-2 text-slate-300 border-[#2a3850] bg-[#141b2b] hover:bg-[#1e293b]"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            {t.export_tasks}
          </Button>

          {/* Add Column Button */}
          <Button
            onClick={() => setIsColumnModalOpen(true)}
            size="sm"
            className="rounded-xl text-xs gap-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
          >
            <Plus className="w-4 h-4" /> {t.new_column}
          </Button>
        </div>
      </div>

      {/* Spacious, Intuitive Filter & Sort Toolbar */}
      <div className="px-8 py-3.5 border-b border-[#1c2638] bg-[#0c111c] flex flex-wrap items-center justify-between gap-4 text-xs">
        {/* Left Side: Search & Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative w-64 max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={lang === "fr" ? "Rechercher une carte ou un tag..." : "Search cards or tags..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#141a27] border border-[#232e42] text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:bg-[#182030] focus:outline-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter by Priority */}
          <div className="flex items-center gap-2 bg-[#141a27] px-3 py-1.5 rounded-xl border border-[#232e42]">
            <span className="text-slate-400 font-semibold">{t.priority} :</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-[#141a27] text-slate-200">{t.filter_priority}</option>
              <option value="URGENT" className="bg-[#141a27] text-rose-400">{t.p_urgent}</option>
              <option value="HIGH" className="bg-[#141a27] text-amber-400">{t.p_high}</option>
              <option value="MEDIUM" className="bg-[#141a27] text-cyan-400">{t.p_medium}</option>
              <option value="LOW" className="bg-[#141a27] text-slate-300">{t.p_low}</option>
            </select>
          </div>

          {/* Filter by Assignee */}
          <div className="flex items-center gap-2 bg-[#141a27] px-3 py-1.5 rounded-xl border border-[#232e42]">
            <User className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 font-semibold">{t.task_assignee} :</span>
            <select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer max-w-[170px] truncate"
            >
              <option value="ALL" className="bg-[#141a27] text-slate-200">{t.filter_assignee}</option>
              <option value="UNASSIGNED" className="bg-[#141a27] text-slate-400">({t.unassigned})</option>
              {members.map((m) => (
                <option key={m.user.id} value={m.user.id} className="bg-[#141a27] text-slate-200">
                  {m.user.firstName} {m.user.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side: Sorting Options & Reset */}
        <div className="flex items-center gap-3">
          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 bg-[#141a27] px-3 py-1.5 rounded-xl border border-[#232e42]">
            <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 font-semibold">{t.sort_by} :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-emerald-400 font-bold focus:outline-none cursor-pointer"
            >
              <option value="DEFAULT" className="bg-[#141a27] text-slate-200">{t.sort_default}</option>
              <option value="DUE_ASC" className="bg-[#141a27] text-slate-200">{t.sort_due_asc}</option>
              <option value="DUE_DESC" className="bg-[#141a27] text-slate-200">{t.sort_due_desc}</option>
              <option value="PRIORITY_DESC" className="bg-[#141a27] text-slate-200">{t.sort_priority_desc}</option>
              <option value="PRIORITY_ASC" className="bg-[#141a27] text-slate-200">{t.sort_priority_asc}</option>
              <option value="TITLE_ASC" className="bg-[#141a27] text-slate-200">{t.sort_title_asc}</option>
              <option value="TITLE_DESC" className="bg-[#141a27] text-slate-200">{t.sort_title_desc}</option>
            </select>
          </div>

          {/* Reset Filters Pill */}
          {isFilterActive && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 text-rose-400 border border-rose-800/60 hover:bg-rose-950/70 transition-all font-semibold"
              title={t.reset_filters}
            >
              <RefreshCw className="w-3 h-3" />
              <span>{t.reset}</span>
            </button>
          )}

          {/* Tasks Counter */}
          <span className="text-slate-400 font-medium ml-2">
            {visibleTasksCount} / {totalTasksCount} {t.tasks_count}
          </span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-[#26334a] bg-[#111827] p-7 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#232e42] pb-4 mb-5">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>{t.create_task_title}</span>
              </h3>
              <button 
                onClick={() => setIsTaskModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <Label htmlFor="taskTitle" className="text-slate-300 font-semibold">{t.task_title_label}</Label>
                <Input
                  id="taskTitle"
                  placeholder="e.g. Conception de l'architecture d'authentification"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  className="bg-[#172033] border-[#2b3a55] text-slate-100 rounded-xl py-2.5 focus:border-emerald-500 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="taskDesc" className="text-slate-300 font-semibold">{t.task_desc_label}</Label>
                <textarea
                  id="taskDesc"
                  rows={3}
                  placeholder="Description détaillée de la tâche ou consignes..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full rounded-xl border border-[#2b3a55] bg-[#172033] p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              {/* Assignee Selection */}
              <div className="space-y-1.5">
                <Label htmlFor="taskAssignee" className="text-slate-300 font-semibold">{t.task_assignee_label}</Label>
                <select
                  id="taskAssignee"
                  value={newTaskAssigneeId}
                  onChange={(e) => setNewTaskAssigneeId(e.target.value)}
                  className="w-full rounded-xl border border-[#2b3a55] bg-[#172033] p-2.5 text-xs text-slate-100 font-medium focus:border-emerald-500 focus:outline-none cursor-pointer"
                >
                  <option value="">-- {t.unassigned} --</option>
                  {members.map((m) => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.firstName} {m.user.lastName} ({m.user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="taskPriority" className="text-slate-300 font-semibold">{t.task_priority_label}</Label>
                  <select
                    id="taskPriority"
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(e.target.value)}
                    className="w-full rounded-xl border border-[#2b3a55] bg-[#172033] p-2.5 text-xs text-slate-100 font-bold focus:border-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="LOW">{t.p_low}</option>
                    <option value="MEDIUM">{t.p_medium}</option>
                    <option value="HIGH">{t.p_high}</option>
                    <option value="URGENT">{t.p_urgent}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="taskDueDate" className="text-slate-300 font-semibold">{t.task_due_label}</Label>
                  <Input
                    id="taskDueDate"
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    className="bg-[#172033] border-[#2b3a55] text-slate-100 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#232e42]">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsTaskModalOpen(false)}
                  className="rounded-xl border-[#2b3a55] bg-[#172033] hover:bg-[#1e293b] text-slate-300"
                >
                  {t.cancel}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmittingTask}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                >
                  {isSubmittingTask ? t.dispatching : t.dispatch_task}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modern Create Column Modal */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#26334a] bg-[#111827] p-7 shadow-2xl relative text-xs animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#232e42] pb-4 mb-5">
              <h3 className="text-base font-bold text-slate-100">
                {t.create_column_title}
              </h3>
              <button 
                onClick={() => setIsColumnModalOpen(false)} 
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-[#1e293b]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateColumn} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="colName" className="text-slate-300 font-semibold">{t.column_name_label}</Label>
                <Input
                  id="colName"
                  placeholder="e.g. En révision, Bloqué, Validé"
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  required
                  className="bg-[#172033] border-[#2b3a55] text-slate-100 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="colColor" className="text-slate-300 font-semibold">{t.column_color_label}</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    id="colColor"
                    value={newColumnColor}
                    onChange={(e) => setNewColumnColor(e.target.value)}
                    className="h-10 w-12 cursor-pointer rounded-xl border border-[#2b3a55] bg-transparent p-0"
                  />
                  <span className="text-xs text-slate-400 font-mono">{newColumnColor}</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#232e42]">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsColumnModalOpen(false)}
                  className="rounded-xl border-[#2b3a55] bg-[#172033] hover:bg-[#1e293b] text-slate-300"
                >
                  {t.cancel}
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmittingColumn}
                  className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md shadow-emerald-500/20"
                >
                  {isSubmittingColumn ? t.loading : t.add_column_btn}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
