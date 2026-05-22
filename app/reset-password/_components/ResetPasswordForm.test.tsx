import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

let hookState = {
  token: "valid-token",
  newPassword: "",
  confirmPassword: "",
  setNewPassword: jest.fn(),
  setConfirmPassword: jest.fn(),
  handleReset: jest.fn((e: React.SyntheticEvent) => e.preventDefault()),
  isPending: false,
  success: false,
  error: null as string | null,
};
jest.mock("../_hooks/resetPasswordHook", () => ({
  useResetPassword: () => hookState,
}));

import ResetPasswordForm from "./ResetPasswordForm";

beforeEach(() => {
  hookState = {
    token: "valid-token",
    newPassword: "",
    confirmPassword: "",
    setNewPassword: jest.fn(),
    setConfirmPassword: jest.fn(),
    handleReset: jest.fn((e: React.SyntheticEvent) => e.preventDefault()),
    isPending: false,
    success: false,
    error: null,
  };
});

describe("ResetPasswordForm", () => {
  it("renders password form when token present", () => {
    render(<ResetPasswordForm />);
    expect(screen.getByRole("heading", { name: "Nueva contraseña" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nueva contraseña")).toBeInTheDocument();
    expect(screen.getByLabelText("Confirmar contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Restablecer/i })).toBeInTheDocument();
  });

  it("shows invalid token state when token is empty", () => {
    hookState.token = "";
    render(<ResetPasswordForm />);
    expect(screen.getByText("Enlace inválido")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Solicitar nuevo enlace/i })).toBeInTheDocument();
  });

  it("shows success state", () => {
    hookState.success = true;
    render(<ResetPasswordForm />);
    expect(screen.getByText(/Contraseña actualizada/)).toBeInTheDocument();
  });

  it("calls setNewPassword on input change", () => {
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText("Nueva contraseña"), {
      target: { value: "MyPass1!" },
    });
    expect(hookState.setNewPassword).toHaveBeenCalledWith("MyPass1!");
  });

  it("calls setConfirmPassword on input change", () => {
    render(<ResetPasswordForm />);
    fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
      target: { value: "MyPass1!" },
    });
    expect(hookState.setConfirmPassword).toHaveBeenCalledWith("MyPass1!");
  });

  it("shows error message when error prop set", () => {
    hookState.error = "Las contraseñas no coinciden.";
    render(<ResetPasswordForm />);
    expect(screen.getByText("Las contraseñas no coinciden.")).toBeInTheDocument();
  });

  it("calls handleReset on form submit", () => {
    render(<ResetPasswordForm />);
    fireEvent.submit(screen.getByRole("button", { name: /Restablecer/i }).closest("form")!);
    expect(hookState.handleReset).toHaveBeenCalledTimes(1);
  });

  it("disables button and shows 'Guardando…' when isPending", () => {
    hookState.isPending = true;
    render(<ResetPasswordForm />);
    expect(screen.getByRole("button", { name: /Guardando/i })).toBeDisabled();
  });

  it("toggles password visibility", () => {
    render(<ResetPasswordForm />);
    const passwordInput = screen.getByLabelText("Nueva contraseña");
    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByLabelText("Mostrar contraseña"));
    expect(passwordInput).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByLabelText("Ocultar contraseña"));
    expect(passwordInput).toHaveAttribute("type", "password");
  });
});
