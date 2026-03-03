"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PRIORITY_BORDER_COLORS: Record<string, string> = {
  low: "border-l-blue-500",
  medium: "border-l-yellow-500",
  high: "border-l-orange-500",
  urgent: "border-l-red-500",
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
      className={`cursor-pointer rounded-md border border-[#E8E5E0] bg-white p-2.5 transition-colors hover:bg-[#F7F7F5] ${
        isDragging ? "shadow-md scale-[1.02]" : ""
      } ${task.priority !== "none" ? `border-l-2 ${PRIORITY_BORDER_COLORS[task.priority] || ""}` : ""}`}
    >
      {task.labels.length > 0 && (
        <div className="mb-1.5 flex items-center gap-1">
          {task.labels.map((tl) => (
            <span
              key={tl.label.id}
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: tl.label.color }}
              title={tl.label.name}
            />
          ))}
        </div>
      )}

      <span className="text-sm font-normal text-[#37352F]">{task.title}</span>

      <div className="mt-2 flex items-center gap-2">
        {task.dueDate && (
          <span
            className={`text-xs ${isOverdue ? "font-medium text-[#EB5757]" : "text-[#9B9A97]"}`}
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
            style={{ backgroundColor: task.assignee.avatarColor || "#2383E2" }}
            title={task.assignee.name || ""}
          >
            {(task.assignee.name || "?")[0].toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
