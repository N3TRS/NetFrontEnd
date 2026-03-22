'use client';

import { useEffect, useState } from 'react';
import type { Socket } from 'socket.io-client';

import { getCollabSocket } from '@/lib/socket';

export const useSocket = (): {
  socket: Socket;
  connected: boolean;
  connectionError: string | null;
} => {
  const [socket] = useState<Socket>(() => getCollabSocket());
  const [connected, setConnected] = useState<boolean>(socket.connected);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const onConnect = () => {
      setConnected(true);
      setConnectionError(null);
    };

    const onDisconnect = () => {
      setConnected(false);
    };

    const onConnectError = (error: Error) => {
      setConnectionError(error.message);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.disconnect();
    };
  }, [socket]);

  return { socket, connected, connectionError };
};
