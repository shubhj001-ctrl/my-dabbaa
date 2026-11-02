"use client";

import Image from "next/image";
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, ImagePlus, LoaderCircle, X } from "lucide-react";
import { CHANDIGARH_SECTORS, CUISINE_OPTIONS, MEAL_CATEGORY_OPTIONS, OPERATING_DAY_OPTIONS } from "@/config/marketplace";
import {
  finalizeKitchenApplicationAction,
  saveKitchenDraftAction,
} from "@/services/marketplace/provider-actions";
import type { ProviderKitchenData } from "@/services/marketplace/provider-queries";

const steps = ["Kitchen basics", "Your food vibe", "Where you deliver"];
const MAX_PHOTOS = 6;
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const supportedTypes = ["image/jpeg", "image/png", "image/webp"];

function photoKey(file: File) {
  return `${file.name}:${file.size}:${file.lastModified}`;
}

function LocalPhotoPreview({ file }: { file: File }) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      if (typeof reader.result === "string") setUrl(reader.result);
    });
    reader.readAsDataURL(file);
    return () => reader.abort();
  }, [file]);
  return url ? <Image src={url} alt={`Selected kitchen image: ${file.name}`} fill unoptimized className="object-cover" /> : null;
}

function checkedValues(form: HTMLFormElement, name: string) {
  return Array.from(form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]:checked`))
    .map((input) => input.value);
}

function field(form: HTMLFormElement, name: string) {
  return new FormData(form).get(name)?.toString() ?? "";
}

export function KitchenOnboardingForm({
  initial,
}: {
  initial?: ProviderKitchenData | null;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("");
  const [busy, startTransition] = useTransition();
  const [uploading, setUploading] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [kitchenId, setKitchenId] = useState(initial?.kitchen.id ?? "");
  const [uploadedFiles, setUploadedFiles] = useState<
    { path: string; imageType: "kitchen" | "food"; displayOrder: number }[]
  >(
    (initial?.photos ?? []).map((photo) => ({
      path: photo.storage_path,
      imageType: photo.image_type,
      displayOrder: photo.display_order,
    })),
  );
  const [uploadedPhotoKeys, setUploadedPhotoKeys] = useState<string[]>([]);
  const [photoTypes, setPhotoTypes] = useState<Record<string, "kitchen" | "food">>({});
  const [serviceSectors, setServiceSectors] = useState<string[]>(
    initial?.serviceAreas.map((area) => area.sector) ?? [],
  );
  const kitchen = initial?.kitchen;

  function validateStep() {
    const form = formRef.current;
    const panel = form?.querySelector<HTMLElement>(`[data-step="${step}"]`);
    if (!form || !panel) return false;
    const invalid = Array.from(panel.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
      "input[required], select[required], textarea[required]",
    )).find((input) => !input.checkValidity());
    if (invalid) {
      invalid.reportValidity();
      invalid.focus();
      return false;
    }

    if (step === 1 && (!checkedValues(form, "cuisineTypes").length ||
      !checkedValues(form, "mealCategories").length ||
      !checkedValues(form, "operatingDays").length)) {
      setMessage("Pick at least one cuisine, meal, and operating day.");
      return false;
    }
    if (step === 2) {
      const currentPhotoCount = initial?.photos.length ?? 0;
      if (serviceSectors.length === 0) {
        setMessage("Choose at least one service sector.");
        return false;
      }
      if (currentPhotoCount + selectedFiles.length === 0) {
        setMessage("Add at least one kitchen or food photo.");
        return false;
      }
    }
    setMessage("");
    return true;
  }

  function nextStep() {
    if (validateStep()) setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function selectFiles(files: FileList | null) {
    if (!files) return;
    const additions = Array.from(files);
    const existingCount = initial?.photos.length ?? 0;
    if (existingCount + selectedFiles.length + additions.length > MAX_PHOTOS) {
      setMessage(`Choose up to ${MAX_PHOTOS} photos for your kitchen.`);
      return;
    }
    const invalid = additions.find((file) => !supportedTypes.includes(file.type) || file.size > MAX_PHOTO_BYTES || file.size < 1);
    if (invalid) {
      setMessage("Photos must be JPG, PNG, or WebP, and no larger than 4 MB each.");
      return;
    }
    setSelectedFiles((current) => [...current, ...additions]);
    setPhotoTypes((current) => ({
      ...current,
      ...Object.fromEntries(additions.map((file) => [photoKey(file), "food"])),
    }));
    setMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function removeFile(index: number) {
    setSelectedFiles((current) => current.filter((_, fileIndex) => fileIndex !== index));
  }

  function addServiceSector(value: string) {
    if (value && !serviceSectors.includes(value) && serviceSectors.length < 15) {
      setServiceSectors((current) => [...current, value]);
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validateStep()) return;
    const form = event.currentTarget;
    const payload = {
      id: kitchenId || undefined,
      kitchenName: field(form, "kitchenName"),
      contactName: field(form, "contactName"),
      description: field(form, "description"),
      contactPhone: field(form, "contactPhone"),
      contactEmail: field(form, "contactEmail"),
      address: field(form, "address"),
      sector: field(form, "sector"),
      pincode: field(form, "pincode"),
      cuisineTypes: checkedValues(form, "cuisineTypes"),
      foodType: field(form, "foodType"),
      preparationType: field(form, "preparationType"),
      mealCategories: checkedValues(form, "mealCategories"),
      avgDailyCapacity: field(form, "avgDailyCapacity"),
      operatingDays: checkedValues(form, "operatingDays"),
      openingTime: field(form, "openingTime"),
      closingTime: field(form, "closingTime"),
      serviceSectors,
    };

    startTransition(async () => {
      setMessage("");
      const draft = await saveKitchenDraftAction(payload);
      if (!draft.success) {
        setMessage(draft.message);
        return;
      }
      if (!draft.kitchenId) {
        setMessage("The kitchen draft was saved but could not be opened. Please try again.");
        return;
      }
      setKitchenId(draft.kitchenId);

      const uploaded = [...uploadedFiles];
      const alreadyUploaded = new Set(uploadedPhotoKeys);
      let uploadNumber = 0;
      for (const file of selectedFiles) {
        const key = photoKey(file);
        if (alreadyUploaded.has(key)) continue;
        uploadNumber += 1;
        setUploading(`Uploading photo ${uploadNumber}…`);
        const body = new FormData();
        body.set("file", file);
        const response = await fetch(`/api/provider/kitchens/${draft.kitchenId}/photos`, {
          method: "POST",
          body,
        });
        const result = await response.json() as { path?: string; error?: string };
        if (!response.ok || !result.path) {
          setUploading("");
          setMessage(result.error ?? "An image could not be uploaded. Your draft is saved; please try again.");
          return;
        }
        uploaded.push({
          path: result.path,
          imageType: photoTypes[key] ?? "food",
          displayOrder: uploaded.length,
        });
        alreadyUploaded.add(key);
        setUploadedPhotoKeys((current) => [...current, key]);
        setUploadedFiles([...uploaded]);
      }
      setUploading("");
      const finalized = await finalizeKitchenApplicationAction({
        kitchenId: draft.kitchenId,
        serviceSectors,
        photos: uploaded,
      });
      if (!finalized.success) {
        setMessage(finalized.message);
        return;
      }
      router.push("/provider/kitchen?submitted=1");
      router.refresh();
    });
  }

  const progress = ((step + 1) / steps.length) * 100;
  const isLocked = busy || Boolean(uploading);

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="space-y-6">
      <div className="onboarding-progress">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-extrabold">Step {step + 1} <span className="font-medium text-muted-foreground">of {steps.length}</span></p>
          <p className="text-xs font-bold uppercase tracking-wider text-[#694b7a]">{steps[step]}</p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eadff4]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Kitchen registration progress">
          <span className="block h-full rounded-full bg-[#c6ff3d] transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          {steps.map((label, index) => (
            <div key={label} className={`onboarding-step ${index <= step ? "onboarding-step-active" : ""}`}>
              <span>{index < step ? <Check size={13} /> : index + 1}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>
      </div>

      {initial?.kitchen.approval_status === "rejected" && initial.kitchen.rejection_reason ? (
        <div className="rounded-xl border border-[#ff5948]/40 bg-[#fff0ed] p-4 text-sm">
          <b>Admin feedback:</b> {initial.kitchen.rejection_reason}
          <p className="mt-1 text-xs">Update the listing and resubmit for review.</p>
        </div>
      ) : null}

      <fieldset data-step="0" hidden={step !== 0} className="onboarding-panel">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-field sm:col-span-2">Kitchen name
            <input name="kitchenName" required minLength={2} maxLength={100} defaultValue={kitchen?.kitchen_name ?? ""} placeholder="e.g. Amma's Kitchen" />
          </label>
          <label className="form-field">Owner / contact name
            <input name="contactName" required minLength={2} maxLength={100} defaultValue={kitchen?.contact_name ?? ""} placeholder="Name customers can ask for" />
          </label>
          <label className="form-field">Contact phone
            <input name="contactPhone" required type="tel" defaultValue={kitchen?.contact_phone ?? ""} placeholder="+91 98765 43210" />
          </label>
          <label className="form-field">Contact email
            <input name="contactEmail" required type="email" defaultValue={kitchen?.contact_email ?? ""} placeholder="kitchen@example.com" />
          </label>
          <label className="form-field">Chandigarh sector
            <select name="sector" required defaultValue={kitchen?.sector ?? ""}>
              <option value="" disabled>Select your sector</option>
              {CHANDIGARH_SECTORS.map((sector) => <option key={sector} value={`Sector ${sector}`}>Sector {sector}</option>)}
            </select>
          </label>
          <label className="form-field sm:col-span-2">Full kitchen address
            <textarea name="address" required minLength={5} maxLength={300} rows={2} defaultValue={kitchen?.address ?? ""} placeholder="House / shop number, road, sector" />
          </label>
          <label className="form-field">PIN code
            <input name="pincode" required inputMode="numeric" pattern="[0-9]{6}" maxLength={6} defaultValue={kitchen?.pincode ?? ""} placeholder="1600XX" />
          </label>
          <label className="form-field sm:col-span-2">Tell us about your kitchen
            <textarea name="description" required minLength={30} maxLength={2000} rows={4} defaultValue={kitchen?.description ?? ""} placeholder="What makes your food special? Share your story, ingredients, or cooking style." />
          </label>
        </div>
      </fieldset>

      <fieldset data-step="1" hidden={step !== 1} className="onboarding-panel space-y-6">
        <div>
          <legend className="form-legend">What do you cook?</legend>
          <div className="choice-grid mt-3">
            {CUISINE_OPTIONS.map((cuisine) => (
              <label className="choice-pill" key={cuisine}>
                <input type="checkbox" name="cuisineTypes" value={cuisine} defaultChecked={kitchen?.cuisine_types.includes(cuisine) ?? false} />
                <span>{cuisine}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="form-field">Food style
            <select name="foodType" defaultValue={kitchen?.food_type ?? "vegetarian"}>
              <option value="vegetarian">Vegetarian</option>
              <option value="non_vegetarian">Non-vegetarian</option>
              <option value="both">Both</option>
            </select>
          </label>
          <label className="form-field">Kitchen style
            <select name="preparationType" defaultValue={kitchen?.preparation_type ?? "homemade"}>
              <option value="homemade">Homemade</option>
              <option value="cloud_kitchen">Cloud kitchen</option>
              <option value="tiffin_service">Tiffin service</option>
            </select>
          </label>
          <label className="form-field">Meals you serve
            <span className="choice-grid mt-2">
              {MEAL_CATEGORY_OPTIONS.map((meal) => (
                <label className="choice-pill" key={meal}>
                  <input type="checkbox" name="mealCategories" value={meal} defaultChecked={kitchen?.meal_categories.includes(meal) ?? false} />
                  <span>{meal[0].toUpperCase() + meal.slice(1)}</span>
                </label>
              ))}
            </span>
          </label>
          <label className="form-field">Average meals per day
            <input name="avgDailyCapacity" required type="number" min={1} max={10000} defaultValue={kitchen?.avg_daily_capacity ?? 30} />
          </label>
          <div className="form-field sm:col-span-2">
            <span>Operating days</span>
            <div className="choice-grid mt-2">
              {OPERATING_DAY_OPTIONS.map((day) => (
                <label className="choice-pill" key={day}>
                  <input type="checkbox" name="operatingDays" value={day} defaultChecked={kitchen?.operating_days.includes(day) ?? ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"].includes(day)} />
                  <span>{day.slice(0, 3)}</span>
                </label>
              ))}
            </div>
          </div>
          <label className="form-field">Opens at
            <input name="openingTime" required type="time" defaultValue={kitchen?.opening_time.slice(0, 5) ?? "08:00"} />
          </label>
          <label className="form-field">Closes at
            <input name="closingTime" required type="time" defaultValue={kitchen?.closing_time.slice(0, 5) ?? "20:00"} />
          </label>
        </div>
      </fieldset>

      <fieldset data-step="2" hidden={step !== 2} className="onboarding-panel space-y-6">
        <div>
          <legend className="form-legend">Where can your dabbaa go?</legend>
          <p className="mt-1 text-sm text-muted-foreground">Choose every Chandigarh sector you can deliver to.</p>
          <div className="service-sector-list mt-4">
            {serviceSectors.map((sector) => (
              <span className="service-sector-chip" key={sector}>
                {sector}
                <button type="button" aria-label={`Remove ${sector}`} onClick={() => setServiceSectors((current) => current.filter((item) => item !== sector))}><X size={14} /></button>
              </span>
            ))}
            {!serviceSectors.length ? <span className="text-xs text-muted-foreground">No service areas selected yet.</span> : null}
          </div>
          <select aria-label="Add service sector" className="mt-3 w-full rounded-xl border border-border bg-white px-3 py-3 text-sm" value="" onChange={(event) => addServiceSector(event.target.value)}>
            <option value="">Add a Chandigarh sector…</option>
            {CHANDIGARH_SECTORS.map((sector) => (
              <option key={sector} disabled={serviceSectors.includes(`Sector ${sector}`)} value={`Sector ${sector}`}>Sector {sector}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <legend className="form-legend">Show us what&apos;s cooking</legend>
              <p className="mt-1 text-sm text-muted-foreground">JPG, PNG or WebP · up to 4 MB each · max 6 photos.</p>
            </div>
            <button type="button" className="upload-pick" onClick={() => fileInputRef.current?.click()}><ImagePlus size={16} /> Add photos</button>
          </div>
          <input ref={fileInputRef} className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={(event) => selectFiles(event.target.files)} />
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {initial?.photos.map((photo) => (
              <div className="photo-preview" key={photo.id}>
                {photo.signed_url ? <Image src={photo.signed_url} alt={`${photo.image_type} uploaded for ${kitchen?.kitchen_name}`} fill unoptimized className="object-cover" /> : <div className="photo-placeholder">Saved kitchen photo</div>}
                <span>{photo.image_type}</span>
              </div>
            ))}
            {selectedFiles.map((file, index) => (
              <div className="photo-preview" key={`${file.name}-${file.lastModified}`}>
                <LocalPhotoPreview file={file} />
                <select
                  aria-label={`Photo type for ${file.name}`}
                  value={photoTypes[photoKey(file)] ?? "food"}
                  onChange={(event) => setPhotoTypes((current) => ({
                    ...current,
                    [photoKey(file)]: event.target.value as "kitchen" | "food",
                  }))}
                >
                  <option value="food">Food</option>
                  <option value="kitchen">Kitchen</option>
                </select>
                <button type="button" aria-label={`Remove ${file.name}`} onClick={() => removeFile(index)}><X size={14} /></button>
              </div>
            ))}
            {!initial?.photos.length && !selectedFiles.length ? (
              <button type="button" className="photo-dropzone" onClick={() => fileInputRef.current?.click()}>
                <ImagePlus size={22} />
                <span>Drop the food pics here</span>
              </button>
            ) : null}
          </div>
        </div>
        <p className="rounded-xl bg-[#fff2c8] px-4 py-3 text-xs leading-5 text-[#51421e]">
          Listings are free. We&apos;ll review the kitchen before it appears publicly. Customers arrange meals and payments directly with you.
        </p>
      </fieldset>

      {uploading ? <p className="flex items-center gap-2 text-sm font-bold" role="status"><LoaderCircle className="animate-spin" size={16} />{uploading}</p> : null}
      {message ? <p className="rounded-xl border border-[#ff5948]/35 bg-[#fff0ed] px-4 py-3 text-sm text-[#7b2c25]" role="alert">{message}</p> : null}

      <div className="flex flex-col-reverse justify-between gap-3 border-t border-border pt-5 sm:flex-row">
        <button type="button" disabled={step === 0 || isLocked} onClick={() => { setMessage(""); setStep((current) => current - 1); }} className="form-secondary">
          <ArrowLeft size={16} /> Back
        </button>
        {step < steps.length - 1 ? (
          <button type="button" disabled={isLocked} onClick={nextStep} className="form-primary">
            Next step <ArrowRight size={16} />
          </button>
        ) : (
          <button type="submit" disabled={isLocked} className="form-primary">
            {isLocked ? <LoaderCircle className="animate-spin" size={17} /> : <Check size={17} />}
            {initial ? "Resubmit for review" : "Submit kitchen for review"}
          </button>
        )}
      </div>
    </form>
  );
}
