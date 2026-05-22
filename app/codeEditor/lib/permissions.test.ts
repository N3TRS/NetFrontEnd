import {
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  canChangeRoles,
  canEdit,
  canExecute,
  canSave,
  isOwner,
  type PermissionLevel,
} from "./permissions";

describe("ASSIGNABLE_ROLES", () => {
  it("does not include OWNER", () => {
    expect(ASSIGNABLE_ROLES).not.toContain("OWNER");
  });
  it("has stable label per role", () => {
    ASSIGNABLE_ROLES.forEach((r) => expect(ROLE_LABELS[r]).toBeTruthy());
  });
});

describe("isOwner", () => {
  it("matches when emails are equal", () => {
    expect(isOwner("a@x.com", "a@x.com")).toBe(true);
  });
  it("rejects mismatched emails", () => {
    expect(isOwner("a@x.com", "b@x.com")).toBe(false);
  });
  it.each([
    [null, "a@x.com"],
    ["a@x.com", null],
    [undefined, undefined],
    ["", "a@x.com"],
  ])("returns false for missing inputs (%p, %p)", (a, b) => {
    expect(isOwner(a as string | null, b as string | null)).toBe(false);
  });
});

describe("canEdit", () => {
  it("owner can always edit even with no role", () => {
    expect(canEdit(null, "o@x.com", "o@x.com")).toBe(true);
  });
  it("returns false when role is missing and user is not owner", () => {
    expect(canEdit(null, "o@x.com", "u@x.com")).toBe(false);
    expect(canEdit(undefined, "o@x.com", "u@x.com")).toBe(false);
  });
  it("VIEW cannot edit", () => {
    expect(canEdit("VIEW", "o@x.com", "u@x.com")).toBe(false);
  });
  it.each<PermissionLevel>([
    "VIEW_EDIT",
    "VIEW_EDIT_EXECUTE",
    "VIEW_EDIT_EXECUTE_SAVE",
  ])("role %s can edit", (role) => {
    expect(canEdit(role, "o@x.com", "u@x.com")).toBe(true);
  });
});

describe("canExecute", () => {
  it("owner can execute", () => {
    expect(canExecute(null, "o@x.com", "o@x.com")).toBe(true);
  });
  it.each<[PermissionLevel, boolean]>([
    ["VIEW", false],
    ["VIEW_EDIT", false],
    ["VIEW_EDIT_EXECUTE", true],
    ["VIEW_EDIT_EXECUTE_SAVE", true],
    ["OWNER", true],
  ])("role %s -> %s", (role, expected) => {
    expect(canExecute(role, "o@x.com", "u@x.com")).toBe(expected);
  });
});

describe("canSave", () => {
  it("owner can save", () => {
    expect(canSave(null, "o@x.com", "o@x.com")).toBe(true);
  });
  it.each<[PermissionLevel, boolean]>([
    ["VIEW", false],
    ["VIEW_EDIT", false],
    ["VIEW_EDIT_EXECUTE", false],
    ["VIEW_EDIT_EXECUTE_SAVE", true],
    ["OWNER", true],
  ])("role %s -> %s", (role, expected) => {
    expect(canSave(role, "o@x.com", "u@x.com")).toBe(expected);
  });
});

describe("canChangeRoles", () => {
  it("only owner can change roles", () => {
    expect(canChangeRoles("o@x.com", "o@x.com")).toBe(true);
    expect(canChangeRoles("o@x.com", "u@x.com")).toBe(false);
  });
});
