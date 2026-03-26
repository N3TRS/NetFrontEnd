'use client';

import { useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';

import type { CollabAck } from '@/lib/collab/types';

export const useSession = (
  socket: Socket,
  sessionId: string,
  userId: string,
  connected: boolean,
): {
  joined: boolean;
  sessionError: string | null;
} => {
  const [joinedAck, setJoinedAck] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || !userId) {
      joinedRef.current = false;
      return;
    }

    if (!connected) {
      joinedRef.current = false;
      return;
    }

    let cancelled = false;

    socket.emit('session.join', { sessionId, userId }, (ack: CollabAck) => {
      if (cancelled) return;

      if (ack.ok) {
        joinedRef.current = true;
        setJoinedAck(true);
        setSessionError(null);
        return;
      }

      setJoinedAck(false);
      joinedRef.current = false;
      setSessionError(typeof ack.error === 'string' ? ack.error : 'No se pudo unir a la sesion');
    });

    return () => {
      cancelled = true;
      if (!joinedRef.current || !socket.connected) return;

      socket.emit('session.leave', { sessionId, userId });
      joinedRef.current = false;
      setJoinedAck(false);
    };
  }, [socket, sessionId, userId, connected]);

  const joined = joinedAck && connected && Boolean(sessionId) && Boolean(userId);
  return { joined, sessionError };
};
