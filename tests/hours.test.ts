import { describe, expect, it } from "vitest";
import { openingHoursFixture } from "@/data/site-fixtures";
import { berlinToday } from "@/lib/cafe";
import {
  activeNotice,
  addDays,
  hoursForDate,
  nextOpening,
  summarizeRegular,
  upcomingExceptions,
} from "@/lib/hours";
import type { OpeningHoursData } from "@/lib/site-types";

const base = openingHoursFixture;
// 2026-11-02 is a Monday; 2026-11-04 a Wednesday (Ruhetag).
const withHoliday: OpeningHoursData = {
  ...base,
  exceptions: [
    { from: "2026-11-02", to: "2026-11-02", closed: true, reason: "Betriebsurlaub" },
    { from: "2026-11-06", to: "2026-11-06", closed: false, hours: { open: "10:00", close: "13:00" } },
    { from: "2026-12-24", to: "2026-12-26", closed: true, reason: "Weihnachten" },
  ],
};

describe("hoursForDate", () => {
  it("uses the regular pattern without exceptions", () => {
    expect(hoursForDate(base, "2026-11-02").hours).toEqual({ open: "08:00", close: "17:00" });
    expect(hoursForDate(base, "2026-11-04").hours).toBeNull(); // Mittwoch Ruhetag
    expect(hoursForDate(base, "2026-11-07").hours).toEqual({ open: "14:00", close: "17:00" });
  });

  it("lets a holiday closure override a normal opening day", () => {
    const result = hoursForDate(withHoliday, "2026-11-02");
    expect(result.hours).toBeNull();
    expect(result.exception?.reason).toBe("Betriebsurlaub");
  });

  it("applies special hours on a single date", () => {
    expect(hoursForDate(withHoliday, "2026-11-06").hours).toEqual({ open: "10:00", close: "13:00" });
  });

  it("covers every day of a multi-day closure", () => {
    for (const d of ["2026-12-24", "2026-12-25", "2026-12-26"]) {
      expect(hoursForDate(withHoliday, d).hours).toBeNull();
    }
    expect(hoursForDate(withHoliday, "2026-12-27").hours).toEqual({ open: "14:00", close: "17:00" });
  });
});

describe("nextOpening", () => {
  it("skips the Ruhetag", () => {
    expect(nextOpening(base, "2026-11-04")).toMatchObject({ date: "2026-11-05", weekday: 4 });
  });

  it("skips a holiday closure", () => {
    // Sunday 1 Nov -> Monday closed by exception -> Tuesday
    expect(nextOpening(withHoliday, "2026-11-01")?.date).toBe("2026-11-03");
  });

  it("returns null when nothing opens within the horizon", () => {
    const closed: OpeningHoursData = { ...base, regular: { 0: null, 1: null, 2: null, 3: null, 4: null, 5: null, 6: null } };
    expect(nextOpening(closed, "2026-11-04")).toBeNull();
  });
});

describe("summaries and notices", () => {
  it("groups consecutive weekdays like the café's own poster", () => {
    expect(summarizeRegular(base).map((r) => `${r.days}: ${r.hours}`)).toEqual([
      "Montag, Dienstag: 08:00 – 17:00 Uhr",
      "Mittwoch: Ruhetag",
      "Donnerstag, Freitag: 08:00 – 17:00 Uhr",
      "Samstag, Sonntag: 14:00 – 17:00 Uhr",
    ]);
  });

  it("lists only exceptions that touch the next weeks", () => {
    expect(upcomingExceptions(withHoliday, "2026-11-03").map((e) => e.from)).toEqual(["2026-11-06"]);
    expect(upcomingExceptions(withHoliday, "2026-12-20").map((e) => e.from)).toEqual(["2026-12-24"]);
  });

  it("shows a notice only inside its window", () => {
    const data = { ...base, notice: { text: "Ab Januar neue Zeiten.", from: "2026-12-01", until: "2026-12-31" } };
    expect(activeNotice(data, "2026-11-30")).toBeNull();
    expect(activeNotice(data, "2026-12-15")).toBe("Ab Januar neue Zeiten.");
    expect(activeNotice(data, "2027-01-01")).toBeNull();
  });
});

describe("Berlin dates", () => {
  it("rolls over at Berlin midnight, not UTC midnight", () => {
    expect(berlinToday(new Date("2026-11-04T22:59:00Z")).isoDate).toBe("2026-11-04"); // 23:59 CET
    expect(berlinToday(new Date("2026-11-04T23:00:00Z")).isoDate).toBe("2026-11-05"); // 00:00 CET
    expect(berlinToday(new Date("2026-07-01T21:59:00Z")).isoDate).toBe("2026-07-01"); // 23:59 CEST
    expect(berlinToday(new Date("2026-07-01T22:00:00Z")).isoDate).toBe("2026-07-02");
  });

  it("adds days across month ends", () => {
    expect(addDays("2026-11-30", 1)).toBe("2026-12-01");
  });
});
