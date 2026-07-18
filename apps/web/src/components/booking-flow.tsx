"use client";

import { ChangeEvent, DragEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Swal from "sweetalert2";

const steps = ["Details", "Medical info", "Review", "Payment"];
const countries = ["Uzbekistan", "South Korea", "China", "Japan", "United States", "Other"];
const languages = ["English", "中文 (Chinese)", "日本語 (Japanese)", "한국어 (Korean)", "O‘zbek tili"];
const flexibilityOptions = ["Exact date only", "± 3 days is fine", "± 1 week is fine", "My dates are flexible"];
const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type FormState = {
  email: string;
  phone: string;
  fullName: string;
  birthDate: string;
  country: string;
  language: string;
  allergies: string;
  flexibility: string;
  clinicNote: string;
  paymentMethod: "card" | "mobile";
  cardNumber: string;
  expiry: string;
  cvc: string;
};

type BookingDraft = {
  step?: number;
  procedure?: string;
  preferredDate?: string;
  form?: Partial<FormState>;
  documentName?: string;
  consent?: boolean;
};

const initialForm: FormState = {
  email: "",
  phone: "",
  fullName: "",
  birthDate: "",
  country: "",
  language: "",
  allergies: "",
  flexibility: "",
  clinicNote: "",
  paymentMethod: "card",
  cardNumber: "",
  expiry: "",
  cvc: "",
};

export function BookingFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clinicSlug = searchParams.get("clinic") || "seoul-line-clinic";
  const clinicName = searchParams.get("clinicName") || "Seoul Line Clinic";
  const draftKey = `medibridge-booking-draft:${clinicSlug}`;
  const [procedure, setProcedure] = useState(searchParams.get("procedure") || "");
  const [preferredDate, setPreferredDate] = useState(searchParams.get("date") || "");
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [documentName, setDocumentName] = useState("blood_test_2026.pdf");
  const [consent, setConsent] = useState(false);
  const [draftLoaded, setDraftLoaded] = useState(false);

  useEffect(() => {
    let draft: BookingDraft | null = null;
    try {
      const savedDraft = sessionStorage.getItem(draftKey);
      if (savedDraft) draft = JSON.parse(savedDraft) as BookingDraft;
    } catch {
      sessionStorage.removeItem(draftKey);
    }

    const restoreFrame = window.requestAnimationFrame(() => {
      if (draft) {
        if (typeof draft.procedure === "string") setProcedure(draft.procedure);
        if (typeof draft.preferredDate === "string") setPreferredDate(draft.preferredDate);
        if (draft.form) setForm((current) => ({ ...current, ...draft.form }));
        if (typeof draft.documentName === "string") setDocumentName(draft.documentName);
        if (typeof draft.consent === "boolean") setConsent(draft.consent);
        if (typeof draft.step === "number" && draft.step >= 1 && draft.step <= 4) setStep(draft.step);
      }
      setDraftLoaded(true);
    });

    return () => window.cancelAnimationFrame(restoreFrame);
  }, [draftKey]);

  useEffect(() => {
    if (!draftLoaded) return;
    const draft: BookingDraft = { step, procedure, preferredDate, form, documentName, consent };
    sessionStorage.setItem(draftKey, JSON.stringify(draft));
  }, [consent, documentName, draftKey, draftLoaded, form, preferredDate, procedure, step]);

  const updateForm = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const showValidation = (text: string) => Swal.fire({
    icon: "warning",
    title: "Please complete this step",
    text,
    confirmButtonColor: "#125453",
  });

  const continueFlow = async () => {
    if (step === 1) {
      const missingFields = [
        !procedure.trim() && "procedure",
        !preferredDate && "preferred date",
        !form.flexibility && "date flexibility",
      ].filter(Boolean);
      if (missingFields.length > 0) {
        await showValidation(`Please complete: ${missingFields.join(", ")}.`);
        return;
      }
    }
    if (step === 2) {
      const missingFields = [
        !form.fullName.trim() && "full name",
        !form.birthDate && "date of birth",
        !form.country && "country",
        !form.language && "preferred language",
      ].filter(Boolean);
      if (missingFields.length > 0) {
        await showValidation(`Please complete: ${missingFields.join(", ")}.`);
        return;
      }
    }
    if (step === 3 && !consent) {
      await showValidation("Confirm that the booking information is correct.");
      return;
    }
    if (step === 4) {
      if (form.paymentMethod === "card" && (!form.cardNumber.trim() || !form.expiry.trim() || !form.cvc.trim())) {
        await showValidation("Enter your card number, expiry date, and CVC.");
        return;
      }
      await Swal.fire({
        icon: "success",
        title: "Booking confirmed",
        text: "Your payment is protected in escrow. The clinic will contact you shortly.",
        confirmButtonText: "View clinic",
        confirmButtonColor: "#125453",
      });
      sessionStorage.removeItem(draftKey);
      router.push(`/clinics/${clinicSlug}`);
      return;
    }
    setStep((current) => Math.min(4, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectDocument = async (file?: File) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      await Swal.fire({ icon: "error", title: "File is too large", text: "Maximum file size is 10MB.", confirmButtonColor: "#125453" });
      return;
    }
    setDocumentName(file.name);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    void selectDocument(event.dataTransfer.files[0]);
  };

  return (
    <div className="min-h-screen bg-white">
      <BookingStepper currentStep={step} onStepClick={(nextStep) => nextStep < step && setStep(nextStep)} />

      <main className="mx-auto grid w-full max-w-[1720px] gap-9 px-5 py-8 sm:px-8 sm:py-11 lg:grid-cols-[minmax(0,1fr)_450px] lg:gap-x-10 lg:gap-y-6 xl:grid-cols-[minmax(0,1fr)_480px] xl:px-10">
        <section className="min-w-0">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep((current) => Math.max(1, current - 1))}
              className="mb-6 inline-flex min-h-11 items-center rounded-full border border-brand-line bg-white px-5 text-sm font-semibold text-brand-teal-700 transition hover:border-brand-teal-500 hover:bg-brand-teal-100"
            >
              ← Back to previous step
            </button>
          )}

          {step === 1 && (
            <StepSection title="Booking details" subtitle="Confirm the procedure and let the clinic know when you'd like to visit.">
              <FormCard title="🩺 Procedure">
                <BookingField label="Selected procedure">
                  <div className={`${inputClass} flex items-center justify-between gap-4`}>
                    <span className={procedure ? "font-medium" : "text-brand-muted/70"}>{procedure || "Select a procedure"}</span>
                    {procedure && <span className="shrink-0 text-brand-muted">from {getProcedurePrice(procedure)}</span>}
                  </div>
                </BookingField>
                <p className="mt-2 text-xs leading-5 text-brand-muted">Carried over from Seoul Line Clinic&apos;s profile — change it below if needed.</p>
                <div className="mt-5">
                  <p className="mb-3 text-xs font-semibold text-brand-muted">Other procedures at this clinic</p>
                  <div className="flex flex-wrap gap-2">
                    {["Rhinoplasty", "Double Eyelid", "V-line Contour"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setProcedure(option)}
                        className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${procedure === option ? "border-brand-teal-700 bg-brand-teal-100 text-brand-teal-900" : "border-brand-line bg-white text-brand-muted hover:border-brand-teal-500 hover:text-brand-teal-900"}`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </FormCard>
              <FormCard title="📅 Preferred date">
                <div className="grid gap-4 sm:grid-cols-2">
                  <BookingDatePicker value={preferredDate} onChange={setPreferredDate} />
                  <BookingFlexibilityPicker value={form.flexibility} onChange={(value) => updateForm("flexibility", value)} />
                </div>
                <div className="mt-5">
                  <BookingField label="Note to clinic (optional)">
                    <textarea value={form.clinicNote} onChange={(event) => updateForm("clinicNote", event.target.value)} placeholder="e.g. I'd prefer a female coordinator, arriving from Shanghai on Aug 10..." rows={3} className={`${inputClass} resize-none`} />
                  </BookingField>
                </div>
              </FormCard>
            </StepSection>
          )}

          {step === 2 && (
            <StepSection title="Your medical information" subtitle="Shared securely with the clinic only. Encrypted and never public.">
              <FormCard title="👤 Patient details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <BookingField label="Full name"><input value={form.fullName} onChange={(event) => updateForm("fullName", event.target.value)} placeholder="Your legal name" className={inputClass} /></BookingField>
                  <BookingDatePicker label="Date of birth" value={form.birthDate} onChange={(value) => updateForm("birthDate", value)} defaultMonth={new Date(1994, 2, 1)} />
                  <BookingSelectPicker label="Country" value={form.country} options={countries} placeholder="Select country" onChange={(value) => updateForm("country", value)} />
                  <BookingSelectPicker label="Preferred language" value={form.language} options={languages} placeholder="Select language" onChange={(value) => updateForm("language", value)} />
                </div>
              </FormCard>

              <FormCard title="🩺 Medical history & documents">
                <BookingField label="Any allergies or conditions?"><textarea value={form.allergies} onChange={(event) => updateForm("allergies", event.target.value)} placeholder="e.g. penicillin allergy, none..." rows={3} className={`${inputClass} resize-y`} /></BookingField>
                <div className="mt-4"><BookingField label="Upload documents (optional)">
                  <label onDragOver={(event) => event.preventDefault()} onDrop={handleDrop} className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-brand-line px-5 py-8 text-center text-sm text-brand-muted transition hover:border-brand-teal-500 hover:bg-brand-cream/60">
                    <span className="text-3xl">📄</span><span className="mt-2 font-semibold">Drop lab reports or previous records here</span><small className="mt-1">PDF, JPG · max 10MB</small>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(event: ChangeEvent<HTMLInputElement>) => void selectDocument(event.target.files?.[0])} />
                  </label>
                  {documentName && <div className="mt-3 flex items-center gap-2 rounded-lg bg-brand-teal-100 px-4 py-3 text-sm font-semibold text-brand-teal-900">📎 <span className="truncate">{documentName}</span><button type="button" onClick={() => setDocumentName("")} className="ml-auto text-brand-muted hover:text-brand-ink" aria-label="Remove document">✕</button></div>}
                </BookingField></div>
              </FormCard>
            </StepSection>
          )}

          {step === 3 && (
            <StepSection title="Review your booking" subtitle="Check every detail before continuing to secure payment.">
              <FormCard title="✓ Booking summary"><ReviewRow label="Clinic" value={clinicName} /><ReviewRow label="Procedure" value={procedure} /><ReviewRow label="Preferred date" value={formatDate(preferredDate)} /><ReviewRow label="Contact" value={`${form.email} · ${form.phone}`} /></FormCard>
              <FormCard title="👤 Patient & medical information"><ReviewRow label="Full name" value={form.fullName} /><ReviewRow label="Date of birth" value={formatDate(form.birthDate)} /><ReviewRow label="Country" value={form.country} /><ReviewRow label="Language" value={form.language} /><ReviewRow label="Allergies / conditions" value={form.allergies || "None provided"} /><ReviewRow label="Document" value={documentName || "No document uploaded"} /></FormCard>
              <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-line bg-brand-cream/55 p-4 text-sm leading-6 text-brand-muted"><input type="checkbox" checked={consent} onChange={(event) => setConsent(event.target.checked)} className="mt-1 h-5 w-5 accent-brand-teal-700" /><span>I confirm that the information above is accurate and can be shared securely with {clinicName}.</span></label>
            </StepSection>
          )}

          {step === 4 && (
            <StepSection title="Secure payment" subtitle="Your money stays protected in escrow until treatment is complete.">
              <PaymentMethod active={form.paymentMethod === "card"} icon="💳" title="Credit / Debit card" description="Visa, Mastercard, UnionPay, JCB" onClick={() => updateForm("paymentMethod", "card")} />
              {form.paymentMethod === "card" && <div className="mt-3 rounded-xl border border-brand-line p-5"><BookingField label="Card number"><input value={form.cardNumber} onChange={(event) => updateForm("cardNumber", formatCardNumber(event.target.value))} placeholder="1234 5678 9012 3456" inputMode="numeric" maxLength={19} className={inputClass} /></BookingField><div className="mt-4 grid grid-cols-2 gap-4"><BookingField label="Expiry"><input value={form.expiry} onChange={(event) => updateForm("expiry", event.target.value)} placeholder="MM / YY" maxLength={7} className={inputClass} /></BookingField><BookingField label="CVC"><input value={form.cvc} onChange={(event) => updateForm("cvc", event.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="•••" inputMode="numeric" className={inputClass} /></BookingField></div></div>}
              <div className="mt-3"><PaymentMethod active={form.paymentMethod === "mobile"} icon="📱" title="Alipay / WeChat Pay" description="Popular for patients from China" onClick={() => updateForm("paymentMethod", "mobile")} /></div>
              <EscrowTimeline />
            </StepSection>
          )}

        </section>

        <BookingSummary clinicSlug={clinicSlug} clinicName={clinicName} procedure={procedure} preferredDate={preferredDate} step={step} onContinue={() => void continueFlow()} />
      </main>
    </div>
  );
}

function BookingStepper({ currentStep, onStepClick }: { currentStep: number; onStepClick: (step: number) => void }) {
  return (
    <nav className="border-b border-brand-line bg-brand-cream px-4 py-8" aria-label="Booking progress">
      <div className="mx-auto flex max-w-5xl items-center justify-center">
        {steps.map((label, index) => {
          const number = index + 1;
          const done = number < currentStep;
          const active = number === currentStep;
          return (
            <div key={label} className="contents">
              {index > 0 && <span className={`mx-2 h-0.5 w-6 sm:mx-4 sm:w-12 lg:mx-6 lg:w-20 ${number <= currentStep ? "bg-emerald-500" : "bg-brand-line"}`} />}
              <button type="button" onClick={() => onStepClick(number)} disabled={number >= currentStep} className="flex shrink-0 items-center gap-3">
                <span className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-bold ${done ? "bg-transparent" : active ? "bg-brand-teal-700 text-white" : "bg-brand-line text-brand-muted"}`}>
                  {done ? <Image src="/icon/check.png" alt="Completed" width={40} height={40} className="h-10 w-10 object-contain" /> : number}
                </span>
                <span className={`hidden text-base font-semibold md:inline lg:text-lg ${done || active ? "text-brand-ink" : "text-brand-muted"}`}>{label}</span>
              </button>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

function StepSection({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) { return <div className="booking-step-transition"><h1 className="font-serif text-3xl font-semibold text-brand-teal-900 sm:text-4xl">{title}</h1><p className="mt-2 text-sm text-brand-muted sm:text-base">{subtitle}</p><div className="mt-7">{children}</div></div>; }
function FormCard({ title, children }: { title: string; children: ReactNode }) { return <section className="mb-6 rounded-2xl border border-brand-line bg-white p-6 sm:p-8"><h2 className="mb-6 text-base font-bold text-brand-ink">{title}</h2>{children}</section>; }
function BookingField({ label, children }: { label: string; children: ReactNode }) { return <label className="block"><span className="mb-2 block text-xs font-semibold text-brand-muted">{label}</span>{children}</label>; }
function ReviewRow({ label, value }: { label: string; value: string }) { return <div className="flex flex-col gap-1 border-b border-brand-line py-3 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:justify-between"><span className="text-sm text-brand-muted">{label}</span><b className="text-sm text-brand-ink sm:text-right">{value}</b></div>; }

function BookingDatePicker({ label = "Date", value, onChange, defaultMonth }: { label?: string; value: string; onChange: (value: string) => void; defaultMonth?: Date }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => dateFromInput(value) ?? defaultMonth ?? new Date());

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const firstWeekDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const selectDay = (day: number) => {
    onChange(toInputDate(year, month, day));
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative z-30">
      <span className="mb-2 block text-xs font-semibold text-brand-muted">{label}</span>
      <button type="button" onClick={() => setOpen((current) => !current)} aria-haspopup="dialog" aria-expanded={open} className={`${inputClass} flex items-center justify-between text-left`}>
        <span className={value ? "font-medium" : "text-brand-muted/70"}>{value ? formatDate(value) : "Select a date"}</span>
        <span className={`text-base text-brand-teal-700 transition-transform duration-300 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      <div role="dialog" aria-label={`Choose ${label.toLowerCase()}`} aria-hidden={!open} className={`absolute left-0 right-0 top-[calc(100%+8px)] origin-top rounded-xl border border-brand-line bg-white p-4 shadow-2xl shadow-brand-teal-900/15 transition-[opacity,transform] duration-300 ease-out ${open ? "pointer-events-auto translate-y-0 scale-y-100 opacity-100" : "pointer-events-none -translate-y-2 scale-y-95 opacity-0"}`}>
        <div className="mb-4 flex items-center justify-between">
          <button type="button" onClick={() => setCalendarMonth(new Date(year, month - 1, 1))} className="flex h-9 w-9 items-center justify-center rounded-full text-brand-teal-700 transition hover:bg-brand-teal-100" aria-label="Previous month">←</button>
          <strong className="text-sm text-brand-ink">{calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</strong>
          <button type="button" onClick={() => setCalendarMonth(new Date(year, month + 1, 1))} className="flex h-9 w-9 items-center justify-center rounded-full text-brand-teal-700 transition hover:bg-brand-teal-100" aria-label="Next month">→</button>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {weekDays.map((day) => <span key={day} className="py-1 text-[11px] font-bold text-brand-muted">{day}</span>)}
          {Array.from({ length: 42 }, (_, index) => {
            const day = index - firstWeekDay + 1;
            if (day < 1 || day > daysInMonth) return <span key={`empty-${index}`} className="h-9" />;
            const dateValue = toInputDate(year, month, day);
            const selected = dateValue === value;
            return <button key={dateValue} type="button" onClick={() => selectDay(day)} className={`flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition ${selected ? "bg-brand-teal-700 text-white" : "text-brand-ink hover:bg-brand-teal-100"}`}>{day}</button>;
          })}
        </div>
      </div>
    </div>
  );
}

function BookingFlexibilityPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return <BookingSelectPicker label="Flexibility" value={value} options={flexibilityOptions} placeholder="Select flexibility" onChange={onChange} />;
}

function BookingSelectPicker({ label, value, options, placeholder, onChange }: { label: string; value: string; options: string[]; placeholder: string; onChange: (value: string) => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  return (
    <div ref={rootRef} className="relative z-20">
      <span className="mb-2 block text-xs font-semibold text-brand-muted">{label}</span>
      <button type="button" onClick={() => setOpen((current) => !current)} aria-haspopup="listbox" aria-expanded={open} className={`${inputClass} flex items-center justify-between text-left`}>
        <span className={value ? "font-medium" : "text-brand-muted/70"}>{value || placeholder}</span>
        <span className={`text-base text-brand-teal-700 transition-transform duration-300 ${open ? "rotate-180" : ""}`}>▾</span>
      </button>

      <div role="listbox" aria-label={`Choose ${label.toLowerCase()}`} aria-hidden={!open} className={`absolute left-0 right-0 top-[calc(100%+8px)] origin-top rounded-xl border border-brand-line bg-white p-2 shadow-2xl shadow-brand-teal-900/15 transition-[opacity,transform] duration-300 ease-out ${open ? "pointer-events-auto translate-y-0 scale-y-100 opacity-100" : "pointer-events-none -translate-y-2 scale-y-95 opacity-0"}`}>
        {options.map((option) => (
          <button key={option} type="button" role="option" aria-selected={value === option} onClick={() => { onChange(option); setOpen(false); }} className={`flex min-h-11 w-full items-center rounded-lg px-3 text-left text-sm font-medium transition ${value === option ? "bg-brand-teal-100 text-brand-teal-900" : "text-brand-ink hover:bg-brand-cream"}`}>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function PaymentMethod({ active, icon, title, description, onClick }: { active: boolean; icon: string; title: string; description: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left ${active ? "border-brand-teal-700" : "border-brand-line"}`}><span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${active ? "border-brand-teal-700" : "border-brand-line"}`}>{active && <span className="h-2.5 w-2.5 rounded-full bg-brand-teal-700" />}</span><span><b className="block text-sm text-brand-ink">{title}</b><small className="text-brand-muted">{description}</small></span><span className="ml-auto text-2xl">{icon}</span></button>;
}

function BookingSummary({ clinicSlug, clinicName, procedure, preferredDate, step, onContinue }: { clinicSlug: string; clinicName: string; procedure: string; preferredDate: string; step: number; onContinue: () => void }) {
  const buttonLabel = step === 1 ? "Continue to medical info →" : step === 2 ? "Continue to review →" : step === 3 ? "Continue to payment →" : "🔒 Pay $2,520 securely";
  return (
    <aside className="order-first lg:order-none">
      <div className="sticky top-6 flex min-h-[620px] flex-col overflow-hidden rounded-2xl border border-brand-line bg-white shadow-2xl shadow-brand-teal-900/10">
        <div className="flex items-center gap-4 border-b border-brand-line p-7">
          <span className="h-16 w-16 shrink-0 rounded-xl bg-linear-to-br from-brand-teal-500 to-brand-teal-900" />
          <div>
            <h2 className="text-lg font-bold text-brand-ink">{clinicName}</h2>
            <p className="mt-1.5 text-sm text-brand-muted">📍 Gangnam-gu · ✦ Top Rated</p>
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-5 p-7 text-base">
            <SummaryRow label="Procedure" value={procedure || "Not selected"} />
            <SummaryRow label="Preferred date" value={formatDate(preferredDate)} />
            <div className="flex justify-between gap-4 text-brand-muted">
              <span>Est. price</span>
              <em className="text-right text-sm font-semibold text-brand-muted">shown after clinic confirms</em>
            </div>
          </div>
        ) : (
          <div className="space-y-4 p-7 text-base">
            <SummaryRow label="Procedure" value={procedure || "Not selected"} />
            <SummaryRow label="Preferred date" value={formatDate(preferredDate)} />
            <SummaryRow label="Est. recovery" value="7 days" />
            <SummaryRow label="Procedure fee" value="$2,400" />
            <SummaryRow label="Platform fee" value="$120" />
            <div className="flex items-end justify-between border-t border-brand-line pt-5">
              <b>Total</b>
              <strong className="font-serif text-3xl text-brand-teal-900">$2,520</strong>
            </div>
          </div>
        )}

        <button type="button" onClick={onContinue} className="mx-7 mb-3 mt-auto min-h-15 w-[calc(100%-3.5rem)] rounded-xl bg-brand-teal-700 px-6 text-base font-bold text-white transition hover:bg-brand-teal-900">
          {buttonLabel}
        </button>
        <Link href={`/clinics/${clinicSlug}`} className="mx-7 mb-5 flex min-h-13 w-[calc(100%-3.5rem)] items-center justify-center rounded-xl border border-brand-line bg-white px-6 text-sm font-bold text-brand-teal-700 transition hover:border-brand-teal-500 hover:bg-brand-teal-100">
          ← Cancel booking
        </Link>

        {step === 1 ? (
          <div className="mx-7 mb-7 flex gap-2 border-t border-brand-line pt-5 text-sm leading-6 text-brand-muted">ℹ️ <span>Exact pricing is confirmed by the clinic based on your procedure details — you won&apos;t be charged at this step.</span></div>
        ) : (
          <div className="mx-7 mb-7 flex gap-2 rounded-xl bg-brand-teal-100 p-5 text-sm leading-6 text-brand-teal-900">🛡 <span>Your payment is held in secure escrow and released only after treatment is confirmed.</span></div>
        )}
      </div>
    </aside>
  );
}
function SummaryRow({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4 text-brand-muted"><span>{label}</span><b className="text-right text-brand-ink">{value}</b></div>; }

function EscrowTimeline() {
  const items = [{ icon: "✓", title: "You pay MediBridge", detail: "Funds are charged securely" }, { icon: "2", title: "Money held in escrow", detail: "Clinic does not receive it yet" }, { icon: "3", title: "You get treated in Korea", detail: "Confirm your procedure is complete" }, { icon: "4", title: "Payment released to clinic", detail: "Only after your confirmation" }];
  return <section className="mt-5 rounded-xl border border-brand-line p-5"><h2 className="mb-5 text-sm font-bold text-brand-ink">🛡 How your escrow payment works</h2><div className="space-y-4">{items.map((item, index) => <div key={item.title} className="flex items-start gap-3"><span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index === 0 ? "bg-emerald-500 text-white" : index === 1 ? "bg-brand-teal-700 text-white" : "bg-brand-line text-brand-muted"}`}>{item.icon}</span><div><h3 className="text-sm font-semibold text-brand-ink">{item.title}</h3><p className="mt-0.5 text-xs text-brand-muted">{item.detail}</p></div>{index === 1 && <span className="ml-auto rounded-full bg-brand-teal-100 px-2 py-1 text-[10px] font-bold text-brand-teal-700">HELD</span>}</div>)}</div></section>;
}

const inputClass = "min-h-14 w-full rounded-xl border border-brand-line bg-white px-4 py-3.5 text-sm text-brand-ink outline-none transition placeholder:text-brand-muted/70 focus:border-brand-teal-500 focus:ring-3 focus:ring-brand-teal-100";
function formatDate(value: string) { if (!value) return "Not provided"; const [year, month, day] = value.split("-").map(Number); return new Date(year, month - 1, day).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }); }
function dateFromInput(value: string) { if (!value) return null; const [year, month, day] = value.split("-").map(Number); return new Date(year, month - 1, day); }
function toInputDate(year: number, month: number, day: number) { return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`; }
function getProcedurePrice(procedure: string) { return procedure === "Double Eyelid" ? "$1,200" : procedure === "V-line Contour" ? "$5,500" : "$2,400"; }
function formatCardNumber(value: string) { return value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim(); }
