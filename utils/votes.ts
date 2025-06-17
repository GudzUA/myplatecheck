export function getUserVotes(email: string): Record<string, { up: number; down: number; voter?: string; author?: string }> {
  try {
    const raw = localStorage.getItem("votesMap");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
