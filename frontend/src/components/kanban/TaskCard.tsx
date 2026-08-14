"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';
import { Calendar, MessageSquare, CheckSquare, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useLangStore } from '@/stores/langStore';
import { translations } from '@/lib/i18n';

export interface Task {
  id: string;
  title: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  labels: { id: string; name: string; color: string }[];
  dueDate?: string | null;
  assigneeId?: string | null;
  _count?: {
    comments: number;
    attachments: number;
    checklists: number;
  };
  checklists?: {
    id: string;
    items: { id: string; isCompleted: boolean }[];
  }[];
  assignee?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { lang } = useLangStore();
  const t = translations[lang] || translations.fr;

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: 'Task', task },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const priorityStyles: Record<string, { label: string; bg: string; text: string; border: string }> = {
    LOW: { label: t.p_low, bg: "bg-slate-800/80", text: "text-slate-300", border: "border-slate-700" },
    MEDIUM: { label: t.p_medium, bg: "bg-cyan-950/60", text: "text-cyan-400", border: "border-cyan-800/60" },
    HIGH: { label: t.p_high, bg: "bg-amber-950/60", text: "text-amber-400", border: "border-amber-800/60" },
    URGENT: { label: t.p_urgent, bg: "bg-rose-950/70", text: "text-rose-400", border: "border-rose-700" },
  };

  const currentPriority = priorityStyles[task.priority] || priorityStyles.MEDIUM;

  // Check checklist progress
  let totalChecklistItems = 0;
  let completedChecklistItems = 0;
  if (task.checklists && task.checklists.length > 0) {
    task.checklists.forEach((cl) => {
      if (cl.items) {
        totalChecklistItems += cl.items.length;
        completedChecklistItems += cl.items.filter((i) => i.isCompleted).length;
      }
    });
  }

  // Due date status
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();
  const isToday = task.dueDate && new Date(task.dueDate).toDateString() === new Date().toDateString();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        "group relative flex cursor-grab flex-col gap-3 rounded-xl border border-[#232e42] bg-[#151c2c] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-[#384c6c] hover:bg-[#1a2336] hover:shadow-lg active:cursor-grabbing select-none",
        isDragging && "opacity-40 ring-2 ring-emerald-500 shadow-2xl scale-[1.02]"
      )}
    >
      {/* Top Labels Row */}
      {task.labels && task.labels.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {task.labels.map((label) => (
            <span
              key={label.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider"
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

      {/* Card Title */}
      <h4 className="text-sm font-semibold text-slate-100 leading-snug group-hover:text-emerald-400 transition-colors">
        {task.title}
      </h4>

      {/* Meta Indicators Row */}
      <div className="flex items-center justify-between pt-1 border-t border-[#1f2a3e] text-xs">
        {/* Left indicators: Priority + Due date + Checklist / Comments */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Priority Pill */}
          <span
            className={cn(
              "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
              currentPriority.bg,
              currentPriority.text,
              currentPriority.border
            )}
          >
            {currentPriority.label}
          </span>

          {/* Due date */}
          {task.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border",
                isOverdue
                  ? "bg-rose-950/60 text-rose-400 border-rose-800 font-bold"
                  : isToday
                  ? "bg-amber-950/60 text-amber-400 border-amber-800"
                  : "bg-slate-800/80 text-slate-400 border-slate-700"
              )}
            >
              {isOverdue ? <AlertCircle className="w-3 h-3 text-rose-400" /> : <Clock className="w-3 h-3 text-slate-400" />}
              <span>{format(new Date(task.dueDate), 'd MMM', { locale: lang === 'fr' ? fr : undefined })}</span>
            </span>
          )}

          {/* Checklist Counter */}
          {totalChecklistItems > 0 && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded",
                completedChecklistItems === totalChecklistItems
                  ? "bg-emerald-950/50 text-emerald-400 font-bold"
                  : "text-slate-400"
              )}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>{completedChecklistItems}/{totalChecklistItems}</span>
            </span>
          )}

          {/* Comments count */}
          {(task._count?.comments ?? 0) > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{task._count?.comments}</span>
            </span>
          )}
        </div>

        {/* Right: Assignee Avatar */}
        {task.assignee ? (
          <div
            className="h-7 w-7 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 flex items-center justify-center border border-emerald-500/40 text-[11px] font-bold text-emerald-300 shadow-sm shrink-0"
            title={`${task.assignee.firstName} ${task.assignee.lastName}`}
          >
            {task.assignee.firstName[0]}{task.assignee.lastName[0]}
          </div>
        ) : (
          <div
            className="h-6 w-6 rounded-full border border-dashed border-slate-700 flex items-center justify-center text-[10px] text-slate-500 shrink-0"
            title={t.unassigned}
          >
            •
          </div>
        )}
      </div>
    </div>
  );
}
