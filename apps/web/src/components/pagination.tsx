import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  query?: Record<string, string>;
  basePath?: string;
  ariaLabel?: string;
};

export function Pagination({
  currentPage,
  totalPages,
  query = {},
  basePath = "/clinics",
  ariaLabel = "Clinics pagination",
}: PaginationProps) {
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (page > 1) params.set("page", String(page));
    const search = params.toString();
    return search ? `${basePath}?${search}` : basePath;
  };

  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav aria-label={ariaLabel} className="mt-12 flex w-full justify-center">
      <div className="flex w-full max-w-md items-center justify-between font-medium text-brand-muted">
        <PaginationArrow
          direction="previous"
          href={pageHref(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        />

        <div className="flex items-center gap-1.5 text-base font-semibold sm:gap-2 sm:text-[17px]">
          {pages.map((page, index) =>
            page === "ellipsis" ? (
              <span key={`ellipsis-${index}`} className="flex h-10 w-7 items-center justify-center text-brand-muted" aria-hidden="true">
                …
              </span>
            ) : (
              <Link
                key={page}
                href={pageHref(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition duration-200 ${
                  page === currentPage
                    ? "border border-brand-teal-500 bg-brand-teal-100/60 font-bold text-brand-teal-700 shadow-sm"
                    : "text-brand-muted hover:bg-brand-cream hover:text-brand-teal-700"
                }`}
              >
                {page}
              </Link>
            ),
          )}
        </div>

        <PaginationArrow
          direction="next"
          href={pageHref(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        />
      </div>
    </nav>
  );
}

function PaginationArrow({
  direction,
  href,
  disabled,
}: {
  direction: "previous" | "next";
  href: string;
  disabled: boolean;
}) {
  const icon = (
    <svg
      className={direction === "next" ? "rotate-180" : ""}
      width="40"
      height="40"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22.499 12.85a.9.9 0 0 1 .57.205l.067.06a.9.9 0 0 1 .06 1.206l-.06.066-5.585 5.586-.028.027.028.027 5.585 5.587a.9.9 0 0 1 .06 1.207l-.06.066a.9.9 0 0 1-1.207.06l-.066-.06-6.25-6.25a1 1 0 0 1-.158-.212l-.038-.08a.9.9 0 0 1-.03-.606l.03-.083a1 1 0 0 1 .137-.226l.06-.066 6.25-6.25a.9.9 0 0 1 .635-.263Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth=".078"
      />
    </svg>
  );

  if (disabled) {
    return (
      <button
        type="button"
        aria-label={direction === "previous" ? "Previous page" : "Next page"}
        disabled
        className="rounded-full bg-slate-200/40 text-slate-400 opacity-55"
      >
        {icon}
      </button>
    );
  }

  return (
    <Link
      href={href}
      aria-label={direction === "previous" ? "Previous page" : "Next page"}
      className="rounded-full bg-slate-200/50 text-slate-600 transition duration-200 hover:bg-brand-teal-100 hover:text-brand-teal-700"
    >
      {icon}
    </Link>
  );
}

function getVisiblePages(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);
  if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis", totalPages];
  if (currentPage >= totalPages - 2) return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}
