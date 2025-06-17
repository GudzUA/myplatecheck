export function getComments() {
  try {
    const raw = localStorage.getItem("comments");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
