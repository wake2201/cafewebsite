import { cacheLife } from "next/cache";
import { berlinToday, openingHours, weekdayNames } from "@/lib/cafe";

/** "Heute, Donnerstag: 08:00 – 17:00 Uhr" — re-evaluated every few minutes. */
export async function TodayHours({ className }: { className?: string }) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 3600 });

  const { weekday } = berlinToday();
  const hours = openingHours[weekday];

  return (
    <p className={className}>
      Heute, {weekdayNames[weekday]}:{" "}
      <strong>{hours ? `${hours.open} – ${hours.close} Uhr geöffnet` : "Ruhetag"}</strong>
    </p>
  );
}
