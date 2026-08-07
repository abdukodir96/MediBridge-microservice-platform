"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";

// Client-side route guard. This is a UI convenience, not the real security
// boundary — every admin mutation/query is independently enforced by
// RolesGuard on the backend regardless of what this check does. But unlike
// the patient/clinic dashboards (an empty list leaking is a non-issue), an
// unguarded /admin would let anyone with the URL see clinic data rendered
// in the UI, so this gets a same-turn guard instead of "later."
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  // Lazy initializer (not effect setState) — guarded so it never touches
  // localStorage during the server render pass.
  const [authorized] = useState<boolean>(
    () => typeof window !== "undefined" && localStorage.getItem("memberType") === "ADMIN",
  );

  useEffect(() => {
    if (!authorized) router.replace("/login");
  }, [authorized, router]);

  if (!authorized) return null;

  return <AdminShell>{children}</AdminShell>;
}
