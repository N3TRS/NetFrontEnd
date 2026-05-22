import { getUserColor, hashEmail } from "./userColor";

const PALETTE = [
  "#7C3AED",
  "#F97316",
  "#2563EB",
  "#16A34A",
  "#DB2777",
  "#0891B2",
  "#CA8A04",
  "#DC2626",
];

describe("hashEmail", () => {
  it("returns 0 for empty string", () => {
    expect(hashEmail("")).toBe(0);
  });
  it("returns positive integer", () => {
    const h = hashEmail("alice@example.com");
    expect(h).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(h)).toBe(true);
  });
  it("is deterministic", () => {
    expect(hashEmail("bob@x.io")).toBe(hashEmail("bob@x.io"));
  });
  it("differs for different inputs", () => {
    expect(hashEmail("a@x.io")).not.toBe(hashEmail("b@x.io"));
  });
});

describe("getUserColor", () => {
  it("returns a color from the palette", () => {
    expect(PALETTE).toContain(getUserColor("anyone@x.io"));
  });
  it("is deterministic for same input", () => {
    expect(getUserColor("c@x.io")).toBe(getUserColor("c@x.io"));
  });
  it("distributes across palette for many inputs", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 64; i += 1) seen.add(getUserColor(`user${i}@x.io`));
    expect(seen.size).toBeGreaterThan(1);
  });
});
