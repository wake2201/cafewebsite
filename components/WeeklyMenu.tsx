import { cacheLife } from "next/cache";
import { berlinToday } from "@/lib/cafe";
import { getWeeklyMenus, selectWeeklyMenu } from "@/lib/weekly-menu";
import { WeeklyMenuView } from "./WeeklyMenuView";

type Props = { headingLevel?: "h2" | "h3"; id?: string };

/**
 * Loads weekly menus and picks the one valid today (Europe/Berlin). Cached briefly so the
 * date check re-runs without a rebuild; an expired week is never shown as current.
 */
export async function WeeklyMenu({ headingLevel, id }: Props) {
  "use cache";
  cacheLife({ stale: 300, revalidate: 900, expire: 3600 });

  const today = berlinToday();
  const selection = selectWeeklyMenu(await getWeeklyMenus(), today.isoDate);

  return <WeeklyMenuView selection={selection} todayIso={today.isoDate} headingLevel={headingLevel} id={id} />;
}
