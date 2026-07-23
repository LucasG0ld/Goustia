import { describe, expect, it } from "vitest";

import {
  adjacentIsoWeek,
  currentIsoWeekStart,
  isoWeekEnd,
  localIsoDateAt,
  startOfIsoWeek,
} from "./week";

describe("ISO planning weeks", () => {
  it("crosses years without duplicating a week", () => {
    expect(startOfIsoWeek("2027-01-01")).toBe("2026-12-28");
    expect(adjacentIsoWeek("2026-12-28", "next")).toBe("2027-01-04");
    expect(adjacentIsoWeek("2027-01-04", "previous")).toBe("2026-12-28");
    expect(isoWeekEnd("2026-12-28")).toBe("2027-01-03");
  });

  it("uses Europe/Paris explicitly around daylight-saving changes", () => {
    expect(localIsoDateAt(new Date("2026-03-29T22:30:00Z"))).toBe("2026-03-30");
    expect(currentIsoWeekStart(new Date("2026-03-29T22:30:00Z"))).toBe(
      "2026-03-30",
    );
    expect(localIsoDateAt(new Date("2026-10-25T23:30:00Z"))).toBe("2026-10-26");
  });

  it("rejects a non-Monday navigation anchor", () => {
    expect(() => adjacentIsoWeek("2026-07-21", "next")).toThrow();
  });
});
