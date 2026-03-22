import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  LayoutDashboard,
  Clock,
  Users,
  Columns,
  CalendarDays,
  Circle,
} from "lucide-react";
import { api } from "@/lib/api";
import { useUser } from "@/context/user";

export const Route = createFileRoute(
  "/_authenticated/project/dashboard/$dashboard",
)({
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

type Task = {
  id: string;
  title: string;
  description?: string;
  mentions?: string[];
};

type ColumnItem = { name: string; tasks: Task[] };
type KanbanColumns = { [key: string]: ColumnItem };

type CalendarEvent = {
  id: number;
  title: string;
  time: string;
  description: string;
  meetingLink: string;
};

type EventsMap = { [dateKey: string]: CalendarEvent[] };

type UpcomingEvent = { dateKey: string; event: CalendarEvent };

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

function formatDateKey(date: Date): string {
  return (
    date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
  );
}

function formatDisplayDate(dateKey: string): string {
  const parts = dateKey.split("-").map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getUpcomingEvents(events: EventsMap, limit: number): UpcomingEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const result: UpcomingEvent[] = [];
  Object.entries(events).forEach(function (entry) {
    const dateKey = entry[0];
    const dayEvents = entry[1];
    const parts = dateKey.split("-").map(Number);
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    if (d >= today) {
      dayEvents.forEach(function (event) {
        result.push({ dateKey: dateKey, event: event });
      });
    }
  });
  result.sort(function (a, b) {
    const ap = a.dateKey.split("-").map(Number);
    const bp = b.dateKey.split("-").map(Number);
    return (
      new Date(ap[0], ap[1] - 1, ap[2]).getTime() -
      new Date(bp[0], bp[1] - 1, bp[2]).getTime()
    );
  });
  return result.slice(0, limit);
}

function MeetingLink(props: { href: string }) {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[10px] text-primary hover:underline"
    >
      Join meeting
    </a>
  );
}

function RouteComponent() {
  const { dashboard: projectId } = Route.useParams();
  const { user } = useUser();

  const [project, setProject] = useState<Project | null>(null);
  const [columns, setColumns] = useState<KanbanColumns>({});
  const [events, setEvents] = useState<EventsMap>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(
    function () {
      if (!user?.uid || !projectId) return;
      setLoading(true);
      setError(null);
      Promise.all([
        api.get("/project/" + user.uid + "/" + projectId),
        api.get("/kanban/" + projectId),
        api.get("/calendar/" + projectId),
      ])
        .then(function (results) {
          setProject(results[0].data.message[0]);
          setColumns(results[1].data || {});
          setEvents((results[2].data && results[2].data.events) || {});
        })
        .catch(function () {
          setError("Failed to load project data.");
        })
        .finally(function () {
          setLoading(false);
        });
    },
    [projectId, user?.uid],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
          <p className="font-medium">Failed to load project</p>
          <p className="text-sm text-muted-foreground">
            {error ? error : "Project not found."}
          </p>
        </div>
      </div>
    );
  }

  const columnList = Object.entries(columns);
  const totalTasks = columnList.reduce(function (sum, entry) {
    return sum + entry[1].tasks.length;
  }, 0);

  const todayKey = formatDateKey(new Date());
  const todayEvents = events[todayKey] || [];
  const upcomingEvents = getUpcomingEvents(events, 5);

  const doneColumnTasks = columnList
    .filter(function (entry) {
      const name = entry[1].name.toLowerCase();
      return name === "done" || name === "completed" || name === "finished";
    })
    .reduce(function (sum, entry) {
      return sum + entry[1].tasks.length;
    }, 0);

  const st = statusMap[project.status] || statusMap["inactive"];
  const pStyle = priorityStyles[project.priority] || "";

  return (
    <div className="p-6 space-y-6 min-h-screen">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <LayoutDashboard className="w-5 h-5 text-muted-foreground" />
          <h1 className="text-xl font-semibold">{project.name}</h1>
          <span
            className={
              "text-xs px-2 py-0.5 rounded-full border font-medium " + pStyle
            }
          >
            {project.priority}
          </span>
          <span className={"flex items-center gap-1 text-xs " + st.text}>
            <span className={"w-1.5 h-1.5 rounded-full " + st.dot} />
            {st.label}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {project.description || "No description provided."}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-0.5 flex-wrap">
          <span>
            Category:{" "}
            <span className="text-foreground font-medium">
              {project.category}
            </span>
          </span>
          <span>·</span>
          <span>
            Manager:{" "}
            <span className="text-foreground font-medium">
              {project.manager}
            </span>
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(project.duration)}
          </span>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="shadow-none border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">{totalTasks}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Total Tasks
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Columns className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">
                {columnList.length}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Columns</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">
                {doneColumnTasks}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Done</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold leading-none">
                {project.users ? project.users.length : 0}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">Members</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Kanban Overview */}
        <Card className="shadow-none border lg:col-span-2">
          <CardContent className="p-0">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-semibold">Kanban Overview</p>
              <p className="text-xs text-muted-foreground">
                {totalTasks} tasks across {columnList.length} columns
              </p>
            </div>
            {columnList.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No columns yet. Add columns in the Kanban board.
              </div>
            ) : (
              <div className="divide-y">
                {columnList.map(function (entry) {
                  const colId = entry[0];
                  const col = entry[1];
                  const pct =
                    totalTasks > 0 ? (col.tasks.length / totalTasks) * 100 : 0;
                  return (
                    <div key={colId} className="px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{col.name}</span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          {col.tasks.length}{" "}
                          {col.tasks.length === 1 ? "task" : "tasks"}
                        </span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden mb-2">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: pct + "%" }}
                        />
                      </div>
                      {col.tasks.length > 0 && (
                        <div className="space-y-1 mt-2">
                          {col.tasks.slice(0, 3).map(function (task) {
                            return (
                              <div
                                key={task.id}
                                className="flex items-start gap-2 py-1"
                              >
                                <Circle className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium truncate">
                                    {task.title}
                                  </p>
                                  {task.description && (
                                    <p className="text-[10px] text-muted-foreground truncate">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                                {task.mentions && task.mentions.length > 0 && (
                                  <span className="text-[10px] text-muted-foreground shrink-0">
                                    {task.mentions.length} mention
                                    {task.mentions.length > 1 ? "s" : ""}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {col.tasks.length > 3 && (
                            <p className="text-[10px] text-muted-foreground pl-5">
                              +{col.tasks.length - 3} more
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Today's Events */}
          <Card className="shadow-none border">
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Today</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date().toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="divide-y">
                {todayEvents.length === 0 ? (
                  <p className="px-4 py-4 text-xs text-muted-foreground">
                    No events today.
                  </p>
                ) : (
                  todayEvents.map(function (event) {
                    return (
                      <div key={event.id} className="px-4 py-2.5">
                        <p className="text-xs font-medium truncate">
                          {event.title}
                        </p>
                        {event.time && (
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {event.time}
                          </p>
                        )}
                        {event.description && (
                          <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                            {event.description}
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="shadow-none border">
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold">Upcoming Events</p>
                <p className="text-xs text-muted-foreground">
                  Next {upcomingEvents.length} scheduled
                </p>
              </div>
              <div className="divide-y">
                {upcomingEvents.length === 0 ? (
                  <p className="px-4 py-4 text-xs text-muted-foreground">
                    No upcoming events.
                  </p>
                ) : (
                  upcomingEvents.map(function (item) {
                    const dateParts = formatDisplayDate(item.dateKey).split(
                      " ",
                    );
                    return (
                      <div
                        key={item.dateKey + item.event.id}
                        className="px-4 py-2.5 flex items-start gap-3"
                      >
                        <div className="shrink-0 text-center min-w-[36px]">
                          <p className="text-[10px] text-muted-foreground leading-none">
                            {dateParts[0]}
                          </p>
                          <p className="text-sm font-bold leading-tight">
                            {dateParts[1]}
                          </p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {item.event.title}
                          </p>
                          {item.event.time && (
                            <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {item.event.time}
                            </p>
                          )}
                          {item.event.meetingLink && (
                            <MeetingLink href={item.event.meetingLink} />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Team Members */}
          <Card className="shadow-none border">
            <CardContent className="p-0">
              <div className="px-4 py-3 border-b">
                <p className="text-sm font-semibold">Team</p>
                <p className="text-xs text-muted-foreground">
                  {project.users ? project.users.length : 0} members
                </p>
              </div>
              <div className="divide-y max-h-48 overflow-y-auto">
                {project.users &&
                  project.users.map(function (member, i) {
                    const initial =
                      member && member.email && member.email[0]
                        ? member.email[0].toUpperCase()
                        : "?";
                    const email =
                      member && member.email ? member.email : "Unknown";
                    const roleBg =
                      member.role === "Super"
                        ? "bg-primary/10 text-primary"
                        : member.role === "Admin"
                          ? "bg-blue-500/10 text-blue-600"
                          : "bg-muted text-muted-foreground";
                    return (
                      <div
                        key={i}
                        className="px-4 py-2.5 flex items-center gap-2.5"
                      >
                        <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                          {initial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">
                            {email}
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
