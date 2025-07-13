"use client";

import { useEffect } from "react";

export default function GuestInitializer() {
  useEffect(() => {
    const existing = localStorage.getItem("user");

    if (!existing) {
      const guestId = `guest_${crypto.randomUUID()}@myplatecheck.com`;
      const user = {
        email: guestId,
        type: "guest"
      };
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, []);

  return null;
}
