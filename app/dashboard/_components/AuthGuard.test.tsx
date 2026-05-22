import { render, screen, waitFor } from "@testing-library/react";

const replaceMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

let authState = { isAuthenticated: false, isLoading: true };
jest.mock("@/app/auth/_hooks/useAuth", () => ({
  useAuth: () => ({ ...authState, user: null, token: null, logout: jest.fn(), refreshAuth: jest.fn() }),
}));

import AuthGuard from "./AuthGuard";

beforeEach(() => {
  replaceMock.mockReset();
});

describe("AuthGuard", () => {
  it("renders nothing while loading", () => {
    authState = { isAuthenticated: false, isLoading: true };
    const { container } = render(
      <AuthGuard>
        <div>secret</div>
      </AuthGuard>,
    );
    expect(container.textContent).toBe("");
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("redirects to /login when unauthenticated", async () => {
    authState = { isAuthenticated: false, isLoading: false };
    render(
      <AuthGuard>
        <div>secret</div>
      </AuthGuard>,
    );
    await waitFor(() => expect(replaceMock).toHaveBeenCalledWith("/login"));
  });

  it("renders children when authenticated", () => {
    authState = { isAuthenticated: true, isLoading: false };
    render(
      <AuthGuard>
        <div>secret</div>
      </AuthGuard>,
    );
    expect(screen.getByText("secret")).toBeInTheDocument();
  });
});
