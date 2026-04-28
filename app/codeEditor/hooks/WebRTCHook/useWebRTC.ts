import { useEffect, useRef, useCallback } from 'react';
import { useCallStore, type Call } from '../../components/_stores/callStore';
import { io, Socket } from 'socket.io-client';


interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

// TURN relay: required when peers sit behind symmetric NAT / restrictive firewalls.
// Production should set NEXT_PUBLIC_TURN_URL/USERNAME/CREDENTIAL to a managed TURN
// (Metered.ca, Twilio NTS, self-hosted coturn). The OpenRelay fallback below works
// for dev but is rate-limited and not suitable for production.
const TURN_URL = process.env.NEXT_PUBLIC_TURN_URL;
const TURN_USERNAME = process.env.NEXT_PUBLIC_TURN_USERNAME;
const TURN_CREDENTIAL = process.env.NEXT_PUBLIC_TURN_CREDENTIAL;

const TURN_SERVERS: RTCIceServer[] =
  TURN_URL && TURN_USERNAME && TURN_CREDENTIAL
    ? [{ urls: TURN_URL, username: TURN_USERNAME, credential: TURN_CREDENTIAL }]
    : [
        {
          urls: [
            'turn:openrelay.metered.ca:80',
            'turn:openrelay.metered.ca:443',
            'turn:openrelay.metered.ca:443?transport=tcp',
          ],
          username: 'openrelayproject',
          credential: 'openrelayproject',
        },
      ];

const DEFAULT_CONFIG: WebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    ...TURN_SERVERS,
  ],
};

const CALLS_URL = process.env.NEXT_PUBLIC_URL_CALL ?? '';

// Normalize call response: backend returns { callId, ... } but we need { id, ... }
function normalizeCall(raw: Record<string, unknown>): Call {
  return {
    ...raw,
    id: (raw.id ?? raw.callId) as string,
    activeParticipants: (raw.activeParticipants as string[]) ?? [],
    acceptedUsers: (raw.acceptedUsers as string[]) ?? [],
    rejectedUsers: (raw.rejectedUsers as string[]) ?? [],
  } as Call;
}

export const useWebRTC = (userId: string, token: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  // Track which side originated the offer for each PC. Only the offerer attempts ICE restart
  // to avoid signaling glare (both sides re-offering at once).
  const offererRef = useRef<Map<string, boolean>>(new Map());
  const iceRestartAttemptsRef = useRef<Set<string>>(new Set());

  const isCall = (value: unknown): value is Call => {
    if (!value || typeof value !== 'object') return false;
    return 'callerId' in value && 'participants' in value;
  };

  const getCallFromPayload = (payload: unknown): Call | null => {
    if (!payload || typeof payload !== 'object') return null;
    const raw = ('call' in payload ? (payload as Record<string, unknown>).call : payload) as Record<string, unknown>;
    if (!isCall(raw)) return null;
    return normalizeCall(raw);
  };

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

  // Initialize socket connection
  useEffect(() => {
    if (!userId) return;

    const socket = io(CALLS_URL, {
      path: '/calls/socket.io',
      transports: ['websocket'],
      reconnection: true,
    });

    socket.on('connect', () => {
      socket.emit('register', { userId });
    });

    socket.on('disconnect', () => { });

    // Incoming call (user was in the original participants list)
    socket.on('incoming-call', (payload: unknown) => {
      const call = getCallFromPayload(payload);
      if (!call) return;
      setCurrentCall(call);
      setIsIncomingCall(true);
    });

    // Someone accepted — update call state
    socket.on('call-accepted', (data: unknown) => {
      const call = getCallFromPayload(data);
      if (call) setCurrentCall(call);
    });

    // Someone rejected — update call state
    socket.on('call-rejected', (data: unknown) => {
      const call = getCallFromPayload(data);
      if (call) setCurrentCall(call);
    });

    // The call was force-ended for everyone
    socket.on('call-ended', () => {
      peerConnectionsRef.current.forEach((pc) => pc.close());
      peerConnectionsRef.current.clear();
      resetCall();
    });

    socket.on('call-missed', () => {
      resetCall();
    });

    // A participant left — remove their stream/PC, update call state
    socket.on('user-left', (data: { call: unknown; userId: string }) => {
      const call = getCallFromPayload(data.call);
      if (call) setCurrentCall(call);

      const leftUserId = data.userId;
      removeRemoteStream(leftUserId);
      const pc = peerConnectionsRef.current.get(leftUserId);
      if (pc) {
        pc.close();
        peerConnectionsRef.current.delete(leftUserId);
      }
    });

    // A new participant joined — update call state; they will offer to us
    socket.on('user-joined', (data: { call: unknown; userId: string }) => {
      const call = getCallFromPayload(data.call);
      if (call) setCurrentCall(call);
      // The new joiner creates WebRTC offers to us; we just wait and handle the offer
    });

    // There is already an active call in progress (late joiner scenario)
    socket.on('call-in-progress', (payload: unknown) => {
      const call = getCallFromPayload(payload);
      if (call && !useCallStore.getState().isInCall) {
        setJoinableCall(call);
      }
    });

    // WebRTC Signaling
    socket.on('webrtc:offer', async (data: { from: string; signal: RTCSessionDescriptionInit }) => {
      await handleOffer(data.from, data.signal);
    });

    socket.on('webrtc:answer', async (data: { from: string; signal: RTCSessionDescriptionInit }) => {
      await handleAnswer(data.from, data.signal);
    });

    socket.on('webrtc:ice-candidate', async (data: { from: string; signal: RTCIceCandidateInit }) => {
      await handleIceCandidate(data.from, data.signal);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  // Acquire local media for the call. Tracks are created DISABLED so the user
  // joins muted with camera off — peers see/hear nothing until the user toggles.
  // Capture stays cold; senders are wired up on PC create so toggling later is
  // a simple track.enabled flip with no renegotiation.
  const getUserMedia = async (): Promise<MediaStream> => {
    const { setIsMuted, setIsVideoOff } = useCallStore.getState();

    const disableAll = (stream: MediaStream) => {
      stream.getTracks().forEach((t) => { t.enabled = false; });
    };

    // 1. Try video + audio
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      disableAll(stream);
      setLocalStream(stream);
      setIsMuted(true);
      setIsVideoOff(true);
      return stream;
    } catch { /* no camera, fall through */ }

    // 2. Try audio only
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      disableAll(stream);
      setLocalStream(stream);
      setIsMuted(true);
      setIsVideoOff(true);
      return stream;
    } catch { /* no microphone either, fall through */ }

    // 3. No devices — join with empty stream (recvonly transceivers added later)
    const empty = new MediaStream();
    setLocalStream(empty);
    setIsMuted(true);
    setIsVideoOff(true);
    return empty;
  };

  // Create peer connection
  const createPeerConnection = (remoteUserId: string): RTCPeerConnection => {
    const existing = peerConnectionsRef.current.get(remoteUserId);
    if (existing && existing.connectionState !== 'closed' && existing.connectionState !== 'failed') {
      return existing;
    }

    const pc = new RTCPeerConnection(DEFAULT_CONFIG);

    // Always negotiate one audio + one video m-line. Real local tracks become
    // sendrecv senders; missing kinds are backfilled as recvonly so we can
    // still receive remote media even when this user has no mic/cam.
    const localStream = useCallStore.getState().localStream;
    const tracks = localStream?.getTracks() ?? [];
    tracks.forEach((track) => pc.addTrack(track, localStream!));

    const has = (kind: 'audio' | 'video') => tracks.some((t) => t.kind === kind);
    if (!has('audio')) pc.addTransceiver('audio', { direction: 'recvonly' });
    if (!has('video')) pc.addTransceiver('video', { direction: 'recvonly' });

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc:ice-candidate', {
          to: remoteUserId,
          signal: event.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      if (remoteStream) addRemoteStream(remoteUserId, remoteStream);
    };

    pc.onconnectionstatechange = () => {
      // 'disconnected' and 'failed' are recoverable via ICE restart (see oniceconnectionstatechange).
      // Only tear down when the PC is definitively closed.
      if (pc.connectionState === 'closed') {
        removeRemoteStream(remoteUserId);
        peerConnectionsRef.current.delete(remoteUserId);
        pendingCandidatesRef.current.delete(remoteUserId);
        offererRef.current.delete(remoteUserId);
        iceRestartAttemptsRef.current.delete(remoteUserId);
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (
        pc.iceConnectionState === 'failed' &&
        offererRef.current.get(remoteUserId) === true &&
        !iceRestartAttemptsRef.current.has(remoteUserId)
      ) {
        iceRestartAttemptsRef.current.add(remoteUserId);
        void (async () => {
          try {
            const offer = await pc.createOffer({ iceRestart: true });
            await pc.setLocalDescription(offer);
            socketRef.current?.emit('webrtc:offer', { to: remoteUserId, signal: offer });
          } catch (error) {
            console.error('ICE restart failed:', error);
          }
        })();
      }
    };

    peerConnectionsRef.current.set(remoteUserId, pc);
    return pc;
  };

  const createOffer = async (remoteUserId: string) => {
    try {
      const pc = createPeerConnection(remoteUserId);
      offererRef.current.set(remoteUserId, true);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (socketRef.current) {
        socketRef.current.emit('webrtc:offer', { to: remoteUserId, signal: offer });
      }
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const flushPendingCandidates = async (remoteUserId: string, pc: RTCPeerConnection) => {
    const queued = pendingCandidatesRef.current.get(remoteUserId) ?? [];
    for (const c of queued) {
      try { await pc.addIceCandidate(new RTCIceCandidate(c)); } catch { /* drop stale */ }
    }
    pendingCandidatesRef.current.delete(remoteUserId);
  };

  const handleOffer = async (remoteUserId: string, offer: RTCSessionDescriptionInit) => {
    try {
      // Reuse existing PC for ICE-restart re-offers (signalingState === 'stable' means it's settled).
      // Only close a stale PC when there's no existing healthy session to preserve.
      const existing = peerConnectionsRef.current.get(remoteUserId);
      const isRenegotiation =
        existing && existing.connectionState !== 'closed' && existing.signalingState === 'stable';

      if (existing && !isRenegotiation && existing.connectionState !== 'connected') {
        existing.close();
        peerConnectionsRef.current.delete(remoteUserId);
        pendingCandidatesRef.current.delete(remoteUserId);
      }

      const pc = createPeerConnection(remoteUserId);
      if (!offererRef.current.has(remoteUserId)) {
        offererRef.current.set(remoteUserId, false);
      }
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      await flushPendingCandidates(remoteUserId, pc);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (socketRef.current) {
        socketRef.current.emit('webrtc:answer', { to: remoteUserId, signal: answer });
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (remoteUserId: string, answer: RTCSessionDescriptionInit) => {
    try {
      const pc = peerConnectionsRef.current.get(remoteUserId);
      if (!pc) return;
      await pc.setRemoteDescription(new RTCSessionDescription(answer));
      await flushPendingCandidates(remoteUserId, pc);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (remoteUserId: string, candidate: RTCIceCandidateInit) => {
    try {
      const pc = peerConnectionsRef.current.get(remoteUserId);
      if (pc && pc.remoteDescription) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        const queue = pendingCandidatesRef.current.get(remoteUserId) ?? [];
        pendingCandidatesRef.current.set(remoteUserId, [...queue, candidate]);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  // Accept an incoming call
  const acceptCall = useCallback(async (callId: string) => {
    if (!socketRef.current) return;
    try {
      const response = await fetch(`${CALLS_URL}/calls/${callId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error('Failed to accept call');

      await getUserMedia();

      setIsInCall(true);
      setIsIncomingCall(false);

      const freshCall = useCallStore.getState().currentCall;
      if (freshCall) {
        if (freshCall.callerId !== userId) await createOffer(freshCall.callerId);
        for (const participantId of freshCall.activeParticipants) {
          if (participantId !== userId && participantId !== freshCall.callerId) {
            await createOffer(participantId);
          }
        }
      }
    } catch (error) {
      console.error('Error accepting call:', error);
      resetCall();
    }
  }, [userId, token]);

  const rejectCall = useCallback(async (callId: string) => {
    if (!socketRef.current) return;
    try {
      await fetch(`${CALLS_URL}/calls/${callId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
      });
      resetCall();
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  }, [userId, token]);

  // Leave the call (caller or participant hangs up — call continues for others if ≥2 remain)
  const leaveCall = useCallback(async () => {
    const callId = useCallStore.getState().currentCall?.id;

    peerConnectionsRef.current.forEach((pc) => pc.close());
    peerConnectionsRef.current.clear();

    if (socketRef.current && callId) {
      socketRef.current.emit('leave-call', { callId, userId });
    }

    resetCall();

    if (callId) {
      try {
        const response = await fetch(`${CALLS_URL}/calls/${callId}/leave`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ userId }),
        });

        if (response.ok) {
          const rawData: Record<string, unknown> = await response.json();
          const call = normalizeCall(rawData);
          // If the call is still active, show the rejoin button
          if (call.status === 'ACCEPTED') {
            useCallStore.getState().setJoinableCall(call);
          }
        }
      } catch (error) {
        console.error('Error leaving call:', error);
      }
    }
  }, [userId, token, resetCall]);

  // Join an already-active call (late joiner)
  const joinCall = useCallback(async (callId: string) => {
    if (!socketRef.current) return;
    try {
      await getUserMedia();

      const response = await fetch(`${CALLS_URL}/calls/${callId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
      });
      if (!response.ok) throw new Error('Failed to join call');

      const callData: Record<string, unknown> = await response.json();
      const call = normalizeCall(callData);
      setCurrentCall(call);
      setJoinableCall(null);
      setIsInCall(true);

      socketRef.current.emit('join-call', { callId, userId });

      // Create offers to all current active participants
      for (const participantId of call.activeParticipants) {
        if (participantId !== userId) await createOffer(participantId);
      }
    } catch (error) {
      console.error('Error joining call:', error);
      resetCall();
    }
  }, [userId, token, resetCall]);

  // Invite additional participants to the active call.
  // Backend re-uses the incoming-call flow: invitees get an `incoming-call` socket event
  // and follow the normal accept path. No WebRTC state change here.
  const inviteToCall = useCallback(async (inviteeIds: string[]) => {
    const callId = useCallStore.getState().currentCall?.id;
    if (!callId || !socketRef.current) return;
    if (inviteeIds.length === 0) return;

    try {
      const response = await fetch(`${CALLS_URL}/calls/${callId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ inviterId: userId, inviteeIds }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as { message?: string }).message || `Failed to invite: ${response.status}`);
      }

      const rawData: Record<string, unknown> = await response.json();
      const call = normalizeCall(rawData);
      setCurrentCall(call);
    } catch (error) {
      console.error('Error inviting to call:', error);
    }
  }, [userId, token]);

  // Start a new call
  const startCall = useCallback(async (participantIds: string[]) => {
    if (!socketRef.current) return;
    if (useCallStore.getState().isInCall) return;

    try {
      const response = await fetch(`${CALLS_URL}/calls/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ callerId: userId, participants: participantIds }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error((errorData as { message?: string }).message || `Failed to create call: ${response.status}`);
      }

      const rawData: Record<string, unknown> = await response.json();
      const call = normalizeCall(rawData);
      setCurrentCall(call);

      await getUserMedia();

      setIsInCall(true);
    } catch (error) {
      console.error('Error starting call:', error);
      resetCall();
    }
  }, [userId, token]);

  return {
    acceptCall,
    rejectCall,
    leaveCall,
    joinCall,
    startCall,
    inviteToCall,
  };
};
