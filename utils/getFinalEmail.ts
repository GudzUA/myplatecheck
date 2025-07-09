export function getFinalEmail(): string {
  if (typeof window === "undefined") return "guest@myplatecheck.com";

  const stored = localStorage.getItem("user");
  try {
    const parsed = stored ? JSON.parse(stored) : null;
    if (parsed?.email && parsed.email !== "guest") return parsed.email;
  } catch {}

  let guestId = localStorage.getItem("guestId");
  if (!guestId) {
    guestId = crypto.randomUUID();
    localStorage.setItem("guestId", guestId);
  }

  return `guest-${guestId}@myplatecheck.com`;
}
