import { useEffect, useRef, useCallback } from 'react';
import { useCallStore, type Call } from '../../components/_stores/callStore';
import { io, Socket } from 'socket.io-client';
import type { Device, Transport, Producer, Consumer } from 'mediasoup-client/lib/types';

const CALLS_URL = process.env.NEXT_PUBLIC_URL_CALL ?? '';

function normalizeCall(raw: Record<string, unknown>): Call {
  return {
    ...raw,
    id: (raw.id ?? raw.callId) as string,
    activeParticipants: (raw.activeParticipants as string[]) ?? [],
    acceptedUsers: (raw.acceptedUsers as string[]) ?? [],
    rejectedUsers: (raw.rejectedUsers as string[]) ?? [],
  } as Call;
}

function isCall(value: unknown): value is Call {
  if (!value || typeof value !== 'object') return false;
  return 'callerId' in value && 'participants' in value;
}

function getCallFromPayload(payload: unknown): Call | null {
  if (!payload || typeof payload !== 'object') return null;
  const raw = (
    'call' in payload
      ? (payload as Record<string, unknown>).call
      : payload
  ) as Record<string, unknown>;
  if (!isCall(raw)) return null;
  return normalizeCall(raw);
}

// Map from producerId → { consumerId, userId } for cleanup
interface ProducerMapping {
  consumerId: string;
  userId: string;
}

export const useWebRTC = (userId: string, token: string | null) => {
  const socketRef = useRef<Socket | null>(null);

  // MediaSoup refs
  const deviceRef = useRef<Device | null>(null);
  const sendTransportRef = useRef<Transport | null>(null);
  const recvTransportRef = useRef<Transport | null>(null);
  const producersRef = useRef<Map<string, Producer>>(new Map()); // kind → Producer
  const consumersRef = useRef<Map<string, Consumer>>(new Map()); // consumerId → Consumer
  const producerMappingRef = useRef<Map<string, ProducerMapping>>(new Map()); // producerId → { consumerId, userId }
  const remoteStreamsMapRef = useRef<Map<string, MediaStream>>(new Map()); // userId → MediaStream

  const {
    setLocalStream,
    addRemoteStream,
    removeRemoteStream,
    setCurrentCall,
    setJoinableCall,
    setIsInCall,
    setIsIncomingCall,
    resetCall,
  } = useCallStore();

  // ─── Media helpers ─────────────────────────────────────────────────────

  const getUserMedia = async (audio = true, video = true): Promise<MediaStream> => {
    const { setIsVideoOff } = useCallStore.getState();

    const audioConstraints: MediaTrackConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    };

    if (video) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: audio ? audioConstraints : false,
          video: { width: { ideal: 1280 }, height: { ideal: 720 } },
        });
        setLocalStream(stream);
        return stream;
      } catch { /* no camera */ }
    }

    if (audio) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
        setLocalStream(stream);
        setIsVideoOff(true);
        return stream;
      } catch { /* no microphone */ }
    }

    const empty = new MediaStream();
    setLocalStream(empty);
    setIsVideoOff(true);
    return empty;
  };

  // ─── MediaSoup cleanup ─────────────────────────────────────────────────

  const cleanupMediasoup = useCallback(() => {
    producersRef.current.forEach((p) => { if (!p.closed) p.close(); });
    producersRef.current.clear();

    consumersRef.current.forEach((c) => { if (!c.closed) c.close(); });
    consumersRef.current.clear();

    if (sendTransportRef.current && !sendTransportRef.current.closed) {
      sendTransportRef.current.close();
    }
    sendTransportRef.current = null;

    if (recvTransportRef.current && !recvTransportRef.current.closed) {
      recvTransportRef.current.close();
    }
    recvTransportRef.current = null;

    deviceRef.current = null;
    producerMappingRef.current.clear();
    remoteStreamsMapRef.current.clear();

    // Release camera / microphone
    const localStream = useCallStore.getState().localStream;
    localStream?.getTracks().forEach((t) => t.stop());
  }, []);

  // ─── Consume a single producer ─────────────────────────────────────────

  const consumeProducer = useCallback(
    async (
      callId: string,
      info: { userId: string; producerId: string; kind: string },
    ) => {
      const socket = socketRef.current;
      const device = deviceRef.current;
      const recvTransport = recvTransportRef.current;
      if (!socket || !device || !recvTransport) return;
      if (info.userId === userId) return; // never consume own producers

      try {
        const params = await socket.emitWithAck('ms:consume', {
          callId,
          transportId: recvTransport.id,
          producerId: info.producerId,
          rtpCapabilities: device.rtpCapabilities,
        });

        if (params?.error) {
          console.error('ms:consume error:', params.error);
          return;
        }

        const consumer: Consumer = await recvTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
        });

        consumersRef.current.set(params.id, consumer);
        producerMappingRef.current.set(info.producerId, {
          consumerId: params.id,
          userId: info.userId,
        });

        await socket.emitWithAck('ms:resume-consumer', {
          callId,
          consumerId: consumer.id,
        });

        // Merge track into this user's MediaStream
        let stream = remoteStreamsMapRef.current.get(info.userId);
        if (!stream) {
          stream = new MediaStream();
          remoteStreamsMapRef.current.set(info.userId, stream);
        }
        stream.addTrack(consumer.track);
        addRemoteStream(info.userId, stream);
      } catch (err) {
        console.error('Error consuming producer:', err);
      }
    },
    [userId, addRemoteStream],
  );

  // ─── Join a call room with MediaSoup ───────────────────────────────────

  const joinMediasoupRoom = useCallback(
    async (callId: string) => {
      const socket = socketRef.current;
      if (!socket) return;

      try {
        // 1. Get router RTP capabilities from server (creates room lazily)
        const rtpCapabilities = await socket.emitWithAck(
          'ms:get-rtp-capabilities',
          { callId },
        );
        if (rtpCapabilities?.error) throw new Error(rtpCapabilities.error);

        // 2. Load mediasoup-client Device (SSR-safe dynamic import)
        const { Device } = await import('mediasoup-client');
        const device = new Device();
        await device.load({ routerRtpCapabilities: rtpCapabilities });
        deviceRef.current = device;

        // 3. Create send transport
        const sendParams = await socket.emitWithAck('ms:create-transport', { callId });
        if (sendParams?.error) throw new Error(sendParams.error);

        const sendTransport = device.createSendTransport(sendParams);
        sendTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
          try {
            await socket.emitWithAck('ms:connect-transport', {
              callId,
              transportId: sendTransport.id,
              dtlsParameters,
            });
            callback();
          } catch (e) { errback(e as Error); }
        });
        sendTransport.on('produce', async ({ kind, rtpParameters }, callback, errback) => {
          try {
            const { producerId } = await socket.emitWithAck('ms:produce', {
              callId,
              transportId: sendTransport.id,
              kind,
              rtpParameters,
            });
            callback({ id: producerId });
          } catch (e) { errback(e as Error); }
        });
        sendTransportRef.current = sendTransport;

        // 4. Create recv transport
        const recvParams = await socket.emitWithAck('ms:create-transport', { callId });
        if (recvParams?.error) throw new Error(recvParams.error);

        const recvTransport = device.createRecvTransport(recvParams);
        recvTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
          try {
            await socket.emitWithAck('ms:connect-transport', {
              callId,
              transportId: recvTransport.id,
              dtlsParameters,
            });
            callback();
          } catch (e) { errback(e as Error); }
        });
        recvTransportRef.current = recvTransport;

        // 5. Produce local tracks
        const localStream = useCallStore.getState().localStream;
        if (localStream) {
          const audioTrack = localStream.getAudioTracks()[0];
          if (audioTrack) {
            const producer = await sendTransport.produce({ track: audioTrack });
            producersRef.current.set('audio', producer);
          }
          const videoTrack = localStream.getVideoTracks()[0];
          if (videoTrack) {
            const producer = await sendTransport.produce({ track: videoTrack });
            producersRef.current.set('video', producer);
          }
        }

        // 6. Consume all existing producers in the room
        const { producers } = await socket.emitWithAck('ms:get-producers', { callId });
        if (Array.isArray(producers)) {
          for (const producerInfo of producers) {
            await consumeProducer(callId, producerInfo);
          }
        }
      } catch (err) {
        console.error('Error joining mediasoup room:', err);
      }
    },
    [consumeProducer],
  );

  // ─── Socket setup ──────────────────────────────────────────────────────

  useEffect(() => {
    if (!userId || !token) return;

    const socket = io(CALLS_URL, {
      path: '/calls/socket.io',
      transports: ['websocket'],
      reconnection: true,
    });

    socket.on('connect', () => {
      socket.emit('register', { userId });
    });

    socket.on('incoming-call', (payload: unknown) => {
      const call = getCallFromPayload(payload);
      if (!call) return;
      setCurrentCall(call);
      setIsIncomingCall(true);
    });

    socket.on('call-accepted', (data: unknown) => {
      const call = getCallFromPayload(data);
      if (call) setCurrentCall(call);
    });

    socket.on('call-rejected', (data: unknown) => {
      const call = getCallFromPayload(data);
      if (call) setCurrentCall(call);
    });

    socket.on('call-ended', () => {
      const { isInCall: wasInCall, currentCall: callSnapshot } =
        useCallStore.getState();

      cleanupMediasoup();
      resetCall();

      if (wasInCall && callSnapshot) {
        useCallStore.getState().setJoinableCall(callSnapshot);
      }
    });

    socket.on('call-missed', () => {
      cleanupMediasoup();
      resetCall();
    });

    socket.on('user-left', (data: { call: unknown; userId: string }) => {
      const call = getCallFromPayload(data.call);
      if (call) setCurrentCall(call);

      const leftUserId = data.userId;
      // Close all consumers associated with this user
      for (const [producerId, mapping] of producerMappingRef.current.entries()) {
        if (mapping.userId === leftUserId) {
          const consumer = consumersRef.current.get(mapping.consumerId);
          if (consumer && !consumer.closed) consumer.close();
          consumersRef.current.delete(mapping.consumerId);
          producerMappingRef.current.delete(producerId);
        }
      }
      remoteStreamsMapRef.current.delete(leftUserId);
      removeRemoteStream(leftUserId);
    });

    socket.on('user-joined', (data: { call: unknown; userId: string }) => {
      const call = getCallFromPayload(data.call);
      if (call) setCurrentCall(call);
      // New participant will emit ms:produce; we'll receive ms:new-producer
    });

    socket.on('call-in-progress', (payload: unknown) => {
      const call = getCallFromPayload(payload);
      if (call && !useCallStore.getState().isInCall) {
        setJoinableCall(call);
      }
    });

    // SFU: someone started producing → consume them
    socket.on(
      'ms:new-producer',
      async (data: { userId: string; producerId: string; kind: string }) => {
        const state = useCallStore.getState();
        if (!state.isInCall) return;
        const callId = state.currentCall?.id;
        if (!callId) return;
        await consumeProducer(callId, data);
      },
    );

    // SFU: a producer was closed (participant left)
    socket.on('ms:producer-closed', ({ producerId }: { producerId: string }) => {
      const mapping = producerMappingRef.current.get(producerId);
      if (!mapping) return;

      const { consumerId, userId: remoteUserId } = mapping;
      const consumer = consumersRef.current.get(consumerId);
      if (consumer && !consumer.closed) consumer.close();
      consumersRef.current.delete(consumerId);
      producerMappingRef.current.delete(producerId);

      // Check if this user has other producers still active
      const hasMore = Array.from(producerMappingRef.current.values()).some(
        (m) => m.userId === remoteUserId,
      );
      if (!hasMore) {
        remoteStreamsMapRef.current.delete(remoteUserId);
        removeRemoteStream(remoteUserId);
      }
    });

    socketRef.current = socket;

    return () => {
      cleanupMediasoup();
      socket.disconnect();
    };
  }, [userId, token, cleanupMediasoup, consumeProducer]);

  // ─── Call actions ──────────────────────────────────────────────────────

  const acceptCall = useCallback(
    async (callId: string) => {
      if (!socketRef.current) return;
      try {
        const response = await fetch(`${CALLS_URL}/calls/${callId}/accept`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        });
        if (!response.ok) throw new Error('Failed to accept call');

        let callRef: Call | null = useCallStore.getState().currentCall;
        try {
          const rawData: unknown = await response.json();
          const parsed = getCallFromPayload(rawData);
          if (parsed) { callRef = parsed; setCurrentCall(callRef); }
        } catch { /* fall back to store */ }

        await getUserMedia(true, true);
        setIsInCall(true);
        setIsIncomingCall(false);

        if (callRef) {
          socketRef.current.emit('join-call', { callId, userId });
          await joinMediasoupRoom(callId);
        }
      } catch (err) {
        console.error('Error accepting call:', err);
        cleanupMediasoup();
        resetCall();
      }
    },
    [userId, token, joinMediasoupRoom, cleanupMediasoup],
  );

  const rejectCall = useCallback(
    async (callId: string) => {
      if (!socketRef.current) return;
      try {
        await fetch(`${CALLS_URL}/calls/${callId}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        });
        resetCall();
      } catch (err) {
        console.error('Error rejecting call:', err);
      }
    },
    [userId, token],
  );

  const leaveCall = useCallback(async () => {
    const callId = useCallStore.getState().currentCall?.id;

    cleanupMediasoup();

    if (socketRef.current && callId) {
      socketRef.current.emit('leave-call', { callId, userId });
    }

    resetCall();

    if (callId) {
      try {
        const response = await fetch(`${CALLS_URL}/calls/${callId}/leave`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const rawData: Record<string, unknown> = await response.json();
          const call = normalizeCall(rawData);
          if (call.status === 'ACCEPTED') {
            useCallStore.getState().setJoinableCall(call);
          }
        }
      } catch (err) {
        console.error('Error leaving call:', err);
      }
    }
  }, [userId, token, cleanupMediasoup]);

  const joinCall = useCallback(
    async (callId: string) => {
      if (!socketRef.current) return;
      try {
        await getUserMedia(true, true);

        const response = await fetch(`${CALLS_URL}/calls/${callId}/join`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        });
        if (!response.ok) throw new Error('Failed to join call');

        const callData: Record<string, unknown> = await response.json();
        const call = normalizeCall(callData);
        setCurrentCall(call);
        setJoinableCall(null);
        setIsInCall(true);

        socketRef.current.emit('join-call', { callId, userId });
        await joinMediasoupRoom(callId);
      } catch (err) {
        console.error('Error joining call:', err);
        cleanupMediasoup();
        resetCall();
      }
    },
    [userId, token, joinMediasoupRoom, cleanupMediasoup],
  );

  const startCall = useCallback(
    async (participantIds: string[]) => {
      if (!socketRef.current) return;
      if (useCallStore.getState().isInCall) return;

      try {
        const response = await fetch(`${CALLS_URL}/calls/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ callerId: userId, participants: participantIds }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            (errorData as { message?: string }).message ||
              `Failed to create call: ${response.status}`,
          );
        }

        const rawData: Record<string, unknown> = await response.json();
        const call = normalizeCall(rawData);
        setCurrentCall(call);

        await getUserMedia(true, true);
        setIsInCall(true);

        socketRef.current.emit('join-call', { callId: call.id, userId });
        await joinMediasoupRoom(call.id);
      } catch (err) {
        console.error('Error starting call:', err);
        cleanupMediasoup();
        resetCall();
      }
    },
    [userId, token, joinMediasoupRoom, cleanupMediasoup],
  );

  const inviteToCall = useCallback(
    async (inviteeIds: string[]) => {
      const callId = useCallStore.getState().currentCall?.id;
      if (!callId || !socketRef.current) return;
      if (inviteeIds.length === 0) return;

      try {
        const response = await fetch(`${CALLS_URL}/calls/${callId}/invite`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ inviterId: userId, inviteeIds }),
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            (errorData as { message?: string }).message ||
              `Failed to invite: ${response.status}`,
          );
        }

        const rawData: Record<string, unknown> = await response.json();
        const call = normalizeCall(rawData);
        setCurrentCall(call);
      } catch (err) {
        console.error('Error inviting to call:', err);
      }
    },
    [userId, token],
  );

  return {
    acceptCall,
    rejectCall,
    leaveCall,
    joinCall,
    startCall,
    inviteToCall,
  };
};
