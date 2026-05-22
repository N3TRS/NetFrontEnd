import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));

jest.mock("@/components/mode-toggle", () => ({
  ModeToggle: () => <div data-testid="mode-toggle" />,
}));

let authState = {
  user: null as { email: string; avatarUrl?: string } | null,
  logout: jest.fn(),
};
jest.mock("@/app/auth/_hooks/useAuth", () => ({
  useAuth: () => ({ ...authState }),
}));

import HeaderRunning from "./Header";

beforeEach(() => {
  pushMock.mockReset();
  authState = { user: null, logout: jest.fn() };
});

describe("HeaderRunning", () => {
  it("renders brand link", () => {
    render(<HeaderRunning />);
    expect(screen.getByText("OmniCode")).toBeInTheDocument();
  });

  it("renders ModeToggle", () => {
    render(<HeaderRunning />);
    expect(screen.getByTestId("mode-toggle")).toBeInTheDocument();
  });

  it("shows UserCircle when no avatarUrl", () => {
    authState.user = { email: "u@x.io" };
    render(<HeaderRunning />);
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByLabelText("Menú de usuario")).toBeInTheDocument();
  });

  it("shows avatar image when avatarUrl present", () => {
    authState.user = { email: "u@x.io", avatarUrl: "https://cdn.example.com/av.png" };
    render(<HeaderRunning />);
    expect(screen.getByRole("img")).toHaveAttribute("src", "https://cdn.example.com/av.png");
  });

  it("opens menu on button click", () => {
    authState.user = { email: "u@x.io" };
    render(<HeaderRunning />);
    expect(screen.queryByText("u@x.io")).toBeNull();
    fireEvent.click(screen.getByLabelText("Menú de usuario"));
    expect(screen.getByText("u@x.io")).toBeInTheDocument();
  });

  it("toggles menu closed on second click", () => {
    authState.user = { email: "u@x.io" };
    render(<HeaderRunning />);
    fireEvent.click(screen.getByLabelText("Menú de usuario"));
    fireEvent.click(screen.getByLabelText("Menú de usuario"));
    expect(screen.queryByText("u@x.io")).toBeNull();
  });

  it("calls logout and pushes to / when Cerrar Sesión clicked", () => {
    authState.user = { email: "u@x.io" };
    render(<HeaderRunning />);
    fireEvent.click(screen.getByLabelText("Menú de usuario"));
    fireEvent.click(screen.getByText("Cerrar Sesión"));
    expect(authState.logout).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("closes menu on outside click", async () => {
    authState.user = { email: "u@x.io" };
    render(<HeaderRunning />);
    fireEvent.click(screen.getByLabelText("Menú de usuario"));
    expect(screen.getByText("u@x.io")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    await waitFor(() => expect(screen.queryByText("u@x.io")).toBeNull());
  });

  it("opens menu with Enter key on avatar button", () => {
    authState.user = { email: "u@x.io" };
    render(<HeaderRunning />);
    fireEvent.keyDown(screen.getByLabelText("Menú de usuario"), { key: "Enter" });
    expect(screen.getByText("u@x.io")).toBeInTheDocument();
  });

  it("closes menu with Escape key on avatar button", () => {
    authState.user = { email: "u@x.io" };
    render(<HeaderRunning />);
    fireEvent.click(screen.getByLabelText("Menú de usuario"));
    fireEvent.keyDown(screen.getByLabelText("Menú de usuario"), { key: "Escape" });
    expect(screen.queryByText("u@x.io")).toBeNull();
  });

  it("logout button: Enter key triggers logout", () => {
    authState.user = { email: "u@x.io" };
    render(<HeaderRunning />);
    fireEvent.click(screen.getByLabelText("Menú de usuario"));
    fireEvent.keyDown(screen.getByText("Cerrar Sesión"), { key: "Enter" });
    expect(authState.logout).toHaveBeenCalledTimes(1);
  });

  it("logout button: Escape key closes menu without logging out", () => {
    authState.user = { email: "u@x.io" };
    render(<HeaderRunning />);
    fireEvent.click(screen.getByLabelText("Menú de usuario"));
    fireEvent.keyDown(screen.getByText("Cerrar Sesión"), { key: "Escape" });
    expect(authState.logout).not.toHaveBeenCalled();
    expect(screen.queryByText("u@x.io")).toBeNull();
  });
});
