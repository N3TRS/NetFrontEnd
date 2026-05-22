import { act, render, renderHook } from "@testing-library/react";
import { ReactNode } from "react";
import { ProjectProvider, useProject } from "./ProjectContext";

function wrapper({ children }: { children: ReactNode }) {
  return <ProjectProvider>{children}</ProjectProvider>;
}

describe("ProjectContext", () => {
  beforeEach(() => sessionStorage.clear());

  it("initial projectUrl is null when sessionStorage empty", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    expect(result.current.projectUrl).toBeNull();
  });

  it("hydrates initial state from sessionStorage", () => {
    sessionStorage.setItem("selected_project_url", "https://github.com/x/y");
    const { result } = renderHook(() => useProject(), { wrapper });
    expect(result.current.projectUrl).toBe("https://github.com/x/y");
  });

  it("setProjectUrl persists to sessionStorage and updates state", () => {
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => result.current.setProjectUrl("https://github.com/a/b"));
    expect(result.current.projectUrl).toBe("https://github.com/a/b");
    expect(sessionStorage.getItem("selected_project_url")).toBe(
      "https://github.com/a/b",
    );
  });

  it("clearProjectUrl removes from sessionStorage and clears state", () => {
    sessionStorage.setItem("selected_project_url", "x");
    const { result } = renderHook(() => useProject(), { wrapper });
    act(() => result.current.clearProjectUrl());
    expect(result.current.projectUrl).toBeNull();
    expect(sessionStorage.getItem("selected_project_url")).toBeNull();
  });

  it("useProject throws when used outside provider", () => {
    function Consumer() {
      useProject();
      return null;
    }
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Consumer />)).toThrow(
      "useProject must be used within ProjectProvider",
    );
    spy.mockRestore();
  });
});
