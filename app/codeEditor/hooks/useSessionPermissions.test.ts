import { renderHook } from "@testing-library/react";
import { useSessionPermissions } from "./useSessionPermissions";

describe("useSessionPermissions", () => {
  it("owner gets all permissions", () => {
    const { result } = renderHook(() =>
      useSessionPermissions({
        ownerEmail: "o@x.io",
        userEmail: "o@x.io",
        role: null,
      }),
    );
    expect(result.current).toMatchObject({
      isOwner: true,
      canEdit: true,
      canExecute: true,
      canSave: true,
      canChangeRoles: true,
      role: null,
    });
  });

  it("VIEW_EDIT_EXECUTE: edit + execute, no save, no role change", () => {
    const { result } = renderHook(() =>
      useSessionPermissions({
        ownerEmail: "o@x.io",
        userEmail: "u@x.io",
        role: "VIEW_EDIT_EXECUTE",
      }),
    );
    expect(result.current.canEdit).toBe(true);
    expect(result.current.canExecute).toBe(true);
    expect(result.current.canSave).toBe(false);
    expect(result.current.canChangeRoles).toBe(false);
  });

  it("VIEW: read-only", () => {
    const { result } = renderHook(() =>
      useSessionPermissions({
        ownerEmail: "o@x.io",
        userEmail: "u@x.io",
        role: "VIEW",
      }),
    );
    expect(result.current.canEdit).toBe(false);
    expect(result.current.canExecute).toBe(false);
    expect(result.current.canSave).toBe(false);
  });

  it("memoizes across rerenders with same inputs", () => {
    const { result, rerender } = renderHook(
      (props: { role: "VIEW" | "VIEW_EDIT" }) =>
        useSessionPermissions({ ownerEmail: "o", userEmail: "u", role: props.role }),
      { initialProps: { role: "VIEW" } },
    );
    const first = result.current;
    rerender({ role: "VIEW" });
    expect(result.current).toBe(first);
    rerender({ role: "VIEW_EDIT" });
    expect(result.current).not.toBe(first);
  });
});
