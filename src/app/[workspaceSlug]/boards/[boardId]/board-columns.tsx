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
      className={`flex-1 px-3 pb-3 ${isOver ? "rounded bg-[#EFEFEF]" : ""}`}
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

  // ─── Drag-and-drop ──────────────────────────────────────────────────
  function findColumnByTaskId(taskId: string): string | null {
    for (const col of columnsData) {
      if (col.tasks.some((t) => t.id === taskId)) return col.id;
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
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
        <div className="flex flex-1 gap-4 overflow-x-auto pb-4">
          {columnsData.map((col) => (
            <div
              key={col.id}
              className="flex w-72 flex-shrink-0 flex-col"
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
                    className="w-full rounded border border-[#E8E5E0] px-2 py-0.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-[#2383E2]"
                  />
                ) : (
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#787774]">
                    {col.name}
                    <span className="ml-2 text-xs font-normal text-[#9B9A97]">
                      {col.tasks.length}
                    </span>
                  </h3>
                )}
                <div className="relative">
                  <button
                    onClick={() =>
                      setMenuOpenId(menuOpenId === col.id ? null : col.id)
                    }
                    className="rounded p-1 text-[#9B9A97] hover:bg-[#EFEFEF] hover:text-[#787774]"
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
                    <div className="absolute right-0 z-10 mt-1 w-36 rounded-md border border-[#E8E5E0] bg-white py-1 shadow-sm">
                      <button
                        onClick={() => startRename(col)}
                        className="w-full px-3 py-1.5 text-left text-sm text-[#37352F] hover:bg-[#F7F7F5]"
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
                        onClick={() => setSelectedTask(task)}
                      />
                    ))}
                  </div>
                </SortableContext>
                {col.tasks.length === 0 && !addingTaskColId && (
                  <p className="py-8 text-center text-xs text-[#9B9A97]">
                    Nothing here yet
                  </p>
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
                        className="w-full rounded border border-[#E8E5E0] px-2 py-1.5 text-sm focus:border-[#2383E2] focus:outline-none focus:ring-1 focus:ring-[#2383E2]"
                      />
                      <div className="mt-1.5 flex gap-2">
                        <button
                          onClick={() => handleAddTask(col.id)}
                          disabled={addTaskLoading || !newTaskTitle.trim()}
                          className="rounded bg-[#2383E2] px-3 py-1 text-sm font-medium text-white hover:bg-[#1B6EC2] disabled:opacity-50"
                        >
                          {addTaskLoading ? "Adding..." : "Add"}
                        </button>
                        <button
                          onClick={() => {
                            setAddingTaskColId(null);
                            setNewTaskTitle("");
                          }}
                          className="rounded px-3 py-1 text-sm text-[#787774] hover:bg-[#EFEFEF]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setAddingTaskColId(col.id);
                        setNewTaskTitle("");
                      }}
                      className="w-full rounded py-1.5 text-sm text-[#9B9A97] hover:bg-[#EFEFEF] hover:text-[#787774]"
                    >
                      + Task
                    </button>
                  )}
                </div>
              </DroppableColumn>
            </div>
          ))}

          {/* Add Column */}
          <div className="flex-shrink-0">
            {showAddColumn ? (
              <form
                onSubmit={handleAddColumn}
                className="w-72 rounded-md p-3"
              >
                <input
                  value={newColumnName}
                  onChange={(e) => setNewColumnName(e.target.value)}
                  placeholder="e.g. Review, Blocked"
                  autoFocus
                  required
                  className="w-full rounded border border-[#E8E5E0] px-3 py-1.5 text-sm focus:border-[#2383E2] focus:outline-none focus:ring-1 focus:ring-[#2383E2]"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={addLoading}
                    className="rounded bg-[#2383E2] px-3 py-1.5 text-sm font-medium text-white hover:bg-[#1B6EC2] disabled:opacity-50"
                  >
                    {addLoading ? "Adding..." : "Add"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddColumn(false);
                      setNewColumnName("");
                    }}
                    className="rounded px-3 py-1.5 text-sm text-[#787774] hover:bg-[#EFEFEF]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowAddColumn(true)}
                className="flex w-72 items-center gap-2 rounded-md border border-dashed border-[#E8E5E0] px-3 py-2.5 text-sm text-[#9B9A97] hover:border-[#37352F]/20 hover:text-[#787774]"
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
            <div className="w-64 rounded-md border border-[#2383E2]/30 bg-white p-3 shadow-md scale-[1.02]">
              <span className="text-sm font-medium text-[#37352F]">
                {activeTask.title}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
