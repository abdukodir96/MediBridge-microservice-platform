"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const procedureOptions = ["Rhinoplasty", "Double Eyelid Surgery", "Face Contouring"];
const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function ClinicBookingCard({ clinicName, startingPrice }: { clinicName: string; startingPrice: string }) {
  const router = useRouter();
  const [procedure, setProcedure] = useState("Rhinoplasty");
  const [date, setDate] = useState("2026-08-12");
  const [procedureOpen, setProcedureOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date(2026, 7, 1));
  const procedureRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closePopovers = (event: PointerEvent) => {
      const target = event.target as Node;
      if (!procedureRef.current?.contains(target)) setProcedureOpen(false);
      if (!calendarRef.current?.contains(target)) setCalendarOpen(false);
    };
    document.addEventListener("pointerdown", closePopovers);
    return () => document.removeEventListener("pointerdown", closePopovers);
  }, []);

  const requireLogin = async () => {
    if (localStorage.getItem("accessToken")) return true;
    const result = await Swal.fire({
      icon: "info",
      title: "Please, login first",
      text: "Log in to continue with this clinic.",
      showCancelButton: true,
      confirmButtonText: "Go to login",
      confirmButtonColor: "#125453",
    });
    if (result.isConfirmed) router.push("/login");
    return false;
  };

  const requestBooking = async () => {
    if (!(await requireLogin())) return;
    await Swal.fire({
      icon: "success",
      title: "Booking request prepared",
      text: `${clinicName} · ${procedure} · ${date}`,
      confirmButtonColor: "#125453",
    });
  };

  const startChat = async () => {
    if (!(await requireLogin())) return;
    await Swal.fire({
      icon: "success",
      title: "Chat request sent",
      text: `${clinicName} will be notified of your request.`,
      confirmButtonColor: "#125453",
    });
  };

  return (
    <aside className="sticky top-6 flex min-h-[820px] flex-col rounded-2xl border border-brand-line bg-white p-7 shadow-2xl shadow-brand-teal-900/10 sm:p-8">
      <p className="text-sm text-brand-muted">Starting from</p>
      <p className="mt-1 font-serif text-[42px] font-semibold text-brand-teal-900">{startingPrice}</p>

      <div ref={procedureRef} className="relative z-30 mt-8 rounded-xl border border-brand-line p-5">
        <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-brand-muted">Procedure</span>
        <button
          type="button"
          onClick={() => {
            setProcedureOpen((current) => !current);
            setCalendarOpen(false);
          }}
          aria-haspopup="listbox"
          aria-expanded={procedureOpen}
          className="mt-2 flex w-full items-center justify-between text-left text-sm font-semibold text-brand-ink outline-none"
        >
          <span>{procedure}</span>
          <span className={`text-xs text-brand-teal-700 transition-transform duration-300 ${procedureOpen ? "rotate-180" : ""}`}>▼</span>
        </button>
        <div
          role="listbox"
          aria-label="Choose procedure"
          aria-hidden={!procedureOpen}
          className={`absolute left-0 right-0 top-[calc(100%+8px)] origin-top rounded-xl border border-brand-line bg-white p-1.5 shadow-2xl shadow-brand-teal-900/15 transition-[opacity,transform] duration-300 ease-out ${
            procedureOpen
              ? "pointer-events-auto translate-y-0 scale-y-100 opacity-100"
              : "pointer-events-none -translate-y-2 scale-y-90 opacity-0"
          }`}
        >
          {procedureOptions.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={procedure === option}
              tabIndex={procedureOpen ? 0 : -1}
              onClick={() => {
                setProcedure(option);
                setProcedureOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left text-sm transition ${
                procedure === option
                  ? "bg-brand-teal-100 font-semibold text-brand-teal-700"
                  : "text-brand-ink hover:bg-brand-cream"
              }`}
            >
              <span>{option}</span>
              {procedure === option && <span>✓</span>}
            </button>
          ))}
        </div>
      </div>

      <div ref={calendarRef} className="relative z-20 mt-5 rounded-xl border border-brand-line p-5">
        <span className="block text-[11px] font-bold uppercase tracking-[0.08em] text-brand-muted">Preferred date</span>
        <button
          type="button"
          onClick={() => {
            setCalendarOpen((current) => !current);
            setProcedureOpen(false);
          }}
          aria-haspopup="dialog"
          aria-expanded={calendarOpen}
          className="mt-2 flex w-full items-center justify-between text-left text-sm font-semibold text-brand-ink outline-none"
        >
          <span>{formatDisplayDate(date)}</span>
          <span aria-hidden="true">▣</span>
        </button>

        <div
          role="dialog"
          aria-label="Choose preferred date"
          aria-hidden={!calendarOpen}
          className={`absolute left-0 right-0 top-[calc(100%+8px)] origin-top rounded-xl border border-brand-line bg-white p-4 shadow-2xl shadow-brand-teal-900/15 transition-[opacity,transform] duration-300 ease-out ${
            calendarOpen
              ? "pointer-events-auto translate-y-0 scale-y-100 opacity-100"
              : "pointer-events-none -translate-y-2 scale-y-90 opacity-0"
          }`}
        >
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))} className="flex h-9 w-9 items-center justify-center rounded-full text-brand-teal-700 hover:bg-brand-teal-100" aria-label="Previous month">‹</button>
            <strong className="text-sm text-brand-teal-900">{calendarMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</strong>
            <button type="button" onClick={() => setCalendarMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))} className="flex h-9 w-9 items-center justify-center rounded-full text-brand-teal-700 hover:bg-brand-teal-100" aria-label="Next month">›</button>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1 text-center">
            {weekDays.map((day) => <span key={day} className="py-1 text-[11px] font-bold text-brand-muted">{day}</span>)}
            {calendarDays(calendarMonth).map((day, index) => {
              if (!day) return <span key={`empty-${index}`} />;
              const isoDate = toIsoDate(calendarMonth.getFullYear(), calendarMonth.getMonth(), day);
              const selected = isoDate === date;
              return (
                <button
                  key={isoDate}
                  type="button"
                  onClick={() => {
                    setDate(isoDate);
                    setCalendarOpen(false);
                  }}
                  className={`flex aspect-square items-center justify-center rounded-full text-xs font-semibold transition ${
                    selected
                      ? "bg-brand-teal-700 text-white"
                      : "text-brand-ink hover:bg-brand-teal-100 hover:text-brand-teal-700"
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <button type="button" onClick={() => void requestBooking()} className="mt-7 min-h-14 w-full rounded-xl bg-brand-teal-700 px-6 text-base font-bold text-white transition hover:bg-brand-teal-900">
        Request booking
      </button>
      <button type="button" onClick={() => void startChat()} className="mt-4 min-h-14 w-full rounded-xl border border-brand-line bg-white px-6 text-base font-bold text-brand-teal-900 transition hover:border-brand-teal-500 hover:bg-brand-cream">
        💬 Chat with clinic first
      </button>

      <div className="mt-7 rounded-xl bg-brand-cream/75 p-5">
        <h3 className="text-sm font-bold text-brand-teal-900">What happens next?</h3>
        <ol className="mt-4 space-y-3.5">
          {[
            "The clinic confirms availability",
            "A coordinator contacts you in your language",
            "Approve your plan and pay securely",
          ].map((step, index) => (
            <li key={step} className="flex items-start gap-3 text-sm leading-5 text-brand-muted">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-teal-100 text-xs font-bold text-brand-teal-700">{index + 1}</span>
              <span className="pt-0.5">{step}</span>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-auto border-t border-brand-line pt-6">
        <p className="flex items-center justify-center gap-2 text-xs text-brand-muted">🛡 Protected by escrow · pay after treatment</p>
        <p className="mt-4 rounded-lg bg-brand-teal-100/55 px-4 py-3 text-center text-xs font-semibold text-brand-teal-700">⚡ Usually responds within 2 hours</p>
      </div>
    </aside>
  );
}

function formatDisplayDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${month}/${day}/${year}`;
}

function calendarDays(month: Date) {
  const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const totalDays = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return [...Array<null>(firstWeekday).fill(null), ...Array.from({ length: totalDays }, (_, index) => index + 1)];
}

function toIsoDate(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
