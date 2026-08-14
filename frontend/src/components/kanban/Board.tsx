"use client";

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Column, ColumnType } from './Column';
import { Task, TaskCard } from './TaskCard';
import { createPortal } from 'react-dom';

interface BoardProps {
  initialColumns: ColumnType[];
  onTaskMove: (taskId: string, targetColumnId: string, newPosition: number) => void;
  onColumnMove: (columnId: string, newPosition: number) => void;
  onTaskClick?: (taskId: string) => void;
  onAddTask?: (columnId: string) => void;
}

export function KanbanBoard({ initialColumns, onTaskMove, onColumnMove, onTaskClick, onAddTask }: BoardProps) {
  const [columns, setColumns] = useState<ColumnType[]>(initialColumns);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  // Sync internal state when filtered or sorted initialColumns change
  useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  const columnIds = columns.map((col) => col.id);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column);
      return;
    }
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
      return;
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';
    const isOverColumn = over.data.current?.type === 'Column';

    if (!isActiveTask) return;

    // Moving a Task over another Task
    if (isActiveTask && isOverTask) {
      setColumns((cols) => {
        const activeColumnIndex = cols.findIndex((col) => col.tasks.some((t) => t.id === activeId));
        const overColumnIndex = cols.findIndex((col) => col.tasks.some((t) => t.id === overId));

        if (activeColumnIndex === -1 || overColumnIndex === -1) return cols;

        const activeCol = cols[activeColumnIndex];
        const overCol = cols[overColumnIndex];

        const activeTaskIndex = activeCol.tasks.findIndex((t) => t.id === activeId);
        const overTaskIndex = overCol.tasks.findIndex((t) => t.id === overId);

        if (activeColumnIndex === overColumnIndex) {
          // Same column
          const newCols = [...cols];
          newCols[activeColumnIndex] = {
            ...activeCol,
            tasks: arrayMove(activeCol.tasks, activeTaskIndex, overTaskIndex),
          };
          return newCols;
        } else {
          // Different column
          const newCols = [...cols];
          const activeTaskItem = activeCol.tasks[activeTaskIndex];
          
          newCols[activeColumnIndex] = {
            ...activeCol,
            tasks: activeCol.tasks.filter((t) => t.id !== activeId),
          };
          
          const newOverTasks = [...overCol.tasks];
          newOverTasks.splice(overTaskIndex, 0, activeTaskItem);
          newCols[overColumnIndex] = {
            ...overCol,
            tasks: newOverTasks,
          };
          return newCols;
        }
      });
    }

    // Moving a Task over an empty Column
    if (isActiveTask && isOverColumn) {
      setColumns((cols) => {
        const activeColumnIndex = cols.findIndex((col) => col.tasks.some((t) => t.id === activeId));
        const overColumnIndex = cols.findIndex((col) => col.id === overId);
        
        if (activeColumnIndex === -1 || overColumnIndex === -1) return cols;

        const activeCol = cols[activeColumnIndex];
        const overCol = cols[overColumnIndex];
        
        if (activeColumnIndex === overColumnIndex) return cols;

        const activeTaskIndex = activeCol.tasks.findIndex((t) => t.id === activeId);
        const newCols = [...cols];
        const activeTaskItem = activeCol.tasks[activeTaskIndex];

        newCols[activeColumnIndex] = {
          ...activeCol,
          tasks: activeCol.tasks.filter((t) => t.id !== activeId),
        };
        
        newCols[overColumnIndex] = {
          ...overCol,
          tasks: [...overCol.tasks, activeTaskItem],
        };
        return newCols;
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;
    
    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    // Handle column move
    if (active.data.current?.type === 'Column') {
      setColumns((cols) => {
        const activeIndex = cols.findIndex((col) => col.id === activeId);
        const overIndex = cols.findIndex((col) => col.id === overId);
        const newCols = arrayMove(cols, activeIndex, overIndex);
        onColumnMove(activeId as string, overIndex);
        return newCols;
      });
      return;
    }

    // Notify backend about task move
    if (active.data.current?.type === 'Task') {
      const activeCol = columns.find(col => col.tasks.some(t => t.id === activeId));
      if (activeCol) {
        const newPosition = activeCol.tasks.findIndex(t => t.id === activeId);
        onTaskMove(activeId as string, activeCol.id, newPosition);
      }
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex h-full gap-6 overflow-x-auto p-6 custom-scrollbar items-start select-none">
        <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
          {columns.map((col) => (
            <Column 
              key={col.id} 
              column={col} 
              onAddTask={onAddTask}
              onTaskClick={onTaskClick}
            />
          ))}
        </SortableContext>
      </div>

      {mounted && createPortal(
        <DragOverlay>
          {activeColumn && <Column column={activeColumn} />}
          {activeTask && <TaskCard task={activeTask} />}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
