import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./utils";

type AlertTone = "info" | "success" | "warning" | "danger";

const alertStyles: Record<AlertTone, string> = {
  info: "border-brand bg-brand-soft",
  success: "border-success bg-brand-soft",
  warning: "border-warning bg-warning-soft",
  danger: "border-danger bg-danger-soft",
};

export function Alert({
  title,
  children,
  tone = "info",
  className,
}: {
  title: string;
  children: ReactNode;
  tone?: AlertTone;
  className?: string;
}) {
  return (
    <div
      className={cn("rounded-lg border-l-4 p-4", alertStyles[tone], className)}
      role={tone === "danger" ? "alert" : "status"}
    >
      <p className="font-semibold text-foreground">{title}</p>
      <div className="mt-1 text-sm text-muted">{children}</div>
    </div>
  );
}

export function LiveNotification({
  children,
  urgent = false,
}: {
  children: ReactNode;
  urgent?: boolean;
}) {
  return (
    <div
      aria-atomic="true"
      className="rounded-lg border bg-surface p-4 shadow-card"
      role={urgent ? "alert" : "status"}
    >
      {children}
    </div>
  );
}

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden="true"
      className={cn("goustia-skeleton rounded-md bg-surface-muted", className)}
      {...props}
    />
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-dashed bg-surface p-8 text-center">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}

export function ErrorState({
  title = "Quelque chose n’a pas fonctionné",
  description,
  action,
}: {
  title?: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <section
      className="rounded-xl border border-danger bg-danger-soft p-6"
      role="alert"
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-muted">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}
