import { useEffect, useRef, useCallback } from 'react';
import { useCallStore, type Call } from '../../components/_stores/callStore';
import { io, Socket } from 'socket.io-client';

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

const isCall = (value: unknown): value is Call => {
  if (!value || typeof value !== 'object') return false;
  return 'callerId' in value && 'participants' in value;
};

const getCallFromPayload = (payload: unknown): Call | null => {
  if (!payload || typeof payload !== 'object') return null;
  const raw = ('call' in payload
    ? (payload as Record<string, unknown>).call
    : payload) as Record<string, unknown>;
  if (!isCall(raw)) return null;
  return normalizeCall(raw);
};

export const useWebRTC = (
  userId: string,
  token: string | null,
  sessionId: string | null,
) => {
  const socketRef = useRef<Socket | null>(null);

  // mediasoup refs
  const deviceRef = useRef<any>(null);
  const sendTransportRef = useRef<any>(null);
  const recvTransportRef = useRef<any>(null);
  const consumersRef = useRef<Map<string, any>>(new Map());
  const consumerUserIdsRef = useRef<Map<string, string>>(new Map()); // consumerId → userId
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const currentCallIdRef = useRef<string | null>(null);

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

  // Emit a socket.io event and return the ACK as a Promise
  const emitAck = useCallback(<T>(event: string, data: object): Promise<T> =>
    new Promise((resolve, reject) => {
      if (!socketRef.current) return reject(new Error('Socket not connected'));
      socketRef.current.emit(event, data, (res: any) => {
        if (res?.error) reject(new Error(res.error));
        else resolve(res as T);
      });
    }), []);

  // Cleanup all mediasoup resources
  const cleanupMediasoup = useCallback(() => {
    consumersRef.current.forEach((c) => { try { if (!c.closed) c.close(); } catch { } });
    consumersRef.current.clear();
    consumerUserIdsRef.current.clear();
    try { if (sendTransportRef.current && !sendTransportRef.current.closed) sendTransportRef.current.close(); } catch { }
    try { if (recvTransportRef.current && !recvTransportRef.current.closed) recvTransportRef.current.close(); } catch { }
    sendTransportRef.current = null;
    recvTransportRef.current = null;
    deviceRef.current = null;
    remoteStreamsRef.current.clear();
    currentCallIdRef.current = null;
  }, []);

  // Consume a remote producer and add its track to the UI
  const consumeProducer = useCallback(async (
    callId: string,
    producerId: string,
    producerUserId: string,
  ) => {
    const device = deviceRef.current;
    const recvTransport = recvTransportRef.current;
    if (!device || !recvTransport) return;

    try {
      const params = await new Promise<any>((resolve, reject) => {
        socketRef.current?.emit('ms:consume', {
          callId,
          transportId: recvTransport.id,
          producerId,
          rtpCapabilities: device.rtpCapabilities,
        }, (res: any) => {
          if (res?.error) reject(new Error(res.error));
          else resolve(res);
        });
      });

      const consumer = await recvTransport.consume(params);
      consumersRef.current.set(consumer.id, consumer);
      consumerUserIdsRef.current.set(consumer.id, producerUserId);

      // Accumulate tracks from the same user into one MediaStream
      let stream = remoteStreamsRef.current.get(producerUserId);
      if (!stream) {
        stream = new MediaStream();
        remoteStreamsRef.current.set(producerUserId, stream);
      }
      stream.addTrack(consumer.track);
      addRemoteStream(producerUserId, stream);

      // Consumer starts paused — must resume to receive media
      socketRef.current?.emit('ms:resume-consumer', { callId, consumerId: consumer.id }, () => {});

      consumer.on('transportclose', () => {
        consumersRef.current.delete(consumer.id);
        consumerUserIdsRef.current.delete(consumer.id);
      });
    } catch (err) {
      console.error(`[mediasoup] consume failed for producer ${producerId}:`, err);
    }
  }, [addRemoteStream]);

  // Keep a stable ref to consumeProducer for use inside socket handlers
  const consumeProducerRef = useRef(consumeProducer);
  useEffect(() => { consumeProducerRef.current = consumeProducer; }, [consumeProducer]);

  // Initialize mediasoup Device + send/recv transports for a call
  const initMediasoup = async (callId: string) => {
    const { Device } = await import('mediasoup-client');

    // 1. Get router RTP capabilities
    const rtpCapabilities = await emitAck<any>('ms:get-rtp-capabilities', { callId });

    // 2. Load device
    const device = new Device();
    await device.load({ routerRtpCapabilities: rtpCapabilities });
    deviceRef.current = device;

    // 3. RECV transport first — so we can consume as soon as someone produces
    const recvParams = await emitAck<any>('ms:create-transport', { callId });
    const recvTransport = device.createRecvTransport(recvParams);
    recvTransport.on('connect', ({ dtlsParameters }: any, callback: () => void, errback: (e: Error) => void) => {
      socketRef.current?.emit(
        'ms:connect-transport',
        { callId, transportId: recvTransport.id, dtlsParameters },
        (res: any) => (res?.error ? errback(new Error(res.error)) : callback()),
      );
    });
    recvTransportRef.current = recvTransport;

    // 4. SEND transport
    const sendParams = await emitAck<any>('ms:create-transport', { callId });
    const sendTransport = device.createSendTransport(sendParams);
    sendTransport.on('connect', ({ dtlsParameters }: any, callback: () => void, errback: (e: Error) => void) => {
      socketRef.current?.emit(
        'ms:connect-transport',
        { callId, transportId: sendTransport.id, dtlsParameters },
        (res: any) => (res?.error ? errback(new Error(res.error)) : callback()),
      );
    });
    sendTransport.on('produce', ({ kind, rtpParameters }: any, callback: (p: { id: string }) => void, errback: (e: Error) => void) => {
      socketRef.current?.emit(
        'ms:produce',
        { callId, transportId: sendTransport.id, kind, rtpParameters },
        (res: any) => (res?.error ? errback(new Error(res.error)) : callback({ id: res.producerId })),
      );
    });
    sendTransportRef.current = sendTransport;
  };

  // Produce audio and video tracks via the send transport
  const produceMedia = async (localStream: MediaStream) => {
    const sendTransport = sendTransportRef.current;
    if (!sendTransport) return;
    for (const track of localStream.getTracks()) {
      try {
        await sendTransport.produce({ track });
      } catch (err) {
        console.error(`[mediasoup] produce failed for ${track.kind}:`, err);
      }
    }
  };

  // Consume all existing producers returned by join-call
  const consumeExistingProducers = async (
    callId: string,
    producers: { userId: string; producerId: string; kind: string }[],
  ) => {
    for (const { userId: producerUserId, producerId } of producers) {
      if (producerUserId !== userId) {
        await consumeProducerRef.current(callId, producerId, producerUserId);
      }
    }
  };

  // Acquire local camera + mic with progressive fallback
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
        setIsVideoOff(false);
        setLocalStream(stream);
        return stream;
      } catch { /* no camera, fall through */ }
    }

    if (audio) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: audioConstraints });
        setLocalStream(stream);
        setIsVideoOff(true);
        return stream;
      } catch { /* no microphone either, fall through */ }
    }

    const empty = new MediaStream();
    setLocalStream(empty);
    setIsVideoOff(true);
    return empty;
  };

  // Initialize socket and register all event handlers
  useEffect(() => {
    if (!userId || !token || !sessionId) return;

    const socket = io(CALLS_URL, {
      path: '/calls/socket.io',
      transports: ['websocket'],
      reconnection: true,
    });

    socket.on('connect', () => {
      socket.emit('register', { userId, sessionId });
    });

    socket.on('disconnect', () => { });

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
      cleanupMediasoup();
      resetCall();
    });

    socket.on('call-missed', () => {
      resetCall();
    });

    socket.on('user-left', (data: { call: unknown; userId: string }) => {
      const call = getCallFromPayload(data.call);
      if (call) setCurrentCall(call);
      // Consumer cleanup happens via ms:producer-closed events from the server.
      // Here we only remove the stream from the UI.
      remoteStreamsRef.current.delete(data.userId);
      removeRemoteStream(data.userId);
    });

    socket.on('user-joined', (data: { call: unknown; userId: string }) => {
      const call = getCallFromPayload(data.call);
      if (call) setCurrentCall(call);
    });

    socket.on('call-in-progress', (payload: unknown) => {
      const call = getCallFromPayload(payload);
      if (call && !useCallStore.getState().isInCall) {
        setJoinableCall(call);
      }
    });

    // New remote producer — consume it
    socket.on('ms:new-producer', async ({ userId: producerUserId, producerId }: { userId: string; producerId: string }) => {
      const callId = currentCallIdRef.current;
      if (!callId || producerUserId === userId) return;
      await consumeProducerRef.current(callId, producerId, producerUserId);
    });

    // Remove consumer and stream if user has no more producers
    socket.on('ms:producer-closed', ({ producerId }: { producerId: string }) => {
      for (const [cid, consumer] of consumersRef.current.entries()) {
        if (consumer.producerId === producerId) {
          const leavingUserId = consumerUserIdsRef.current.get(cid);
          try { if (!consumer.closed) consumer.close(); } catch { }
          consumersRef.current.delete(cid);
          consumerUserIdsRef.current.delete(cid);

          if (leavingUserId) {
            const hasMore = [...consumerUserIdsRef.current.values()].some(uid => uid === leavingUserId);
            if (!hasMore) {
              remoteStreamsRef.current.delete(leavingUserId);
              removeRemoteStream(leavingUserId);
            }
          }
          break;
        }
      }
    });

    socket.on('user:mute-changed', ({ userId: remoteUserId, isMuted }: { userId: string; isMuted: boolean }) => {
      useCallStore.getState().setRemoteMuteState(remoteUserId, isMuted);
    });

    socketRef.current = socket;
    return () => {
      socket.disconnect();
    };
  }, [userId, token, sessionId]);

  // Emit mute state to the call room whenever local isMuted changes
  useEffect(() => {
    let prev = useCallStore.getState().isMuted;
    return useCallStore.subscribe((state) => {
      if (state.isMuted === prev) return;
      prev = state.isMuted;
      const { currentCall } = state;
      if (socketRef.current && currentCall?.id) {
        socketRef.current.emit('user:mute-changed', {
          callId: currentCall.id,
          userId,
          isMuted: state.isMuted,
        });
      }
    });
  }, [userId]);

  // Start a new outgoing call
  const startCall = useCallback(async (participantIds: string[]) => {
    if (!socketRef.current || !sessionId) return;
    if (useCallStore.getState().isInCall) return;
    cleanupMediasoup();

    try {
      const response = await fetch(`${CALLS_URL}/calls/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ callerId: userId, sessionId, participants: participantIds }),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error((err as { message?: string }).message ?? `Failed to create call: ${response.status}`);
      }

      const rawData: Record<string, unknown> = await response.json();
      const call = normalizeCall(rawData);
      setCurrentCall(call);

      const localStream = await getUserMedia(true, true);

      // Join the socket.io call room + get existing producers
      currentCallIdRef.current = call.id;
      const { producers } = await emitAck<{ producers: any[] }>('join-call', { callId: call.id, userId });

      // Init mediasoup device + transports
      await initMediasoup(call.id);

      // Produce local tracks
      await produceMedia(localStream);

      // Consume any producers already in the room (edge case: others joined first)
      await consumeExistingProducers(call.id, producers ?? []);

      setIsInCall(true);
    } catch (error) {
      console.error('Error starting call:', error);
      cleanupMediasoup();
      resetCall();
    }
  }, [userId, token, sessionId, emitAck, cleanupMediasoup]);

  // Accept an incoming call
  const acceptCall = useCallback(async (callId: string) => {
    if (!socketRef.current || !sessionId) return;
    cleanupMediasoup();
    try {
      const response = await fetch(`${CALLS_URL}/calls/${callId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, sessionId }),
      });
      if (!response.ok) throw new Error('Failed to accept call');

      let callRef: Call | null = useCallStore.getState().currentCall;
      try {
        const rawData: unknown = await response.json();
        const parsed = getCallFromPayload(rawData);
        if (parsed) { callRef = parsed; setCurrentCall(callRef); }
      } catch { }

      const localStream = await getUserMedia(true, true);

      // Join the socket.io call room + get existing producers (caller's tracks)
      currentCallIdRef.current = callId;
      const { producers } = await emitAck<{ producers: any[] }>('join-call', { callId, userId });

      // Init mediasoup
      await initMediasoup(callId);

      // Produce local tracks
      await produceMedia(localStream);

      // Consume caller's existing producers
      await consumeExistingProducers(callId, producers ?? []);

      setIsInCall(true);
      setIsIncomingCall(false);
    } catch (error) {
      console.error('Error accepting call:', error);
      cleanupMediasoup();
      // Stop local stream if acquired
      const ls = useCallStore.getState().localStream;
      if (ls) { ls.getTracks().forEach(t => t.stop()); useCallStore.getState().setLocalStream(null); }
      useCallStore.getState().setIsInCall(false);
      useCallStore.getState().setIsIncomingCall(true);
    }
  }, [userId, token, sessionId, emitAck, cleanupMediasoup]);

  // Reject an incoming call
  const rejectCall = useCallback(async (callId: string) => {
    if (!socketRef.current || !sessionId) return;
    try {
      await fetch(`${CALLS_URL}/calls/${callId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, sessionId }),
      });
      resetCall();
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  }, [userId, token, sessionId]);

  // Leave the current call
  const leaveCall = useCallback(async () => {
    const callId = useCallStore.getState().currentCall?.id;

    cleanupMediasoup();

    if (socketRef.current && callId) {
      socketRef.current.emit('leave-call', { callId, userId });
    }

    resetCall();

    if (callId && sessionId) {
      try {
        const response = await fetch(`${CALLS_URL}/calls/${callId}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId, sessionId }),
        });
        if (response.ok) {
          const rawData: Record<string, unknown> = await response.json();
          const call = normalizeCall(rawData);
          if (call.status === 'ACCEPTED') {
            useCallStore.getState().setJoinableCall(call);
          }
        }
      } catch (error) {
        console.error('Error leaving call:', error);
      }
    }
  }, [userId, token, sessionId, cleanupMediasoup]);

  // Join an already-active call (late joiner / rejoin)
  const joinCall = useCallback(async (callId: string) => {
    if (!socketRef.current || !sessionId) return;
    cleanupMediasoup();
    try {
      const localStream = await getUserMedia(true, true);

      const response = await fetch(`${CALLS_URL}/calls/${callId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId, sessionId }),
      });
      if (!response.ok) throw new Error('Failed to join call');

      const callData: Record<string, unknown> = await response.json();
      const call = normalizeCall(callData);
      setCurrentCall(call);
      setJoinableCall(null);

      // Join the socket.io call room + get existing producers
      currentCallIdRef.current = callId;
      const { producers } = await emitAck<{ producers: any[] }>('join-call', { callId, userId });

      // Init mediasoup
      await initMediasoup(callId);

      // Produce local tracks
      await produceMedia(localStream);

      // Consume all existing producers
      await consumeExistingProducers(callId, producers ?? []);

      setIsInCall(true);
    } catch (error) {
      console.error('Error joining call:', error);
      cleanupMediasoup();
      // Stop local stream if acquired, but preserve joinableCall so the button stays active
      const ls = useCallStore.getState().localStream;
      if (ls) { ls.getTracks().forEach(t => t.stop()); useCallStore.getState().setLocalStream(null); }
    }
  }, [userId, token, sessionId, emitAck, cleanupMediasoup]);

  // Invite additional participants to the active call
  const inviteToCall = useCallback(async (inviteeIds: string[]) => {
    const callId = useCallStore.getState().currentCall?.id;
    if (!callId || !socketRef.current || !sessionId) return;
    if (inviteeIds.length === 0) return;

    try {
      const response = await fetch(`${CALLS_URL}/calls/${callId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ inviterId: userId, sessionId, inviteeIds }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as { message?: string }).message ?? `Failed to invite: ${response.status}`);
      }
      const rawData: Record<string, unknown> = await response.json();
      const call = normalizeCall(rawData);
      setCurrentCall(call);
    } catch (error) {
      console.error('Error inviting to call:', error);
    }
  }, [userId, token, sessionId]);

  return {
    acceptCall,
    rejectCall,
    leaveCall,
    joinCall,
    startCall,
    inviteToCall,
  };
};
