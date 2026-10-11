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
      {(title || action) && (
        <div className={`flex items-center justify-between gap-4 pb-3 mb-4 border-b border-slate-100 ${noPadding ? "p-4 pb-3" : ""}`}>
          <div>
            {title && <h2 className="hotel-panel-title mb-0">{title}</h2>}
            {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
