import { cacheLife } from "next/cache";
import { berlinToday, cafe } from "@/lib/cafe";
import { formatPrice, formatRange, formatShortDate, getActiveWeeklyMenu, weeklyMenu } from "@/lib/weekly-menu";
import styles from "./WeeklyMenu.module.css";

type Props = { headingLevel?: "h2" | "h3"; id?: string };

/**
 * Renders the current week's lunch menu, or an honest fallback once the stored plan has
 * expired. Cached for a short period so the date check re-runs without a rebuild.
 */
export async function WeeklyMenu({ headingLevel: Heading = "h2", id = "wochenkarte" }: Props) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  const today = berlinToday();
  const menu = getActiveWeeklyMenu(today.isoDate);

  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={`container ${styles.layout}`}>
        <div className={styles.intro}>
          <Heading id={id} className={styles.title}>
            Wochenkarte
          </Heading>
          {menu ? (
            <p className={styles.range}>{formatRange(menu.validFrom, menu.validTo)}</p>
          ) : null}
          <p className={styles.lunch}>
            Mittagstisch von {cafe.lunch.from} bis {cafe.lunch.to} Uhr
          </p>
        </div>

        {menu ? (
          <>
          <ol className={styles.days}>
            {menu.days.map((day) => {
              const isToday = day.date === today.isoDate;
              return (
                <li
                  key={day.date}
                  className={styles.day}
                  data-today={isToday || undefined}
                  data-closed={day.closed || undefined}
                  aria-current={isToday ? "date" : undefined}
                >
                  <p className={styles.weekday}>
                    {day.weekday}
                    <span className={`${styles.date} tabular`}>{formatShortDate(day.date)}</span>
                    {isToday ? <span className={styles.todayTag}>heute</span> : null}
                  </p>
                  {day.closed ? (
                    <p className={styles.closed}>Ruhetag</p>
                  ) : (
                    day.dishes.map((dish) => (
                      <p key={dish.name} className={styles.dish}>
                        <span>{dish.name}</span>
                        <span className={`${styles.price} tabular`}>{formatPrice(dish.priceEur)}</span>
                      </p>
                    ))
                  )}
                </li>
              );
            })}
          </ol>
          <ul className={styles.notes}>
            {menu.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          </>
        ) : (
          <div className={styles.empty}>
            <p>
              Die Wochenkarte für diese Woche ist hier noch nicht eingetragen
              {/* Keep the last known period visible so nobody mistakes it for the current plan. */}
              {" "}(zuletzt: {formatRange(weeklyMenu.validFrom, weeklyMenu.validTo)}).
            </p>
            <p>
              Was es heute zu Mittag gibt, erfahren Sie telefonisch unter{" "}
              <a href={cafe.phone.href}>{cafe.phone.display}</a>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
