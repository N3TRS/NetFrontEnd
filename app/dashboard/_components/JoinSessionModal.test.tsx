import { fireEvent, render, screen } from "@testing-library/react";
import JoinSessionModal from "./JoinSessionModal";

const baseProps = {
  open: true,
  inviteCode: "",
  isJoining: false,
  error: null,
  canJoin: true,
  onChangeInviteCode: jest.fn(),
  onClose: jest.fn(),
  onJoin: jest.fn(),
};

beforeEach(() => jest.clearAllMocks());

describe("JoinSessionModal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(<JoinSessionModal {...baseProps} open={false} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders title and invite code input when open", () => {
    render(<JoinSessionModal {...baseProps} />);
    expect(screen.getByText("Unirse a sesion")).toBeInTheDocument();
    expect(screen.getByLabelText("Codigo de invitacion")).toBeInTheDocument();
  });

  it("calls onClose when backdrop clicked", () => {
    render(<JoinSessionModal {...baseProps} />);
    fireEvent.click(screen.getByLabelText("Cerrar modal"));
    expect(baseProps.onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Cancelar clicked", () => {
    render(<JoinSessionModal {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Cancelar/i }));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("calls onJoin when Unirse clicked", () => {
    render(<JoinSessionModal {...baseProps} />);
    fireEvent.click(screen.getByRole("button", { name: /Unirse/i }));
    expect(baseProps.onJoin).toHaveBeenCalledTimes(1);
  });

  it("disables Unirse when canJoin=false", () => {
    render(<JoinSessionModal {...baseProps} canJoin={false} />);
    expect(screen.getByRole("button", { name: /Unirse/i })).toBeDisabled();
  });

  it("shows 'Conectando...' and disables when isJoining=true", () => {
    render(<JoinSessionModal {...baseProps} isJoining />);
    const btn = screen.getByRole("button", { name: /Conectando/i });
    expect(btn).toBeDisabled();
  });

  it("shows error when error prop provided", () => {
    render(<JoinSessionModal {...baseProps} error="Código inválido" />);
    expect(screen.getByText("Código inválido")).toBeInTheDocument();
  });

  it("calls onChangeInviteCode with uppercase on input", () => {
    render(<JoinSessionModal {...baseProps} />);
    fireEvent.change(screen.getByLabelText("Codigo de invitacion"), {
      target: { value: "abcd1234" },
    });
    expect(baseProps.onChangeInviteCode).toHaveBeenCalledWith("ABCD1234");
  });
});
