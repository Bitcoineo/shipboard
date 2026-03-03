"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-blue-500",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

export interface LabelData {
  id: string;
  name: string;
  color: string;
  workspaceId: string;
}

export interface TaskData {
  id: string;
  columnId: string;
  boardId: string;
  title: string;
  description: string | null;
  assigneeId: string | null;
  priority: string;
  dueDate: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  assignee: {
    id: string;
    name: string | null;
    avatarColor: string | null;
  } | null;
  labels: Array<{ label: LabelData }>;
}

export default function TaskCard({
  task,
  onClick,
}: {
  task: TaskData;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { type: "task", task } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue =
    task.dueDate && new Date(task.dueDate) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`cursor-pointer rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md ${
        isDragging ? "opacity-50 shadow-lg" : ""
      }`}
    >
      {/* Label pills */}
      {task.labels.length > 0 && (
        <div className="mb-1.5 flex flex-wrap gap-1">
          {task.labels.map((tl) => (
            <span
              key={tl.label.id}
              className="inline-block rounded-full px-2 py-0.5 text-[10px] font-medium text-white"
              style={{ backgroundColor: tl.label.color }}
            >
              {tl.label.name}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-start gap-2">
        {task.priority !== "none" && (
          <span
            className={`mt-1 inline-block h-2 w-2 flex-shrink-0 rounded-full ${PRIORITY_COLORS[task.priority] || ""}`}
          />
        )}
        <span className="text-sm font-medium text-gray-900">{task.title}</span>
      </div>

      <div className="mt-2 flex items-center gap-2">
        {task.dueDate && (
          <span
            className={`text-xs ${isOverdue ? "font-medium text-red-600" : "text-gray-400"}`}
          >
            {new Date(task.dueDate).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </span>
        )}

        {task.assignee && (
          <div
            className="ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium text-white"
            style={{ backgroundColor: task.assignee.avatarColor || "#374151" }}
            title={task.assignee.name || ""}
          >
            {(task.assignee.name || "?")[0].toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
