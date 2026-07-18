import { Suspense } from "react";
import { BookingFlow } from "@/components/booking-flow";

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-cream" />}>
      <BookingFlow />
    </Suspense>
  );
}
