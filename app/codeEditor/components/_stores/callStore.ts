import { create } from 'zustand';

export enum CallStatus {
  RINGING = 'RINGING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  ENDED = 'ENDED',
  MISSED = 'MISSED',
}

export interface Call {
  callId?: string;
  id: string;
  callerId: string;
  participants: string[];
  activeParticipants: string[];
  acceptedUsers: string[];
  rejectedUsers: string[];
  status: CallStatus;
  createdAt: Date;
  startedAt?: Date;
  endedAt?: Date;
}

interface RemoteStreamEntry {
  userId: string;
  stream: MediaStream;
}

interface CallState {
  // Call state
  currentCall: Call | null;
  joinableCall: Call | null;
  isInCall: boolean;
  isIncomingCall: boolean;

  // Media state
  localStream: MediaStream | null;
  remoteStreams: RemoteStreamEntry[];

  // Media controls
  isMuted: boolean;
  isVideoOff: boolean;

  // Actions
  setCurrentCall: (call: Call | null) => void;
  setJoinableCall: (call: Call | null) => void;
  setIsInCall: (isInCall: boolean) => void;
  setIsIncomingCall: (isIncoming: boolean) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  addRemoteStream: (userId: string, stream: MediaStream) => void;
  removeRemoteStream: (userId: string) => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  setIsMuted: (value: boolean) => void;
  setIsVideoOff: (value: boolean) => void;
  resetCall: () => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  // Initial state
  currentCall: null,
  joinableCall: null,
  isInCall: false,
  isIncomingCall: false,
  localStream: null,
  remoteStreams: [],
  isMuted: false,
  isVideoOff: false,

  // Actions
  setCurrentCall: (call) => set({ currentCall: call }),

  setJoinableCall: (call) => set({ joinableCall: call }),

  setIsInCall: (isInCall) => set({ isInCall }),

  setIsIncomingCall: (isIncoming) => set({ isIncomingCall: isIncoming }),
  
  setLocalStream: (stream) => {
    const currentStream = get().localStream;
    
    // Stop previous stream if exists
    if (currentStream) {
      currentStream.getTracks().forEach(track => track.stop());
    }
    
    set({ localStream: stream });
  },
  
  addRemoteStream: (userId, stream) => {
    set((state) => {
      // Remove existing stream for this user if any
      const filtered = state.remoteStreams.filter(s => s.userId !== userId);
      return {
        remoteStreams: [...filtered, { userId, stream }]
      };
    });
  },
  
  removeRemoteStream: (userId) =>
    set((state) => ({
      remoteStreams: state.remoteStreams.filter(s => s.userId !== userId),
    })),
  
  toggleMute: () => {
    const { localStream, isMuted } = get();
    
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMuted; // Toggle
      }
    }
    
    set({ isMuted: !isMuted });
  },
  
  toggleVideo: () => {
    const { localStream, isVideoOff } = get();

    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = isVideoOff;
      }
    }

    set({ isVideoOff: !isVideoOff });
  },

  setIsMuted: (value) => set({ isMuted: value }),

  setIsVideoOff: (value) => set({ isVideoOff: value }),
  
  resetCall: () => {
    const { localStream, remoteStreams } = get();

    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    remoteStreams.forEach(entry => {
      entry.stream.getTracks().forEach(track => track.stop());
    });

    set({
      currentCall: null,
      isInCall: false,
      isIncomingCall: false,
      localStream: null,
      remoteStreams: [],
      isMuted: false,
      isVideoOff: false,
    });
  },
}));