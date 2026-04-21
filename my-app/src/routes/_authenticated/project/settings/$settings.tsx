import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Settings,
  Info,
  Users,
  X,
  Plus,
  AlertTriangle,
  Save,
  ChevronRight,
  Loader2,
  Menu,
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useUser } from "@/context/user";

export const Route = createFileRoute(
  "/_authenticated/project/settings/$settings",
)({
  component: RouteComponent,
});

const navItems = [
  { id: "general", label: "General", icon: Info },
  { id: "team", label: "Team & Access", icon: Users },
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

const roleOptions = ["Viewer", "Editor", "Admin", "Contributor"];

function RouteComponent() {
  const navigate = useNavigate();
  const { settings: projectId } = Route.useParams();
  const { user } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("general");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [projectCategory, setProjectCategory] = useState("Other");
  const [projectPriority, setProjectPriority] = useState("Medium");
  const [durationValue, setDurationValue] = useState("");
  const [durationUnit, setDurationUnit] = useState("");
  const [projectStatus, setProjectStatus] = useState("active");
  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("Viewer");
  const [selectedNewMember, setSelectedNewMember] = useState<any>(null);
  const [userSuggestions, setUserSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId || projectId === "settings") return;

      try {
        setIsLoading(true);
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
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        toast.error("Failed to load project settings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [projectId, user.uid]);

  useEffect(() => {
    if (!newMemberEmail) {
      setUserSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(() => {
      api.post("/user/profile", { email: newMemberEmail }).then((res) => {
        if ([200, 201, 202, 204].includes(res.status)) {
          const results = res.data.message;
          setUserSuggestions(Array.isArray(results) ? results : []);
          setShowSuggestions(true);
        }
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [newMemberEmail]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const updateMemberRole = (uid: string, email: string, newRole: string) => {
    setTeamMembers((prev) =>
      prev.map((m) => {
        const isMatch = uid && m.uid ? m.uid === uid : m.email === email;
        return isMatch ? { ...m, role: newRole } : m;
      }),
    );
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        name: projectName,
        description: projectDescription,
        category: projectCategory,
        priority: projectPriority,
        status: projectStatus,
        users: teamMembers.map((m) => {
          const clean: Record<string, any> = {
            uid: m.uid || "",
            email: m.email,
            role: m.role || "Viewer",
          };
          if (m.permission) clean.permission = m.permission;
          return clean;
        }),
        duration: { value: durationValue, unit: durationUnit },
      };

      await api.patch(`/project/${projectId}`, payload);
      toast.success("All changes synced to database.");
    } catch (err) {
      toast.error("Failed to save settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const addTeamMember = () => {
    if (!newMemberEmail) {
      toast.error("Please enter an email address.");
      return;
    }

    const emailToAdd = selectedNewMember?.email || newMemberEmail;
    const uidToAdd = selectedNewMember?.uid || selectedNewMember?.id || "";

    const alreadyAdded = teamMembers.some((m) =>
      uidToAdd ? m.uid === uidToAdd : m.email === emailToAdd,
    );
    if (alreadyAdded) {
      toast.error("This member is already in the team.");
      return;
    }

    const newMember: Record<string, any> = {
      uid: uidToAdd,
      email: emailToAdd,
      role: newMemberRole || "Viewer",
    };

    setTeamMembers((prev) => [...prev, newMember]);
    setNewMemberEmail("");
    setNewMemberRole("Viewer");
    setSelectedNewMember(null);
    setUserSuggestions([]);
    setShowSuggestions(false);
  };

  const removeTeamMember = (uid: string, email: string) => {
    setTeamMembers((prev) =>
      prev.filter((m) => (uid && m.uid ? m.uid !== uid : m.email !== email)),
    );
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

  const handleNavClick = (id: string) => {
    setActiveSection(id);
    setSidebarOpen(false); // close drawer on mobile after selection
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="bg-background my-5 min-h-screen rounded-2xl p-4 sm:p-6">
      {/* HEADER */}
      <div className="mb-6 sm:mb-8 flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center gap-3">
          {/* Mobile hamburger to open sidebar */}
          <button
            className="sm:hidden p-2 rounded-lg border bg-background"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Open navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Project Settings</h1>
            <p className="text-muted-foreground text-sm sm:text-base">
              Manage {projectName || "Project"}
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="gap-2 w-full sm:w-auto"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="flex gap-6 items-start">
        {/* SIDEBAR — desktop: always visible, mobile: overlay drawer */}
        <>
          {/* Backdrop for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-30 bg-black/40 sm:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={`
              fixed top-0 left-0 z-40 h-full w-64 bg-background shadow-xl p-4 transition-transform duration-200
              sm:static sm:z-auto sm:h-auto sm:w-56 sm:p-0 sm:bg-transparent sm:shadow-none sm:translate-x-0 sm:block sm:shrink-0
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}
          >
            {/* Mobile close button */}
            <div className="flex justify-between items-center mb-4 sm:hidden">
              <span className="font-semibold text-sm">Navigation</span>
              <button onClick={() => setSidebarOpen(false)} aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>

            <Card className="shadow-sm">
              <CardContent className="p-2">
                <nav className="space-y-0.5">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
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
        </>

        {/* CONTENT SECTIONS */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* GENERAL SECTION */}
          {activeSection === "general" && (
            <Card className="shadow-lg">
              <CardContent className="p-5 sm:p-8 space-y-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      className="w-24 shrink-0"
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
              <CardContent className="p-5 sm:p-8 space-y-6">
                <h2 className="text-lg font-semibold">Add New Member</h2>

                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-start">
                  <div className="relative flex-1" ref={suggestionsRef}>
                    <Input
                      placeholder="Search by email or name"
                      value={newMemberEmail}
                      onChange={(e) => {
                        setNewMemberEmail(e.target.value);
                        if (
                          selectedNewMember &&
                          e.target.value !== selectedNewMember.email
                        ) {
                          setSelectedNewMember(null);
                        }
                      }}
                      onFocus={() => {
                        if (userSuggestions.length > 0)
                          setShowSuggestions(true);
                      }}
                    />

                    {showSuggestions && (
                      <div className="absolute z-20 w-full mt-1 bg-card border rounded-md shadow-lg max-h-48 overflow-auto">
                        {userSuggestions.length > 0 ? (
                          userSuggestions.map((u, index) => (
                            <div
                              key={u.uid || index}
                              className="px-4 py-2 cursor-pointer hover:bg-accent transition-colors"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setSelectedNewMember(u);
                                setNewMemberEmail(u.email || u);
                                setShowSuggestions(false);
                                setUserSuggestions([]);
                              }}
                            >
                              <div className="font-medium text-sm">
                                {u.name || u.email || u}
                              </div>
                              {u.email && u.name && (
                                <div className="text-xs text-muted-foreground">
                                  {u.email}
                                </div>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            No users found
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Select
                      value={newMemberRole}
                      onValueChange={(value) => setNewMemberRole(value)}
                    >
                      <SelectTrigger className="w-full sm:w-40 shrink-0">
                        <SelectValue placeholder="Select a Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Roles</SelectLabel>
                          {roleOptions.map((r) => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={addTeamMember}
                      className="shrink-0 max-sm:w-full"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add
                    </Button>
                  </div>
                </div>

                {/* Selected user preview */}
                {selectedNewMember && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block shrink-0" />
                    Selected:{" "}
                    <span className="font-medium text-foreground">
                      {selectedNewMember.name || selectedNewMember.email}
                    </span>
                    {selectedNewMember.name && (
                      <span>({selectedNewMember.email})</span>
                    )}
                    <button
                      className="ml-1 text-destructive hover:underline text-xs"
                      onClick={() => {
                        setSelectedNewMember(null);
                        setNewMemberEmail("");
                      }}
                    >
                      Clear
                    </button>
                  </div>
                )}

                {/* Current Team Members List */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Current Members ({teamMembers.length})
                  </h3>
                  {teamMembers.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center border rounded-xl">
                      No team members yet. Add one above.
                    </p>
                  ) : (
                    teamMembers.map((member) => (
                      <div
                        key={member.uid || member.email}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 border rounded-xl gap-3"
                      >
                        {/* Member Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {member.name || member.email}
                          </p>
                          {member.name && (
                            <p className="text-xs text-muted-foreground truncate">
                              {member.email}
                            </p>
                          )}
                          {member.permission && (
                            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full mt-0.5 inline-block">
                              {member.permission}
                            </span>
                          )}
                        </div>

                        {/* Role Dropdown + Remove — side by side on mobile too */}
                        <div className="flex items-center gap-2 shrink-0">
                          <Select
                            value={member.role || "Viewer"}
                            onValueChange={(value) =>
                              updateMemberRole(member.uid, member.email, value)
                            }
                          >
                            <SelectTrigger className="w-36">
                              <SelectValue placeholder="Select a Role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Roles</SelectLabel>
                                {roleOptions.map((r) => (
                                  <SelectItem key={r} value={r}>
                                    {r}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0"
                            onClick={() =>
                              removeTeamMember(member.uid, member.email)
                            }
                          >
                            <X className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* DANGER ZONE SECTION */}
          {activeSection === "danger" && (
            <Card className="shadow-lg border-destructive/30 bg-destructive/5">
              <CardContent className="p-5 sm:p-8 space-y-4">
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
