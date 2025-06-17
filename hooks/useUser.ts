"use client";

import { useEffect, useState } from "react";

export function useUser() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("userEmail");
    setEmail(stored);
  }, []);

  const logout = () => {
    localStorage.removeItem("userEmail");
    setEmail(null);
  };

  return { email, logout };
}
