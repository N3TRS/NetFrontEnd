import { create } from 'zustand';

export enum CallStatus {
  RINGING = 'RINGING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  ENDED = 'ENDED',
  MISSED = 'MISSED',
}

export interface Call {
  id: string;
  callerId: string;
  participants: string[];
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
  setIsInCall: (isInCall: boolean) => void;
  setIsIncomingCall: (isIncoming: boolean) => void;
  setLocalStream: (stream: MediaStream | null) => void;
  addRemoteStream: (userId: string, stream: MediaStream) => void;
  removeRemoteStream: (userId: string) => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  resetCall: () => void;
}

export const useCallStore = create<CallState>((set, get) => ({
  // Initial state
  currentCall: null,
  isInCall: false,
  isIncomingCall: false,
  localStream: null,
  remoteStreams: [],
  isMuted: false,
  isVideoOff: false,

  // Actions
  setCurrentCall: (call) => set({ currentCall: call }),
  
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
  
  removeRemoteStream: (userId) => {
    const entry = get().remoteStreams.find(s => s.userId === userId);
    
    // Stop the stream
    if (entry) {
      entry.stream.getTracks().forEach(track => track.stop());
    }
    
    set((state) => ({
      remoteStreams: state.remoteStreams.filter(s => s.userId !== userId)
    }));
  },
  
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
        videoTrack.enabled = isVideoOff; // Toggle
      }
    }
    
    set({ isVideoOff: !isVideoOff });
  },
  
  resetCall: () => {
    const { localStream, remoteStreams } = get();
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Stop all remote streams
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