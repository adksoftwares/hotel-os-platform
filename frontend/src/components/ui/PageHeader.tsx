"use client";
import React, { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: ReactNode;
  badge?: ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  action,
  badge,
}: PageHeaderProps) {
  return (
    <header className="hotel-page-header pb-4 mb-6 border-b border-slate-200/80">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 mb-2 font-medium">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-slate-800 hover:underline transition-colors">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-slate-800 font-semibold">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className="flex items-center gap-3">
          <h1 className="hotel-page-title">{title}</h1>
          {badge}
        </div>
        {description && <p className="hotel-page-description">{description}</p>}
      </div>
      {action && <div className="flex items-center gap-2.5 shrink-0">{action}</div>}
    </header>
  );
}
