import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Settings,
  Info,
  Users,
  Shield,
  Bell,
  X,
  Plus,
  AlertTriangle,
  Save,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useUser } from "@/context/user";

// Define the route with the $settings parameter
export const Route = createFileRoute(
  "/_authenticated/project/settings/$settings",
)({
  component: RouteComponent,
});

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
  const navigate = useNavigate();
  // CRITICAL FIX: Grab ID from URL params, not Context, to prevent "wrong project" bug
  const { settings: projectId } = Route.useParams();
  const { user } = useUser();

  // --- LOADING STATES ---
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("general");

  // --- FORM STATE ---
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectCategory, setProjectCategory] = useState("Other");
  const [projectPriority, setProjectPriority] = useState("Medium");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("");
  const [projectStatus, setProjectStatus] = useState("active");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  // Settings Objects (JSONB)
  const [notifications, setNotifications] = useState({
    taskAssigned: true,
    taskCompleted: true,
    memberJoined: false,
    deadlineReminder: true,
    statusChange: true,
    weeklyDigest: false,
  });

  const [permissions, setPermissions] = useState({
    membersCanInvite: false,
    publicVisibility: false,
    editorsCanDelete: false,
    viewersCanComment: true,
  });

  // UI Helpers
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId || projectId === "settings") return;

      try {
        setIsLoading(true);
        // Using the exact route structure from your Express backend
        const res = await api.get(`/project/${user.uid}/${projectId}`);
        const data = res.data.message[0];

        if (data) {
          setProjectName(data.name || "");
          setProjectDescription(data.description || "");
          setProjectCategory(data.category || "Other");
          setProjectPriority(data.priority || "Medium");
          setProjectStatus(data.status || "active");
          setTeamMembers(data.users || []);

          if (data.duration) {
            setDurationValue(data.duration.value || "");
            setDurationUnit(data.duration.unit || "");
          }
          if (data.notifications) setNotifications(data.notifications);
          if (data.permissions) setPermissions(data.permissions);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Failed to load project settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, user.email]); // Re-run when the URL project ID changes

  // --- 2. SAVE LOGIC ---
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        name: projectName,
        description: projectDescription,
        category: projectCategory,
        priority: projectPriority,
        status: projectStatus,
        users: teamMembers,
        duration: { value: durationValue, unit: durationUnit },
        notifications,
        permissions,
      };

      await api.patch(`/project/${projectId}`, payload);
      toast.success("All changes synced to database.");
    } catch (err) {
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- 3. ACTIONS ---
  const addTeamMember = () => {
    if (!newMemberEmail) return;
    const newMember = {
      id: Date.now(),
      email: newMemberEmail,
      role: newMemberRole || "Contributor",
    };
    setTeamMembers([...teamMembers, newMember]);
    setNewMemberEmail("");
    setNewMemberRole("");
  };

  const removeTeamMember = (id: number) => {
    setTeamMembers(teamMembers.filter((m) => m.id !== id));
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

  const handleDelete = async () => {
    try {
      setIsSaving(true);
      await api.delete(`/project/${projectId}`);
      toast.success("Project deleted permanently.");
      navigate({ to: "/dashboard" });
    } catch {
      toast.error("Delete failed.");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-background my-5 min-h-screen rounded-2xl p-6">
      {/* HEADER */}
      <div className="mb-8 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Settings className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Project Settings</h1>
            <p className="text-muted-foreground">
              Manage {projectName || "Project"}
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="flex gap-6 items-start">
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-56 shrink-0">
          <Card className="shadow-sm">
            <CardContent className="p-2">
              <nav className="space-y-0.5">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeSection === item.id
                        ? item.id === "danger"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4" />
                      {item.label}
                    </div>
                    <ChevronRight
                      className={`w-3.5 h-3.5 ${activeSection === item.id ? "opacity-100" : "opacity-0"}`}
                    />
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* CONTENT SECTIONS */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* GENERAL SECTION */}
          {activeSection === "general" && (
            <Card className="shadow-lg">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-2">
                  <Label>Project Name *</Label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <div className="flex flex-wrap gap-2">
                      {categoryOptions.map((cat) => (
                        <Button
                          key={cat}
                          variant={
                            projectCategory === cat ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setProjectCategory(cat)}
                        >
                          {cat}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <div className="flex flex-wrap gap-2">
                      {priorityOptions.map((p) => (
                        <Button
                          key={p}
                          variant={
                            projectPriority === p ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setProjectPriority(p)}
                        >
                          {p}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Duration</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      className="w-24"
                      value={durationValue}
                      onChange={(e) => setDurationValue(e.target.value)}
                    />
                    <Input
                      placeholder="Unit (e.g., Months)"
                      value={durationUnit}
                      onChange={(e) => setDurationUnit(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* TEAM SECTION */}
          {activeSection === "team" && (
            <Card className="shadow-lg">
              <CardContent className="p-8 space-y-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="Team Member Email"
                    value={newMemberEmail}
                    onChange={(e) => setNewMemberEmail(e.target.value)}
                  />
                  <Input
                    placeholder="Role"
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                  />
                  <Button onClick={addTeamMember}>
                    <Plus className="w-4 h-4 mr-1" /> Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-xl"
                    >
                      <div>
                        <p className="text-sm font-medium">{member.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.role}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTeamMember(member.id)}
                      >
                        <X className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeSection === "notifications" && (
            <Card className="shadow-lg">
              <CardContent className="p-8 space-y-4">
                {Object.entries(notifications).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 border rounded-xl"
                  >
                    <Label className="capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </Label>
                    <button
                      onClick={() => toggleNotification(key)}
                      className={`w-11 h-6 rounded-full transition-colors ${value ? "bg-primary" : "bg-border"} relative`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? "translate-x-5" : ""}`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* PERMISSIONS SECTION */}
          {activeSection === "permissions" && (
            <Card className="shadow-lg">
              <CardContent className="p-8 space-y-4">
                {Object.entries(permissions).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 border rounded-xl"
                  >
                    <Label className="capitalize">
                      {key.replace(/([A-Z])/g, " $1")}
                    </Label>
                    <button
                      onClick={() => togglePermission(key)}
                      className={`w-11 h-6 rounded-full transition-colors ${value ? "bg-primary" : "bg-border"} relative`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${value ? "translate-x-5" : ""}`}
                      />
                    </button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* DANGER ZONE SECTION */}
          {activeSection === "danger" && (
            <Card className="shadow-lg border-destructive/30 bg-destructive/5">
              <CardContent className="p-8 space-y-4">
                <h2 className="text-xl font-bold text-destructive flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Danger Zone
                </h2>
                <div className="space-y-2">
                  <Label>
                    Type{" "}
                    <span className="font-mono font-bold">delete project</span>{" "}
                    to confirm
                  </Label>
                  <Input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="delete project"
                  />
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={deleteConfirm !== "delete project" || isSaving}
                  onClick={handleDelete}
                >
                  Delete Project Permanently
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
