import { io, type Socket } from "socket.io-client";

let collabSocket: Socket | null = null;

const getBaseUrl = (): string => {
  return "http://localhost:3002";
};

export const getCollabSocket = (): Socket => {
  if (collabSocket) return collabSocket;

  collabSocket = io(`${getBaseUrl()}/collab`, {
    autoConnect: false,
    transports: ["websocket"],
  });

  return collabSocket;
};
