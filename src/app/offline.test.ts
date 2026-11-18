import { describe, expect, it } from "vitest";
import { isStale, readinessText } from "./offline";

const data = { builtOn: "2026-11-13", env: { snapshotTo: "2026-10" } } as Parameters<typeof readinessText>[1];

describe("readinessText", () => {
  it.each([
    [{ state: "checking" } as const, null],
    [{ state: "unavailable" } as const, "Offline copy isn't available in this browser"],
    [{ state: "preparing", saved: 12, total: 30 } as const, "Preparing for offline… 12 of 30 items"],
    [{ state: "ready", total: 30 } as const, "Ready offline · 30 items · supply data through Oct 2026"],
    [{ state: "stale" } as const, "Offline copy is from Nov 13; reconnect to refresh"],
  ])("%o", (r, text) => expect(readinessText(r, data)).toBe(text));
});

describe("isStale", () => {
  it.each([
    ["2026-11-20", false, false], // exactly 7 days old
    ["2026-11-21", false, true],
    ["2026-11-21", true, false], // online: the service worker refreshes it
    ["2026-11-13", false, false],
  ])("today %s, online %s → %s", (today, online, stale) =>
    expect(isStale("2026-11-13", today, online)).toBe(stale),
  );
});
