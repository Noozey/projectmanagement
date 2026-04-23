import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  CheckCircle2,
  AlertCircle,
  FolderKanban,
  Clock,
  ChevronRight,
  Loader2,
  LayoutDashboard,
} from "lucide-react";
import { api } from "@/lib/api";
import { useUser } from "@/context/user";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: RouteComponent,
});

type ProjectUser = { email: string; uid: string; role: string };
type Duration = { value: number; unit: string } | string | null;
type Project = {
  uid: string;
  name: string;
  description: string;
  category: string;
  priority: string;
  manager: string;
  users: ProjectUser[];
  duration: Duration;
  status: string;
  creator: { email: string; uid: string };
  notifications: { [key: string]: boolean };
  permissions: { [key: string]: boolean };
};

const priorityStyles: { [key: string]: string } = {
  Critical: "bg-destructive/15 text-destructive border-destructive/20",
  High: "bg-orange-500/15 text-orange-600 border-orange-500/20",
  Medium: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  Low: "bg-green-500/15 text-green-600 border-green-500/20",
};

const statusMap: {
  [key: string]: { dot: string; label: string; text: string };
} = {
  active: { dot: "bg-green-500", label: "Active", text: "text-green-600" },
  "at-risk": {
    dot: "bg-destructive",
    label: "At Risk",
    text: "text-destructive",
  },
  done: {
    dot: "bg-muted-foreground",
    label: "Completed",
    text: "text-muted-foreground",
  },
  inactive: {
    dot: "bg-muted-foreground",
    label: "Inactive",
    text: "text-muted-foreground",
  },
};

function formatDuration(duration: Duration): string {
  if (!duration) return "No deadline";
  if (typeof duration === "string") return duration;
  if (typeof duration === "object" && duration.value && duration.unit) {
    return duration.value + " " + duration.unit;
  }
  return "No deadline";
}

function RouteComponent() {
  const { user } = useUser();
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    setError(null);
    api
      .get("/project/" + user.uid)
      .then((res) => {
        setAllProjects(res.data.message || []);
      })
      .catch(() => {
        setError("Failed to load projects.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user?.uid]);

  // Stats
  const activeCount = allProjects.filter((p) => p.status === "active").length;
  const atRiskCount = allProjects.filter(
    (p) => p.priority === "Critical",
  ).length;

  // Unique members across all projects
  const uniqueMembersMap = new Map<string, ProjectUser>();
  allProjects.forEach((p) => {
    (p.users || []).forEach((u) => {
      if (!uniqueMembersMap.has(u.uid)) {
        uniqueMembersMap.set(u.uid, u);
      }
    });
  });
  const uniqueMemberList = Array.from(uniqueMembersMap.values());

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="font-medium">Failed to load projects</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <LayoutDashboard className="h-8 w-8" />
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          View details about projects you are involved in.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="shadow-none border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <FolderKanban className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">
                {allProjects.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Total Projects
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{activeCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Active</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{atRiskCount}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Critical</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">
                {uniqueMemberList.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Members</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* All Projects Table */}
        <Card className="shadow-none border lg:col-span-2">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <p className="text-sm font-semibold">All Projects</p>
            </div>
            <div className="divide-y">
              {allProjects.length === 0 && (
                <p className="text-sm text-muted-foreground px-4 py-6 text-center">
                  No projects found.
                </p>
              )}
              {allProjects.map((p) => {
                const pst = statusMap[p.status] || statusMap["inactive"];
                const ppStyle = priorityStyles[p.priority] || "";
                return (
                  <Link
                    key={p.uid}
                    className="block px-4 py-3 hover:bg-accent/30 transition-colors group cursor-pointer"
                    to="/project/dashboard/$dashboard"
                    params={{ dashboard: p.uid }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{p.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={
                              "w-1.5 h-1.5 rounded-full shrink-0 " + pst.dot
                            }
                          />
                          <span className={"text-xs " + pst.text}>
                            {pst.label}
                          </span>
                          <span className="text-muted-foreground/40 text-xs">
                            ·
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {p.category}
                          </span>
                          <span className="text-muted-foreground/40 text-xs">
                            ·
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {p.users ? p.users.length : 0} members
                          </span>
                        </div>
                      </div>
                      <span
                        className={
                          "hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium border shrink-0 " +
                          ppStyle
                        }
                      >
                        {p.priority}
                      </span>
                      <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatDuration(p.duration)}
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Team Members */}
        <div className="space-y-4">
          <Card className="shadow-none border">
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold">Team Members</p>
                <p className="text-xs text-muted-foreground">
                  {uniqueMemberList.length} people across all projects
                </p>
              </div>
              <ScrollArea>
                <div className="divide-y max-h-52">
                  {uniqueMemberList.length === 0 && (
                    <p className="text-sm text-muted-foreground px-4 py-6 text-center">
                      No members found.
                    </p>
                  )}
                  {uniqueMemberList.map((member, i) => {
                    const initial = member.email?.[0]?.toUpperCase() ?? "?";
                    const roleBg =
                      member.role === "Super"
                        ? "bg-primary/10 text-primary"
                        : member.role === "Admin"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-muted text-muted-foreground";
                    return (
                      <div
                        key={member.uid ?? i}
                        className="px-4 py-2.5 flex items-center gap-2.5"
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                          {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {member.email}
                          </p>
                        </div>
                        <span
                          className={
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 " +
                            roleBg
                          }
                        >
                          {member.role}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
