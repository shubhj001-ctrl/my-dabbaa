"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  children: React.ReactNode;
  pendingLabel: string;
  disabled?: boolean;
};

export function SubmitButton({
  children,
  pendingLabel,
  disabled = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending || disabled}
      className="auth-submit"
      aria-disabled={pending || disabled}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
