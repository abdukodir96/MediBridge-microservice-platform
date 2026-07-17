import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 font-serif text-[25px] font-semibold text-brand-teal-900">
      <span className="flex h-[32.5px] w-[32.5px] items-center justify-center rounded-[9px] bg-brand-teal-700">
        <svg viewBox="0 0 24 24" fill="none" className="h-[17.5px] w-[17.5px]">
          <path d="M12 3v18M3 12h18" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </span>
      MediBridge
    </Link>
  );
}
