"use client";

import { useState, useEffect, useRef } from "react";
import type { TaskData, LabelData } from "./task-card";

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
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

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

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`${apiBase}/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || null,
        priority,
        dueDate: dueDate || null,
      }),
    });

    if (res.ok) {
      const { data } = await res.json();
      // Rebuild labels array for the updated task
      const updatedLabels = taskLabels
        .map((id) => {
          const label = workspaceLabels.find((l) => l.id === id);
          return label ? { label } : null;
        })
        .filter(Boolean) as Array<{ label: LabelData }>;

      onUpdated({ ...task, ...data, labels: updatedLabels });
    }
    setSaving(false);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
    >
      <div className="mx-4 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Task Details</h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Add a description..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
              />
            </div>
          </div>

          {/* Labels */}
          {workspaceLabels.length > 0 && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Labels
              </label>
              <div className="flex flex-wrap gap-2">
                {workspaceLabels.map((label) => {
                  const isActive = taskLabels.includes(label.id);
                  return (
                    <button
                      key={label.id}
                      type="button"
                      onClick={() => toggleLabel(label.id)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                        isActive
                          ? "text-white ring-2 ring-offset-1 ring-gray-400"
                          : "text-white opacity-40 hover:opacity-70"
                      }`}
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {task.assignee && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Assignee
              </label>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                <div
                  className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium text-white"
                  style={{
                    backgroundColor: task.assignee.avatarColor || "#374151",
                  }}
                >
                  {(task.assignee.name || "?")[0].toUpperCase()}
                </div>
                <span className="text-sm text-gray-700">
                  {task.assignee.name || "Unknown"}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <div>
            {confirmDelete ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-600">Are you sure?</span>
                <button
                  onClick={handleDelete}
                  className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                >
                  Yes, delete
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDelete(true)}
                className="rounded px-3 py-1.5 text-sm text-red-600 hover:bg-red-50"
              >
                Delete task
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
