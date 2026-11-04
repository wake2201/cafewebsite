import { cacheLife } from "next/cache";
import { berlinToday } from "@/lib/cafe";
import { getOpeningHours } from "@/lib/content";
import {
  activeNotice,
  describeException,
  exceptionFor,
  formatExceptionDates,
  summarizeRegular,
  upcomingExceptions,
} from "@/lib/hours";
import styles from "./OpeningHours.module.css";

/**
 * Regular weekly hours with today's row marked, followed by any business notice and the
 * holiday closures / special hours of the next three weeks. `tone` adapts colours to the
 * surface it sits on (the dark homepage band or a light page).
 */
export async function OpeningHours({ tone = "light" }: { tone?: "light" | "dark" }) {
  "use cache";
  cacheLife("cms");

  const today = berlinToday();
  const data = await getOpeningHours();
  const todayException = exceptionFor(data, today.isoDate);
  const notice = activeNotice(data, today.isoDate);
  const upcoming = upcomingExceptions(data, today.isoDate);

  return (
    <div className={styles.wrap} data-tone={tone}>
      <dl className={styles.hours}>
        {summarizeRegular(data).map((row) => {
          // When an exception applies today, "heute" moves to the exception list instead.
          const isToday = !todayException && row.weekdays.includes(today.weekday);
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

      {notice ? (
        <p className={styles.notice} role="note">
          {notice}
        </p>
      ) : null}

      {upcoming.length > 0 ? (
        <div className={styles.exceptions}>
          <p className={styles.exceptionsTitle}>Abweichende Öffnungszeiten</p>
          <ul>
            {upcoming.map((ex) => {
              const isToday = ex === todayException;
              return (
                <li key={`${ex.from}-${ex.to}`} data-today={isToday || undefined}>
                  <span>
                    {formatExceptionDates(ex)}
                    {isToday ? <span className={styles.today}> (heute)</span> : null}
                  </span>
                  <span className={styles.time}>
                    {describeException(ex)}
                    {ex.reason ? ` (${ex.reason})` : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
