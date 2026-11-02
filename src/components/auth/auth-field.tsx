type AuthFieldProps = {
  id: string;
  name: string;
  label: string;
  type?: "email" | "password" | "tel" | "text";
  autoComplete?: string;
  error?: string;
  hint?: string;
  required?: boolean;
};

export function AuthField({
  id,
  name,
  label,
  type = "text",
  autoComplete,
  error,
  hint,
  required = true,
}: AuthFieldProps) {
  const descriptionId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={descriptionId}
        className="auth-input"
      />
      {error ? (
        <p id={`${id}-error`} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs leading-5 text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function AuthFormMessage({
  message,
  success = false,
}: {
  message?: string;
  success?: boolean;
}) {
  if (!message) {
    return null;
  }

  return (
    <p
      className={`rounded-xl border px-4 py-3 text-sm leading-5 ${
        success
          ? "border-primary/20 bg-accent text-primary"
          : "border-destructive/20 bg-destructive/5 text-destructive"
      }`}
      role={success ? "status" : "alert"}
      aria-live="polite"
    >
      {message}
    </p>
  );
}
