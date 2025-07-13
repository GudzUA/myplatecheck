"use client";

import { useEffect } from "react";

export default function GuestInitializer() {
  useEffect(() => {
    let parsedUser;

    const existing = localStorage.getItem("user");
    if (!existing) {
      const guestId = `guest_${crypto.randomUUID()}@myplatecheck.com`;
      parsedUser = {
        email: guestId,
        type: "guest"
      };
      localStorage.setItem("user", JSON.stringify(parsedUser));
    } else {
      try {
        parsedUser = JSON.parse(existing);
      } catch {
        parsedUser = null;
      }
    }

    // ⬇️ Обов’язково: оновлюємо users
    if (parsedUser?.email) {
      const email = parsedUser.email.toLowerCase();
      const rawUsers = localStorage.getItem("users");
      const users = rawUsers ? JSON.parse(rawUsers) : {};

      users[email] = {
        badges: [
          ...(parsedUser.pro || parsedUser.type === "pro" ? ["pro"] : [])
        ]
      };

      localStorage.setItem("users", JSON.stringify(users));
    }
  }, []);

  return null;
}
