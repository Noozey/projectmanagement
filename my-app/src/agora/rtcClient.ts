import AgoraRTC, {
  type IAgoraRTCClient,
  type ICameraVideoTrack,
  type IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";

export const client: IAgoraRTCClient = AgoraRTC.createClient({
  mode: "rtc",
  codec: "vp8",
});

export let localTracks: {
  audioTrack: IMicrophoneAudioTrack | null;
  videoTrack: ICameraVideoTrack | null;
} = {
  audioTrack: null,
  videoTrack: null,
};

export let remoteUsers: Record<string, any> = {};
