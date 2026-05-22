import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("@/app/codeEditor/api", () => ({
  ...jest.requireActual("@/app/codeEditor/api"),
  renameSession: jest.fn(),
  deleteSession: jest.fn(),
}));

import { renameSession, deleteSession, HttpError, type SessionSummary } from "@/app/codeEditor/api";
import SessionCard from "./SessionCard";

const renameMock = renameSession as unknown as jest.Mock;
const deleteMock = deleteSession as unknown as jest.Mock;

const sample: SessionSummary = {
  id: "s1",
  name: "MySession",
  language: "typescript",
  inviteCode: "ABCD1234",
  ownerEmail: "o@x.io",
  isActive: true,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

beforeEach(() => {
  renameMock.mockReset();
  deleteMock.mockReset();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: jest.fn().mockResolvedValue(undefined) },
  });
});

describe("SessionCard", () => {
  it("renders core info + Owner badge for owner", () => {
    render(
      <SessionCard
        session={sample}
        currentUserEmail="o@x.io"
        token="tk"
        onRenamed={jest.fn()}
        onDeleted={jest.fn()}
      />,
    );
    expect(screen.getByText("MySession")).toBeInTheDocument();
    expect(screen.getByText("typescript")).toBeInTheDocument();
    expect(screen.getByText("Owner")).toBeInTheDocument();
  });

  it("renders Guest badge for non-owner and hides owner actions", () => {
    render(
      <SessionCard
        session={sample}
        currentUserEmail="other@x.io"
        token="tk"
        onRenamed={jest.fn()}
        onDeleted={jest.fn()}
      />,
    );
    expect(screen.getByText("Guest")).toBeInTheDocument();
    expect(screen.queryByTitle("Renombrar")).toBeNull();
  });

  it("copies invite code on click and shows Copiado", async () => {
    render(
      <SessionCard
        session={sample}
        currentUserEmail="o@x.io"
        token="tk"
        onRenamed={jest.fn()}
        onDeleted={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByTitle(/Copiar código/));
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith("ABCD1234"),
    );
    expect(await screen.findByText(/Copiado/)).toBeInTheDocument();
  });

  it("rename flow calls API and onRenamed", async () => {
    renameMock.mockResolvedValueOnce({ session: { ...sample, name: "Renamed" } });
    const onRenamed = jest.fn();
    render(
      <SessionCard
        session={sample}
        currentUserEmail="o@x.io"
        token="tk"
        onRenamed={onRenamed}
        onDeleted={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByTitle("Renombrar"));
    const input = screen.getByDisplayValue("MySession");
    fireEvent.change(input, { target: { value: "Renamed" } });
    fireEvent.keyDown(input, { key: "Enter" });
    await waitFor(() =>
      expect(renameMock).toHaveBeenCalledWith("tk", "s1", "Renamed"),
    );
    expect(onRenamed).toHaveBeenCalledWith("s1", "Renamed");
  });

  it("rename surfaces 409 error message", async () => {
    renameMock.mockRejectedValueOnce(new HttpError(409, null, "conflict"));
    render(
      <SessionCard
        session={sample}
        currentUserEmail="o@x.io"
        token="tk"
        onRenamed={jest.fn()}
        onDeleted={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByTitle("Renombrar"));
    const input = screen.getByDisplayValue("MySession");
    fireEvent.change(input, { target: { value: "Other" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(await screen.findByText(/Ya existe una sesión/)).toBeInTheDocument();
  });

  it("rename Escape key cancels back to view", () => {
    render(
      <SessionCard
        session={sample}
        currentUserEmail="o@x.io"
        token="tk"
        onRenamed={jest.fn()}
        onDeleted={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByTitle("Renombrar"));
    const input = screen.getByDisplayValue("MySession");
    fireEvent.keyDown(input, { key: "Escape" });
    expect(screen.queryByDisplayValue("MySession")).toBeNull();
  });

  it("delete flow calls API and onDeleted", async () => {
    deleteMock.mockResolvedValueOnce({ session: sample });
    const onDeleted = jest.fn();
    render(
      <SessionCard
        session={sample}
        currentUserEmail="o@x.io"
        token="tk"
        onRenamed={jest.fn()}
        onDeleted={onDeleted}
      />,
    );
    fireEvent.click(screen.getByTitle("Eliminar"));
    fireEvent.click(screen.getByText("Confirmar"));
    await waitFor(() =>
      expect(deleteMock).toHaveBeenCalledWith("tk", "s1"),
    );
    expect(onDeleted).toHaveBeenCalledWith("s1");
  });

  it("delete cancel returns to view mode", () => {
    render(
      <SessionCard
        session={sample}
        currentUserEmail="o@x.io"
        token="tk"
        onRenamed={jest.fn()}
        onDeleted={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByTitle("Eliminar"));
    expect(screen.getByText("Confirmar")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Cancelar"));
    expect(screen.queryByText("Confirmar")).toBeNull();
  });

  it("rename skips API call when name unchanged", async () => {
    render(
      <SessionCard
        session={sample}
        currentUserEmail="o@x.io"
        token="tk"
        onRenamed={jest.fn()}
        onDeleted={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByTitle("Renombrar"));
    // don't change input — keep same name
    fireEvent.keyDown(screen.getByDisplayValue("MySession"), { key: "Enter" });
    await waitFor(() => expect(renameMock).not.toHaveBeenCalled());
    // returns to view mode
    expect(screen.getByText("MySession")).toBeInTheDocument();
  });

  it("delete shows error and stays in confirm mode on API failure", async () => {
    deleteMock.mockRejectedValueOnce(new Error("Server error"));
    render(
      <SessionCard
        session={sample}
        currentUserEmail="o@x.io"
        token="tk"
        onRenamed={jest.fn()}
        onDeleted={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByTitle("Eliminar"));
    fireEvent.click(screen.getByText("Confirmar"));
    expect(await screen.findByText("Server error")).toBeInTheDocument();
    // still in confirm mode
    expect(screen.getByText("Confirmar")).toBeInTheDocument();
  });

  it("extractErrorMessage uses HttpError body.message for non-409", async () => {
    renameMock.mockRejectedValueOnce(
      new HttpError(400, { message: "Bad name" }, "bad"),
    );
    render(
      <SessionCard
        session={sample}
        currentUserEmail="o@x.io"
        token="tk"
        onRenamed={jest.fn()}
        onDeleted={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByTitle("Renombrar"));
    const input = screen.getByDisplayValue("MySession");
    fireEvent.change(input, { target: { value: "NewName" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(await screen.findByText("Bad name")).toBeInTheDocument();
  });

  it("extractErrorMessage uses generic fallback for unknown error", async () => {
    renameMock.mockRejectedValueOnce("raw string error");
    render(
      <SessionCard
        session={sample}
        currentUserEmail="o@x.io"
        token="tk"
        onRenamed={jest.fn()}
        onDeleted={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByTitle("Renombrar"));
    const input = screen.getByDisplayValue("MySession");
    fireEvent.change(input, { target: { value: "NewName" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(await screen.findByText("Ocurrio un error.")).toBeInTheDocument();
  });
});
