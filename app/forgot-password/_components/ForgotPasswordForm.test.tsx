import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

let hookState = {
  email: "",
  setEmail: jest.fn(),
  handleForgot: jest.fn((e: React.SyntheticEvent) => e.preventDefault()),
  isPending: false,
  submitted: false,
};
jest.mock("../_hooks/forgotPasswordHook", () => ({
  useForgotPassword: () => hookState,
}));

import ForgotPasswordForm from "./ForgotPasswordForm";

beforeEach(() => {
  hookState = {
    email: "",
    setEmail: jest.fn(),
    handleForgot: jest.fn((e: React.SyntheticEvent) => e.preventDefault()),
    isPending: false,
    submitted: false,
  };
});

describe("ForgotPasswordForm", () => {
  it("renders form with email input and submit button", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByText(/Olvidaste tu Contraseña/)).toBeInTheDocument();
    expect(screen.getByLabelText("Correo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Enviar enlace/i })).toBeInTheDocument();
  });

  it("shows success state when submitted", () => {
    hookState.submitted = true;
    hookState.email = "u@x.io";
    render(<ForgotPasswordForm />);
    expect(screen.getByText(/Revisa tu correo/)).toBeInTheDocument();
    expect(screen.getByText("u@x.io")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Volver al Inicio/i })).toBeInTheDocument();
  });

  it("calls setEmail on input change", () => {
    render(<ForgotPasswordForm />);
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "test@x.io" } });
    expect(hookState.setEmail).toHaveBeenCalledWith("test@x.io");
  });

  it("calls handleForgot on form submit", () => {
    render(<ForgotPasswordForm />);
    fireEvent.submit(screen.getByRole("button", { name: /Enviar enlace/i }).closest("form")!);
    expect(hookState.handleForgot).toHaveBeenCalledTimes(1);
  });

  it("disables button and shows 'Enviando…' when isPending", () => {
    hookState.isPending = true;
    render(<ForgotPasswordForm />);
    const btn = screen.getByRole("button", { name: /Enviando/i });
    expect(btn).toBeDisabled();
  });

  it("shows back-to-login link in form state", () => {
    render(<ForgotPasswordForm />);
    expect(screen.getByRole("link", { name: /Inicia Sesión/i })).toHaveAttribute("href", "/login");
  });
});
