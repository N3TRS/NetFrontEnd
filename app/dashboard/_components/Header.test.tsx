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

let authState = {
  user: null as { email: string; avatarUrl?: string } | null,
  logout: jest.fn(),
};

jest.mock("@/app/auth/_hooks/useAuth", () => ({
  useAuth: () => ({ ...authState }),
}));

import NavBar from "./Header";

beforeEach(() => {
  pushMock.mockReset();
  authState.logout = jest.fn();
  authState.user = null;
});

describe("NavBar", () => {
  it("renders brand link and nav items", () => {
    render(<NavBar />);
    expect(screen.getByText("OmniCode")).toBeInTheDocument();
    expect(screen.getByText("Sesiones")).toBeInTheDocument();
  });

  it("shows UserCircle icon when no avatarUrl", () => {
    authState.user = { email: "u@x.io" };
    render(<NavBar />);
    expect(screen.getByLabelText("Menú de usuario")).toBeInTheDocument();
    // no img tag for avatar
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("shows avatar image when avatarUrl present", () => {
    authState.user = { email: "u@x.io", avatarUrl: "https://cdn.example.com/av.png" };
    render(<NavBar />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "https://cdn.example.com/av.png");
    expect(img).toHaveAttribute("alt", "u@x.io");
  });

  it("opens menu on avatar button click", () => {
    authState.user = { email: "u@x.io" };
    render(<NavBar />);
    expect(screen.queryByText("u@x.io")).toBeNull();
    fireEvent.click(screen.getByLabelText("Menú de usuario"));
    expect(screen.getByText("u@x.io")).toBeInTheDocument();
  });

  it("closes menu on second click", () => {
    authState.user = { email: "u@x.io" };
    render(<NavBar />);
    fireEvent.click(screen.getByLabelText("Menú de usuario"));
    fireEvent.click(screen.getByLabelText("Menú de usuario"));
    expect(screen.queryByText("u@x.io")).toBeNull();
  });

  it("calls logout and pushes to / when Cerrar Sesión clicked", () => {
    authState.user = { email: "u@x.io" };
    render(<NavBar />);
    fireEvent.click(screen.getByLabelText("Menú de usuario"));
    fireEvent.click(screen.getByText("Cerrar Sesión"));
    expect(authState.logout).toHaveBeenCalledTimes(1);
    expect(pushMock).toHaveBeenCalledWith("/");
  });

  it("closes menu on outside click", async () => {
    authState.user = { email: "u@x.io" };
    render(<NavBar />);
    fireEvent.click(screen.getByLabelText("Menú de usuario"));
    expect(screen.getByText("u@x.io")).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    await waitFor(() => expect(screen.queryByText("u@x.io")).toBeNull());
  });
});
