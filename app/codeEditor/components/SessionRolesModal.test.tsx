import { fireEvent, render, screen } from "@testing-library/react";
import { SessionRolesModal } from "./SessionRolesModal";
import type { Participant } from "./ParticipantAvatars";

const baseProps = {
  open: true,
  participants: [
    { email: "owner@x.io", role: undefined } as Participant,
    { email: "u@x.io", role: "VIEW_EDIT" } as Participant,
  ],
  ownerEmail: "owner@x.io",
  currentUserEmail: "u@x.io",
  canChangeRoles: true,
  onClose: jest.fn(),
  onChangeRole: jest.fn(),
};

beforeEach(() => {
  baseProps.onClose = jest.fn();
  baseProps.onChangeRole = jest.fn();
});

describe("SessionRolesModal", () => {
  it("renders nothing when open=false", () => {
    const { container } = render(
      <SessionRolesModal {...baseProps} open={false} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows lock notice when canChangeRoles=false", () => {
    render(<SessionRolesModal {...baseProps} canChangeRoles={false} />);
    expect(screen.getByText(/Owner only/i)).toBeInTheDocument();
  });

  it("shows All permissions badge for owner row", () => {
    render(<SessionRolesModal {...baseProps} />);
    expect(screen.getByText("All permissions")).toBeInTheDocument();
  });

  it("invokes onChangeRole when non-owner row select changes", () => {
    render(<SessionRolesModal {...baseProps} />);
    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "VIEW_EDIT_EXECUTE" } });
    expect(baseProps.onChangeRole).toHaveBeenCalledWith(
      "u@x.io",
      "VIEW_EDIT_EXECUTE",
    );
  });

  it("close button invokes onClose", () => {
    render(<SessionRolesModal {...baseProps} />);
    fireEvent.click(screen.getByLabelText("Close"));
    expect(baseProps.onClose).toHaveBeenCalled();
  });

  it("shows empty state when no participants", () => {
    render(<SessionRolesModal {...baseProps} participants={[]} />);
    expect(screen.getByText(/No participants yet/i)).toBeInTheDocument();
  });

  it("marks the current user with (you)", () => {
    render(<SessionRolesModal {...baseProps} />);
    expect(screen.getByText(/\(you\)/)).toBeInTheDocument();
  });
});
