import { fireEvent, render, screen } from "@testing-library/react";
import type { SessionSummary } from "@/app/codeEditor/api";

jest.mock("@/app/auth/_hooks/useAuth", () => ({
  useAuth: () => ({ token: "tk", user: { email: "u@x.io" } }),
}));

let mySessionsState = {
  sessions: [] as SessionSummary[] | null,
  isLoading: false,
};
jest.mock("@/app/sessions/_hooks/useMySessions", () => ({
  useMySessions: () => mySessionsState,
}));

const resetCreateStateMock = jest.fn();
const resetJoinStateMock = jest.fn();
jest.mock("./_hooks/useSessionActions", () => ({
  useSessionActions: () => ({
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
    handleCreateSession: jest.fn(),
    handleJoinSession: jest.fn(),
    resetCreateState: resetCreateStateMock,
    resetJoinState: resetJoinStateMock,
  }),
}));

jest.mock("./_components/EmptyState", () => ({
  __esModule: true,
  default: ({ onSelectProject }: { onSelectProject: () => void }) => (
    <button onClick={onSelectProject} data-testid="empty-state-btn">
      Select Project
    </button>
  ),
}));
jest.mock("./_components/SelectProject", () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="select-project">
        <button onClick={onClose}>close-select</button>
      </div>
    ) : null,
}));
jest.mock("./_components/CreateSessionModal", () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="create-modal">
        <button onClick={onClose}>close-create</button>
      </div>
    ) : null,
}));
jest.mock("./_components/JoinSessionModal", () => ({
  __esModule: true,
  default: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div data-testid="join-modal">
        <button onClick={onClose}>close-join</button>
      </div>
    ) : null,
}));
jest.mock("./_components/SessionsHero", () => ({
  __esModule: true,
  default: ({
    onCreateClick,
    onJoinClick,
  }: {
    onCreateClick: () => void;
    onJoinClick: () => void;
  }) => (
    <div data-testid="sessions-hero">
      <button onClick={onCreateClick}>hero-create</button>
      <button onClick={onJoinClick}>hero-join</button>
    </div>
  ),
}));

import Dashboard from "./page";

beforeEach(() => {
  jest.clearAllMocks();
  mySessionsState = { sessions: [], isLoading: false };
});

describe("Dashboard page", () => {
  it("renders without crash", () => {
    render(<Dashboard />);
    expect(screen.getByTestId("sessions-hero")).toBeInTheDocument();
  });

  it("opens create modal from SessionsHero and resets state", () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByText("hero-create"));
    expect(resetCreateStateMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("create-modal")).toBeInTheDocument();
  });

  it("closes create modal", () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByText("hero-create"));
    fireEvent.click(screen.getByText("close-create"));
    expect(screen.queryByTestId("create-modal")).toBeNull();
  });

  it("opens join modal from SessionsHero and resets state", () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByText("hero-join"));
    expect(resetJoinStateMock).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("join-modal")).toBeInTheDocument();
  });

  it("closes join modal", () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByText("hero-join"));
    fireEvent.click(screen.getByText("close-join"));
    expect(screen.queryByTestId("join-modal")).toBeNull();
  });

  it("opens SelectProject from EmptyState", () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByTestId("empty-state-btn"));
    expect(screen.getByTestId("select-project")).toBeInTheDocument();
  });

  it("closes SelectProject", () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByTestId("empty-state-btn"));
    fireEvent.click(screen.getByText("close-select"));
    expect(screen.queryByTestId("select-project")).toBeNull();
  });
});
