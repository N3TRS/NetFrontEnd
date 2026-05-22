import { fireEvent, render, screen } from "@testing-library/react";
import CreateSessionModal from "./CreateSessionModal";

const baseProps = {
  open: true,
  sessionName: "",
  language: "typescript",
  isCreating: false,
  error: null,
  canCreate: true,
  onChangeSessionName: jest.fn(),
  onChangeLanguage: jest.fn(),
  onClose: jest.fn(),
  onCreate: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe("CreateSessionModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<CreateSessionModal {...baseProps} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders title and inputs when open", () => {
    render(<CreateSessionModal {...baseProps} />);
    expect(screen.getByText("Crear sesion")).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre de la sesion")).toBeInTheDocument();
    expect(screen.getByLabelText("Lenguaje de programacion")).toBeInTheDocument();
  });

  it("calls onClose when backdrop clicked", () => {
    render(<CreateSessionModal {...baseProps} />);
    fireEvent.click(screen.getByLabelText("Cerrar modal"));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when X button clicked", () => {
    render(<CreateSessionModal {...baseProps} />);
    const closeButtons = screen.getAllByRole("button");
    // X button is the second button (after backdrop)
    fireEvent.click(closeButtons[1]);
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("calls onClose when Cancelar clicked", () => {
    render(<CreateSessionModal {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("calls onCreate when Crear button clicked", () => {
    render(<CreateSessionModal {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Crear y entrar/i }));
    expect(baseProps.onCreate).toHaveBeenCalledTimes(1);
  });

  it("disables Crear button when canCreate=false", () => {
    render(<CreateSessionModal {...baseProps} canCreate={false} />);
    expect(screen.getByRole("button", { name: /Crear y entrar/i })).toBeDisabled();
  });

  it("disables Crear button and shows 'Creando...' when isCreating=true", () => {
    render(<CreateSessionModal {...baseProps} isCreating />);
    const btn = screen.getByRole("button", { name: /Creando/i });
    expect(btn).toBeDisabled();
  });

  it("shows error message when error prop provided", () => {
    render(<CreateSessionModal {...baseProps} error="Nombre duplicado" />);
    expect(screen.getByText("Nombre duplicado")).toBeInTheDocument();
  });

  it("hides error block when no error", () => {
    render(<CreateSessionModal {...baseProps} error={null} />);
    expect(screen.queryByText(/duplicado/)).toBeNull();
  });

  it("calls onChangeSessionName on input change", () => {
    render(<CreateSessionModal {...baseProps} />);
    fireEvent.change(screen.getByLabelText("Nombre de la sesion"), {
      target: { value: "My Session" },
    });
    expect(baseProps.onChangeSessionName).toHaveBeenCalledWith("My Session");
  });

  it("calls onChangeLanguage on select change", () => {
    render(<CreateSessionModal {...baseProps} />);
    const select = screen.getByLabelText("Lenguaje de programacion");
    fireEvent.change(select, { target: { value: "python" } });
    expect(baseProps.onChangeLanguage).toHaveBeenCalledWith("python");
  });
});
