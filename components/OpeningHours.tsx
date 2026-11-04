import { cacheLife } from "next/cache";
import { berlinToday, openingHoursSummary } from "@/lib/cafe";
import styles from "./OpeningHours.module.css";

/**
 * Weekly opening hours with today's row marked. `tone` adapts colours to the
 * surface it sits on (the dark homepage band or a light page).
 */
export async function OpeningHours({ tone = "light" }: { tone?: "light" | "dark" }) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 3600 });

  const { weekday } = berlinToday();

  return (
    <dl className={styles.hours} data-tone={tone}>
      {openingHoursSummary.map((row) => {
        const isToday = row.weekdays.includes(weekday);
        return (
          <div key={row.days} className={styles.row} data-today={isToday || undefined}>
            <dt>
              {row.days}
              {isToday ? <span className={styles.today}> (heute)</span> : null}
            </dt>
            <dd className={styles.time}>{row.hours}</dd>
          </div>
        );
      })}
    </dl>
  );
}
