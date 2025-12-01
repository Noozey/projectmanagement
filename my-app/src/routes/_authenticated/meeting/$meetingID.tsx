import { createFileRoute } from "@tanstack/react-router";
import AgoraRTC from "agora-rtc-sdk-ng";
import { useEffect, useState } from "react";
import { Camera, CameraOff, Mic, MicOff, PhoneOff, User } from "lucide-react";
import { toast } from "sonner";

const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
const localTracks: { audioTrack?: any; videoTrack?: any } = {};
const remoteUsers: Record<string, any> = {};

export const Route = createFileRoute("/_authenticated/meeting/$meetingID")({
  component: MeetingRoom,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      token: search.token as string,
      uid: search.uid as string,
    };
  },
});

function MeetingRoom() {
  const { meetingID } = Route.useParams();
  const { token, uid } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(true);

  useEffect(() => {
    joinMeeting();
    return () => {
      leaveMeeting();
    };
  }, []);

  // Auto-hide controls after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowControls(false), 3000);
    };

    window.addEventListener("mousemove", resetTimer);
    resetTimer();

    return () => {
      window.removeEventListener("mousemove", resetTimer);
      clearTimeout(timeout);
    };
  }, []);

  const joinMeeting = async () => {
    try {
      setIsJoining(true);
      setError(null);

      client.on("user-published", handleUserPublished);
      client.on("user-left", handleUserLeft);

      await client.join(
        import.meta.env.VITE_AGORA_APP_ID,
        meetingID,
        token || null,
        Number(uid),
      );

      // Request microphone and camera permissions with better error handling
      try {
        const [mic, cam] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localTracks.audioTrack = mic;
        localTracks.videoTrack = cam;

        const localPlayer = document.getElementById("local-player");
        if (localPlayer) {
          cam.play("local-player");
        }

        await client.publish([mic, cam]);
        console.log("Successfully joined meeting and published tracks");
        setIsJoining(false);
      } catch (mediaError: any) {
        console.error("Media device error:", mediaError);

        // Try to join with audio only if camera fails
        if (
          mediaError.code === "NOT_READABLE" ||
          mediaError.name === "NotReadableError"
        ) {
          setError(
            "Camera access denied or in use. Joining with audio only...",
          );

          try {
            const mic = await AgoraRTC.createMicrophoneAudioTrack();
            localTracks.audioTrack = mic;
            await client.publish([mic]);
            setCameraOff(true);
            setIsJoining(false);

            // Clear error after 5 seconds
            setTimeout(() => setError(null), 5000);
          } catch (audioError) {
            setError(
              "Could not access microphone or camera. Please check permissions.",
            );
            setIsJoining(false);
          }
        } else {
          setError(
            "Could not access media devices. Please check your permissions.",
          );
          setIsJoining(false);
        }
      }
    } catch (err: any) {
      console.error("Failed to join meeting", err);
      setError(`Failed to join meeting: ${err.message || "Unknown error"}`);
      setIsJoining(false);
    }
  };

  const leaveMeeting = async () => {
    try {
      localTracks.audioTrack?.close();
      localTracks.videoTrack?.close();
      await client.leave();
      navigate({ to: "/meeting" });
    } catch (err) {
      console.error("Failed to leave meeting", err);
    }
  };

  const handleUserPublished = async (user: any, mediaType: string) => {
    try {
      await client.subscribe(user, mediaType);

      if (mediaType === "video") {
        const id = `remote-${user.uid}`;
        const container = document.getElementById("remote-container");

        if (!container) {
          console.error("Remote container not found");
          return;
        }

        let div = document.getElementById(id);
        if (div) {
          div.remove();
        }

        div = document.createElement("div");
        div.id = id;
        div.className =
          "relative w-[400px] h-[250px] bg-muted rounded-xl overflow-hidden border border-border";

        const videoWrapper = document.createElement("div");
        videoWrapper.className = "absolute inset-0";
        div.appendChild(videoWrapper);

        const nameTag = document.createElement("div");
        nameTag.className =
          "absolute bottom-3 left-3 bg-card/80 backdrop-blur-sm text-card-foreground text-sm px-3 py-1.5 rounded-md border border-border z-10";
        nameTag.textContent = `User ${user.uid}`;
        div.appendChild(nameTag);

        container.appendChild(div);

        if (user.videoTrack) {
          user.videoTrack.play(videoWrapper);
          console.log(`Playing video for user ${user.uid}`);
        }
      }

      if (mediaType === "audio") {
        if (user.audioTrack) {
          user.audioTrack.play();
          console.log(`Playing audio for user ${user.uid}`);
        }
      }

      remoteUsers[user.uid] = user;
    } catch (err) {
      console.error("Error in handleUserPublished:", err);
    }
  };

  const handleUserLeft = (user: any) => {
    console.log(`User ${user.uid} left the meeting`);
    delete remoteUsers[user.uid];
    const elem = document.getElementById(`remote-${user.uid}`);
    if (elem) {
      elem.remove();
    }
  };

  const toggleMute = async () => {
    try {
      if (localTracks.audioTrack) {
        await localTracks.audioTrack.setEnabled(!muted);
        setMuted(!muted);
        console.log(`Microphone ${!muted ? "muted" : "unmuted"}`);
      } else {
        console.error("Audio track not available");
      }
    } catch (err) {
      console.error("Failed to toggle mute:", err);
    }
  };

  const toggleCamera = async () => {
    try {
      if (localTracks.videoTrack) {
        await localTracks.videoTrack.setEnabled(!cameraOff);
        setCameraOff(!cameraOff);
        console.log(`Camera ${!cameraOff ? "off" : "on"}`);
      } else {
        console.error("Video track not available");
      }
    } catch (err) {
      console.error("Failed to toggle camera:", err);
    }
  };

  return (
    <div className="relative h-screen w-full bg-background overflow-hidden rounded-2xl mt-5">
      {isJoining && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-foreground text-lg font-medium">
              Joining meeting...
            </p>
          </div>
        </div>
      )}

      {error && toast.warning("Something went wrong")}

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          id="remote-container"
          className="w-full h-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 content-center"
        ></div>
      </div>

      <div className="absolute top-4 right-4 w-48 h-36 rounded-xl overflow-hidden shadow-xl border-2 border-border bg-card z-20">
        <div className="relative w-full h-full">
          <div id="local-player" className="w-full h-full bg-muted"></div>
          <div className="absolute bottom-2 left-2 bg-card/80 backdrop-blur-sm text-card-foreground text-xs px-2 py-1 rounded-md border border-border">
            You
          </div>
          {cameraOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-accent flex items-center justify-center text-2xl">
                  <User />
                </div>
                <p className="text-xs text-muted-foreground">Camera off</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div
        className={`absolute top-0 left-0 right-0 px-6 py-4 transition-all duration-300 z-10 ${showControls ? "opacity-100" : "opacity-0"}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"></div>
            <span className="text-foreground text-sm font-medium">
              Meeting ID: {meetingID}
            </span>
          </div>
          <div className="text-foreground text-sm">
            {new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 right-0 px-6 py-6 transition-all duration-300 ${showControls ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleMute}
            className={`group relative w-14 h-14 rounded-full transition-all duration-200 flex items-center justify-center shadow-md ${
              muted
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            }`}
            title={muted ? "Unmute" : "Mute"}
          >
            <span className="text-2xl">{muted ? <MicOff /> : <Mic />}</span>
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {muted ? "Unmute" : "Mute"}
            </span>
          </button>

          <button
            onClick={toggleCamera}
            className={`group relative w-14 h-14 rounded-full transition-all duration-200 flex items-center justify-center shadow-md ${
              cameraOff
                ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                : "bg-secondary hover:bg-secondary/80 text-secondary-foreground"
            }`}
            title={cameraOff ? "Turn camera on" : "Turn camera off"}
          >
            <span className="text-2xl">
              {cameraOff ? <CameraOff /> : <Camera />}
            </span>
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {cameraOff ? "Turn on" : "Turn off"}
            </span>
          </button>

          <button
            onClick={leaveMeeting}
            className="group relative w-14 h-14 rounded-full bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-all duration-200 flex items-center justify-center shadow-md"
            title="Leave meeting"
          >
            <span className="text-2xl">
              <PhoneOff />
            </span>
            <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Leave
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
