import type { ReactNode } from "react";

export function PageHeader({ eyebrow, title, description, actions }: { eyebrow?: string; title: string; description?: string; actions?: ReactNode }) {
  return <div className="page-header"><div>{eyebrow && <span className="eyebrow">{eyebrow}</span>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{actions && <div className="page-actions">{actions}</div>}</div>;
}

export function Panel({ title, subtitle, action, children, className = "" }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-header"><div><h2 className="panel-title">{title}</h2>{subtitle && <p className="panel-subtitle">{subtitle}</p>}</div>{action}</div>{children}</section>;
}

export function MetricCard({ label, value, note, icon, tone = "" }: { label: string; value: string | number; note?: string; icon?: ReactNode; tone?: string }) {
  return <div className="metric-card"><div className="metric-head"><span>{label}</span>{icon}</div><b className={`metric-value ${tone}`}>{value}</b>{note && <small className="metric-note">{note}</small>}</div>;
}

export function EmptyState({ title, description, icon }: { title: string; description: string; icon?: ReactNode }) {
  return <div className="empty-state">{icon && <span className="empty-state-icon">{icon}</span>}<b>{title}</b><p>{description}</p></div>;
}

export function ActionMessage({ message, error = false }: { message?: string; error?: boolean }) {
  if (!message) return null;
  return <div className={`notice ${error ? "notice-error" : ""}`} role={error ? "alert" : "status"}>{message}</div>;
}

export function SubmitButton({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <button className={`button button-primary ${className}`} type="submit">{children}</button>;
}

export function Badge({ children, tone = "" }: { children: ReactNode; tone?: string }) {
  return <span className={`badge ${tone ? `badge-${tone}` : ""}`}>{children}</span>;
}
