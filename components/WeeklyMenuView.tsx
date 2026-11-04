import { formatRange as formatTimeRange } from "@/lib/hours";
import type { WeeklyMenuSelection } from "@/lib/menu-types";
import type { ContactInfo, TimeRange } from "@/lib/site-types";
import { formatDayMonth, formatPrice, formatRange, formatShortDate, formatWeekday } from "@/lib/weekly-menu";
import styles from "./WeeklyMenu.module.css";

type Props = {
  selection: WeeklyMenuSelection;
  /** ISO date of "today" in Europe/Berlin, used to mark the current day. */
  todayIso: string;
  headingLevel?: "h2" | "h3";
  id?: string;
  phone: ContactInfo["phone"];
  lunch?: TimeRange;
};

/**
 * Presentational weekly menu. Knows nothing about where the data comes from:
 * it renders whatever selection it receives (current week, upcoming preview, or none).
 */
export function WeeklyMenuView({
  selection,
  todayIso,
  headingLevel: Heading = "h2",
  id = "wochenkarte",
  phone,
  lunch,
}: Props) {
  const menu = selection.status === "none" ? null : selection.menu;
  const isPreview = selection.status === "upcoming";

  return (
    <section className={styles.section} aria-labelledby={id}>
      <div className={`container ${styles.layout}`}>
        <div className={styles.intro}>
          <Heading id={id} className={styles.title}>
            Wochenkarte
          </Heading>
          {menu ? (
            <p className={styles.range}>
              {isPreview ? <span className={styles.preview}>Vorschau: </span> : null}
              {formatRange(menu.validFrom, menu.validTo)}
            </p>
          ) : null}
          {lunch ? <p className={styles.lunch}>Mittagstisch {formatTimeRange(lunch)}</p> : null}
          {isPreview && menu ? (
            <p className={styles.previewNote}>
              Diese Karte gilt ab {formatWeekday(menu.validFrom)}, {formatDayMonth(menu.validFrom)}. Für die
              laufende Woche ist noch keine Karte eingetragen.
            </p>
          ) : null}
        </div>

        {menu ? (
          <>
            <ol className={styles.days}>
              {menu.days.map((day) => {
                const isToday = !isPreview && day.date === todayIso;
                return (
                  <li
                    key={day.date}
                    className={styles.day}
                    data-today={isToday || undefined}
                    aria-current={isToday ? "date" : undefined}
                  >
                    <p className={styles.weekday}>
                      {formatWeekday(day.date)}
                      <span className={`${styles.date} tabular`}>{formatShortDate(day.date)}</span>
                      {isToday ? <span className={styles.todayTag}>heute</span> : null}
                    </p>
                    <div className={styles.dishes}>
                      {day.closed ? <p className={styles.closed}>Ruhetag</p> : null}
                      {!day.closed && day.dishes.length === 0 ? (
                        <p className={styles.closed}>Kein Mittagstisch eingetragen</p>
                      ) : null}
                      {!day.closed
                        ? day.dishes.map((dish) => (
                            <div key={dish.name} className={styles.dish}>
                              <p className={styles.dishName}>
                                {dish.name}
                                {dish.description ? <span className={styles.dishNote}>{dish.description}</span> : null}
                              </p>
                              {dish.priceEur !== undefined ? (
                                <p className={`${styles.price} tabular`}>{formatPrice(dish.priceEur)}</p>
                              ) : null}
                            </div>
                          ))
                        : null}
                      {day.note ? <p className={styles.dayNote}>{day.note}</p> : null}
                    </div>
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
              Für diese Woche ist hier noch keine Wochenkarte eingetragen
              {selection.status === "none" && selection.lastValidTo ? (
                <> (die zuletzt eingetragene Karte galt bis {formatDayMonth(selection.lastValidTo)})</>
              ) : null}
              .
            </p>
            <p>
              Was es heute zu Mittag gibt, erfahren Sie telefonisch unter{" "}
              <a href={phone.href}>{phone.display}</a>.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
