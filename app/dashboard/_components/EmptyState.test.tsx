import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("@/components/ui/animated-shader-hero", () => ({
  useShaderBackground: () => ({ current: null }),
}));

import EmptyState from "./EmptyState";

describe("EmptyState", () => {
  it("renders heading + CTA", () => {
    render(<EmptyState onSelectProject={jest.fn()} />);
    expect(screen.getByText(/No tienes sesiones activas/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Seleccionar Repositorio/i })).toBeInTheDocument();
  });

  it("calls onSelectProject when CTA clicked", () => {
    const cb = jest.fn();
    render(<EmptyState onSelectProject={cb} />);
    fireEvent.click(screen.getByRole("button", { name: /Seleccionar Repositorio/i }));
    expect(cb).toHaveBeenCalledTimes(1);
  });
});
