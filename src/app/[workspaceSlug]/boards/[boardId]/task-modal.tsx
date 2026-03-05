"use client";

import { useState, useEffect, useRef } from "react";
import type { TaskData, LabelData } from "./task-card";
import { hexToRgba } from "./task-card";

const PRIORITIES = ["none", "low", "medium", "high", "urgent"] as const;

export default function TaskModal({
  task,
  apiBase,
  workspaceLabels,
  onClose,
  onUpdated,
  onDeleted,
}: {
  task: TaskData;
  apiBase: string;
  workspaceLabels: LabelData[];
  onClose: () => void;
  onUpdated: (updated: TaskData) => void;
  onDeleted: (taskId: string) => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [priority, setPriority] = useState(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate || "");
  const [taskLabels, setTaskLabels] = useState(
    task.labels.map((tl) => tl.label.id)
  );
  const [lastSaved, setLastSaved] = useState({
    title: task.title,
    description: task.description || "",
    priority: task.priority,
    dueDate: task.dueDate || "",
  });
  const [showSaved, setShowSaved] = useState(false);
  const savedTimerRef = useRef<NodeJS.Timeout | null>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  async function saveField(updates: Record<string, string | null>) {
    const res = await fetch(`${apiBase}/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    if (res.ok) {
      const { data } = await res.json();
      const updatedLabels = taskLabels
        .map((id) => {
          const label = workspaceLabels.find((l) => l.id === id);
          return label ? { label } : null;
        })
        .filter(Boolean) as Array<{ label: LabelData }>;
      onUpdated({ ...task, ...data, labels: updatedLabels });
      setLastSaved((prev) => ({ ...prev, ...updates }));
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      setShowSaved(true);
      savedTimerRef.current = setTimeout(() => setShowSaved(false), 1500);
    }
  }

  async function toggleLabel(labelId: string) {
    const isActive = taskLabels.includes(labelId);

    if (isActive) {
      setTaskLabels((prev) => prev.filter((id) => id !== labelId));
      await fetch(`${apiBase}/tasks/${task.id}/labels/${labelId}`, {
        method: "DELETE",
      });
    } else {
      setTaskLabels((prev) => [...prev, labelId]);
      await fetch(`${apiBase}/tasks/${task.id}/labels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labelId }),
      });
    }
  }

  async function handleDelete() {
    const res = await fetch(`${apiBase}/tasks/${task.id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      onDeleted(task.id);
    }
  }

  return (
    <div
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center bg-black/40 animate-fade-in"
    >
      <div className="h-[85vh] sm:h-auto w-full sm:mx-4 sm:max-w-lg rounded-t-xl sm:rounded-md bg-white p-4 sm:p-6 shadow-lg animate-modal-in overflow-y-auto">
        {/* Header: Saved indicator + close button */}
        <div className="mb-4 flex items-center justify-end gap-3">
          <span
            className={`text-xs text-[#A3A3A3] transition-opacity duration-300 ${
              showSaved ? "opacity-100" : "opacity-0"
            }`}
          >
            Saved
          </span>
          <button
            onClick={onClose}
            className="rounded p-1 text-[#A3A3A3] hover:bg-[#F0F0EF] hover:text-[#6B6B6B]"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={() => {
            if (title.trim() && title !== lastSaved.title) {
              saveField({ title });
            }
          }}
          placeholder="Untitled"
          className="mb-4 w-full border-0 bg-transparent px-0 text-lg font-semibold text-[#2D2D2D] placeholder:text-[#A3A3A3] focus:outline-none focus:ring-0"
        />

        {/* Property rows */}
        <div className="mb-4">
          {/* Priority */}
          <div className="flex items-center border-b border-[#EEEEED] py-2.5">
            <span className="w-24 shrink-0 text-sm text-[#A3A3A3]">
              Priority
            </span>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                saveField({ priority: e.target.value });
              }}
              className="w-full rounded-md border-0 bg-transparent px-2 py-1 text-sm text-[#2D2D2D] hover:bg-[#F8F8F7] focus:bg-[#F8F8F7] focus:outline-none focus:ring-0"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Owner */}
          {task.assignee && (
            <div className="flex items-center border-b border-[#EEEEED] py-2.5">
              <span className="w-24 shrink-0 text-sm text-[#A3A3A3]">
                Owner
              </span>
              <div className="flex items-center gap-2 px-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white"
                  style={{
                    backgroundColor: task.assignee.avatarColor || "#4F46E5",
                  }}
                >
                  {(task.assignee.name || "?")[0].toUpperCase()}
                </div>
                <span className="text-sm text-[#2D2D2D]">
                  {task.assignee.name || "Unknown"}
                </span>
              </div>
            </div>
          )}

          {/* Due date */}
          <div className="flex items-center border-b border-[#EEEEED] py-2.5">
            <span className="w-24 shrink-0 text-sm text-[#A3A3A3]">Due</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => {
                setDueDate(e.target.value);
                saveField({ dueDate: e.target.value || null });
              }}
              className="w-full rounded-md border-0 bg-transparent px-2 py-1 text-sm text-[#2D2D2D] hover:bg-[#F8F8F7] focus:bg-[#F8F8F7] focus:outline-none focus:ring-0"
            />
          </div>

          {/* Tags */}
          {workspaceLabels.length > 0 && (
            <div className="flex items-center border-b border-[#EEEEED] py-2.5">
              <span className="w-24 shrink-0 text-sm text-[#A3A3A3]">
                Tags
              </span>
              <div className="flex flex-wrap gap-1.5 px-2">
                {workspaceLabels.map((label) => {
                  const isActive = taskLabels.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium transition ${
                        isActive ? "" : "opacity-40 hover:opacity-70"
                      }`}
                      style={{
                        backgroundColor: hexToRgba(label.color, 0.15),
                        color: label.color,
                      }}
                    >
                      {label.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => {
            if (description !== lastSaved.description) {
              saveField({ description: description || null });
            }
          }}
          rows={4}
          placeholder="Add details..."
          className="mb-4 w-full resize-none rounded-md border-0 bg-transparent px-0 py-1.5 text-sm text-[#2D2D2D] placeholder:text-[#A3A3A3] focus:bg-[#F8F8F7] focus:outline-none focus:ring-0"
        />

        {/* Delete */}
        <button
          onClick={handleDelete}
          className="rounded px-2 py-1 text-sm text-[#EB5757] hover:bg-[#FBE9E9]"
        >
          Delete task
        </button>
      </div>
    </div>
  );
}
