"use client";

import { Box, Card, Flex, Heading, Stack, Text } from "@sanity/ui";
import {
  forwardRef,
  useEffect,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ReactNode,
  type Ref,
} from "react";
import { useClient } from "sanity";
import { usePaneRouter, type ChildLinkProps } from "sanity/structure";
import { STUDIO_AREAS, type StudioArea } from "../areas";
import { apiVersion } from "../env";

/**
 * Start pane of the Studio: the café logo, the four editing areas with a one-line explanation
 * each, and whether a weekly menu is published for this week and later. Each row is a normal
 * structure link (ChildLink), so the areas open as the next pane like any Sanity list item.
 */

const LOGO = { src: "/images/brand/cafe-am-lindenplatz-logo.png", width: 834, height: 381 };

// Published documents only (no drafts, no release versions).
const WEEK_STATUS_QUERY = /* groq */ `{
  "current": *[_type == "weeklyMenu" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))
    && validFrom <= $today && validTo >= $today] | order(validFrom asc)[0]{ validFrom, validTo },
  "upcoming": *[_type == "weeklyMenu" && !(_id in path("drafts.**")) && !(_id in path("versions.**"))
    && validFrom > $today] | order(validFrom asc)[0]{ validFrom, validTo }
}`;

type AnchorProps = ComponentPropsWithoutRef<"a">;

type Range = { validFrom: string; validTo: string } | null;
type WeekStatus =
  | { state: "loading" }
  | { state: "error" }
  | { state: "ready"; current: Range; upcoming: Range };

/** Today in Berlin as yyyy-mm-dd (the café's calendar, independent of the editor's device zone). */
function berlinToday(): string {
  return new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Berlin" }).format(new Date());
}

const dayMonth = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", timeZone: "UTC" });
const day = new Intl.DateTimeFormat("de-DE", { day: "numeric", timeZone: "UTC" });

/** "2. bis 6. November" or "30. Oktober bis 3. November". */
function formatRange({ validFrom, validTo }: { validFrom: string; validTo: string }): string {
  const from = new Date(`${validFrom}T00:00:00Z`);
  const to = new Date(`${validTo}T00:00:00Z`);
  const sameMonth = from.getUTCMonth() === to.getUTCMonth() && from.getUTCFullYear() === to.getUTCFullYear();
  return `${sameMonth ? `${day.format(from)}.` : dayMonth.format(from)} bis ${dayMonth.format(to)}`;
}

function useWeekStatus(): WeekStatus {
  const client = useClient({ apiVersion });
  const [status, setStatus] = useState<WeekStatus>({ state: "loading" });
  useEffect(() => {
    let active = true;
    client
      .fetch<{ current: Range; upcoming: Range }>(WEEK_STATUS_QUERY, { today: berlinToday() })
      .then((result) => active && setStatus({ state: "ready", ...result }))
      .catch(() => active && setStatus({ state: "error" }));
    return () => {
      active = false;
    };
  }, [client]);
  return status;
}

function WeekStatusText({ status }: { status: WeekStatus }) {
  if (status.state === "loading") {
    return <Text size={1} muted>Stand der Wochenkarte wird geladen …</Text>;
  }
  if (status.state === "error") {
    return <Text size={1} muted>Der Stand der Wochenkarte konnte nicht geladen werden.</Text>;
  }
  return (
    <Stack gap={2}>
      <Text size={1} muted>
        {status.current
          ? `Diese Woche: ${formatRange(status.current)}`
          : "Für diese Woche ist keine Wochenkarte veröffentlicht."}
      </Text>
      <Text size={1} muted>
        {status.upcoming
          ? `Als Nächstes: ${formatRange(status.upcoming)}`
          : "Noch keine Karte für die kommende Zeit veröffentlicht."}
      </Text>
    </Stack>
  );
}

function AreaLink({ area, selected, extra }: { area: StudioArea; selected: boolean; extra?: ReactNode }) {
  const { ChildLink } = usePaneRouter();
  // Card renders the link itself (as Sanity's own list items do), so focus and selection styles
  // apply. Memoised so the link component keeps its identity between renders.
  const Link = useMemo(() => {
    // ChildLink renders an <a> and passes other props (and the ref) through to it.
    const Anchor = ChildLink as ComponentType<ChildLinkProps & AnchorProps & { ref?: Ref<HTMLAnchorElement> }>;
    return forwardRef<HTMLAnchorElement, AnchorProps>(function AreaAnchor(props, ref) {
      return <Anchor {...props} childId={area.id} ref={ref} />;
    });
  }, [ChildLink, area.id]);
  const Icon = area.icon;
  return (
    <Card
      as={Link}
      data-as="a"
      padding={3}
      radius={2}
      // "pressed" (not "selected"): a quiet tint that keeps the muted description readable.
      pressed={selected}
      aria-current={selected ? "page" : undefined}
      __unstable_focusRing
    >
      <Flex gap={3} align="flex-start">
        <Text size={2} aria-hidden="true">
          <Icon />
        </Text>
        <Stack gap={3} flex={1}>
          <Text size={2} weight="semibold">
            {area.title}
          </Text>
          <Text size={1} muted>
            {area.description}
          </Text>
          {extra}
        </Stack>
      </Flex>
    </Card>
  );
}

export function StudioOverview() {
  const { routerPanesState, groupIndex } = usePaneRouter();
  const openId = routerPanesState[groupIndex + 1]?.[0]?.id;
  const weekStatus = useWeekStatus();

  return (
    <Box padding={4} paddingTop={5}>
      <Stack gap={5}>
        {/* The logo stays on its own paper ground: it is a transparent PNG with black lettering. */}
        <Card radius={2} padding={2} style={{ background: "#FFFCF8", width: "fit-content" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- static asset inside the client-only Studio */}
          <img src={LOGO.src} width={LOGO.width} height={LOGO.height} alt="Café am Lindenplatz" style={{ display: "block", width: 168, height: "auto" }} />
        </Card>
        <Stack gap={3}>
          <Heading as="h2" size={3}>
            Inhalte bearbeiten
          </Heading>
          <Text size={1} muted>
            Änderungen erscheinen nach dem Veröffentlichen in etwa 2 bis 3 Minuten auf der Website.
          </Text>
        </Stack>
        <nav aria-label="Bereiche">
          <Stack gap={1} as="ul" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {STUDIO_AREAS.map((area, index) => (
              <li key={area.id}>
                <AreaLink
                  area={area}
                  selected={openId === area.id}
                  extra={
                    index === 0 ? (
                      // Announced when it finishes loading, without moving focus.
                      <div aria-live="polite">
                        <WeekStatusText status={weekStatus} />
                      </div>
                    ) : undefined
                  }
                />
              </li>
            ))}
          </Stack>
        </nav>
        <Text size={1} muted>
          <a href="/" target="_blank" rel="noopener">
            Website in neuem Tab öffnen
          </a>
        </Text>
      </Stack>
    </Box>
  );
}
