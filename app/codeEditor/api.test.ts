import {
  HttpError,
  analyzeCode,
  createSession,
  deleteSession,
  drawBoard,
  executeCode,
  getBoardSnapshot,
  getSession,
  isDrawRequest,
  joinSession,
  listSessions,
  renameSession,
  saveBoardSnapshot,
  saveSessionSnapshot,
  updateParticipantRole,
} from "./api";

interface MockResponseInit {
  status?: number;
  body?: unknown;
  textBody?: string;
}

function mockResponse({ status = 200, body, textBody }: MockResponseInit) {
  const text =
    textBody !== undefined ? textBody : body !== undefined ? JSON.stringify(body) : "";
  return {
    ok: status >= 200 && status < 300,
    status,
    text: jest.fn().mockResolvedValue(text),
    json: jest.fn().mockResolvedValue(body ?? null),
  };
}

const fetchMock = global.fetch as jest.Mock;

beforeEach(() => {
  fetchMock.mockReset();
});

describe("HttpError", () => {
  it("preserves status + body + message", () => {
    const err = new HttpError(404, { message: "nope" }, "nope");
    expect(err.status).toBe(404);
    expect(err.body).toEqual({ message: "nope" });
    expect(err.message).toBe("nope");
    expect(err.name).toBe("HttpError");
    expect(err).toBeInstanceOf(Error);
  });
});

describe("isDrawRequest", () => {
  it.each([
    ["dibuja un diagrama de arquitectura", true],
    ["draw a chart please", true],
    ["wireframe of the homepage", true],
    ["explain this code", false],
    ["what does this function do", false],
  ])("%s -> %s", (prompt, expected) => {
    expect(isDrawRequest(prompt)).toBe(expected);
  });

  it("is case-insensitive", () => {
    expect(isDrawRequest("DIAGRAM time")).toBe(true);
  });
});

describe("session API requests", () => {
  it("listSessions: GET /v1/sessions with bearer token", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ body: { sessions: [] } }));
    const data = await listSessions("tk");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/v1\/sessions$/);
    expect(init.method).toBe("GET");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tk");
    expect(data).toEqual({ sessions: [] });
  });

  it("getSession: GET /v1/sessions/:id", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ body: { session: { id: "x" }, participants: [] } }));
    await getSession("tk", "abc");
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/v1\/sessions\/abc$/);
  });

  it("createSession sends JSON body with content-type", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ body: { session: { id: "1", name: "S", inviteCode: "AAAA1111" } } }),
    );
    await createSession("tk", "MyName", "python");
    const init = fetchMock.mock.calls[0][1];
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      name: "MyName",
      language: "python",
    });
    expect((init.headers as Record<string, string>)["Content-Type"]).toBe(
      "application/json",
    );
  });

  it("joinSession trims and uppercases invite code", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ body: { session: { id: "1" } } }));
    await joinSession("tk", "  abcd1234  ");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.inviteCode).toBe("ABCD1234");
  });

  it("updateParticipantRole PATCH includes role body", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ body: { participant: {} } }));
    await updateParticipantRole("tk", "sid", "u@x.io", "VIEW_EDIT");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/v1\/sessions\/sid\/participants\/u%40x\.io\/role$/);
    expect(init.method).toBe("PATCH");
    expect(JSON.parse(init.body as string)).toEqual({ role: "VIEW_EDIT" });
  });

  it("renameSession PATCH /rename", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ body: { session: { id: "1" } } }));
    await renameSession("tk", "sid", "New Name");
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/v1\/sessions\/sid\/rename$/);
    expect(fetchMock.mock.calls[0][1].method).toBe("PATCH");
  });

  it("deleteSession DELETE", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ body: { session: {} } }));
    await deleteSession("tk", "sid");
    expect(fetchMock.mock.calls[0][1].method).toBe("DELETE");
  });

  it("executeCode maps language to piston id", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ body: { run: { stdout: "ok", stderr: "", code: 0 } } }),
    );
    await executeCode("tk", "sid", "python", "print('x')");
    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body).toEqual({ sessionId: "sid", language: "python", code: "print('x')" });
  });

  it("saveSessionSnapshot POST", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ body: { snapshot: { id: "snap" } } }));
    await saveSessionSnapshot("tk", "sid", "typescript", "const a = 1");
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/v1\/sessions\/sid\/snapshots$/);
  });

  it("throws HttpError on non-2xx with parsed message", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse({ status: 409, body: { message: "duplicate" } }),
    );
    await expect(createSession("tk", "x")).rejects.toMatchObject({
      status: 409,
      message: "duplicate",
    });
  });

  it("throws HttpError with default message when body has none", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ status: 500, body: {} }));
    await expect(listSessions("tk")).rejects.toMatchObject({
      status: 500,
      message: "Request failed with status 500",
    });
  });

  it("returns null when response body is empty", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ status: 200, textBody: "" }));
    const data = await listSessions("tk");
    expect(data).toBeNull();
  });
});

describe("board API (separate base URL)", () => {
  it("saveBoardSnapshot POST", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ body: { id: "b" } }));
    await saveBoardSnapshot("tk", "sid", "ssid", "u@x.io", [{ k: 1 }]);
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/v1\/boards\/sid\/snapshots$/);
  });

  it("getBoardSnapshot GET", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse({ body: { id: "b" } }));
    await getBoardSnapshot("tk", "ssid");
    expect(fetchMock.mock.calls[0][0]).toMatch(/\/v1\/boards\/snapshots\/ssid$/);
    expect(fetchMock.mock.calls[0][1].method).toBe("GET");
  });
});

describe("AI gateway helpers", () => {
  it("analyzeCode success returns parsed JSON", async () => {
    const okResp = {
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ status: "success", analysis: "ok" }),
      text: jest.fn(),
    };
    fetchMock.mockResolvedValueOnce(okResp);
    const out = await analyzeCode("prompt", "code");
    expect(out).toEqual({ status: "success", analysis: "ok" });
  });

  it("analyzeCode error includes status", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 503,
      text: jest.fn().mockResolvedValue("upstream down"),
      json: jest.fn(),
    });
    await expect(analyzeCode("p", "c")).rejects.toThrow(/503/);
  });

  it("drawBoard success", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ status: "success", response: "yay" }),
      text: jest.fn(),
    });
    const out = await drawBoard("dibuja", "sid");
    expect(out.response).toBe("yay");
  });

  it("drawBoard failure", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      text: jest.fn().mockResolvedValue(""),
      json: jest.fn(),
    });
    await expect(drawBoard("p", "sid")).rejects.toThrow(/500/);
  });
});
