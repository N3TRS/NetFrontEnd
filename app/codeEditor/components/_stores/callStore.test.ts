import { act } from "@testing-library/react";
import { CallStatus, useCallStore, type Call } from "./callStore";

const baseCall: Call = {
  id: "c1",
  sessionId: "s1",
  callerId: "u1",
  participants: ["u1", "u2"],
  activeParticipants: ["u1"],
  acceptedUsers: [],
  rejectedUsers: [],
  status: CallStatus.RINGING,
  createdAt: new Date("2026-01-01T00:00:00Z"),
};

function makeTrack(kind: "audio" | "video") {
  return {
    kind,
    enabled: true,
    stop: jest.fn(),
  } as unknown as MediaStreamTrack;
}

function makeStream(tracks: MediaStreamTrack[] = []) {
  const t = tracks.length ? tracks : [makeTrack("audio"), makeTrack("video")];
  return {
    getTracks: () => t,
    getAudioTracks: () => t.filter((x) => x.kind === "audio"),
    getVideoTracks: () => t.filter((x) => x.kind === "video"),
  } as unknown as MediaStream;
}

const initial = useCallStore.getState();

afterEach(() => {
  act(() => {
    useCallStore.setState({ ...initial });
  });
});

describe("useCallStore - initial state", () => {
  it("starts with empty/null defaults", () => {
    const s = useCallStore.getState();
    expect(s.currentCall).toBeNull();
    expect(s.joinableCall).toBeNull();
    expect(s.isInCall).toBe(false);
    expect(s.isIncomingCall).toBe(false);
    expect(s.localStream).toBeNull();
    expect(s.remoteStreams).toEqual([]);
    expect(s.isMuted).toBe(false);
    expect(s.isVideoOff).toBe(false);
    expect(s.remoteMuteStates).toEqual({});
  });
});

describe("useCallStore - setters", () => {
  it("setCurrentCall / setJoinableCall", () => {
    act(() => useCallStore.getState().setCurrentCall(baseCall));
    expect(useCallStore.getState().currentCall).toEqual(baseCall);
    act(() => useCallStore.getState().setJoinableCall(baseCall));
    expect(useCallStore.getState().joinableCall).toEqual(baseCall);
  });

  it("setIsInCall / setIsIncomingCall", () => {
    act(() => {
      useCallStore.getState().setIsInCall(true);
      useCallStore.getState().setIsIncomingCall(true);
    });
    expect(useCallStore.getState().isInCall).toBe(true);
    expect(useCallStore.getState().isIncomingCall).toBe(true);
  });
});

describe("useCallStore - localStream lifecycle", () => {
  it("stops previous stream's tracks when replacing localStream", () => {
    const t1 = [makeTrack("audio"), makeTrack("video")];
    const oldStream = makeStream(t1);
    act(() => useCallStore.getState().setLocalStream(oldStream));

    const newStream = makeStream();
    act(() => useCallStore.getState().setLocalStream(newStream));

    t1.forEach((trk) => expect(trk.stop).toHaveBeenCalled());
    expect(useCallStore.getState().localStream).toBe(newStream);
  });
});

describe("useCallStore - remote streams", () => {
  it("addRemoteStream replaces existing entry for same userId", () => {
    const a = makeStream();
    const b = makeStream();
    act(() => useCallStore.getState().addRemoteStream("u2", a));
    act(() => useCallStore.getState().addRemoteStream("u2", b));
    const list = useCallStore.getState().remoteStreams;
    expect(list).toHaveLength(1);
    expect(list[0]).toEqual({ userId: "u2", stream: b });
  });

  it("removeRemoteStream drops the matching userId", () => {
    const a = makeStream();
    const b = makeStream();
    act(() => {
      useCallStore.getState().addRemoteStream("u2", a);
      useCallStore.getState().addRemoteStream("u3", b);
    });
    act(() => useCallStore.getState().removeRemoteStream("u2"));
    const list = useCallStore.getState().remoteStreams;
    expect(list).toHaveLength(1);
    expect(list[0].userId).toBe("u3");
  });

  it("setRemoteMuteState updates the per-user map", () => {
    act(() => useCallStore.getState().setRemoteMuteState("u2", true));
    expect(useCallStore.getState().remoteMuteStates.u2).toBe(true);
    act(() => useCallStore.getState().setRemoteMuteState("u2", false));
    expect(useCallStore.getState().remoteMuteStates.u2).toBe(false);
  });
});

describe("useCallStore - toggles", () => {
  it("toggleMute flips state and toggles audio track enabled", () => {
    const audio = makeTrack("audio");
    const stream = makeStream([audio]);
    act(() => useCallStore.getState().setLocalStream(stream));

    act(() => useCallStore.getState().toggleMute());
    expect(useCallStore.getState().isMuted).toBe(true);
    // After toggling: enabled set to previous isMuted value (false)
    expect(audio.enabled).toBe(false);

    act(() => useCallStore.getState().toggleMute());
    expect(useCallStore.getState().isMuted).toBe(false);
    expect(audio.enabled).toBe(true);
  });

  it("toggleVideo flips state and toggles video track enabled", () => {
    const video = makeTrack("video");
    const stream = makeStream([video]);
    act(() => useCallStore.getState().setLocalStream(stream));

    act(() => useCallStore.getState().toggleVideo());
    expect(useCallStore.getState().isVideoOff).toBe(true);
    expect(video.enabled).toBe(false);

    act(() => useCallStore.getState().toggleVideo());
    expect(useCallStore.getState().isVideoOff).toBe(false);
    expect(video.enabled).toBe(true);
  });

  it("toggleMute works without a local stream", () => {
    act(() => useCallStore.getState().toggleMute());
    expect(useCallStore.getState().isMuted).toBe(true);
  });

  it("setIsMuted / setIsVideoOff set explicit values", () => {
    act(() => {
      useCallStore.getState().setIsMuted(true);
      useCallStore.getState().setIsVideoOff(true);
    });
    expect(useCallStore.getState().isMuted).toBe(true);
    expect(useCallStore.getState().isVideoOff).toBe(true);
  });
});

describe("useCallStore - resetCall", () => {
  it("stops all tracks and clears state", () => {
    const localTracks = [makeTrack("audio"), makeTrack("video")];
    const local = makeStream(localTracks);
    const remoteTrack = makeTrack("audio");
    const remote = makeStream([remoteTrack]);

    act(() => {
      useCallStore.getState().setLocalStream(local);
      useCallStore.getState().addRemoteStream("u2", remote);
      useCallStore.getState().setCurrentCall(baseCall);
      useCallStore.getState().setIsInCall(true);
      useCallStore.getState().setRemoteMuteState("u2", true);
    });

    act(() => useCallStore.getState().resetCall());

    localTracks.forEach((t) => expect(t.stop).toHaveBeenCalled());
    expect(remoteTrack.stop).toHaveBeenCalled();
    const s = useCallStore.getState();
    expect(s.currentCall).toBeNull();
    expect(s.localStream).toBeNull();
    expect(s.remoteStreams).toEqual([]);
    expect(s.isInCall).toBe(false);
    expect(s.remoteMuteStates).toEqual({});
  });
});
