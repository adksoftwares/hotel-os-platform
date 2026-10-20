"use client";
import React from "react";
import { 
  CheckCircle2, Clock, AlertCircle, Wrench, 
  Sparkles, Check, XCircle, ShieldAlert, Bed, UserCheck
} from "lucide-react";

export type UniversalStatus = 
  | "Available" | "Occupied" | "Reserved"
  | "Clean" | "Dirty" | "Cleaning" | "Inspected" | "Ready"
  | "Maintenance" | "Out of Order" | "Blocked"
  | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "CANCELLED" | "PENDING"
  | "NEW" | "PREPARING" | "READY" | "SERVED"
  | "PAID" | "UNPAID" | "PARTIAL" | "REFUNDED" | "VOIDED";

interface StatusBadgeProps {
  status: string | UniversalStatus;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "md", className = "" }: StatusBadgeProps) {
  const norm = (status || "").toUpperCase();

  let label = status;
  let colorClass = "hotel-status-neutral";
  let IconComponent = Clock;

  switch (norm) {
    // Rooms - Occupancy
    case "AVAILABLE":
    case "VACANT":
      label = "Available";
      colorClass = "hotel-status-available";
      IconComponent = CheckCircle2;
      break;
    case "OCCUPIED":
      label = "Occupied";
      colorClass = "hotel-status-occupied";
      IconComponent = Bed;
      break;
    case "RESERVED":
      label = "Reserved";
      colorClass = "bg-slate-100 text-slate-700 border border-slate-200";
      IconComponent = Clock;
      break;

    // Rooms - Housekeeping
    case "CLEAN":
      label = "Clean";
      colorClass = "hotel-status-available";
      IconComponent = CheckCircle2;
      break;
    case "READY":
      label = "Ready";
      colorClass = "hotel-status-inspected";
      IconComponent = Sparkles;
      break;
    case "INSPECTED":
      label = "Inspected";
      colorClass = "hotel-status-inspected";
      IconComponent = Check;
      break;
    case "DIRTY":
      label = "Dirty";
      colorClass = "hotel-status-dirty";
      IconComponent = AlertCircle;
      break;
    case "CLEANING":
      label = "Cleaning";
      colorClass = "hotel-status-cleaning";
      IconComponent = Clock;
      break;

    // Operational
    case "MAINTENANCE":
    case "OUT OF ORDER":
    case "OUT_OF_SERVICE":
      label = "Maintenance";
      colorClass = "hotel-status-maintenance";
      IconComponent = Wrench;
      break;
    case "IN SERVICE":
    case "AVAILABLE_OPS":
      label = "In Service";
      colorClass = "hotel-status-available";
      IconComponent = CheckCircle2;
      break;

    // Reservations
    case "CONFIRMED":
      label = "Confirmed";
      colorClass = "bg-blue-50 text-blue-700 border border-blue-200";
      IconComponent = CheckCircle2;
      break;
    case "CHECKED_IN":
      label = "In-House";
      colorClass = "hotel-status-occupied";
      IconComponent = UserCheck;
      break;
    case "CHECKED_OUT":
      label = "Departed";
      colorClass = "hotel-status-neutral";
      IconComponent = Check;
      break;
    case "CANCELLED":
    case "NO_SHOW":
      label = norm === "NO_SHOW" ? "No Show" : "Cancelled";
      colorClass = "bg-rose-50 text-rose-700 border border-rose-200";
      IconComponent = XCircle;
      break;

    // Payments
    case "PAID":
    case "SETTLED":
      label = "Paid";
      colorClass = "hotel-status-available";
      IconComponent = CheckCircle2;
      break;
    case "PARTIAL":
      label = "Partial";
      colorClass = "bg-amber-50 text-amber-700 border border-amber-200";
      IconComponent = Clock;
      break;
    case "UNPAID":
    case "DUE":
      label = "Balance Due";
      colorClass = "hotel-status-dirty";
      IconComponent = AlertCircle;
      break;

    default:
      label = status;
      colorClass = "hotel-status-neutral";
      IconComponent = Clock;
  }

  const sizeClasses = size === "sm" ? "text-[11px] px-1.5 py-0.5 gap-1" : "text-xs px-2 py-0.5 gap-1.5";

  return (
    <span 
      className={`hotel-status font-medium rounded inline-flex items-center ${colorClass} ${sizeClasses} ${className}`}
      title={`Status: ${label}`}
    >
      <IconComponent className={size === "sm" ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} />
      <span>{label}</span>
    </span>
  );
}
