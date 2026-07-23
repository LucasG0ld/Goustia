"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

import { Button } from "./button";
import { cn } from "./utils";

export function Modal({
  open,
  title,
  description,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      aria-describedby={description ? descriptionId : undefined}
      aria-labelledby={titleId}
      className="m-auto w-[min(32rem,calc(100%-2rem))] rounded-xl border bg-surface p-0 text-foreground shadow-overlay backdrop:bg-slate-950/45"
      onCancel={onClose}
      onClose={onClose}
      ref={dialogRef}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className="mt-2 text-muted" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          <Button
            aria-label="Fermer la fenêtre"
            onClick={onClose}
            size="sm"
            variant="ghost"
          >
            <span aria-hidden="true">×</span>
          </Button>
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </dialog>
  );
}

export function Panel({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      aria-label={title}
      className={cn("rounded-xl border bg-surface p-5 shadow-card", className)}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </aside>
  );
}
