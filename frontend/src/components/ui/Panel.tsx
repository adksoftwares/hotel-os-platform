"use client";
import React, { ReactNode } from "react";

interface PanelProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function Panel({
  title,
  description,
  action,
  children,
  className = "",
  noPadding = false,
}: PanelProps) {
  return (
    <div className={`hotel-panel ${noPadding ? "p-0" : ""} ${className}`}>
      {(title || action || description) && (
        <div className={`pb-3 mb-4 border-b border-slate-100 ${noPadding ? "p-4 pb-3" : ""}`}>
          {(title || action) && (
            <div className="flex items-start justify-between gap-3">
              {title && <h2 className="hotel-panel-title mb-0 leading-snug">{title}</h2>}
              {action && <div className="shrink-0">{action}</div>}
            </div>
          )}
          {description && (
            <p className="text-xs text-slate-500 mt-1 leading-normal">{description}</p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}
