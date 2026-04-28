import { useEffect, useRef, useCallback } from 'react';
import { useCallStore, type Call } from '../../components/_stores/callStore';
import { io, Socket } from 'socket.io-client';


interface WebRTCConfig {
  iceServers: RTCIceServer[];
}

const DEFAULT_CONFIG: WebRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};

const CALLS_URL = process.env.NEXT_PUBLIC_URL_CALL ?? '';

// Normalize call response: backend returns { callId, ... } but we need { id, ... }
function normalizeCall(raw: Record<string, unknown>): Call {
  return {
    ...raw,
    id: (raw.id ?? raw.callId) as string,
    activeParticipants: (raw.activeParticipants as string[]) ?? [],
  } as Call;
}

export const useWebRTC = (userId: string, token: string | null) => {
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

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

  // Get user media with progressive fallback: video+audio → audio only → empty stream
  const getUserMedia = async (audio = true, video = true): Promise<MediaStream> => {
    const { setIsVideoOff } = useCallStore.getState();

    // 1. Try video + audio
    if (video) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio,
          video: { width: 1280, height: 720 },
        });
        setLocalStream(stream);
        return stream;
      } catch { /* no camera, fall through */ }
    }

    // 2. Try audio only
    if (audio) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setLocalStream(stream);
        setIsVideoOff(true);
        return stream;
      } catch { /* no microphone either, fall through */ }
    }

    // 3. No devices — join with empty stream (can still receive others' media)
    const empty = new MediaStream();
    setLocalStream(empty);
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

    const localStream = useCallStore.getState().localStream;
    if (localStream) {
      localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc:ice-candidate', {
          to: remoteUserId,
          signal: event.candidate.toJSON(),
        });
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      addRemoteStream(remoteUserId, remoteStream);
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        removeRemoteStream(remoteUserId);
        peerConnectionsRef.current.delete(remoteUserId);
      }
    };

    peerConnectionsRef.current.set(remoteUserId, pc);
    return pc;
  };

  const createOffer = async (remoteUserId: string) => {
    try {
      const pc = createPeerConnection(remoteUserId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (socketRef.current) {
        socketRef.current.emit('webrtc:offer', { to: remoteUserId, signal: offer });
      }
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  const handleOffer = async (remoteUserId: string, offer: RTCSessionDescriptionInit) => {
    try {
      const pc = createPeerConnection(remoteUserId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
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
      if (pc) await pc.setRemoteDescription(new RTCSessionDescription(answer));
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (remoteUserId: string, candidate: RTCIceCandidateInit) => {
    try {
      const pc = peerConnectionsRef.current.get(remoteUserId);
      if (pc) await pc.addIceCandidate(new RTCIceCandidate(candidate));
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

      await getUserMedia(true, true);

      setIsInCall(true);
      setIsIncomingCall(false);

      const freshCall = useCallStore.getState().currentCall;
      if (freshCall) {
        if (freshCall.callerId !== userId) await createOffer(freshCall.callerId);
        for (const participantId of freshCall.acceptedUsers) {
          if (participantId !== userId) await createOffer(participantId);
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
      await getUserMedia(true, true);

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

      await getUserMedia(true, true);

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
  };
};
