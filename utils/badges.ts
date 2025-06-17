import { getUserVotes } from "./votes";
import { getComments } from "./comments";

export function assignBadges(user: any): string[] {
  const badges = new Set<string>();

  // 🔸 Якщо не має логіна або email — гість
  if (!user.login && !user.email) {
    badges.add("guest");
    return Array.from(badges);
  }

  // 🔹 Статуси
  if (user.type === "pro" || user.pro) badges.add("pro");
  else badges.add("free");

  if (user.badges?.includes("moderator")) badges.add("moderator");
  if (user.badges?.includes("founder")) badges.add("founder");

  const comments = getComments().filter(
    c => c.author === user.login || c.email === user.email
  );

  // 🔹 Reporter — за перший коментар
  if (comments.length >= 1) badges.add("reporter");

  // 🔹 Detective — 10+ коментарів
  if (comments.length > 10) badges.add("detective");

  // 🔹 Radar — хоча б одне відео
  if (comments.some(c => c.videoUrl)) badges.add("radar");

  // 🔹 Chop guard — якщо згадується CHOP
  const isChop = comments.some(c =>
    c.plate?.toUpperCase().includes("CHOP") ||
    c.comment?.toUpperCase().includes("CHOP")
  );
  if (isChop && comments.length > 1) badges.add("chop_guard");

  // 🔹 Upvotes (like) — отримані лайки на коментарях
  const votes = getUserVotes(user.email);
  const likesReceived = comments.reduce((sum, c) => {
    const v = votes[c.id];
    return sum + (v?.up || 0);
  }, 0);

  if (likesReceived > 10) badges.add("liker");
  if (likesReceived > 30) badges.add("top_contributor");

  // 🔹 Helper — і коментар, і хоч один лайк
  if (comments.length >= 1 && likesReceived >= 1) badges.add("helper");

  // 🔹 Veteran — більше року з моменту створення
  const created = user.createdAt || user.created || 0;
  if (created && Date.now() - new Date(created).getTime() > 365 * 24 * 60 * 60 * 1000) {
    badges.add("veteran");
  }

  return Array.from(badges);
}
