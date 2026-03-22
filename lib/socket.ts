import { io, type Socket } from 'socket.io-client';

let collabSocket: Socket | null = null;

const getBaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_COLLAB_SERVER_URL ?? 'http://localhost:3001';
};

export const getCollabSocket = (): Socket => {
  if (collabSocket) return collabSocket;

  collabSocket = io(`${getBaseUrl()}/collab`, {
    autoConnect: false,
    transports: ['websocket'],
  });

  return collabSocket;
};
