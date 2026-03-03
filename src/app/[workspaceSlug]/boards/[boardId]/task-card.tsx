"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const PRIORITY_BORDER_COLORS: Record<string, string> = {
  low: "border-l-blue-500",
  medium: "border-l-yellow-500",
  high: "border-l-orange-500",
  urgent: "border-l-red-500",
};

const PRIORITY_BADGES: Record<string, { text: string; classes: string }> = {
  urgent: { text: "Urgent", classes: "bg-red-50 text-red-600" },
  high: { text: "High", classes: "bg-orange-50 text-orange-600" },
  medium: { text: "Medium", classes: "bg-yellow-50 text-yellow-600" },
  low: { text: "Low", classes: "bg-blue-50 text-blue-600" },
};

export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
  isSelected,
  onSelect,
}: {
  task: TaskData;
  onClick: () => void;
  isSelected?: boolean;
  onSelect?: (e: React.MouseEvent) => void;
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
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) {
          onSelect?.(e);
        } else {
          onClick();
        }
      }}
      className={`group relative cursor-pointer rounded-md border px-4 py-3 transition-all duration-150 ${
        isSelected
          ? "border-[#4F46E5] bg-[#EEF2FF] shadow-sm"
          : "border-transparent bg-white shadow-sm hover:bg-[#F8F8F7] hover:shadow-md hover:border-[#4F46E5]/20 hover:scale-[1.01] active:scale-[0.99] active:shadow-sm"
      } ${isDragging ? "shadow-md scale-[1.02]" : ""} ${
        task.priority !== "none" ? `border-l-2 ${PRIORITY_BORDER_COLORS[task.priority] || ""}` : ""
      }`}
    >
      {/* Selection checkbox */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.(e);
        }}
        className={`absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-2 transition-opacity ${
          isSelected
            ? "border-[#4F46E5] bg-[#4F46E5] opacity-100"
            : "border-[#D3D1CB] bg-white opacity-0 group-hover:opacity-100"
        }`}
      >
        {isSelected && (
          <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </div>

      {/* Priority badge */}
      {task.priority !== "none" && PRIORITY_BADGES[task.priority] && (
        <span className={`mb-1 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${PRIORITY_BADGES[task.priority].classes}`}>
          {PRIORITY_BADGES[task.priority].text}
        </span>
      )}

      {/* Title */}
      <span className="text-[15px] font-normal text-[#2D2D2D]">{task.title}</span>

      {/* Label pills */}
      {task.labels.length > 0 && (
        <div className="mt-1.5 flex flex-wrap items-center gap-1">
          {task.labels.slice(0, 3).map((tl) => (
            <span
              key={tl.label.id}
              className="rounded-full px-1.5 py-0.5 text-[11px] font-medium"
              style={{ backgroundColor: hexToRgba(tl.label.color, 0.15), color: tl.label.color }}
            >
              {tl.label.name}
            </span>
          ))}
          {task.labels.length > 3 && (
            <span className="rounded-full bg-[#F8F8F7] px-1.5 py-0.5 text-[11px] text-[#A3A3A3]">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom row: due date + assignee */}
      <div className="mt-2 flex items-center gap-2">
        {task.dueDate && (
          isOverdue ? (
            <span className="rounded-full bg-red-50 px-1.5 py-0.5 text-[11px] font-medium text-red-600">
              Overdue · {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          ) : (
            <span className="text-[13px] text-[#A3A3A3]">
              {new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
          )
        )}

        {task.assignee && (
          <div
            className="ml-auto flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: task.assignee.avatarColor || "#4F46E5" }}
            title={task.assignee.name || ""}
          >
            {(task.assignee.name || "?")[0].toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
