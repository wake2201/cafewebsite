import { cacheLife } from "next/cache";
import { berlinToday } from "@/lib/cafe";
import { getContactInfo, getOpeningHours, getWeeklyMenus } from "@/lib/content";
import { selectWeeklyMenu } from "@/lib/weekly-menu";
import { WeeklyMenuView } from "./WeeklyMenuView";

type Props = { headingLevel?: "h2" | "h3"; id?: string; reveal?: boolean };

/**
 * Loads weekly menus and picks the one valid today (Europe/Berlin). Cached briefly so the
 * date check re-runs without a rebuild; an expired week is never shown as current.
 */
export async function WeeklyMenu({ headingLevel, id, reveal = false }: Props) {
  "use cache";
  cacheLife("cms");

  const today = berlinToday();
  const [menus, contact, hours] = await Promise.all([getWeeklyMenus(), getContactInfo(), getOpeningHours()]);
  const selection = selectWeeklyMenu(menus, today.isoDate);

  return (
    <WeeklyMenuView
      selection={selection}
      todayIso={today.isoDate}
      headingLevel={headingLevel}
      id={id}
      phone={contact.phone}
      lunch={hours.lunch}
      reveal={reveal}
    />
  );
}
