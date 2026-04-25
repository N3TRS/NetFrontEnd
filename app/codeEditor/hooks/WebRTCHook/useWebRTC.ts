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

export const useWebRTC = (userId: string) => {
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  const isCall = (value: unknown): value is Call => {
    if (!value || typeof value !== 'object') {
      return false;
    }

    return 'id' in value && 'callerId' in value && 'participants' in value;
  };

  const getCallFromPayload = (payload: unknown): Call | null => {
    if (!payload || typeof payload !== 'object') {
      return null;
    }

    const callCandidate = 'call' in payload ? payload.call : payload;

    if (!isCall(callCandidate)) {
      return null;
    }

    return callCandidate;
  };
  
  const {
    setLocalStream,
    addRemoteStream,
    removeRemoteStream,
    setCurrentCall,
    setIsInCall,
    setIsIncomingCall,
    resetCall,
    currentCall,
  } = useCallStore();

  // Initialize socket connection
  useEffect(() => {
    if (!userId) return;

    const CALLS_URL = process.env.NEXT_PUBLIC_URL_APIGATEWAY || 'http://localhost:3002';
    const socket = io(CALLS_URL, {
      transports: ['websocket'],
      reconnection: true,
    });

    socket.on('connect', () => {
      socket.emit('register', { userId });
    });

    socket.on('disconnect', () => {});

    // Handle incoming call
    socket.on('incoming-call', (payload: unknown) => {
      const call = getCallFromPayload(payload);

      if (!call) {
        console.warn('Incoming call payload missing call data:', payload);
        return;
      }

      setCurrentCall(call);
      setIsIncomingCall(true);
      // NOTE: We do NOT request media here - only when accepting
    });

    // Handle call accepted
    socket.on('call-accepted', (data: { call: Call; userId: string }) => {
      setCurrentCall(data.call);
      
      // If we already have local stream, create offer to new participant
      if (useCallStore.getState().localStream && data.userId !== userId) {
        createOffer(data.userId);
      }
    });

    // Handle call rejected
    socket.on('call-rejected', (data: { call: Call; userId: string }) => {
      setCurrentCall(data.call);
    });

    // Handle call ended
    socket.on('call-ended', () => {
      endCall();
    });

    socket.on('call-missed', () => {
      resetCall();
    });

    // WebRTC Signaling
    socket.on('webrtc:offer', async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      await handleOffer(data.from, data.offer);
    });

    socket.on('webrtc:answer', async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
      await handleAnswer(data.from, data.answer);
    });

    socket.on('webrtc:ice-candidate', async (data: { from: string; candidate: RTCIceCandidateInit }) => {
      await handleIceCandidate(data.from, data.candidate);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Get user media (ONLY called when accepting call)
  const getUserMedia = async (audio = true, video = true): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio,
        video: video ? { width: 1280, height: 720 } : false,
      });
      
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  };

  // Create peer connection
  const createPeerConnection = (remoteUserId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection(DEFAULT_CONFIG);

    // Add local stream tracks
    const localStream = useCallStore.getState().localStream;
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('webrtc:ice-candidate', {
          to: remoteUserId,
          candidate: event.candidate.toJSON(),
        });
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      addRemoteStream(remoteUserId, remoteStream);
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        removeRemoteStream(remoteUserId);
        peerConnectionsRef.current.delete(remoteUserId);
      }
    };

    peerConnectionsRef.current.set(remoteUserId, pc);
    return pc;
  };

  // Create and send offer
  const createOffer = async (remoteUserId: string) => {
    try {
      const pc = createPeerConnection(remoteUserId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (socketRef.current) {
        socketRef.current.emit('webrtc:offer', {
          to: remoteUserId,
          offer: offer,
        });
      }
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  };

  // Handle incoming offer
  const handleOffer = async (remoteUserId: string, offer: RTCSessionDescriptionInit) => {
    try {
      const pc = createPeerConnection(remoteUserId);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      if (socketRef.current) {
        socketRef.current.emit('webrtc:answer', {
          to: remoteUserId,
          answer: answer,
        });
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  // Handle incoming answer
  const handleAnswer = async (remoteUserId: string, answer: RTCSessionDescriptionInit) => {
    try {
      const pc = peerConnectionsRef.current.get(remoteUserId);
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  // Handle ICE candidate
  const handleIceCandidate = async (remoteUserId: string, candidate: RTCIceCandidateInit) => {
    try {
      const pc = peerConnectionsRef.current.get(remoteUserId);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  // Accept call 
  const acceptCall = useCallback(async (callId: string) => {
    if (!socketRef.current) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_CALLS}/calls/${callId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error('Failed to accept call');

      const stream = await getUserMedia(true, true);
      
      if (!stream) {
        throw new Error('Could not access media devices');
      }

      setIsInCall(true);
      setIsIncomingCall(false);

      const call = currentCall;
      if (call) {
        call.acceptedUsers.forEach((participantId) => {
          if (participantId !== userId) {
            createOffer(participantId);
          }
        });
      }

    } catch (error) {
      console.error('Error accepting call:', error);
      resetCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentCall]);

  const rejectCall = useCallback(async (callId: string) => {
    if (!socketRef.current) return;

    try {
      await fetch(`${process.env.NEXT_PUBLIC_URL_CALLS}/calls/${callId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      resetCall();
    } catch (error) {
      console.error('Error rejecting call:', error);
    }
  }, [userId, resetCall]);
  //End call
  const endCall = useCallback(async () => {
    const callId = currentCall?.id;

    peerConnectionsRef.current.forEach((pc) => {
      pc.close();
    });
    peerConnectionsRef.current.clear();

    resetCall();

    if (callId && socketRef.current) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_CALLS}/calls/${callId}/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to end call on server:', response.status, errorText);
        }
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
  }, [currentCall, resetCall]);

  // Start a new call
  const startCall = useCallback(async (participantIds: string[]) => {
    if (!socketRef.current) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL_CALLS}/calls/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerId: userId,
          participants: participantIds,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error:', response.status, errorData);
        throw new Error(errorData.message || `Failed to create call: ${response.status}`);
      }

      const { call } = await response.json();
      setCurrentCall(call);

      const stream = await getUserMedia(true, true);
      
      if (!stream) {
        throw new Error('Could not access media devices');
      }

      setIsInCall(true);
    } catch (error) {
      console.error('Error starting call:', error);
      resetCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, currentCall]);

  return {
    acceptCall,
    rejectCall,
    endCall,
    startCall,
  };
};
