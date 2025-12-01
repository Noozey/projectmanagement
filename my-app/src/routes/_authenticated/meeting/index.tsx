import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Video, UserPlus, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_authenticated/meeting/")({
  component: MeetingLobby,
});

function MeetingLobby() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  // CREATE MEETING
  const createMeeting = async () => {
    try {
      const { data } = await api.get("/access_token");
      if (!data.channelName) {
        return alert("Error: channelName missing from server");
      }
      navigate({
        to: "/meeting/$meetingID",
        params: { meetingID: data.channelName },
        search: { token: data.token, uid: data.uid },
      });
    } catch (err) {
      console.error(err);
      alert("Failed to create meeting");
    }
  };

  // JOIN MEETING
  const joinMeeting = async () => {
    if (!code) {
      return alert("Enter meeting code");
    }
    try {
      const { data } = await api.get(`/token?channelName=${code}`);
      if (!data.channelName) {
        return alert("Invalid meeting code");
      }
      navigate({
        to: "/meeting/$meetingID",
        params: { meetingID: data.channelName },
        search: { token: data.token, uid: data.uid },
      });
    } catch (err) {
      console.error(err);
      alert("Failed to join meeting");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
            <Video className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-5xl font-bold mb-3 text-foreground">
            Video Meetings
          </h1>
          <p className="text-lg text-muted-foreground">
            Create a new meeting or join an existing one
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* CREATE MEETING */}
          <Card className="bg-card rounded-3xl p-8 shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                <Video className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-card-foreground mb-2">
                Create Meeting
              </h2>
              <p className="text-muted-foreground text-sm">
                Start a new video conference instantly
              </p>
            </div>
            <Button
              className="w-full h-12 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all group"
              onClick={createMeeting}
            >
              Create New Meeting
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Card>

          {/* JOIN MEETING */}
          <Card className="bg-card rounded-3xl p-8 shadow-xl border border-border hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
                <UserPlus className="w-8 h-8 text-secondary-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-card-foreground mb-2">
                Join Meeting
              </h2>
              <p className="text-muted-foreground text-sm">
                Enter a code to join an ongoing call
              </p>
            </div>
            <div className="space-y-4">
              <Input
                placeholder="Enter meeting code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="text-center font-mono text-lg h-12 rounded-xl border-2 focus:border-ring transition-colors"
                onKeyPress={(e) => e.key === "Enter" && joinMeeting()}
              />
              <Button
                className="w-full h-12 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all group"
                onClick={joinMeeting}
              >
                Join Meeting
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer hint */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Need help? Contact support for assistance</p>
        </div>
      </div>
    </div>
  );
}
