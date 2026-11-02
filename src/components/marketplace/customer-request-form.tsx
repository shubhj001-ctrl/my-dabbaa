"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { ArrowRight, X } from "lucide-react";
import { submitCustomerRequestAction } from "@/services/marketplace/request-actions";

export function CustomerRequestForm({
  kitchenId,
  kitchenName,
}: {
  kitchenId: string;
  kitchenName: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && dialog && !dialog.open) dialog.showModal();
  }, [isOpen]);

  function submit(formData: FormData) {
    setFieldErrors({});
    setMessage("");
    startTransition(async () => {
      const result = await submitCustomerRequestAction({
        kitchenId,
        preferredMeal: formData.get("preferredMeal"),
        preferredStartDate: formData.get("preferredStartDate"),
        message: formData.get("message"),
        consentGiven: formData.get("consentGiven") === "on",
      });
      if (!result.success) {
        setMessage(result.message);
        setFieldErrors(result.fieldErrors ?? {});
        return;
      }
      setMessage("Request sent! You can follow updates in My requests.");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="choose-primary mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-[#3a1c4a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        Choose this kitchen <ArrowRight aria-hidden="true" size={16} />
      </button>
      {isOpen ? (
        <dialog
          ref={dialogRef}
          aria-labelledby="request-form-title"
          className="request-modal"
          onCancel={(event) => {
            if (isPending) event.preventDefault();
          }}
          onClose={() => setIsOpen(false)}
          onClick={(event) => {
            if (event.target === event.currentTarget && !isPending) setIsOpen(false);
          }}
        >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="section-kicker">MAKE IT A REGULAR THING</p>
                <h2 id="request-form-title" className="mt-2 text-2xl font-black">
                  Say hey to {kitchenName}.
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  This sends an enquiry only. No payment or subscription is created.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close request form"
                onClick={() => setIsOpen(false)}
                className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-muted hover:bg-accent"
                disabled={isPending}
              >
                <X size={18} />
              </button>
            </div>
            {message.startsWith("Request sent!") ? (
              <div className="mt-6 rounded-2xl bg-[#e9f8c8] p-5" role="status">
                <p className="font-bold">{message}</p>
                <Link
                  href="/requests"
                  className="mt-3 inline-flex min-h-10 items-center gap-2 font-bold underline underline-offset-4"
                >
                  View my requests <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <form action={submit} className="mt-6 space-y-4">
                <label className="request-field">
                  <span>What are you hungry for?</span>
                  <select autoFocus name="preferredMeal" defaultValue="lunch" required>
                    <option value="breakfast">Breakfast</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="multiple">Multiple meals</option>
                  </select>
                </label>
                {fieldErrors.preferredMeal?.[0] ? (
                  <p className="request-form-error">{fieldErrors.preferredMeal[0]}</p>
                ) : null}
                <label className="request-field">
                  <span>When would you like to start?</span>
                  <input
                    name="preferredStartDate"
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    required
                  />
                </label>
                {fieldErrors.preferredStartDate?.[0] ? (
                  <p className="request-form-error">{fieldErrors.preferredStartDate[0]}</p>
                ) : null}
                <label className="request-field">
                  <span>A note for the kitchen <small>(optional)</small></span>
                  <textarea
                    name="message"
                    maxLength={1000}
                    rows={3}
                    placeholder="Dietary preferences, questions, or anything useful..."
                  />
                </label>
                <label className="request-consent">
                  <input name="consentGiven" type="checkbox" required />
                  <span>
                    I agree that my name and the details in this request can be shared
                    with this kitchen. My phone and email stay private unless I later
                    choose to share them after activation.
                  </span>
                </label>
                {fieldErrors.consentGiven?.[0] ? (
                  <p className="request-form-error">{fieldErrors.consentGiven[0]}</p>
                ) : null}
                {message ? (
                  <p className="request-form-error" role="alert">{message}</p>
                ) : null}
                <button
                  className="button-pop button-aubergine w-full justify-center"
                  disabled={isPending}
                  type="submit"
                >
                  {isPending ? "Sending your request..." : "Send kitchen request"}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
        </dialog>
      ) : null}
    </>
  );
}
