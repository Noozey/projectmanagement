import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Info,
  Users,
  Trash2,
  Shield,
  Bell,
  X,
  Plus,
  AlertTriangle,
  Save,
  ChevronRight,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute(
  "/_authenticated/project/settings/$settings",
)({
  component: RouteComponent,
});

// Sidebar nav items
const navItems = [
  { id: "general", label: "General", icon: Info },
  { id: "team", label: "Team & Access", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "permissions", label: "Permissions", icon: Shield },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

const priorityOptions = ["Critical", "High", "Medium", "Low"];
const categoryOptions = [
  "Development",
  "Marketing",
  "Design",
  "Research",
  "Operations",
  "Other",
];

function RouteComponent() {
  const [activeSection, setActiveSection] = useState("general");

  // General settings state
  const [projectName, setProjectName] = useState("My Awesome Project");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectCategory, setProjectCategory] = useState("Development");
  const [projectPriority, setProjectPriority] = useState("High");
  const [durationValue, setDurationValue] = useState("3");
  const [durationUnit, setDurationUnit] = useState("months");
  const [projectStatus, setProjectStatus] = useState("active");

  // Team state
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      email: "alice@example.com",
      role: "Lead Developer",
      access: "admin",
    },
    { id: 2, email: "bob@example.com", role: "Designer", access: "editor" },
    {
      id: 3,
      email: "carol@example.com",
      role: "QA Engineer",
      access: "viewer",
    },
  ]);
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");

  // Notification state
  const [notifications, setNotifications] = useState({
    taskAssigned: true,
    taskCompleted: true,
    memberJoined: false,
    deadlineReminder: true,
    statusChange: true,
    weeklyDigest: false,
  });

  // Permission state
  const [permissions, setPermissions] = useState({
    membersCanInvite: false,
    publicVisibility: false,
    editorsCanDelete: false,
    viewersCanComment: true,
  });

  const [deleteConfirm, setDeleteConfirm] = useState("");

  const handleSaveGeneral = async () => {
    try {
      // await api.patch("/project/:id", { ... });
      toast("Project settings saved successfully.");
    } catch {
      toast("Failed to save settings.");
    }
  };

  const addTeamMember = () => {
    if (!newMemberEmail) return;
    setTeamMembers([
      ...teamMembers,
      {
        id: Date.now(),
        email: newMemberEmail,
        role: newMemberRole,
        access: "viewer",
      },
    ]);
    setNewMemberEmail("");
    setNewMemberRole("");
  };

  const removeTeamMember = (id: number) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
  };

  const updateMemberAccess = (id: number, access: string) => {
    setTeamMembers(
      teamMembers.map((m) => (m.id === id ? { ...m, access } : m)),
    );
  };

  const toggleNotification = (key: string) => {
    setNotifications((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const togglePermission = (key: string) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const accessColors: Record<string, string> = {
    admin: "bg-primary/15 text-primary border-primary/20",
    editor: "bg-blue-500/15 text-blue-600 border-blue-500/20",
    viewer: "bg-muted text-muted-foreground border-border",
  };

  return (
    <div className="bg-background my-5 min-h-screen rounded-2xl p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Project Settings</h1>
            <p className="text-muted-foreground">
              Manage your project configuration and team
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar */}
        <aside className="w-56 shrink-0">
          <Card className="shadow-sm sticky top-6">
            <CardContent className="p-2">
              <nav className="space-y-0.5">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  const isDanger = item.id === "danger";
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${
                        isActive
                          ? isDanger
                            ? "bg-destructive/10 text-destructive"
                            : "bg-primary/10 text-primary"
                          : isDanger
                            ? "text-destructive/70 hover:bg-destructive/10 hover:text-destructive"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        {item.label}
                      </div>
                      <ChevronRight
                        className={`w-3.5 h-3.5 transition-opacity ${
                          isActive
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-50"
                        }`}
                      />
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Main Content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* General */}
          {activeSection === "general" && (
            <Card className="shadow-lg">
              <CardContent className="p-8 space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Info className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">
                      General Information
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Update your project's basic details.
                  </p>
                </div>
                <Separator />

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Project Name *</Label>
                    <Input
                      id="project-name"
                      className="text-lg"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project-description">Description</Label>
                    <Textarea
                      id="project-description"
                      placeholder="Describe your project goals and objectives..."
                      className="min-h-[120px] resize-none"
                      value={projectDescription}
                      onChange={(e) => setProjectDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <div className="flex flex-wrap gap-2">
                        {categoryOptions.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => setProjectCategory(cat)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                              projectCategory === cat
                                ? "bg-primary/10 text-primary border-primary/30"
                                : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <div className="flex flex-wrap gap-2">
                        {priorityOptions.map((p) => (
                          <button
                            key={p}
                            onClick={() => setProjectPriority(p)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                              projectPriority === p
                                ? "bg-primary/10 text-primary border-primary/30"
                                : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Project Duration</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="0"
                        className="w-32"
                        value={durationValue}
                        onChange={(e) => setDurationValue(e.target.value)}
                      />
                      <Input
                        placeholder="days / weeks / months"
                        className="flex-1"
                        value={durationUnit}
                        onChange={(e) => setDurationUnit(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex gap-2">
                      {["active", "paused", "completed", "archived"].map(
                        (s) => (
                          <button
                            key={s}
                            onClick={() => setProjectStatus(s)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border capitalize transition-all ${
                              projectStatus === s
                                ? "bg-primary/10 text-primary border-primary/30"
                                : "bg-card border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                            }`}
                          >
                            {s}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t">
                  <Button onClick={handleSaveGeneral} className="gap-2">
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team */}
          {activeSection === "team" && (
            <Card className="shadow-lg">
              <CardContent className="p-8 space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Team & Access</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Manage who has access to this project.
                  </p>
                </div>
                <Separator />

                {/* Add member */}
                <div className="space-y-3">
                  <Label>Invite a Member</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Email address"
                      className="flex-1"
                      value={newMemberEmail}
                      onChange={(e) => setNewMemberEmail(e.target.value)}
                    />
                    <Input
                      placeholder="Role"
                      className="w-40"
                      value={newMemberRole}
                      onChange={(e) => setNewMemberRole(e.target.value)}
                    />
                    <Button onClick={addTeamMember} className="gap-1 shrink-0">
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Member list */}
                <div className="space-y-3">
                  <Label>Current Members ({teamMembers.length})</Label>
                  <div className="space-y-2">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent/30 transition-colors"
                      >
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-primary">
                            {member.email[0].toUpperCase()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.email}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {member.role || "No role"}
                          </p>
                        </div>

                        {/* Access selector */}
                        <div className="flex gap-1">
                          {["viewer", "editor", "admin"].map((level) => (
                            <button
                              key={level}
                              onClick={() =>
                                updateMemberAccess(member.id, level)
                              }
                              className={`px-2.5 py-1 rounded-md text-xs font-medium border capitalize transition-all ${
                                member.access === level
                                  ? accessColors[level]
                                  : "text-muted-foreground border-transparent hover:border-border"
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => removeTeamMember(member.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors ml-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2 border-t">
                  <Button
                    className="gap-2"
                    onClick={() => toast("Team settings saved.")}
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeSection === "notifications" && (
            <Card className="shadow-lg">
              <CardContent className="p-8 space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Bell className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Notifications</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Choose what events you want to be notified about.
                  </p>
                </div>
                <Separator />

                <div className="space-y-4">
                  {[
                    {
                      key: "taskAssigned",
                      label: "Task Assigned",
                      desc: "When a task is assigned to you",
                    },
                    {
                      key: "taskCompleted",
                      label: "Task Completed",
                      desc: "When a task is marked done",
                    },
                    {
                      key: "memberJoined",
                      label: "Member Joined",
                      desc: "When someone joins the project",
                    },
                    {
                      key: "deadlineReminder",
                      label: "Deadline Reminders",
                      desc: "24h before due dates",
                    },
                    {
                      key: "statusChange",
                      label: "Status Changes",
                      desc: "When project status is updated",
                    },
                    {
                      key: "weeklyDigest",
                      label: "Weekly Digest",
                      desc: "Summary every Monday morning",
                    },
                  ].map(({ key, label, desc }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/20 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <button
                        onClick={() => toggleNotification(key)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                          notifications[key as keyof typeof notifications]
                            ? "bg-primary"
                            : "bg-border"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                            notifications[key as keyof typeof notifications]
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2 border-t">
                  <Button
                    className="gap-2"
                    onClick={() => toast("Notification preferences saved.")}
                  >
                    <Save className="w-4 h-4" />
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Permissions */}
          {activeSection === "permissions" && (
            <Card className="shadow-lg">
              <CardContent className="p-8 space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-5 h-5 text-primary" />
                    <h2 className="text-xl font-semibold">Permissions</h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Control what members can do within this project.
                  </p>
                </div>
                <Separator />

                <div className="space-y-4">
                  {[
                    {
                      key: "membersCanInvite",
                      label: "Members can invite others",
                      desc: "Allow non-admin members to invite new people",
                    },
                    {
                      key: "publicVisibility",
                      label: "Public visibility",
                      desc: "Make the project visible to anyone with the link",
                    },
                    {
                      key: "editorsCanDelete",
                      label: "Editors can delete tasks",
                      desc: "Allow editors to permanently delete tasks",
                    },
                    {
                      key: "viewersCanComment",
                      label: "Viewers can comment",
                      desc: "Allow read-only members to leave comments",
                    },
                  ].map(({ key, label, desc }) => (
                    <div
                      key={key}
                      className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/20 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground">{desc}</p>
                      </div>
                      <button
                        onClick={() => togglePermission(key)}
                        className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
                          permissions[key as keyof typeof permissions]
                            ? "bg-primary"
                            : "bg-border"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                            permissions[key as keyof typeof permissions]
                              ? "translate-x-5"
                              : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2 border-t">
                  <Button
                    className="gap-2"
                    onClick={() => toast("Permissions saved.")}
                  >
                    <Save className="w-4 h-4" />
                    Save Permissions
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Danger Zone */}
          {activeSection === "danger" && (
            <Card className="shadow-lg border-destructive/30">
              <CardContent className="p-8 space-y-8">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-5 h-5 text-destructive" />
                    <h2 className="text-xl font-semibold text-destructive">
                      Danger Zone
                    </h2>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    These actions are irreversible. Please proceed with caution.
                  </p>
                </div>
                <Separator className="border-destructive/20" />

                {/* Archive */}
                <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-card">
                  <div>
                    <p className="font-medium">Archive Project</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Mark this project as archived. It will be read-only and
                      hidden from the main view.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="shrink-0"
                    onClick={() => toast("Project archived.")}
                  >
                    Archive
                  </Button>
                </div>

                {/* Transfer */}
                <div className="flex items-center justify-between p-5 rounded-xl border border-border bg-card">
                  <div>
                    <p className="font-medium">Transfer Ownership</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Transfer this project to another member. You will lose
                      admin access.
                    </p>
                  </div>
                  <Button variant="outline" className="shrink-0">
                    Transfer
                  </Button>
                </div>

                {/* Delete */}
                <div className="p-5 rounded-xl border border-destructive/30 bg-destructive/5 space-y-4">
                  <div>
                    <p className="font-medium text-destructive">
                      Delete Project
                    </p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Permanently delete this project and all its data. This
                      cannot be undone.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Type{" "}
                      <span className="font-mono font-semibold text-foreground">
                        delete project
                      </span>{" "}
                      to confirm
                    </Label>
                    <Input
                      placeholder="delete project"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      className="border-destructive/30 focus-visible:ring-destructive/30"
                    />
                  </div>
                  <Button
                    variant="destructive"
                    className="gap-2 w-full"
                    disabled={deleteConfirm !== "delete project"}
                    onClick={() => toast("Project deleted.")}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Project Permanently
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
