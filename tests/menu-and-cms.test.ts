import { describe, expect, it } from "vitest";
import type { WeeklyMenu } from "@/lib/menu-types";
import { selectWeeklyMenu } from "@/lib/weekly-menu";
import { mapContactInfo, mapOpeningHours, mapStandingOffers, mapWeeklyMenus } from "@/sanity/lib/mappers";
import {
  rangesOverlap,
  validateMenuDays,
  validatePrice,
  validateTime,
  validateTimeRange,
} from "@/sanity/validation";

const week = (validFrom: string, validTo: string): WeeklyMenu => ({ validFrom, validTo, days: [], notes: [] });

describe("selectWeeklyMenu (three states)", () => {
  const menus = [week("2026-11-02", "2026-11-06"), week("2026-11-16", "2026-11-20")];

  it.each([
    ["2026-11-01", "upcoming", "2026-11-02"],
    ["2026-11-02", "current", "2026-11-02"],
    ["2026-11-06", "current", "2026-11-02"],
    ["2026-11-07", "upcoming", "2026-11-16"],
    ["2026-11-20", "current", "2026-11-16"],
  ])("on %s shows %s %s", (date, status, from) => {
    const s = selectWeeklyMenu(menus, date);
    expect(s.status).toBe(status);
    expect(s.status !== "none" && s.menu.validFrom).toBe(from);
  });

  it("never returns an expired week", () => {
    const s = selectWeeklyMenu(menus, "2026-11-21");
    expect(s).toEqual({ status: "none", lastValidTo: "2026-11-20" });
  });

  it("handles an empty list", () => {
    expect(selectWeeklyMenu([], "2026-11-04")).toEqual({ status: "none", lastValidTo: undefined });
  });
});

describe("Sanity mappers", () => {
  it("maps menus with several dishes, optional prices, notes and closed days", () => {
    const [menu] = mapWeeklyMenus([
      {
        validFrom: "2026-11-09",
        validTo: "2026-11-13",
        notes: ["Änderungen vorbehalten.", "  ", null],
        days: [
          { date: "2026-11-10", dishes: [{ name: "Gulasch", price: 9.5 }, { name: "Salat", description: "klein" }] },
          { date: "2026-11-09", dishes: [{ name: " Eintopf ", price: 6.2 }] },
          { date: "2026-11-11", closed: true, dishes: [{ name: "ignored" }] },
          { dishes: [{ name: "no date" }] },
        ],
      },
      { validFrom: "2026-11-16" }, // incomplete: dropped
    ]);
    expect(menu.notes).toEqual(["Änderungen vorbehalten."]);
    expect(menu.days.map((d) => d.date)).toEqual(["2026-11-09", "2026-11-10", "2026-11-11"]);
    expect(menu.days[0].dishes).toEqual([{ name: "Eintopf", description: undefined, priceEur: 6.2 }]);
    expect(menu.days[1].dishes[1]).toEqual({ name: "Salat", description: "klein", priceEur: undefined });
    expect(menu.days[2]).toMatchObject({ closed: true, dishes: [] });
  });

  it("maps opening hours, treating special hours without times as closed", () => {
    const data = mapOpeningHours({
      monday: { open: "08:00", close: "17:00" },
      wednesday: { closed: true },
      lunchFrom: "11:30",
      lunchTo: "14:00",
      exceptions: [
        { from: "2026-12-24", to: "2026-12-26", closed: true, reason: "Weihnachten" },
        { from: "2026-11-06", closed: false, open: "10:00", close: "13:00" },
        { from: "2026-11-20", closed: false },
      ],
      notice: { text: " " },
    })!;
    expect(data.regular[1]).toEqual({ open: "08:00", close: "17:00" });
    expect(data.regular[3]).toBeNull();
    expect(data.regular[2]).toBeNull(); // missing weekday = no hours published
    expect(data.lunch).toEqual({ open: "11:30", close: "14:00" });
    expect(data.exceptions[1]).toMatchObject({ from: "2026-11-06", to: "2026-11-06", closed: false });
    expect(data.exceptions[2]).toMatchObject({ closed: true });
    expect(data.notice).toBeUndefined();
  });

  it("hides invisible offers and empty groups", () => {
    const groups = mapStandingOffers({
      groups: [
        { title: "Kaffee und Kuchen", items: [{ title: "Kaffee", price: 2.8 }, { title: "Alt", visible: false }] },
        { title: "Leer", items: [{ title: "Weg", visible: false }] },
      ],
    });
    expect(groups).toEqual([{ title: "Kaffee und Kuchen", offers: [{ title: "Kaffee", detail: undefined, when: undefined, priceEur: 2.8 }] }]);
  });

  it("derives tel: link and directions from contact details, or rejects incomplete data", () => {
    const c = mapContactInfo({ phone: "03441 2 79 77 78", street: "Röntgenstraße 1", postalCode: "06712", city: "Zeitz" })!;
    expect(c.phone.href).toBe("tel:+4934412797778");
    expect(c.address.street).toBe("Röntgenstraße 1");
    expect(c.directionsUrl).toContain("R%C3%B6ntgenstra%C3%9Fe%201%2C%2006712%20Zeitz");
    expect(mapContactInfo({ phone: "123" })).toBeNull();
  });
});

describe("Studio validation rules", () => {
  it("checks times and ranges", () => {
    expect(validateTime("08:00", true)).toBe(true);
    expect(validateTime("8 Uhr", true)).not.toBe(true);
    expect(validateTime(undefined, false)).toBe(true);
    expect(validateTimeRange({ open: "17:00", close: "08:00" })).not.toBe(true);
    expect(validateTimeRange({ closed: true })).toBe(true);
  });

  it("checks menu days against the date range and duplicates", () => {
    expect(validateMenuDays([{ date: "2026-11-02" }, { date: "2026-11-03" }], "2026-11-02", "2026-11-06")).toBe(true);
    expect(validateMenuDays([{ date: "2026-11-02" }, { date: "2026-11-02" }], "2026-11-02", "2026-11-06")).toMatch(/doppelt/);
    expect(validateMenuDays([{ date: "2026-11-09" }], "2026-11-02", "2026-11-06")).toMatch(/nach dem Ende/);
    expect(validateMenuDays([], "2026-11-02", "2026-11-06")).not.toBe(true);
  });

  it("checks prices", () => {
    expect(validatePrice(10.9)).toBe(true);
    expect(validatePrice(undefined)).toBe(true);
    expect(validatePrice(-1)).not.toBe(true);
    expect(validatePrice(1.234)).not.toBe(true);
  });

  it("detects overlapping weeks", () => {
    expect(rangesOverlap("2026-11-02", "2026-11-06", "2026-11-06", "2026-11-10")).toBe(true);
    expect(rangesOverlap("2026-11-02", "2026-11-06", "2026-11-07", "2026-11-13")).toBe(false);
  });
});

describe("initial CMS import file", () => {
  it("contains exactly the verified legacy facts (no weekly menu, no invented items)", async () => {
    const { readFileSync } = await import("node:fs");
    const { contactFixture, openingHoursFixture } = await import("@/data/site-fixtures");
    const { standingOfferGroupsFixture } = await import("@/data/standing-offers");
    const docs = readFileSync("sanity/seed/initial-content.ndjson", "utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => JSON.parse(line));
    expect(docs.map((d) => d._id).sort()).toEqual(["contactInfo", "openingHours", "standingOffers"]);
    const byId = Object.fromEntries(docs.map((d) => [d._id, d]));
    expect(mapContactInfo(byId.contactInfo)).toEqual(contactFixture);
    expect(mapOpeningHours(byId.openingHours)).toEqual({ ...openingHoursFixture, notice: undefined });
    expect(mapStandingOffers(byId.standingOffers)).toEqual(
      standingOfferGroupsFixture.map((g) => ({
        title: g.title,
        offers: g.offers.map((o) => ({ title: o.title, detail: o.detail, when: o.when, priceEur: undefined })),
      })),
    );
  });
});
