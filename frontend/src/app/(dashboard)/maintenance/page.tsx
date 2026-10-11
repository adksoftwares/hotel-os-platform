"use client";

import { useState, useRef } from "react";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

interface MaintenanceIssue {
  id: string;
  roomNumber: string;
  issue: string;
  priority: Priority;
  status: Status;
}

const mockIssues: MaintenanceIssue[] = [
  { id: "1", roomNumber: "101", issue: "Leaking faucet", priority: "MEDIUM", status: "OPEN" },
  { id: "2", roomNumber: "205", issue: "AC not cooling", priority: "HIGH", status: "IN_PROGRESS" },
  { id: "3", roomNumber: "310", issue: "Broken TV remote", priority: "LOW", status: "OPEN" },
  { id: "4", roomNumber: "105", issue: "No hot water", priority: "CRITICAL", status: "RESOLVED" },
  { id: "5", roomNumber: "402", issue: "Light bulb burnt out", priority: "LOW", status: "CLOSED" },
];

export default function MaintenanceKanban() {
  const [issues, setIssues] = useState<MaintenanceIssue[]>(mockIssues);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<Status | null>(null);

  const columns: { title: string; status: Status; color: string }[] = [
    { title: "Open", status: "OPEN", color: "border-t-red-400" },
    { title: "In Progress", status: "IN_PROGRESS", color: "border-t-yellow-400" },
    { title: "Resolved", status: "RESOLVED", color: "border-t-blue-400" },
    { title: "Closed", status: "CLOSED", color: "border-t-green-400" },
  ];

  const moveIssue = (id: string, newStatus: Status) => {
    setIssues((prev) =>
      prev.map((issue) => (issue.id === id ? { ...issue, status: newStatus } : issue))
    );
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "LOW": return "bg-green-100 text-green-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "HIGH": return "bg-orange-100 text-orange-800";
      case "CRITICAL": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
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
    <div className="p-6 h-screen flex flex-col bg-gray-50">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Maintenance Issues</h1>
        <p className="text-sm text-slate-500">Drag cards between columns to update status</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => {
          const columnIssues = issues.filter((i) => i.status === column.status);
          const isOver = dragOver === column.status;
          return (
            <div
              key={column.status}
              onDragOver={(e) => handleDragOver(e, column.status)}
              onDrop={(e) => handleDrop(e, column.status)}
              className={`flex flex-col bg-gray-100 rounded-lg border-t-4 ${column.color} min-w-[300px] w-[300px] p-4 flex-shrink-0 transition-colors ${isOver ? "bg-blue-50 ring-2 ring-blue-300" : ""}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-700">{column.title}</h2>
                <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded-full font-medium">
                  {columnIssues.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto flex flex-col gap-3 min-h-[60px]">
                {columnIssues.length === 0 && (
                  <div className={`flex-1 border-2 border-dashed rounded-lg flex items-center justify-center text-sm text-gray-400 p-4 ${isOver ? "border-blue-400 text-blue-400" : "border-gray-300"}`}>
                    Drop here
                  </div>
                )}
                {columnIssues.map((issue) => (
                  <div
                    key={issue.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, issue.id)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white p-4 rounded-md shadow-sm border border-gray-200 flex flex-col gap-2 cursor-grab active:cursor-grabbing select-none transition-opacity ${draggingId === issue.id ? "opacity-40" : "opacity-100"}`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-gray-800">Room {issue.roomNumber}</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(issue.priority)}`}>
                        {issue.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{issue.issue}</p>

                    <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-2">
                      {columns.map(
                        (c) =>
                          c.status !== issue.status && (
                            <button
                              key={c.status}
                              onClick={() => moveIssue(issue.id, c.status)}
                              className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              → {c.title}
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
    </div>
  );
}
