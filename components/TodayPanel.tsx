import { cacheLife } from "next/cache";
import { berlinToday } from "@/lib/cafe";
import { getOpeningHours, getWeeklyMenus } from "@/lib/content";
import { addDays, formatRange, hoursForDate, nextOpening, weekdayNames } from "@/lib/hours";
import { formatDayMonth, formatPrice, getActiveWeeklyMenu } from "@/lib/weekly-menu";
import styles from "./TodayPanel.module.css";

/**
 * "Heute" summary for the hero: today's effective hours (holiday closures and special hours
 * override the weekly pattern), today's lunch from the valid weekly menu, or the next opening.
 */
export async function TodayPanel() {
  "use cache";
  cacheLife("cms");

  const today = berlinToday();
  const [hoursData, menus] = await Promise.all([getOpeningHours(), getWeeklyMenus()]);
  const { hours, exception } = hoursForDate(hoursData, today.isoDate);
  const menuDay = hours
    ? getActiveWeeklyMenu(menus, today.isoDate)?.days.find((day) => day.date === today.isoDate)
    : undefined;
  const dishes = menuDay && !menuDay.closed ? menuDay.dishes : [];
  const next = hours ? null : nextOpening(hoursData, today.isoDate);
  const closedLabel = exception?.closed ? `Heute geschlossen${exception.reason ? ` (${exception.reason})` : ""}.` : "Ruhetag.";

  return (
    <section className={styles.panel} aria-labelledby="heute">
      <h2 id="heute" className={styles.day}>
        Heute, {weekdayNames[today.weekday]}
      </h2>
      {hours ? (
        <p className={styles.line}>
          {exception ? "Heute geänderte Zeiten:" : "Geöffnet"}{" "}
          <span className={styles.time}>{formatRange(hours)}</span>
          {exception?.reason ? <> ({exception.reason})</> : null}
        </p>
      ) : (
        <p className={styles.line}>
          {closedLabel}
          {next ? (
            <>
              {" "}
              Wieder geöffnet am {weekdayNames[next.weekday]}
              {/* Beyond six days, or after a closure, name the date so "am Montag" is never ambiguous. */}
              {next.date > addDays(today.isoDate, 6) || exception ? `, ${formatDayMonth(next.date)},` : ""}{" "}
              <span className={styles.time}>ab {next.hours.open} Uhr</span>
            </>
          ) : null}
        </p>
      )}
      {dishes.length > 0 ? (
        <p className={styles.line}>
          Mittagstisch
          {hoursData.lunch ? (
            <>
              {" "}
              <span className={styles.time}>{formatRange(hoursData.lunch)}</span>
            </>
          ) : null}
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
