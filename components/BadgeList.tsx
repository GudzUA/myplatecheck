// components/BadgeList.tsx
import Image from "next/image";

const badgeMap: Record<string, string> = {
  guest: "/badges/guest.svg",
  free: "/badges/free.svg",
  pro: "/badges/pro.svg",
  reporter: "/badges/reporter.svg",
  detective: "/badges/detective.svg",
  radar: "/badges/radar.svg",
  chop_guard: "/badges/chop_guard.svg",
  liker: "/badges/liker.svg",
  top_contributor: "/badges/top_contributor.svg",
  helper: "/badges/helper.svg",
  veteran: "/badges/veteran.svg",
  moderator: "/badges/moderator.svg",
  founder: "/badges/founder.svg",
};

export default function BadgeList({ badges }: { badges: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {badges.map((badge) =>
        badgeMap[badge] ? (
          <Image
            key={badge}
            src={badgeMap[badge]}
            alt={badge}
            width={20}
            height={20}
            title={badge}
            className="inline-block"
          />
        ) : null
      )}
    </div>
  );
}
