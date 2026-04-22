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

    const socket = io(process.env.NEXT_PUBLIC_URL_CALLS, {
      transports: ['websocket'],
      reconnection: true,
    });

    socket.on('connect', () => {
      console.log('Connected to NetCalls service');
      // Register user
      socket.emit('register', { userId });
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from NetCalls service');
    });

    // Handle incoming call
    socket.on('incoming-call', (payload: unknown) => {
      const call = getCallFromPayload(payload);
      console.log('Incoming call:', call);

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
      console.log('Call accepted by:', data.userId);
      setCurrentCall(data.call);
      
      // If we already have local stream, create offer to new participant
      if (useCallStore.getState().localStream && data.userId !== userId) {
        createOffer(data.userId);
      }
    });

    // Handle call rejected
    socket.on('call-rejected', (data: { call: Call; userId: string }) => {
      console.log('Call rejected by:', data.userId);
      setCurrentCall(data.call);
    });

    // Handle call ended
    socket.on('call-ended', () => {
      console.log('Call ended');
      endCall();
    });

    // Handle call missed
    socket.on('call-missed', () => {
      console.log('Call missed');
      resetCall();
    });

    // WebRTC Signaling
    socket.on('webrtc:offer', async (data: { from: string; offer: RTCSessionDescriptionInit }) => {
      console.log('Received offer from:', data.from);
      await handleOffer(data.from, data.offer);
    });

    socket.on('webrtc:answer', async (data: { from: string; answer: RTCSessionDescriptionInit }) => {
      console.log('Received answer from:', data.from);
      await handleAnswer(data.from, data.answer);
    });

    socket.on('webrtc:ice-candidate', async (data: { from: string; candidate: RTCIceCandidateInit }) => {
      console.log('Received ICE candidate from:', data.from);
      await handleIceCandidate(data.from, data.candidate);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
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
      console.log('Received remote track from:', remoteUserId);
      const [remoteStream] = event.streams;
      addRemoteStream(remoteUserId, remoteStream);
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state with ${remoteUserId}:`, pc.connectionState);
      
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

      console.log('Call accepted successfully');
    } catch (error) {
      console.error('Error accepting call:', error);
      resetCall();
    }
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
  }, [userId]);
  //End call
  const endCall = useCallback(async () => {
    console.log('Ending call...', { callId: currentCall?.id, userId });
    const callId = currentCall?.id;
    
    // First: Close all peer connections
    peerConnectionsRef.current.forEach((pc) => {
      pc.close();
    });
    peerConnectionsRef.current.clear();
    console.log('Peer connections closed');

    // Second: Reset local state (stops media streams)
    resetCall();
    console.log('Local state reset');

    // Finally: Notify backend
    if (callId && socketRef.current) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL_CALLS}/calls/${callId}/end`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('Failed to end call on server:', response.status, errorText);
        } else {
          console.log('Call ended on server');
        }
      } catch (error) {
        console.error('Error ending call:', error);
      }
    }
  }, [currentCall, userId, resetCall]);

  // Start a new call
  const startCall = useCallback(async (participantIds: string[]) => {
    console.log('Starting call...', { userId, participants: participantIds, currentCall, isInCall: useCallStore.getState().isInCall });
    
    if (!socketRef.current) {
      console.error('Socket not connected');
      return;
    }

    try {
      console.log('Creating call with:', { callerId: userId, participants: participantIds });
      
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
      console.log('Call created:', call);
      setCurrentCall(call);

      const stream = await getUserMedia(true, true);
      
      if (!stream) {
        throw new Error('Could not access media devices');
      }

      setIsInCall(true);

      console.log('Call started successfully');
    } catch (error) {
      console.error('Error starting call:', error);
      resetCall();
    }
  }, [userId, currentCall]);

  return {
    acceptCall,
    rejectCall,
    endCall,
    startCall,
  };
};
