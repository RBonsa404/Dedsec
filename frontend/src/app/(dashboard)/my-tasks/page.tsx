"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { Loader2, Calendar, AlertCircle, Search, Filter, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { TaskModal } from "@/components/kanban/TaskModal";
import { useLangStore } from "@/stores/langStore";
import { translations } from "@/lib/i18n";

interface Task {
  id: string;
  title: string;
  priority: string;
  dueDate: string | null;
  column: {
    name: string;
    board: {
      name: string;
      project: { name: string };
    };
  };
}

export default function MyTasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const { lang } = useLangStore();
  const t = translations[lang] || translations.fr;

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks/my-tasks");
      setTasks(res.data);
    } catch (error) {
      console.error("Failed to fetch my tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const priorityColors: Record<string, string> = {
    LOW: "bg-bg-tertiary text-text-primary border-border-color",
    MEDIUM: "bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/50",
    HIGH: "bg-accent-warning/20 text-accent-warning border border-accent-warning/50",
    URGENT: "bg-danger/20 text-danger border border-danger/50 animate-pulse",
  };

  const priorityLabels: Record<string, string> = {
    LOW: t.p_low,
    MEDIUM: t.p_medium,
    HIGH: t.p_high,
    URGENT: t.p_urgent,
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        searchQuery === "" ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.column.board.project.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPriority = priorityFilter === "ALL" || task.priority === priorityFilter;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchQuery, priorityFilter]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-mono text-2xl font-bold tracking-tight text-accent-primary flex items-center gap-2">
            &gt; /ops/my-tasks
          </h1>
          <p className="text-sm text-text-secondary mt-1 font-mono">
            {lang === "fr"
              ? "TABLEAU DE BORD PERSONNEL DES MISSIONS ASSIGNÉES"
              : "PERSONAL DASHBOARD OF ASSIGNED MISSIONS"}
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="px-3 py-1 rounded bg-bg-secondary border border-border-color text-text-secondary">
            {filteredTasks.length} {t.tasks_count}
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-color bg-bg-secondary p-3 font-mono text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.search_tasks}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded bg-bg-primary border border-border-color text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-text-muted font-bold">{t.priority}:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded bg-bg-primary border border-border-color px-2.5 py-1.5 text-text-primary focus:border-accent-primary focus:outline-none"
          >
            <option value="ALL">{t.filter_priority}</option>
            <option value="LOW">{t.p_low}</option>
            <option value="MEDIUM">{t.p_medium}</option>
            <option value="HIGH">{t.p_high}</option>
            <option value="URGENT">{t.p_urgent}</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="rounded-lg border border-border-color bg-bg-secondary overflow-hidden font-mono text-xs">
        <table className="w-full text-left">
          <thead className="text-[11px] text-text-secondary uppercase bg-bg-tertiary border-b border-border-color">
            <tr>
              <th className="px-6 py-4">Tâche</th>
              <th className="px-6 py-4">Projet</th>
              <th className="px-6 py-4">Colonne Pipeline</th>
              <th className="px-6 py-4">Niveau de Priorité</th>
              <th className="px-6 py-4">Échéance</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-muted">
                  {lang === "fr"
                    ? "Aucune tâche assignée correspondant aux critères."
                    : "No assigned tasks matching your criteria."}
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <tr
                    key={task.id}
                    className="border-b border-border-color hover:bg-bg-tertiary/50 cursor-pointer transition-colors"
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <td className="px-6 py-4 font-bold text-text-primary">
                      {task.title}
                    </td>
                    <td className="px-6 py-4 text-text-secondary">
                      <span className="bg-bg-tertiary px-2.5 py-1 rounded border border-border-color">
                        {task.column.board.project.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-text-muted font-mono text-[11px]">
                        [{task.column.name}]
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          priorityColors[task.priority] || ""
                        }`}
                      >
                        {priorityLabels[task.priority] || task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {task.dueDate ? (
                        <div
                          className={`flex items-center gap-1.5 font-bold ${
                            isOverdue ? "text-danger" : "text-text-secondary"
                          }`}
                        >
                          {isOverdue ? (
                            <AlertCircle className="w-3.5 h-3.5 text-danger" />
                          ) : (
                            <Calendar className="w-3.5 h-3.5 text-accent-secondary" />
                          )}
                          <span>{format(new Date(task.dueDate), "dd/MM/yyyy")}</span>
                        </div>
                      ) : (
                        <span className="text-text-muted">-</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <TaskModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={fetchTasks}
      />
    </div>
  );
}
