"use client";

import React, { useMemo } from 'react';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';
import { Plus, MoreHorizontal } from 'lucide-react';
import { useLangStore } from '@/stores/langStore';
import { translations } from '@/lib/i18n';

export interface ColumnType {
  id: string;
  name: string;
  color?: string;
  tasks: Task[];
}

interface ColumnProps {
  column: ColumnType;
  onAddTask?: (columnId: string) => void;
  onTaskClick?: (taskId: string) => void;
}

export function Column({ column, onAddTask, onTaskClick }: ColumnProps) {
  const taskIds = useMemo(() => column.tasks.map((t) => t.id), [column.tasks]);
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
    id: column.id,
    data: { type: 'Column', column },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const accentColor = column.color || '#10b981';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex h-full w-[330px] shrink-0 flex-col rounded-2xl bg-[#0d131f] border border-[#1c2638] shadow-md transition-all select-none",
        isDragging && "opacity-40 ring-2 ring-emerald-500 shadow-2xl"
      )}
    >
      {/* Column Header */}
      <div 
        {...attributes}
        {...listeners}
        className="flex items-center justify-between px-4 py-3.5 cursor-grab active:cursor-grabbing border-b border-[#1c2638]"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div 
            className="w-3 h-3 rounded-full shrink-0 shadow-xs" 
            style={{ backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}80` }}
          />
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide truncate">
            {column.name}
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#182234] px-2.5 py-0.5 text-xs font-semibold text-slate-400 border border-[#233148]">
            {column.tasks.length}
          </span>
        </div>
      </div>

      {/* Task List Container */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto overflow-x-hidden p-3.5 custom-scrollbar min-h-[140px]">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onClick={() => onTaskClick?.(task.id)}
            />
          ))}
        </SortableContext>

        {column.tasks.length === 0 && (
          <div className="flex flex-1 items-center justify-center p-6 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">
            {lang === "fr" ? "Aucune tâche pour le moment" : "No tasks in this list"}
          </div>
        )}
      </div>

      {/* Add Task Quick Action */}
      <div className="p-3 pt-1 border-t border-[#182234]/60">
        <button
          onClick={() => onAddTask?.(column.id)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-700/80 py-2.5 px-3 text-xs font-semibold text-slate-300 transition-all hover:border-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 active:scale-[0.99]"
        >
          <Plus className="h-4 w-4" />
          <span>{lang === "fr" ? "Ajouter une carte" : "Add a card"}</span>
        </button>
      </div>
    </div>
  );
}
