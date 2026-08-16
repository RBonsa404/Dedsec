"use client";

import { useEffect, useState, useMemo } from "react";
import api from "@/lib/api";
import { Loader2, Calendar, AlertCircle, Search, Filter, CheckCircle2, List } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from "date-fns";
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
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
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
    LOW: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    URGENT: "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse",
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
    <div className="space-y-4 sm:space-y-6 w-full px-2 sm:px-4 md:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="font-mono text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-accent-primary flex items-center gap-2">
            &gt; /ops/my-tasks
          </h1>
          <p className="text-[10px] sm:text-xs md:text-sm text-text-secondary mt-1 font-mono">
            {lang === "fr"
              ? "TABLEAU DE BORD PERSONNEL DES MISSIONS ASSIGNÉES"
              : "PERSONAL DASHBOARD OF ASSIGNED MISSIONS"}
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-xs">
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 sm:p-2 rounded ${viewMode === "list" ? "bg-accent-primary/20 text-accent-primary" : "bg-bg-secondary text-text-secondary border border-border-color"}`}
          >
            <List className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`p-1.5 sm:p-2 rounded ${viewMode === "calendar" ? "bg-accent-primary/20 text-accent-primary" : "bg-bg-secondary text-text-secondary border border-border-color"}`}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
          <span className="px-2 sm:px-3 py-1 rounded bg-bg-secondary border border-border-color text-text-secondary">
            {filteredTasks.length} {t.tasks_count}
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 rounded-lg border border-border-color bg-bg-secondary p-2 sm:p-3 font-mono text-[10px] sm:text-xs">
        <div className="relative flex-1 min-w-[150px] sm:min-w-[200px] max-w-full sm:max-w-md w-full">
          <Search className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-text-muted absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.search_tasks}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 sm:pl-9 pr-2 sm:pr-3 py-1.5 rounded bg-bg-primary border border-border-color text-text-primary placeholder:text-text-muted focus:border-accent-primary focus:outline-none text-[10px] sm:text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-text-muted font-bold text-[9px] sm:text-xs hidden sm:inline">{t.priority}:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded bg-bg-primary border border-border-color px-2 sm:px-2.5 py-1.5 text-text-primary focus:border-accent-primary focus:outline-none text-[10px] sm:text-xs w-full sm:w-auto"
          >
            <option value="ALL">{t.filter_priority}</option>
            <option value="LOW">{t.p_low}</option>
            <option value="MEDIUM">{t.p_medium}</option>
            <option value="HIGH">{t.p_high}</option>
            <option value="URGENT">{t.p_urgent}</option>
          </select>
        </div>
      </div>

      {/* Tasks View */}
      {viewMode === "list" ? (
        <div className="rounded-lg border border-border-color bg-bg-secondary overflow-hidden font-mono text-[10px] sm:text-xs">
          {/* Desktop Table */}
          <div className="hidden sm:block">
            <table className="w-full text-left">
              <thead className="text-[10px] sm:text-[11px] text-text-secondary uppercase bg-bg-tertiary border-b border-border-color">
                <tr>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Tâche</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Projet</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Colonne Pipeline</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Niveau de Priorité</th>
                  <th className="px-4 sm:px-6 py-3 sm:py-4">Échéance</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 sm:px-6 py-8 sm:py-12 text-center text-text-muted">
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
                        <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-text-primary">
                          {task.title}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-text-secondary">
                          <span className="bg-bg-tertiary px-2 sm:px-2.5 py-0.5 sm:py-1 rounded border border-border-color text-[9px] sm:text-xs">
                            {task.column.board.project.name}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span className="text-text-muted font-mono text-[9px] sm:text-[11px]">
                            [{task.column.name}]
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <span
                            className={`px-2 sm:px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-bold uppercase ${
                              priorityColors[task.priority] || ""
                            }`}
                          >
                            {priorityLabels[task.priority] || task.priority}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          {task.dueDate ? (
                            <div
                              className={`flex items-center gap-1.5 font-bold ${
                                isOverdue ? "text-danger" : "text-text-secondary"
                              }`}
                            >
                              {isOverdue ? (
                                <AlertCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-danger" />
                              ) : (
                                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent-secondary" />
                              )}
                              <span className="text-[9px] sm:text-xs">{format(new Date(task.dueDate), "dd/MM/yyyy")}</span>
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

          {/* Mobile Card View */}
          <div className="sm:hidden space-y-2 p-2 sm:p-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-6 text-text-muted text-[10px]">
                {lang === "fr"
                  ? "Aucune tâche assignée correspondant aux critères."
                  : "No assigned tasks matching your criteria."}
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
                return (
                  <div
                    key={task.id}
                    className="rounded-lg border border-border-color bg-bg-tertiary p-3 cursor-pointer hover:bg-bg-primary/50 transition-colors"
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-text-primary text-[11px] sm:text-sm flex-1">{task.title}</h3>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-bold uppercase shrink-0 ${
                          priorityColors[task.priority] || ""
                        }`}
                      >
                        {priorityLabels[task.priority] || task.priority}
                      </span>
                    </div>
                    <div className="space-y-1.5 text-[9px] sm:text-xs">
                      <div className="flex items-center gap-1.5 text-text-secondary">
                        <span className="bg-bg-primary px-1.5 py-0.5 rounded border border-border-color text-[8px]">
                          {task.column.board.project.name}
                        </span>
                        <span className="text-text-muted font-mono text-[8px]">
                          [{task.column.name}]
                        </span>
                      </div>
                      {task.dueDate && (
                        <div
                          className={`flex items-center gap-1.5 font-bold ${
                            isOverdue ? "text-danger" : "text-text-secondary"
                          }`}
                        >
                          {isOverdue ? (
                            <AlertCircle className="w-3 h-3" />
                          ) : (
                            <Calendar className="w-3 h-3" />
                          )}
                          <span>{format(new Date(task.dueDate), "dd/MM/yyyy")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : (
        <CalendarView tasks={filteredTasks} onTaskClick={setSelectedTaskId} />
      )}

      <TaskModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={fetchTasks}
      />
    </div>
  );
}

// Calendar View Component
function CalendarView({ tasks, onTaskClick }: { tasks: Task[]; onTaskClick: (id: string) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { lang } = useLangStore();
  
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = startOfMonth(date);
    const lastDayOfMonth = endOfMonth(date);
    const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });
    
    const startDayOfWeek = getDay(firstDayOfMonth);
    
    return { daysInMonth, startDayOfWeek };
  };

  const { daysInMonth, startDayOfWeek } = getCalendarDays(currentDate);
  
  const getTasksForDay = (date: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = {
    fr: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  };

  const dayNames = {
    fr: ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"],
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  };

  const priorityColorsCalendar: Record<string, string> = {
    LOW: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    MEDIUM: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    URGENT: "bg-red-500/20 text-red-400 border-red-500/50",
  };

  return (
    <div className="rounded-lg border border-border-color bg-bg-secondary overflow-hidden font-mono text-[10px] sm:text-xs">
      {/* Calendar Header */}
      <div className="bg-bg-tertiary border-b border-border-color p-2 sm:p-3 md:p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <button 
              onClick={prevMonth} 
              className="p-1.5 sm:p-2 hover:bg-bg-primary rounded transition-colors text-text-primary hover:text-accent-primary"
              aria-label="Previous month"
            >
              ←
            </button>
            <button 
              onClick={goToToday}
              className="px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-bg-primary rounded transition-colors text-[9px] sm:text-xs text-text-secondary hover:text-text-primary"
            >
              {lang === "fr" ? "Aujourd'hui" : "Today"}
            </button>
            <button 
              onClick={nextMonth} 
              className="p-1.5 sm:p-2 hover:bg-bg-primary rounded transition-colors text-text-primary hover:text-accent-primary"
              aria-label="Next month"
            >
              →
            </button>
          </div>
          <h2 className="font-bold text-text-primary text-[10px] sm:text-xs md:text-sm text-center flex-1">
            {monthNames[lang === "fr" ? "fr" : "en"][currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <div className="w-20 sm:w-24 hidden sm:block"></div>
        </div>
      </div>

      <div className="p-2 sm:p-3 md:p-4">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1 mb-1 sm:mb-2">
          {dayNames[lang === "fr" ? "fr" : "en"].map((day) => (
            <div key={day} className="text-center text-text-muted font-bold text-[7px] sm:text-[9px] md:text-[10px] py-1 sm:py-1.5 md:py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
          {/* Empty cells for days before the first day of the month */}
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}

          {/* Days of the month */}
          {daysInMonth.map((date) => {
            const dayTasks = getTasksForDay(date);
            const isToday = new Date().toDateString() === date.toDateString();
            const dayNumber = date.getDate();
            
            return (
              <div
                key={date.toISOString()}
                className={`aspect-square rounded border border-border-color bg-bg-tertiary p-0.5 sm:p-1 md:p-1.5 hover:bg-bg-primary/50 transition-colors cursor-pointer relative group ${isToday ? 'border-accent-primary ring-1 ring-accent-primary/50' : ''}`}
              >
                <div className="text-center text-text-primary font-bold text-[8px] sm:text-[9px] md:text-[10px] mb-0.5 sm:mb-1">
                  {dayNumber}
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  {dayTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskClick(task.id);
                      }}
                      className={`text-[6px] sm:text-[7px] md:text-[8px] px-0.5 sm:px-1 py-0.5 rounded truncate border transition-all hover:scale-105 hover:shadow-lg ${priorityColorsCalendar[task.priority] || ''}`}
                      title={task.title}
                    >
                      {task.title}
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-[6px] sm:text-[7px] md:text-[8px] text-text-muted text-center font-bold">
                      +{dayTasks.length - 2}
                    </div>
                  )}
                </div>
                
                {/* Hover tooltip */}
                {dayTasks.length > 0 && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-bg-primary border border-border-color rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-max max-w-[200px]">
                    <div className="text-[8px] sm:text-[9px] text-text-primary">
                      {dayTasks.map(task => (
                        <div key={task.id} className="flex items-center gap-1 truncate">
                          <div className={`w-1.5 h-1.5 rounded-full ${priorityColorsCalendar[task.priority]?.split(' ')[0] || 'bg-gray-500'}`}></div>
                          <span>{task.title}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}