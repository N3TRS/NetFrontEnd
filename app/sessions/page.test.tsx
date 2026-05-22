import { fireEvent, render, screen } from "@testing-library/react";
import type { SessionSummary } from "@/app/codeEditor/api";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock("@/app/auth/_hooks/useAuth", () => ({
  useAuth: () => ({ token: "tk", user: { email: "u@x.io" } }),
}));

const refetchMock = jest.fn();
const updateSessionNameMock = jest.fn();
const removeSessionMock = jest.fn();
let mySessionsState = {
  sessions: null as SessionSummary[] | null,
  isLoading: true,
  error: null as string | null,
  refetch: refetchMock,
  updateSessionName: updateSessionNameMock,
  removeSession: removeSessionMock,
};
jest.mock("./_hooks/useMySessions", () => ({
  useMySessions: () => mySessionsState,
}));

const resetCreateStateMock = jest.fn();
const resetJoinStateMock = jest.fn();
const handleCreateSessionMock = jest.fn();
const handleJoinSessionMock = jest.fn();
let sessionActionsState = {
  sessionName: "",
  setSessionName: jest.fn(),
  language: "typescript",
  setLanguage: jest.fn(),
  inviteCode: "",
  setInviteCode: jest.fn(),
  isCreating: false,
  isJoining: false,
  createError: null,
  joinError: null,
  canCreate: false,
  canJoin: false,
  handleCreateSession: handleCreateSessionMock,
  handleJoinSession: handleJoinSessionMock,
  resetCreateState: resetCreateStateMock,
  resetJoinState: resetJoinStateMock,
};
jest.mock("@/app/dashboard/_hooks/useSessionActions", () => ({
  useSessionActions: () => sessionActionsState,
}));

// Stub heavy child components
jest.mock("./_components/SessionCard", () => ({
  __esModule: true,
  default: ({ session }: { session: SessionSummary }) => (
    <div data-testid="session-card">{session.name}</div>
  ),
}));
jest.mock("@/app/dashboard/_components/CreateSessionModal", () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div data-testid="create-modal"><button onClick={onClose}>close-create</button></div> : null,
}));
jest.mock("@/app/dashboard/_components/JoinSessionModal", () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div data-testid="join-modal"><button onClick={onClose}>close-join</button></div> : null,
}));

const sample: SessionSummary = {
  id: "s1",
  name: "Session A",
  language: "typescript",
  inviteCode: "AAAA1111",
  ownerEmail: "u@x.io",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-02T00:00:00Z",
};

import SessionsListPage from "./page";

beforeEach(() => {
  jest.clearAllMocks();
  mySessionsState = {
    sessions: null,
    isLoading: true,
    error: null,
    refetch: refetchMock,
    updateSessionName: updateSessionNameMock,
    removeSession: removeSessionMock,
  };
});

describe("SessionsListPage", () => {
  it("renders heading", () => {
    render(<SessionsListPage />);
    expect(screen.getByText("Mis sesiones")).toBeInTheDocument();
  });

  it("shows skeleton when loading", () => {
    const { container } = render(<SessionsListPage />);
    expect(container.querySelectorAll(".animate-pulse").length).toBeGreaterThan(0);
  });

  it("shows error state with retry button", () => {
    mySessionsState = { ...mySessionsState, isLoading: false, error: "Failed to fetch" };
    render(<SessionsListPage />);
    expect(screen.getByText("Failed to fetch")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Reintentar/i })).toBeInTheDocument();
  });

  it("calls refetch on Reintentar click", () => {
    mySessionsState = { ...mySessionsState, isLoading: false, error: "err" };
    render(<SessionsListPage />);
    fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it("calls refetch on refresh icon button", () => {
    mySessionsState = { ...mySessionsState, sessions: [], isLoading: false };
    render(<SessionsListPage />);
    fireEvent.click(screen.getByTitle("Actualizar"));
    expect(refetchMock).toHaveBeenCalledTimes(1);
  });

  it("shows empty sessions state", () => {
    mySessionsState = { ...mySessionsState, sessions: [], isLoading: false };
    render(<SessionsListPage />);
    expect(screen.getByText(/Aún no tienes sesiones/)).toBeInTheDocument();
  });

  it("renders session cards when sessions present", () => {
    mySessionsState = { ...mySessionsState, sessions: [sample], isLoading: false };
    render(<SessionsListPage />);
    expect(screen.getByTestId("session-card")).toBeInTheDocument();
    expect(screen.getByText("Session A")).toBeInTheDocument();
  });

  it("shows session count", () => {
    mySessionsState = { ...mySessionsState, sessions: [sample], isLoading: false };
    render(<SessionsListPage />);
    expect(screen.getByText(/1 sesión/)).toBeInTheDocument();
  });

  it("filters sessions by search query", () => {
    const s2 = { ...sample, id: "s2", name: "Other Session" };
    mySessionsState = { ...mySessionsState, sessions: [sample, s2], isLoading: false };
    render(<SessionsListPage />);
    fireEvent.change(screen.getByPlaceholderText(/Buscar por nombre/i), {
      target: { value: "Other" },
    });
    expect(screen.getByText("Other Session")).toBeInTheDocument();
    expect(screen.queryByText("Session A")).toBeNull();
  });

  it("shows empty search state and clears search", () => {
    mySessionsState = { ...mySessionsState, sessions: [sample], isLoading: false };
    render(<SessionsListPage />);
    fireEvent.change(screen.getByPlaceholderText(/Buscar por nombre/i), {
      target: { value: "zzz" },
    });
    expect(screen.getByText(/Sin resultados/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Limpiar búsqueda/i }));
    expect(screen.getByText("Session A")).toBeInTheDocument();
  });

  it("changes sort order", () => {
    mySessionsState = { ...mySessionsState, sessions: [sample], isLoading: false };
    render(<SessionsListPage />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "name" } });
    // after changing, session still visible
    expect(screen.getByText("Session A")).toBeInTheDocument();
  });

  it("opens and closes create modal", () => {
    mySessionsState = { ...mySessionsState, sessions: [], isLoading: false };
    render(<SessionsListPage />);
    fireEvent.click(screen.getAllByRole("button", { name: /Crear sesión/i })[0]);
    expect(screen.getByTestId("create-modal")).toBeInTheDocument();
    expect(resetCreateStateMock).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText("close-create"));
    expect(screen.queryByTestId("create-modal")).toBeNull();
  });

  it("opens and closes join modal", () => {
    mySessionsState = { ...mySessionsState, sessions: [], isLoading: false };
    render(<SessionsListPage />);
    fireEvent.click(screen.getByRole("button", { name: /Unirse/i }));
    expect(screen.getByTestId("join-modal")).toBeInTheDocument();
    expect(resetJoinStateMock).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText("close-join"));
    expect(screen.queryByTestId("join-modal")).toBeNull();
  });

  it("open create from empty state button", () => {
    mySessionsState = { ...mySessionsState, sessions: [], isLoading: false };
    render(<SessionsListPage />);
    const createBtns = screen.getAllByRole("button", { name: /Crear sesión/i });
    // click the one inside EmptySessions
    fireEvent.click(createBtns[createBtns.length - 1]);
    expect(screen.getByTestId("create-modal")).toBeInTheDocument();
  });
});
