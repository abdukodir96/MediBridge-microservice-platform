"use client";

import { useState } from "react";
import { useRouter } from "@/lib/plain-navigation";
import Swal from "sweetalert2";
import { connectChatSocket } from "@/lib/chat/socket";

// Shared between the Clinic Review Queue and All Clinics screens — both need
// the exact same "open (or find) the admin-support room for this clinic,
// then jump to Messages" action.
export function useMessageClinic() {
  const router = useRouter();
  const [openingFor, setOpeningFor] = useState<string | null>(null);

  const messageClinic = (clinicOwnerId: string) => {
    setOpeningFor(clinicOwnerId);
    const socket = connectChatSocket();
    socket.emit(
      "openAdminRoom",
      { clinicOwnerId },
      (res: { status: string; roomId?: string; message?: string }) => {
        socket.disconnect(); // one-off connection — the Messages page opens its own
        setOpeningFor(null);
        if (res.status === "roomOpened" && res.roomId) {
          router.push(`/admin/messages?room=${res.roomId}`);
        } else {
          Swal.fire({
            icon: "error",
            title: "Couldn't open chat",
            text: res.message ?? "Please try again.",
            confirmButtonColor: "#125453",
          });
        }
      },
    );
  };

  return { messageClinic, openingFor };
}
