import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "./utils";

type FieldShellProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
};

function FieldShell({
  id,
  label,
  hint,
  error,
  required,
  children,
}: FieldShellProps) {
  return (
    <div className="grid gap-2">
      <label className="font-semibold text-foreground" htmlFor={id}>
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-danger">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-sm text-muted" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          className="text-sm font-medium text-danger"
          id={`${id}-error`}
          role="alert"
        >
          <span aria-hidden="true">Erreur : </span>
          {error}
        </p>
      ) : null}
    </div>
  );
}

const controlClassName =
  "min-h-12 w-full rounded-md border bg-surface px-3 py-2 text-foreground shadow-sm placeholder:text-muted hover:border-brand disabled:cursor-not-allowed disabled:bg-surface-muted disabled:opacity-70";

type TextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { id: providedId, label, hint, error, className, required, ...props },
    ref,
  ) {
    const generatedId = useId();
    const id = providedId ?? generatedId;
    const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

    return (
      <FieldShell
        error={error}
        hint={hint}
        id={id}
        label={label}
        required={required}
      >
        <input
          aria-describedby={describedBy}
          aria-invalid={error ? true : undefined}
          className={cn(controlClassName, className)}
          id={id}
          ref={ref}
          required={required}
          {...props}
        />
      </FieldShell>
    );
  },
);

type SelectFieldProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
};

export function SelectField({
  id: providedId,
  label,
  hint,
  error,
  className,
  required,
  children,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <FieldShell
      error={error}
      hint={hint}
      id={id}
      label={label}
      required={required}
    >
      <select
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        aria-invalid={error ? true : undefined}
        className={cn(controlClassName, className)}
        id={id}
        required={required}
        {...props}
      >
        {children}
      </select>
    </FieldShell>
  );
}

type TextareaFieldProps = Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  "id"
> & {
  id?: string;
  label: string;
  hint?: string;
  error?: string;
};

export function TextareaField({
  id: providedId,
  label,
  hint,
  error,
  className,
  required,
  ...props
}: TextareaFieldProps) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <FieldShell
      error={error}
      hint={hint}
      id={id}
      label={label}
      required={required}
    >
      <textarea
        aria-describedby={
          error ? `${id}-error` : hint ? `${id}-hint` : undefined
        }
        aria-invalid={error ? true : undefined}
        className={cn(controlClassName, "min-h-28", className)}
        id={id}
        required={required}
        {...props}
      />
    </FieldShell>
  );
}

type ChoiceProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "id" | "type"
> & {
  id?: string;
  label: string;
  description?: string;
};

function Choice({
  type,
  id: providedId,
  label,
  description,
  className,
  ...props
}: ChoiceProps & { type: "checkbox" | "radio" }) {
  const generatedId = useId();
  const id = providedId ?? generatedId;

  return (
    <div className="flex min-h-11 items-start gap-3">
      <input
        className={cn(
          "mt-1 size-5 shrink-0 accent-brand disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        id={id}
        type={type}
        {...props}
      />
      <div>
        <label className="font-medium text-foreground" htmlFor={id}>
          {label}
        </label>
        {description ? (
          <p className="text-sm text-muted">{description}</p>
        ) : null}
      </div>
    </div>
  );
}

export function Checkbox(props: ChoiceProps) {
  return <Choice type="checkbox" {...props} />;
}

export function Radio(props: ChoiceProps) {
  return <Choice type="radio" {...props} />;
}
