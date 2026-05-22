import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

import SessionsHero from "./SessionsHero";
import type { SessionSummary } from "@/app/codeEditor/api";

const session: SessionSummary = {
  id: "s1",
  name: "Backend pairing",
  language: "typescript",
  inviteCode: "AAAA1111",
  ownerEmail: "owner@x.io",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const baseProps = {
  sessions: null,
  isLoading: true,
  currentUserEmail: "owner@x.io",
  onCreateClick: jest.fn(),
  onJoinClick: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe("SessionsHero", () => {
  it("renders CTA buttons", () => {
    render(<SessionsHero {...baseProps} />);
    expect(screen.getByRole("button", { name: /Crear sesión/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Unirse con código/i })).toBeInTheDocument();
  });

  it("calls onCreateClick", () => {
    render(<SessionsHero {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Crear sesión/i }));
    expect(baseProps.onCreateClick).toHaveBeenCalledTimes(1);
  });

  it("calls onJoinClick", () => {
    render(<SessionsHero {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Unirse con código/i }));
    expect(baseProps.onJoinClick).toHaveBeenCalledTimes(1);
  });

  it("shows empty state when sessions is empty array", () => {
    render(<SessionsHero {...baseProps} sessions={[]} isLoading={false} />);
    expect(screen.getByText(/Aún no tienes sesiones/)).toBeInTheDocument();
  });

  it("hides session count badge when no sessions", () => {
    render(<SessionsHero {...baseProps} sessions={[]} isLoading={false} />);
    expect(screen.queryByText(/^\d+ sesion/i)).toBeNull();
  });

  it("renders session rows when sessions present", () => {
    render(
      <SessionsHero {...baseProps} sessions={[session]} isLoading={false} />,
    );
    expect(screen.getByText("Backend pairing")).toBeInTheDocument();
  });

  it("shows session count badge", () => {
    render(
      <SessionsHero {...baseProps} sessions={[session]} isLoading={false} />,
    );
    expect(screen.getByText(/1 sesión/)).toBeInTheDocument();
  });

  it("shows Owner badge for owner session", () => {
    render(
      <SessionsHero
        {...baseProps}
        sessions={[session]}
        isLoading={false}
        currentUserEmail="owner@x.io"
      />,
    );
    expect(screen.getByText("Owner")).toBeInTheDocument();
  });

  it("does not show Owner badge for guest session", () => {
    render(
      <SessionsHero
        {...baseProps}
        sessions={[session]}
        isLoading={false}
        currentUserEmail="guest@x.io"
      />,
    );
    expect(screen.queryByText("Owner")).toBeNull();
  });

  it("shows plural badge for multiple sessions", () => {
    render(
      <SessionsHero
        {...baseProps}
        sessions={[session, { ...session, id: "s2", name: "S2" }]}
        isLoading={false}
      />,
    );
    expect(screen.getByText(/2 sesiones/)).toBeInTheDocument();
  });

  it("renders link to /sessions", () => {
    render(<SessionsHero {...baseProps} sessions={[]} isLoading={false} />);
    expect(screen.getByRole("link", { name: /Ver todas/i })).toHaveAttribute(
      "href",
      "/sessions",
    );
  });
});
