import { cacheLife } from "next/cache";
import { berlinToday, cafe, nextOpenDay, openingHours, weekdayNames } from "@/lib/cafe";
import { formatPrice, getActiveWeeklyMenu, getWeeklyMenus } from "@/lib/weekly-menu";
import styles from "./TodayPanel.module.css";

/**
 * "Heute" summary for the hero: today's hours, today's lunch from the dated weekly plan
 * (only while that plan is valid), or the next opening on a rest day.
 * Weekly pattern only; holiday closures arrive with the CMS in Milestone 3.
 */
export async function TodayPanel() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 600, expire: 3600 });

  const today = berlinToday();
  const hours = openingHours[today.weekday];
  const menuDay = getActiveWeeklyMenu(await getWeeklyMenus(), today.isoDate)?.days.find(
    (day) => day.date === today.isoDate,
  );
  const dishes = menuDay && !menuDay.closed ? menuDay.dishes : [];
  const next = hours ? null : nextOpenDay(today.weekday);

  return (
    <section className={styles.panel} aria-labelledby="heute">
      <h2 id="heute" className={styles.day}>
        Heute, {weekdayNames[today.weekday]}
      </h2>
      {hours ? (
        <p className={styles.line}>
          Geöffnet <span className={styles.time}>{hours.open} – {hours.close} Uhr</span>
        </p>
      ) : (
        <p className={styles.line}>
          Ruhetag. Wieder geöffnet am {weekdayNames[next!.weekday]}{" "}
          <span className={styles.time}>ab {next!.hours.open} Uhr</span>
        </p>
      )}
      {dishes.length > 0 ? (
        <p className={styles.line}>
          Mittagstisch <span className={styles.time}>{cafe.lunch.from} – {cafe.lunch.to} Uhr</span>
          {dishes.map((dish) => (
            <span key={dish.name} className={styles.dish}>
              {dish.name}
              {dish.priceEur !== undefined ? (
                <>
                  {" "}
                  <span className="tabular">{formatPrice(dish.priceEur)}</span>
                </>
              ) : null}
            </span>
          ))}
        </p>
      ) : null}
    </section>
  );
}
