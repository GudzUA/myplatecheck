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

useEffect(() => {
  const stored = localStorage.getItem("user");
  if (!stored) return;

  const user = JSON.parse(stored);
  const email = user?.email;

  if (!email || email.startsWith("guest")) return;

  fetch("/api/user/status", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
    .then((res) => res.json())
    .then((data) => {
      if (user.pro !== data.pro) {
  console.log("🔁 PRO status changed:", user.pro, "→", data.pro);
  user.pro = data.pro;
  localStorage.setItem("user", JSON.stringify(user));
  window.dispatchEvent(new Event("userUpdated"));
}
    })
    .catch((e) => console.error("❌ Failed to check PRO status", e));
}, []);

  return null;
}
