import { LANGUAGE_VERSIONS, PISTON_LANGUAGE_MAP } from './Utils/constants';

const SESSIONS_API_BASE =
  process.env.NEXT_PUBLIC_URL_SESSIONS || 'http://localhost:3002';


export class HttpError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: { message?: string;[k: string]: unknown } | null,
    message: string,
  ) {
    super(message);
    this.name = 'HttpError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  token: string;
  body?: unknown;
}

async function request<T>(path: string, opts: RequestOptions): Promise<T> {
  const { method = 'GET', token, body } = opts;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${SESSIONS_API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const parsed = data as { message?: string } | null;
    const msg =
      (parsed && typeof parsed.message === 'string' && parsed.message) ||
      `Request failed with status ${response.status}`;
    throw new HttpError(response.status, parsed, msg);
  }

  return data as T;
}

export interface SessionSummary {
  id: string;
  name: string;
  language: string;
  inviteCode: string;
  ownerEmail: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const listSessions = (
  token: string,
): Promise<{ sessions: SessionSummary[] }> =>
  request('/v1/sessions', { method: 'GET', token });

export const renameSession = (
  token: string,
  sessionId: string,
  name: string,
): Promise<{ session: SessionSummary }> =>
  request(`/v1/sessions/${sessionId}/rename`, {
    method: 'PATCH',
    token,
    body: { name },
  });

export const deleteSession = (
  token: string,
  sessionId: string,
): Promise<{ session: SessionSummary }> =>
  request(`/v1/sessions/${sessionId}`, { method: 'DELETE', token });

export const createSession = (
  token: string,
  name: string,
  language: keyof typeof LANGUAGE_VERSIONS = 'javascript',
): Promise<{ session: SessionSummary }> =>
  request('/v1/sessions', {
    method: 'POST',
    token,
    body: { name, language },
  });

export const joinSession = (
  token: string,
  inviteCode: string,
): Promise<{ session: SessionSummary }> =>
  request('/v1/sessions/join', {
    method: 'POST',
    token,
    body: { inviteCode: inviteCode.trim().toUpperCase() },
  });

export const executeCode = (
  token: string,
  sessionId: string,
  language: keyof typeof LANGUAGE_VERSIONS,
  code: string,
) =>
  request('/v1/executions/run', {
    method: 'POST',
    token,
    body: {
      sessionId,
      language: PISTON_LANGUAGE_MAP[language],
      code,
    },
  });

export const saveSessionSnapshot = (
  token: string,
  sessionId: string,
  language: keyof typeof LANGUAGE_VERSIONS,
  code: string,
) =>
  request(`/v1/sessions/${sessionId}/snapshots`, {
    method: 'POST',
    token,
    body: {
      language: PISTON_LANGUAGE_MAP[language],
      code,
    },
  });


export interface AnalyzeResponse {
  status: 'success';
  analysis: string;
}

export async function analyzeCode(
  prompt: string,
  code: string,
): Promise<AnalyzeResponse> {
  const res = await fetch(`${SESSIONS_API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, code }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Analysis failed (${res.status})${text ? `: ${text}` : ''}`);
  }
  return res.json() as Promise<AnalyzeResponse>;
}
