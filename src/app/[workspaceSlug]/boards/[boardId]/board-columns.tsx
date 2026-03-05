"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import TaskCard, { type TaskData, type LabelData } from "./task-card";
import TaskModal from "./task-modal";

interface Column {
  id: string;
  boardId: string;
  name: string;
  position: number;
  createdAt: string;
  tasks: TaskData[];
}

function DroppableColumn({
  column,
  children,
}: {
  column: Column;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: "column", columnId: column.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-1 flex-col px-3 pb-3 ${isOver ? "rounded bg-[#F0F0EF]" : ""}`}
      style={{ minHeight: 40 }}
    >
      {children}
    </div>
  );
}

export default function BoardColumns({
  initialColumns,
  boardId,
  workspaceSlug,
  workspaceLabels,
}: {
  initialColumns: Column[];
  boardId: string;
  workspaceSlug: string;
  workspaceLabels: LabelData[];
}) {
  const router = useRouter();
  const [columnsData, setColumnsData] = useState(initialColumns);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [addingTaskColId, setAddingTaskColId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [addTaskLoading, setAddTaskLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskData | null>(null);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const lastSelectedRef = useRef<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);
  const taskInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setColumnsData(initialColumns);
  }, [initialColumns]);

  useEffect(() => {
    if (editingId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingId]);

  useEffect(() => {
    if (addingTaskColId && taskInputRef.current) {
      taskInputRef.current.focus();
    }
  }, [addingTaskColId]);

  const apiBase = `/api/workspaces/${workspaceSlug}/boards/${boardId}`;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  // ─── Column operations ──────────────────────────────────────────────
  async function handleAddColumn(e: React.FormEvent) {
    e.preventDefault();
    setAddLoading(true);

    const res = await fetch(`${apiBase}/columns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newColumnName }),
    });

    if (res.ok) {
      setNewColumnName("");
      setShowAddColumn(false);
      router.refresh();
    }
    setAddLoading(false);
  }

  async function handleRename(columnId: string) {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }

    const res = await fetch(`${apiBase}/columns/${columnId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName }),
    });

    if (res.ok) {
      router.refresh();
    }
    setEditingId(null);
  }

  async function handleDeleteColumn(columnId: string) {
    const res = await fetch(`${apiBase}/columns/${columnId}`, {
      method: "DELETE",
    });

    if (res.ok) {
      router.refresh();
    }
  }

  function startRename(col: Column) {
    setEditingId(col.id);
    setEditName(col.name);
    setMenuOpenId(null);
  }

  // ─── Task operations ────────────────────────────────────────────────
  async function handleAddTask(columnId: string) {
    if (!newTaskTitle.trim()) return;
    setAddTaskLoading(true);

    const res = await fetch(`${apiBase}/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId, title: newTaskTitle }),
    });

    if (res.ok) {
      const { data: newTask } = await res.json();
      setColumnsData((prev) =>
        prev.map((col) =>
          col.id === columnId
            ? { ...col, tasks: [...col.tasks, { ...newTask, assignee: null, labels: [] }] }
            : col
        )
      );
      setNewTaskTitle("");
      setAddingTaskColId(null);
    }
    setAddTaskLoading(false);
  }

  function handleTaskUpdated(updated: TaskData) {
    setColumnsData((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.map((t) =>
          t.id === updated.id ? { ...t, ...updated } : t
        ),
      }))
    );
    setSelectedTask(null);
  }

  function handleTaskDeleted(taskId: string) {
    setColumnsData((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => t.id !== taskId),
      }))
    );
    setSelectedTask(null);
  }

  // ─── Multi-select & bulk delete ─────────────────────────────────────
  function handleSelect(task: TaskData, columnId: string, e: React.MouseEvent) {
    if (e.shiftKey && lastSelectedRef.current) {
      const col = columnsData.find((c) => c.id === columnId);
      if (col) {
        const taskIds = col.tasks.map((t) => t.id);
        const lastIdx = taskIds.indexOf(lastSelectedRef.current);
        const curIdx = taskIds.indexOf(task.id);
        if (lastIdx !== -1 && curIdx !== -1) {
          const [start, end] = [Math.min(lastIdx, curIdx), Math.max(lastIdx, curIdx)];
          const rangeIds = taskIds.slice(start, end + 1);
          setSelectedIds((prev) => {
            const next = new Set(prev);
            rangeIds.forEach((id) => next.add(id));
            return next;
          });
        }
      }
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(task.id)) next.delete(task.id);
        else next.add(task.id);
        return next;
      });
      lastSelectedRef.current = task.id;
    }
  }

  async function handleBulkDelete() {
    const idsToDelete = Array.from(selectedIds);
    setColumnsData((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => !selectedIds.has(t.id)),
      }))
    );
    setSelectedIds(new Set());
    const results = await Promise.all(
      idsToDelete.map((id) =>
        fetch(`${apiBase}/tasks/${id}`, { method: "DELETE" })
      )
    );
    if (results.some((r) => !r.ok)) router.refresh();
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (selectedIds.size === 0) return;
      if (e.key === "Escape") {
        setSelectedIds(new Set());
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        // Don't intercept when typing in an input/textarea
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA") return;
        e.preventDefault();
        handleBulkDelete();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIds]);

  // ─── Drag-and-drop ──────────────────────────────────────────────────
  function findColumnByTaskId(taskId: string): string | null {
    for (const col of columnsData) {
      if (col.tasks.some((t) => t.id === taskId)) return col.id;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    setSelectedIds(new Set());
    const task = event.active.data.current?.task as TaskData | undefined;
    if (task) setActiveTask(task);
  }

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const sourceColId = findColumnByTaskId(activeId);
      let targetColId: string | null = null;

      if (overId.startsWith("column-")) {
        targetColId = overId.replace("column-", "");
      } else {
        targetColId = findColumnByTaskId(overId);
      }

      if (!sourceColId || !targetColId || sourceColId === targetColId) return;

      setColumnsData((prev) => {
        const sourceCol = prev.find((c) => c.id === sourceColId);
        const targetCol = prev.find((c) => c.id === targetColId);
        if (!sourceCol || !targetCol) return prev;

        const task = sourceCol.tasks.find((t) => t.id === activeId);
        if (!task) return prev;

        return prev.map((col) => {
          if (col.id === sourceColId) {
            return { ...col, tasks: col.tasks.filter((t) => t.id !== activeId) };
          }
          if (col.id === targetColId) {
            const overIndex = col.tasks.findIndex((t) => t.id === overId);
            const newTasks = [...col.tasks];
            const insertIndex = overIndex >= 0 ? overIndex : newTasks.length;
            newTasks.splice(insertIndex, 0, { ...task, columnId: targetColId! });
            return { ...col, tasks: newTasks };
          }
          return col;
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnsData]
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const targetColId = overId.startsWith("column-")
      ? overId.replace("column-", "")
      : findColumnByTaskId(overId);

    if (!targetColId) return;

    // Reorder within column
    setColumnsData((prev) => {
      return prev.map((col) => {
        if (col.id !== targetColId) return col;

        const oldIndex = col.tasks.findIndex((t) => t.id === activeId);
        const newIndex = overId.startsWith("column-")
          ? col.tasks.length - 1
          : col.tasks.findIndex((t) => t.id === overId);

        if (oldIndex === -1 || oldIndex === newIndex) return col;

        const newTasks = [...col.tasks];
        const [moved] = newTasks.splice(oldIndex, 1);
        newTasks.splice(newIndex, 0, moved);
        return { ...col, tasks: newTasks };
      });
    });

    // Calculate new position
    const column = columnsData.find((c) => c.id === targetColId);
    if (!column) return;

    const taskIndex = (() => {
      const col = columnsData.find((c) => c.id === targetColId);
      if (!col) return -1;
      if (overId.startsWith("column-")) return col.tasks.length;
      const idx = col.tasks.findIndex((t) => t.id === overId);
      return idx >= 0 ? idx : col.tasks.length;
    })();

    const tasksInCol = column.tasks.filter((t) => t.id !== activeId);
    let newPosition: number;

    if (tasksInCol.length === 0) {
      newPosition = 1000;
    } else if (taskIndex === 0) {
      newPosition = Math.max(1, (tasksInCol[0]?.position ?? 1000) - 1000);
    } else if (taskIndex >= tasksInCol.length) {
      newPosition = (tasksInCol[tasksInCol.length - 1]?.position ?? 0) + 1000;
    } else {
      const before = tasksInCol[taskIndex - 1]?.position ?? 0;
      const after = tasksInCol[taskIndex]?.position ?? before + 2000;
      newPosition = Math.round((before + after) / 2);
    }

    await fetch(`${apiBase}/tasks/${activeId}/move`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columnId: targetColId, position: newPosition }),
    });
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div
          className="flex flex-1 gap-4 overflow-x-auto pb-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedIds(new Set());
          }}
        >
          {columnsData.map((col) => (
            <div
              key={col.id}
              className="group/col flex w-80 flex-shrink-0 flex-col"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between px-3 py-2.5">
                {editingId === col.id ? (
                  <input
                    ref={editInputRef}
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onBlur={() => handleRename(col.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRename(col.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="w-full rounded border border-[#EEEEED] px-2 py-0.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                  />
                ) : (
                  <h3 className="flex items-center text-[15px] font-medium text-[#6B6B6B]">
                    {col.name}
                    <span className="ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#EEEEED] px-1.5 text-[13px] text-[#A3A3A3]">
                      {col.tasks.length}
                    </span>
                  </h3>
                )}
                <div className="relative">
                  <button
                    onClick={() =>
                      setMenuOpenId(menuOpenId === col.id ? null : col.id)
                    }
                    title="Column options"
                    className="rounded p-1 text-[#A3A3A3] opacity-0 transition-all duration-150 group-hover/col:opacity-100 hover:bg-[#F0F0EF] hover:text-[#6B6B6B]"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0zm6 0a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </button>
                  {menuOpenId === col.id && (
                    <div className="absolute right-0 z-10 mt-1 w-36 rounded-md border border-[#EEEEED] bg-white py-1 shadow-sm">
                      <button
                        onClick={() => startRename(col)}
                        className="w-full px-3 py-1.5 text-left text-sm text-[#2D2D2D] hover:bg-[#F8F8F7]"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpenId(null);
                          handleDeleteColumn(col.id);
                        }}
                        className="w-full px-3 py-1.5 text-left text-sm text-[#EB5757] hover:bg-[#FBE9E9]"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Column Body — droppable + sortable tasks */}
              <DroppableColumn column={col}>
                <SortableContext
                  items={col.tasks.map((t) => t.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2">
                    {col.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        isSelected={selectedIds.has(task.id)}
                        onClick={() => {
                          setSelectedIds(new Set());
                          setSelectedTask(task);
                        }}
                        onSelect={(e) => handleSelect(task, col.id, e)}
                      />
                    ))}
                  </div>
                </SortableContext>
                {col.tasks.length === 0 && addingTaskColId !== col.id && (
                  <div className="flex flex-1 flex-col items-center justify-center py-8">
                    <button
                      onClick={() => { setAddingTaskColId(col.id); setNewTaskTitle(""); }}
                      title="Add task"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-[#EEEEED] text-[#A3A3A3] transition-all duration-150 hover:border-[#4F46E5] hover:text-[#4F46E5]"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                    <span className="mt-2 text-xs text-[#A3A3A3]">Add a task</span>
                  </div>
                )}
                {/* Add task */}
                <div className="pt-1">
                  {addingTaskColId === col.id ? (
                    <div>
                      <input
                        ref={taskInputRef}
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddTask(col.id);
                          if (e.key === "Escape") {
                            setAddingTaskColId(null);
                            setNewTaskTitle("");
                          }
                        }}
                        placeholder="What needs to be done?"
                        className="w-full rounded border border-[#EEEEED] px-2 py-1.5 text-sm focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                      />
                      <div className="mt-1.5 flex gap-2">
                        <button
                          onClick={() => handleAddTask(col.id)}
                          disabled={addTaskLoading || !newTaskTitle.trim()}
                          className="rounded bg-[#4F46E5] px-3 py-1 text-sm font-medium text-white transition-all duration-150 hover:bg-[#4338CA] hover:shadow-md active:scale-[0.97] disabled:opacity-50"
                        >
                          {addTaskLoading ? "Adding..." : "Add"}
                        </button>
                        <button
                          onClick={() => {
                            setAddingTaskColId(null);
                            setNewTaskTitle("");
                          }}
                          className="rounded px-3 py-1 text-sm text-[#6B6B6B] transition-all duration-150 hover:bg-[#F0F0EF] hover:shadow-sm active:scale-[0.97]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : col.tasks.length > 0 ? (
                    <button
                      onClick={() => {
                        setAddingTaskColId(col.id);
                        setNewTaskTitle("");
                      }}
                      className="w-full rounded py-1.5 text-sm text-[#A3A3A3] transition-all duration-150 hover:bg-[#F0F0EF] hover:text-[#6B6B6B] hover:border-l-2 hover:border-[#4F46E5]/40 hover:pl-2"
                    >
                      + Task
                    </button>
                  ) : null}
                </div>
              </DroppableColumn>
            </div>
          ))}

          {/* Add Column */}
          <div className="flex-shrink-0 self-start">
            {showAddColumn ? (
              <form
                onSubmit={handleAddColumn}
                className="w-80 rounded-md p-3"
              >
                <input
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="e.g. Review, Blocked"
                  autoFocus
                  required
                  className="w-full rounded border border-[#EEEEED] px-3 py-1.5 text-sm focus:border-[#4F46E5] focus:outline-none focus:ring-1 focus:ring-[#4F46E5]"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="rounded bg-[#4F46E5] px-3 py-1.5 text-sm font-medium text-white transition-all duration-150 hover:bg-[#4338CA] hover:shadow-md active:scale-[0.97] disabled:opacity-50"
                  >
                    {addLoading ? "Adding..." : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddColumn(false);
                      setNewColumnName("");
                    }}
                    className="rounded px-3 py-1.5 text-sm text-[#6B6B6B] transition-all duration-150 hover:bg-[#F0F0EF] hover:shadow-sm active:scale-[0.97]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddColumn(true)}
                title="Add column"
                className="flex w-80 items-center gap-2 rounded-md border border-dashed border-[#EEEEED] px-3 py-2.5 text-sm text-[#A3A3A3] transition-all duration-150 hover:border-solid hover:border-[#2D2D2D]/20 hover:bg-[#4F46E5]/5 hover:text-[#6B6B6B]"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                + Column
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-64 rounded-md border border-[#4F46E5]/30 bg-white p-3 shadow-md scale-[1.02]">
              <span className="text-sm font-medium text-[#2D2D2D]">
                {activeTask.title}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedIds.size > 0 && (
        <div className="animate-slide-up fixed bottom-6 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 z-40 flex items-center justify-center gap-3 rounded-lg border border-[#EEEEED] bg-white/95 backdrop-blur-sm px-4 py-2.5 shadow-lg">
          <span className="text-sm font-medium text-[#2D2D2D]">
            {selectedIds.size} task{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="rounded px-3 py-1.5 text-sm font-medium text-[#EB5757] transition-all duration-150 hover:bg-[#FBE9E9] active:scale-[0.97]"
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="rounded px-3 py-1.5 text-sm text-[#6B6B6B] transition-all duration-150 hover:bg-[#F0F0EF] active:scale-[0.97]"
          >
            Clear
          </button>
        </div>
      )}

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          apiBase={apiBase}
          workspaceLabels={workspaceLabels}
          onClose={() => setSelectedTask(null)}
          onUpdated={handleTaskUpdated}
          onDeleted={handleTaskDeleted}
        />
      )}
    </>
  );
}
