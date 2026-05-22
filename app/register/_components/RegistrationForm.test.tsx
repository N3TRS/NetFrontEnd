import { fireEvent, render, screen } from "@testing-library/react";

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

const handleGithubLoginMock = jest.fn();
jest.mock("../../login/_hooks/githubLoginHook", () => ({
  githubLoginHook: () => ({ handleGithubLogin: handleGithubLoginMock }),
}));

let signUpState = {
  name: "",
  email: "",
  password: "",
  setName: jest.fn(),
  setEmail: jest.fn(),
  setPassword: jest.fn(),
  handleSignUp: jest.fn((e: React.SyntheticEvent) => e.preventDefault()),
  isPending: false,
};
jest.mock("../_hooks/signUpHook", () => ({
  useSignUp: () => signUpState,
}));

import RegistrationForm from "./RegistrationForm";

beforeEach(() => {
  signUpState = {
    name: "",
    email: "",
    password: "",
    setName: jest.fn(),
    setEmail: jest.fn(),
    setPassword: jest.fn(),
    handleSignUp: jest.fn((e: React.SyntheticEvent) => e.preventDefault()),
    isPending: false,
  };
  handleGithubLoginMock.mockReset();
});

describe("RegistrationForm", () => {
  it("renders all form fields and buttons", () => {
    render(<RegistrationForm />);
    expect(screen.getByLabelText("Nombre de Usuario")).toBeInTheDocument();
    expect(screen.getByLabelText("Correo Electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Registrarse/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continuar con GitHub/i })).toBeInTheDocument();
  });

  it("calls handleGithubLogin on GitHub button click", () => {
    render(<RegistrationForm />);
    fireEvent.click(screen.getByRole("button", { name: /Continuar con GitHub/i }));
    expect(handleGithubLoginMock).toHaveBeenCalledTimes(1);
  });

  it("calls setName when fullName input changes", () => {
    render(<RegistrationForm />);
    fireEvent.change(screen.getByLabelText("Nombre de Usuario"), {
      target: { name: "fullName", value: "John" },
    });
    expect(signUpState.setName).toHaveBeenCalledWith("John");
  });

  it("calls setEmail when email input changes", () => {
    render(<RegistrationForm />);
    fireEvent.change(screen.getByLabelText("Correo Electrónico"), {
      target: { name: "email", value: "j@x.io" },
    });
    expect(signUpState.setEmail).toHaveBeenCalledWith("j@x.io");
  });

  it("calls setPassword when password input changes", () => {
    render(<RegistrationForm />);
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { name: "password", value: "Secret1!" },
    });
    expect(signUpState.setPassword).toHaveBeenCalledWith("Secret1!");
  });

  it("calls onPasswordChange callback", () => {
    const onPasswordChange = jest.fn();
    render(<RegistrationForm onPasswordChange={onPasswordChange} />);
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { name: "password", value: "abc" },
    });
    expect(onPasswordChange).toHaveBeenCalledWith("abc");
  });

  it("shows password rules when password field focused", () => {
    render(<RegistrationForm />);
    expect(screen.queryByText(/Mínimo 8 caracteres/)).toBeNull();
    fireEvent.focus(screen.getByLabelText("Contraseña"));
    expect(screen.getByText(/Mínimo 8 caracteres/)).toBeInTheDocument();
  });

  it("toggles password visibility and calls onPasswordVisibilityChange", () => {
    const onPasswordVisibilityChange = jest.fn();
    render(<RegistrationForm onPasswordVisibilityChange={onPasswordVisibilityChange} />);
    const passwordInput = screen.getByLabelText("Contraseña");
    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByLabelText("Show password"));
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(onPasswordVisibilityChange).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByLabelText("Hide password"));
    expect(onPasswordVisibilityChange).toHaveBeenCalledWith(false);
  });

  it("calls onTypingChange on email focus/blur", () => {
    const onTypingChange = jest.fn();
    render(<RegistrationForm onTypingChange={onTypingChange} />);
    fireEvent.focus(screen.getByLabelText("Correo Electrónico"));
    expect(onTypingChange).toHaveBeenCalledWith(true);
    fireEvent.blur(screen.getByLabelText("Correo Electrónico"));
    expect(onTypingChange).toHaveBeenCalledWith(false);
  });

  it("calls handleSignUp on form submit", () => {
    render(<RegistrationForm />);
    fireEvent.submit(
      screen.getByRole("button", { name: /Registrarse/i }).closest("form")!,
    );
    expect(signUpState.handleSignUp).toHaveBeenCalledTimes(1);
  });

  it("disables submit button and shows 'Processing…' when isPending", () => {
    signUpState.isPending = true;
    render(<RegistrationForm />);
    expect(screen.getByRole("button", { name: /Processing/i })).toBeDisabled();
  });

  it("has login link", () => {
    render(<RegistrationForm />);
    expect(screen.getByRole("link", { name: /Inicia sesión/i })).toHaveAttribute(
      "href",
      "/login",
    );
  });
});
