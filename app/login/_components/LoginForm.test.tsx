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

const handleLoginMock = jest.fn((e: React.SyntheticEvent) => e.preventDefault());
let loginState = {
  email: "",
  password: "",
  setEmail: jest.fn(),
  setPassword: jest.fn(),
  handleLogin: handleLoginMock,
  isPending: false,
};
jest.mock("../_hooks/loginHook", () => ({
  useLogin: () => loginState,
}));

const handleGithubLoginMock = jest.fn();
jest.mock("../_hooks/githubLoginHook", () => ({
  githubLoginHook: () => ({ handleGithubLogin: handleGithubLoginMock }),
}));

import LoginForm from "./LoginForm";

beforeEach(() => {
  loginState = {
    email: "",
    password: "",
    setEmail: jest.fn(),
    setPassword: jest.fn(),
    handleLogin: jest.fn((e: React.SyntheticEvent) => e.preventDefault()),
    isPending: false,
  };
  handleGithubLoginMock.mockReset();
});

describe("LoginForm", () => {
  it("renders heading, inputs and buttons", () => {
    render(<LoginForm />);
    expect(screen.getByText(/Bienvenido de nuevo/i)).toBeInTheDocument();
    expect(screen.getByLabelText("Correo")).toBeInTheDocument();
    expect(screen.getByLabelText("Contraseña")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continuar Con GitHub/i })).toBeInTheDocument();
  });

  it("calls handleGithubLogin on GitHub button click", () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /Continuar Con GitHub/i }));
    expect(handleGithubLoginMock).toHaveBeenCalledTimes(1);
  });

  it("calls setEmail when email input changes", () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Correo"), { target: { name: "email", value: "u@x.io" } });
    expect(loginState.setEmail).toHaveBeenCalledWith("u@x.io");
  });

  it("calls setPassword when password input changes", () => {
    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { name: "password", value: "secret" },
    });
    expect(loginState.setPassword).toHaveBeenCalledWith("secret");
  });

  it("calls onPasswordChange callback when password changes", () => {
    const onPasswordChange = jest.fn();
    render(<LoginForm onPasswordChange={onPasswordChange} />);
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { name: "password", value: "abc" },
    });
    expect(onPasswordChange).toHaveBeenCalledWith("abc");
  });

  it("calls onTypingChange on email focus/blur", () => {
    const onTypingChange = jest.fn();
    render(<LoginForm onTypingChange={onTypingChange} />);
    fireEvent.focus(screen.getByLabelText("Correo"));
    expect(onTypingChange).toHaveBeenCalledWith(true);
    fireEvent.blur(screen.getByLabelText("Correo"));
    expect(onTypingChange).toHaveBeenCalledWith(false);
  });

  it("toggles password visibility and calls onPasswordVisibilityChange", () => {
    const onPasswordVisibilityChange = jest.fn();
    render(<LoginForm onPasswordVisibilityChange={onPasswordVisibilityChange} />);
    const passwordInput = screen.getByLabelText("Contraseña");
    expect(passwordInput).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByLabelText("Show password"));
    expect(passwordInput).toHaveAttribute("type", "text");
    expect(onPasswordVisibilityChange).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByLabelText("Hide password"));
    expect(passwordInput).toHaveAttribute("type", "password");
    expect(onPasswordVisibilityChange).toHaveBeenCalledWith(false);
  });

  it("calls handleLogin on form submit", () => {
    render(<LoginForm />);
    fireEvent.submit(screen.getByRole("button", { name: /Iniciar Sesión/i }).closest("form")!);
    expect(loginState.handleLogin).toHaveBeenCalledTimes(1);
  });

  it("disables submit and shows 'Iniciando Sesión…' when isPending", () => {
    loginState.isPending = true;
    render(<LoginForm />);
    expect(screen.getByRole("button", { name: /Iniciando Sesión/i })).toBeDisabled();
  });

  it("has forgot password link", () => {
    render(<LoginForm />);
    expect(screen.getByRole("link", { name: /Olvidaste/i })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
  });
});
