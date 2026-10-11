"use client";

import { useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { Wrench, Plus, CheckCircle2, Clock, AlertTriangle, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

interface MaintenanceIssue {
  id: string;
  roomNumber: string;
  issue: string;
  priority: Priority;
  status: Status;
  reportedAt: string;
}

const mockIssues: MaintenanceIssue[] = [];

export default function MaintenanceKanban() {
  const { toast } = useToast();
  const [issues, setIssues] = useState<MaintenanceIssue[]>(mockIssues);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<Status | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newRoom, setNewRoom] = useState("");
  const [newIssue, setNewIssue] = useState("");
  const [newPriority, setNewPriority] = useState<Priority>("MEDIUM");

  const columns: { title: string; status: Status; color: string; badgeColor: string }[] = [
    { title: "Open Issues", status: "OPEN", color: "border-t-rose-500", badgeColor: "bg-rose-100 text-rose-800" },
    { title: "In Progress", status: "IN_PROGRESS", color: "border-t-amber-500", badgeColor: "bg-amber-100 text-amber-800" },
    { title: "Resolved / Testing", status: "RESOLVED", color: "border-t-blue-500", badgeColor: "bg-blue-100 text-blue-800" },
    { title: "Closed & Certified", status: "CLOSED", color: "border-t-emerald-600", badgeColor: "bg-emerald-100 text-emerald-800" },
  ];

  const moveIssue = (id: string, newStatus: Status) => {
    setIssues((prev) =>
      prev.map((issue) => (issue.id === id ? { ...issue, status: newStatus } : issue))
    );
    toast(`Work order #${id} moved to ${newStatus}.`, "info");
  };

  const handleCreateIssue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoom.trim() || !newIssue.trim()) {
      toast("Please enter both Room Number and Issue description.", "error");
      return;
    }
    const created: MaintenanceIssue = {
      id: Date.now().toString(),
      roomNumber: newRoom.trim(),
      issue: newIssue.trim(),
      priority: newPriority,
      status: "OPEN",
      reportedAt: "Just now",
    };
    setIssues([created, ...issues]);
    setIsAddModalOpen(false);
    setNewRoom("");
    setNewIssue("");
    setNewPriority("MEDIUM");
    toast(`Maintenance issue for Room ${created.roomNumber} logged.`, "success");
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case "LOW":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">Low</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">Medium</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-50 text-orange-800 border border-orange-200">High</span>;
      case "CRITICAL":
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200">Critical</span>;
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOver(status);
  };

  const handleDrop = (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    if (draggingId) {
      moveIssue(draggingId, status);
    }
    setDraggingId(null);
    setDragOver(null);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
    setDragOver(null);
  };

  return (
    <div className="hotel-page">
      <PageHeader
        title="Engineering & Maintenance Kanban"
        description="Track physical plant work orders, room repairs, and operational equipment certifications."
        action={
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="hotel-button hotel-button-emerald text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Report Work Order</span>
          </button>
        }
      />

      {/* Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6 items-start">
        {columns.map((column) => {
          const columnIssues = issues.filter((i) => i.status === column.status);
          const isOver = dragOver === column.status;
          return (
            <div
              key={column.status}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDrop={(e) => handleDrop(e, column.status)}
              className={`bg-slate-50/80 rounded-xl border border-slate-200 border-t-4 ${column.color} p-3.5 flex flex-col transition-all min-h-[480px] ${
                isOver ? "bg-blue-50/60 ring-2 ring-blue-300" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  {column.title}
                </h2>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${column.badgeColor}`}>
                  {columnIssues.length}
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-2.5">
                {columnIssues.length === 0 && (
                  <div className={`flex-1 border-2 border-dashed rounded-lg flex items-center justify-center text-xs text-slate-400 p-6 min-h-[120px] ${
                    isOver ? "border-blue-400 text-blue-500 bg-blue-50" : "border-slate-300"
                  }`}>
                    Drag cards here
                  </div>
                )}
                {columnIssues.map((issue) => (
                  <div
                    key={issue.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, issue.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white p-3.5 rounded-lg shadow-2xs border border-slate-200 hover:border-slate-300 hover:shadow-xs flex flex-col gap-2 cursor-grab active:cursor-grabbing select-none transition-all ${
                      draggingId === issue.id ? "opacity-30 scale-95" : "opacity-100"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                        <Wrench className="w-3.5 h-3.5 text-slate-500" />
                        <span>Room {issue.roomNumber}</span>
                      </div>
                      {getPriorityBadge(issue.priority)}
                    </div>
                    <p className="text-xs text-slate-700 leading-snug">{issue.issue}</p>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                      <span>{issue.reportedAt}</span>
                    </div>

                    {/* Accessible Status Move Buttons for keyboard / touch users */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {columns.map(
                        (c) =>
                          c.status !== issue.status && (
                            <button
                              key={c.status}
                              onClick={() => moveIssue(issue.id, c.status)}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                              → {c.title.split(" ")[0]}
                            </button>
                          )
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Report Maintenance Issue Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Report Engineering Work Order"
      >
        <form onSubmit={handleCreateIssue} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Room or Location *
            </label>
            <input
              type="text"
              placeholder="e.g. 204, Kitchen Cooler, Lobby Elevator"
              value={newRoom}
              onChange={(e) => setNewRoom(e.target.value)}
              className="hotel-input"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Issue Description *
            </label>
            <textarea
              rows={3}
              placeholder="Detailed description of defect, symptom, or equipment failure..."
              value={newIssue}
              onChange={(e) => setNewIssue(e.target.value)}
              className="hotel-input min-h-[72px]"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Priority Urgency
            </label>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value as Priority)}
              className="hotel-input"
            >
              <option value="LOW">Low (Cosmetic, non-disruptive)</option>
              <option value="MEDIUM">Medium (Serviceable during shift)</option>
              <option value="HIGH">High (Impacts guest stay)</option>
              <option value="CRITICAL">Critical (Immediate safety / Out of Order)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="hotel-button hotel-button-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="hotel-button hotel-button-emerald"
            >
              Submit Work Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
