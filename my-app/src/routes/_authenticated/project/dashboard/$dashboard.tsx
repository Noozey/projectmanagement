import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  FolderKanban,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  CalendarDays,
  Flame,
  Target,
  Zap,
  ChevronRight,
  Activity,
} from "lucide-react";

export const Route = createFileRoute(
  "/_authenticated/project/dashboard/$dashboard",
)({
  component: RouteComponent,
});

// ── mock data ──────────────────────────────────────────────────────────────
const stats = [
  {
    label: "Total Projects",
    value: "24",
    delta: "+3",
    up: true,
    icon: FolderKanban,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Tasks Completed",
    value: "381",
    delta: "+18%",
    up: true,
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-500/10",
  },
  {
    label: "Team Members",
    value: "12",
    delta: "+2",
    up: true,
    icon: Users,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  {
    label: "Overdue Tasks",
    value: "7",
    delta: "+2",
    up: false,
    icon: AlertCircle,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
];

const projects = [
  {
    id: 1,
    name: "Mobile App Redesign",
    category: "Design",
    priority: "High",
    progress: 72,
    tasks: { done: 18, total: 25 },
    dueDate: "Mar 15",
    members: ["A", "B", "C"],
    status: "active",
  },
  {
    id: 2,
    name: "API Gateway Migration",
    category: "Development",
    priority: "Critical",
    progress: 45,
    tasks: { done: 9, total: 20 },
    dueDate: "Feb 28",
    members: ["D", "E"],
    status: "at-risk",
  },
  {
    id: 3,
    name: "Q1 Marketing Campaign",
    category: "Marketing",
    priority: "Medium",
    progress: 88,
    tasks: { done: 22, total: 25 },
    dueDate: "Mar 1",
    members: ["F", "G", "H", "I"],
    status: "active",
  },
  {
    id: 4,
    name: "Data Pipeline Setup",
    category: "Operations",
    priority: "High",
    progress: 30,
    tasks: { done: 6, total: 20 },
    dueDate: "Apr 10",
    members: ["J", "K"],
    status: "active",
  },
  {
    id: 5,
    name: "Customer Onboarding Flow",
    category: "Design",
    priority: "Low",
    progress: 95,
    tasks: { done: 19, total: 20 },
    dueDate: "Feb 22",
    members: ["A", "C"],
    status: "done",
  },
];

const recentTasks = [
  {
    id: 1,
    title: "Finalize wireframes for checkout flow",
    project: "Mobile App Redesign",
    assignee: "Alice",
    priority: "High",
    status: "in-progress",
    due: "Today",
  },
  {
    id: 2,
    title: "Write unit tests for auth module",
    project: "API Gateway Migration",
    assignee: "Bob",
    priority: "Critical",
    status: "todo",
    due: "Overdue",
  },
  {
    id: 3,
    title: "Review campaign copy drafts",
    project: "Q1 Marketing Campaign",
    assignee: "Carol",
    priority: "Medium",
    status: "review",
    due: "Tomorrow",
  },
  {
    id: 4,
    title: "Set up staging environment",
    project: "Data Pipeline Setup",
    assignee: "Dave",
    priority: "High",
    status: "todo",
    due: "Mar 2",
  },
  {
    id: 5,
    title: "User acceptance testing",
    project: "Customer Onboarding Flow",
    assignee: "Eve",
    priority: "Low",
    status: "done",
    due: "Done",
  },
];

const activityFeed = [
  {
    user: "Alice",
    action: "completed",
    target: "Wireframe review",
    time: "2m ago",
    color: "bg-green-500",
  },
  {
    user: "Bob",
    action: "commented on",
    target: "Auth module PR",
    time: "14m ago",
    color: "bg-blue-500",
  },
  {
    user: "Carol",
    action: "created task",
    target: "Social media assets",
    time: "1h ago",
    color: "bg-primary",
  },
  {
    user: "Dave",
    action: "moved",
    target: "DB migration → In Progress",
    time: "2h ago",
    color: "bg-amber-500",
  },
  {
    user: "Eve",
    action: "completed",
    target: "Onboarding UAT",
    time: "3h ago",
    color: "bg-green-500",
  },
  {
    user: "Alice",
    action: "assigned",
    target: "Checkout flow to Bob",
    time: "5h ago",
    color: "bg-primary",
  },
];

// ── helpers ────────────────────────────────────────────────────────────────
const priorityStyles: Record<string, string> = {
  Critical: "bg-destructive/15 text-destructive border-destructive/20",
  High: "bg-orange-500/15 text-orange-600 border-orange-500/20",
  Medium: "bg-amber-500/15 text-amber-600 border-amber-500/20",
  Low: "bg-green-500/15 text-green-600 border-green-500/20",
};

const statusStyles: Record<
  string,
  { dot: string; label: string; text: string }
> = {
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
};

const taskStatusStyles: Record<
  string,
  { bg: string; text: string; label: string }
> = {
  todo: { bg: "bg-muted", text: "text-muted-foreground", label: "To Do" },
  "in-progress": {
    bg: "bg-blue-500/15",
    text: "text-blue-600",
    label: "In Progress",
  },
  review: { bg: "bg-amber-500/15", text: "text-amber-600", label: "Review" },
  done: { bg: "bg-green-500/15", text: "text-green-600", label: "Done" },
};

// simple bar chart using divs
const weeklyData = [40, 65, 50, 80, 72, 90, 60];
const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function MiniBarChart() {
  const max = Math.max(...weeklyData);
  return (
    <div className="flex items-end gap-1.5 h-20 w-full">
      {weeklyData.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div
            className="w-full rounded-t-md transition-all duration-500"
            style={{
              height: `${(v / max) * 100}%`,
              background:
                i === 5
                  ? "oklch(0.7014 0.1729 33.23)"
                  : "oklch(0.7014 0.1729 33.23 / 0.25)",
            }}
          />
          <span className="text-[10px] text-muted-foreground">
            {weekDays[i]}
          </span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ progress }: { progress: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const dash = (progress / 100) * circ;
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        className="text-border"
      />
      <circle
        cx="36"
        cy="36"
        r={r}
        fill="none"
        stroke="oklch(0.7014 0.1729 33.23)"
        strokeWidth="7"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  );
}

// ── component ──────────────────────────────────────────────────────────────
function RouteComponent() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filters = ["all", "active", "at-risk", "done"];

  const filteredProjects =
    activeFilter === "all"
      ? projects
      : projects.filter((p) => p.status === activeFilter);

  const totalTasks = projects.reduce((s, p) => s + p.tasks.total, 0);
  const doneTasks = projects.reduce((s, p) => s + p.tasks.done, 0);
  const overallProgress = Math.round((doneTasks / totalTasks) * 100);

  return (
    <div className="bg-background my-5 min-h-screen rounded-2xl p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <LayoutDashboard className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm">
              Welcome back — here's what's happening
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 hidden sm:flex">
            <CalendarDays className="w-4 h-4" />
            Feb 2026
          </Button>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}
                  >
                    <Icon className={`w-5 h-5 ${s.color}`} />
                  </div>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-semibold ${
                      s.up ? "text-green-600" : "text-destructive"
                    }`}
                  >
                    {s.up ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {s.delta}
                  </span>
                </div>
                <p className="text-3xl font-bold tracking-tight">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {s.label}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── Middle row: Chart + Progress + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Weekly task completion bar chart */}
        <Card className="shadow-sm lg:col-span-1">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">Weekly Output</p>
                <p className="text-xs text-muted-foreground">
                  Tasks completed per day
                </p>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-500/10 px-2 py-1 rounded-full">
                <TrendingUp className="w-3 h-3" />
                +12%
              </div>
            </div>
            <MiniBarChart />
          </CardContent>
        </Card>

        {/* Overall progress donut */}
        <Card className="shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div>
              <p className="font-semibold">Overall Progress</p>
              <p className="text-xs text-muted-foreground">
                Across all projects
              </p>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative">
                <DonutChart progress={overallProgress} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold">{overallProgress}%</span>
                </div>
              </div>
              <div className="space-y-2.5 flex-1">
                {[
                  { label: "Completed", value: doneTasks, color: "bg-primary" },
                  {
                    label: "Remaining",
                    value: totalTasks - doneTasks,
                    color: "bg-border",
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${item.color}`}
                      />
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                ))}
                <div className="pt-1 border-t text-sm flex justify-between">
                  <span className="text-muted-foreground">Total tasks</span>
                  <span className="font-semibold">{totalTasks}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card className="shadow-sm">
          <CardContent className="p-5 space-y-4">
            <div>
              <p className="font-semibold">Quick Metrics</p>
              <p className="text-xs text-muted-foreground">
                This week's highlights
              </p>
            </div>
            <div className="space-y-3">
              {[
                {
                  icon: Flame,
                  label: "Active streak",
                  value: "14 days",
                  color: "text-orange-500",
                  bg: "bg-orange-500/10",
                },
                {
                  icon: Target,
                  label: "Goals hit",
                  value: "8 / 10",
                  color: "text-primary",
                  bg: "bg-primary/10",
                },
                {
                  icon: Zap,
                  label: "Avg velocity",
                  value: "23 tasks/wk",
                  color: "text-blue-500",
                  bg: "bg-blue-500/10",
                },
                {
                  icon: Activity,
                  label: "Uptime",
                  value: "99.8%",
                  color: "text-green-600",
                  bg: "bg-green-500/10",
                },
              ].map(({ icon: Icon, label, value, color, bg }) => (
                <div key={label} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0`}
                  >
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {label}
                    </span>
                    <span className="text-sm font-semibold">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Projects Table ── */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
            <div>
              <h2 className="text-lg font-semibold">Projects</h2>
              <p className="text-xs text-muted-foreground">
                {projects.length} total projects
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Filter pills */}
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                {filters.map((f) => (
                  <button
                    key={f}
                    onClick={() => setActiveFilter(f)}
                    className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition-all ${
                      activeFilter === f
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Plus className="w-3.5 h-3.5" />
                New
              </Button>
            </div>
          </div>

          <div className="divide-y">
            {filteredProjects.map((project) => {
              const st = statusStyles[project.status];
              return (
                <div
                  key={project.id}
                  className="px-6 py-4 hover:bg-accent/30 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    {/* Name + category */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-medium truncate">{project.name}</p>
                        <span
                          className={`w-1.5 h-1.5 rounded-full shrink-0 ${st.dot}`}
                        />
                        <span className={`text-xs shrink-0 ${st.text}`}>
                          {st.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {project.category}
                        </span>
                        <span className="text-muted-foreground/40">·</span>
                        <span className="text-xs text-muted-foreground">
                          {project.tasks.done}/{project.tasks.total} tasks
                        </span>
                      </div>
                    </div>

                    {/* Priority */}
                    <span
                      className={`hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border shrink-0 ${
                        priorityStyles[project.priority]
                      }`}
                    >
                      {project.priority}
                    </span>

                    {/* Progress bar */}
                    <div className="hidden md:flex flex-col gap-1 w-32 shrink-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Progress
                        </span>
                        <span className="text-xs font-semibold">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-border rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${project.progress}%`,
                            background:
                              project.progress >= 80
                                ? "oklch(0.62 0.19 142)"
                                : project.status === "at-risk"
                                  ? "oklch(0.577 0.205 27.325)"
                                  : "oklch(0.7014 0.1729 33.23)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Members avatars */}
                    <div className="hidden lg:flex -space-x-2 shrink-0">
                      {project.members.slice(0, 3).map((m, i) => (
                        <div
                          key={i}
                          className="w-7 h-7 rounded-full bg-primary/15 border-2 border-card flex items-center justify-center text-[10px] font-bold text-primary"
                        >
                          {m}
                        </div>
                      ))}
                      {project.members.length > 3 && (
                        <div className="w-7 h-7 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[10px] font-medium text-muted-foreground">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>

                    {/* Due date */}
                    <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      {project.dueDate}
                    </div>

                    <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ── Bottom row: Recent Tasks + Activity Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent tasks */}
        <Card className="shadow-sm lg:col-span-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
              <div>
                <h2 className="text-lg font-semibold">Recent Tasks</h2>
                <p className="text-xs text-muted-foreground">
                  Your latest assigned items
                </p>
              </div>
              <Button variant="ghost" size="sm" className="gap-1 text-primary">
                View all
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="divide-y">
              {recentTasks.map((task) => {
                const ts = taskStatusStyles[task.status];
                return (
                  <div
                    key={task.id}
                    className="px-6 py-3.5 hover:bg-accent/30 transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          task.status === "done"
                            ? "bg-green-500"
                            : task.status === "in-progress"
                              ? "bg-blue-500"
                              : task.status === "review"
                                ? "bg-amber-500"
                                : "bg-border"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {task.project}
                        </p>
                      </div>
                      <span
                        className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ts.bg} ${ts.text} shrink-0`}
                      >
                        {ts.label}
                      </span>
                      <span
                        className={`text-xs shrink-0 font-medium ${
                          task.due === "Overdue"
                            ? "text-destructive"
                            : task.due === "Today"
                              ? "text-amber-600"
                              : task.due === "Done"
                                ? "text-muted-foreground"
                                : "text-muted-foreground"
                        }`}
                      >
                        {task.due}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Activity feed */}
        <Card className="shadow-sm lg:col-span-2">
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b">
              <div>
                <h2 className="text-lg font-semibold">Activity</h2>
                <p className="text-xs text-muted-foreground">
                  Live team updates
                </p>
              </div>
              <Button variant="ghost" size="icon" className="w-8 h-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </div>
            <div className="px-6 py-4 space-y-0">
              {activityFeed.map((item, i) => (
                <div key={i} className="flex gap-3 relative">
                  {/* timeline line */}
                  {i < activityFeed.length - 1 && (
                    <div className="absolute left-3.5 top-8 w-px h-full bg-border -translate-x-1/2" />
                  )}
                  <div
                    className={`w-7 h-7 rounded-full ${item.color} flex items-center justify-center shrink-0 z-10 mt-0.5`}
                  >
                    <span className="text-[10px] font-bold text-white">
                      {item.user[0]}
                    </span>
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm leading-snug">
                      <span className="font-semibold">{item.user}</span>{" "}
                      <span className="text-muted-foreground">
                        {item.action}
                      </span>{" "}
                      <span className="font-medium">{item.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
