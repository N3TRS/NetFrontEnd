import axios from 'axios';
import { LANGUAGE_VERSIONS, PISTON_LANGUAGE_MAP } from './Utils/constants';

const SESSIONS_API_BASE =
  process.env.NEXT_PUBLIC_SESSION_API_URL || 'http://localhost:3002/v1';

const API_URL = axios.create({
  baseURL: SESSIONS_API_BASE,
});

function authHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  };
}

export const createSession = async (
  token: string,
  name: string,
  language: keyof typeof LANGUAGE_VERSIONS = 'javascript',
) => {
  const response = await API_URL.post(
    '/sessions',
    {
      name,
      language,
    },
    {
      headers: authHeaders(token),
    },
  );

  return response.data;
};

export const joinSession = async (token: string, inviteCode: string) => {
  const response = await API_URL.post(
    '/sessions/join',
    {
      inviteCode: inviteCode.trim().toUpperCase(),
    },
    {
      headers: authHeaders(token),
    },
  );

  return response.data;
};

export const executeCode = async (
  token: string,
  sessionId: string,
  language: keyof typeof LANGUAGE_VERSIONS,
  code: string,
) => {
  const response = await API_URL.post(
    '/executions/run',
    {
      sessionId,
      language: PISTON_LANGUAGE_MAP[language],
      code,
    },
    {
      headers: authHeaders(token),
    },
  );

  return response.data;
};

export const saveSessionSnapshot = async (
  token: string,
  sessionId: string,
  language: keyof typeof LANGUAGE_VERSIONS,
  code: string,
) => {
  const response = await API_URL.post(
    `/sessions/${sessionId}/snapshots`,
    {
      language: PISTON_LANGUAGE_MAP[language],
      code,
    },
    {
      headers: authHeaders(token),
    },
  );

  return response.data;
};
